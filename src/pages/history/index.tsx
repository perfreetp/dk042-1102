import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { getCategoryInfo, formatTime } from '@/utils'
import { STATUS_LABELS } from '@/types'
import EmptyState from '@/components/EmptyState'

type TabType = 'posted' | 'responded'

const HistoryPage: React.FC = () => {
  const { myWorries, userStats, myResponses, refreshTimeouts } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('posted')

  useDidShow(() => {
    refreshTimeouts()
  })

  const handleWorryClick = (worryId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${worryId}` })
  }

  return (
    <View className={styles.pageContainer}>
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
                <View className={styles.recordMeta}>
                  <Text>{category.emoji} {category.label}</Text>
                  <Text>{formatTime(worry.createdAt)}</Text>
                </View>
              </View>
            )
          })
        )
      ) : (
        myResponses.length === 0 ? (
          <EmptyState emoji="🤗" title="暂无回应记录" desc="去回应别人的烦恼吧" />
        ) : (
          myResponses.map(resp => {
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
                <View
                  style={{
                    padding: '16rpx 20rpx',
                    background: 'rgba(124, 111, 230, 0.06)',
                    borderRadius: '12rpx',
                    marginTop: '16rpx'
                  }}
                >
                  <Text
                    style={{
                      fontSize: '22rpx',
                      color: '#7C6FE6',
                      marginBottom: '8rpx',
                      display: 'block'
                    }}
                  >
                    我的回应：
                  </Text>
                  <Text style={{ fontSize: '26rpx', color: '#2C2C3D', lineHeight: 1.6 }}>
                    {resp.content}
                  </Text>
                </View>
                <View className={styles.recordMeta}>
                  <Text>{category.emoji} {category.label}</Text>
                  <Text>{formatTime(resp.createdAt)}</Text>
                </View>
              </View>
            )
          })
        )
      )}
    </View>
  )
}

export default HistoryPage
