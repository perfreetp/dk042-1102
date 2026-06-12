import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { getCategoryInfo, formatTime } from '@/utils'
import { STATUS_LABELS, ResponseType, RESPONSE_TYPES, Worry, MyResponse, FEEDBACK_TAGS } from '@/types'
import EmptyState from '@/components/EmptyState'

type TabType = 'posted' | 'responded'
type SortType = 'newest' | 'oldest'
type FilterType = 'all' | ResponseType

const HistoryPage: React.FC = () => {
  const { myWorries, userStats, myResponses, refreshTimeouts } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('posted')
  const [sortType, setSortType] = useState<SortType>('newest')
  const [filterType, setFilterType] = useState<FilterType>('all')

  useDidShow(() => {
    refreshTimeouts()
  })

  const handleWorryClick = (worryId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${worryId}` })
  }

  const handleSortChange = () => {
    const newSort = sortType === 'newest' ? 'oldest' : 'newest'
    setSortType(newSort)
  }

  const displayedResponses = useMemo(() => {
    let list = [...myResponses]
    if (filterType !== 'all') {
      list = list.filter(r => r.type === filterType)
    }
    list.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortType === 'newest' ? -diff : diff
    })
    return list
  }, [myResponses, sortType, filterType])

  const renderFeedbackForPosted = (worry: Worry) => {
    if (!worry.response?.feedback) return null
    const fb = worry.response.feedback
    return (
      <View className={styles.feedbackBox}>
        <Text className={styles.feedbackLabel}>🎯 我给这条回应的反馈</Text>
        <View className={styles.feedbackTags}>
          {fb.tags.map(tag => {
            const ti = FEEDBACK_TAGS.find(t => t.value === tag)
            return <Text key={tag} className={styles.feedbackTag}>{ti?.emoji} {ti?.label}</Text>
          })}
        </View>
        {fb.comment && <Text className={styles.feedbackComment}>"{fb.comment}"</Text>}
      </View>
    )
  }

  const renderFeedbackForResponded = (resp: MyResponse) => {
    if (!resp.feedback) return null
    const fb = resp.feedback
    return (
      <View className={styles.feedbackBox}>
        <Text className={styles.feedbackLabel}>🎯 对方给我的反馈</Text>
        <View className={styles.feedbackTags}>
          {fb.tags.map(tag => {
            const ti = FEEDBACK_TAGS.find(t => t.value === tag)
            return <Text key={tag} className={styles.feedbackTag}>{ti?.emoji} {ti?.label}</Text>
          })}
        </View>
        {fb.comment && <Text className={styles.feedbackComment}>"{fb.comment}"</Text>}
      </View>
    )
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>发布烦恼</Text>
          <Text className={styles.summaryNum}>{userStats.postedCount} 条</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>回应他人</Text>
          <Text className={styles.summaryNum}>{userStats.respondedCount} 条</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>收到回应</Text>
          <Text className={styles.summaryNum}>{userStats.receivedCount} 条</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>收获感谢</Text>
          <Text className={styles.summaryNum}>{userStats.thankedCount} 次</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'posted' && styles.activeTab)}
          onClick={() => setActiveTab('posted')}
        >
          我发布的
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'responded' && styles.activeTab)}
          onClick={() => setActiveTab('responded')}
        >
          我回应的
        </View>
      </View>

      {activeTab === 'responded' && (
        <View className={styles.filterBar}>
          <View className={styles.filterSection}>
            <Text className={styles.filterLabel}>回应类型：</Text>
            <View className={styles.filterChips}>
              <View
                className={classnames(styles.filterChip, filterType === 'all' && styles.chipActive)}
                onClick={() => setFilterType('all')}
              >
                全部
              </View>
              {RESPONSE_TYPES.map(rt => (
                <View
                  key={rt.value}
                  className={classnames(styles.filterChip, filterType === rt.value && styles.chipActive)}
                  onClick={() => setFilterType(rt.value)}
                >
                  {rt.emoji} {rt.label}
                </View>
              ))}
            </View>
          </View>
          <View className={styles.sortBtn} onClick={handleSortChange}>
            {sortType === 'newest' ? '↓ 最新优先' : '↑ 最早优先'}
          </View>
        </View>
      )}

      {activeTab === 'posted' ? (
        myWorries.length === 0 ? (
          <EmptyState emoji="📝" title="暂无发布记录" desc="去写一条烦恼吧" />
        ) : (
          myWorries.map(worry => {
            const category = getCategoryInfo(worry.category)
            const isTimeout = worry.status === 'timeout'
            return (
              <View
                key={worry.id}
                className={classnames(styles.recordCard, isTimeout && styles.timeoutCard)}
                onClick={() => handleWorryClick(worry.id)}
              >
                <View className={styles.recordHeader}>
                  <Text className={styles.recordType}>
                    {worry.response ? '💚 已收到回应' : isTimeout ? '⏰ 已超时回收' : '⏳ 等待中'}
                  </Text>
                  <Text className={styles.recordStatus}>
                    {STATUS_LABELS[worry.status]}
                  </Text>
                </View>
                <Text className={styles.recordContent}>{worry.content}</Text>
                {worry.response && worry.response.content && (
                  <View className={styles.responseBox}>
                    <Text className={styles.responseLabel}>
                      {worry.response.type === 'suggestion' ? '💡 对方建议：' :
                       worry.response.type === 'empathy' ? '🤗 对方共情：' : '🌙 对方陪伴：'}
                    </Text>
                    <Text className={styles.responseContent}>
                      {worry.response.content}
                    </Text>
                  </View>
                )}
                {renderFeedbackForPosted(worry)}
                <View className={styles.recordMeta}>
                  <Text>{category.emoji} {category.label}</Text>
                  <Text>{formatTime(worry.createdAt)}</Text>
                </View>
              </View>
            )
          })
        )
      ) : (
        displayedResponses.length === 0 ? (
          <EmptyState emoji="🤗" title="暂无回应记录" desc="去回应别人的烦恼吧" />
        ) : (
          displayedResponses.map(resp => {
            const category = getCategoryInfo(resp.worryCategory)
            const typeInfo = {
              suggestion: { emoji: '💡', label: '建议' },
              empathy: { emoji: '🤗', label: '共情' },
              companionship: { emoji: '🌙', label: '陪伴' }
            }[resp.type]
            return (
              <View key={resp.id} className={styles.recordCard}>
                <View className={styles.recordHeader}>
                  <Text className={styles.recordType}>
                    🤝 我回应了这条烦恼
                  </Text>
                  <Text className={styles.respTypeBadge}>
                    {typeInfo.emoji} {typeInfo.label}
                  </Text>
                </View>
                <Text className={styles.recordContent}>
                  对方：{resp.worryContent}
                </Text>
                <View className={styles.myResponseBox}>
                  <Text className={styles.myRespLabel}>
                    我的回应（{typeInfo.label}）：
                  </Text>
                  <Text className={styles.myRespContent}>
                    {resp.content}
                  </Text>
                </View>
                {renderFeedbackForResponded(resp)}
                <View className={styles.recordMeta}>
                  <Text>{category.emoji} {category.label}</Text>
                  <Text>{formatTime(resp.createdAt)}</Text>
                </View>
              </View>
            )
          })
        )
      )}
    </ScrollView>
  )
}

export default HistoryPage
