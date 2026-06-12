import React, { useState } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { STATUS_LABELS, Worry } from '@/types'
import { getCategoryInfo } from '@/utils'
import EmptyState from '@/components/EmptyState'

type TabType = 'all' | 'responded' | 'pending'

const MinePage: React.FC = () => {
  const { myWorries, userStats, toggleFavorite, thankResponse } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const filteredWorries = myWorries.filter(w => {
    if (activeTab === 'all') return true
    if (activeTab === 'responded') return !!w.response
    if (activeTab === 'pending') return !w.response
    return true
  })

  const handleWorryClick = (worryId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${worryId}` })
  }

  const handleGotoFavorites = () => {
    Taro.navigateTo({ url: '/pages/favorites/index' })
  }

  const handleGotoHistory = () => {
    Taro.navigateTo({ url: '/pages/history/index' })
  }

  const handleGotoSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' })
  }

  const handleFavorite = (e, worry: Worry) => {
    e.stopPropagation()
    if (worry.response) {
      toggleFavorite(worry.response.id)
    }
  }

  const handleThank = (e, worry: Worry) => {
    e.stopPropagation()
    if (worry.response && !worry.response.isThanked) {
      thankResponse(worry.response.id)
      Taro.showToast({ title: '感谢已送出 💖', icon: 'none' })
    }
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.headerCard}>
        <Text className={styles.greeting}>我的交换档案 🌸</Text>
        <Text className={styles.streakText}>🔥 已连续陪伴 {userStats.streak} 天，你真的很棒</Text>
        <View className={styles.statsGrid}>
          <View className={styles.stat}>
            <Text className={styles.statNum}>{userStats.postedCount}</Text>
            <Text className={styles.statLabel}>发布烦恼</Text>
          </View>
          <View className={styles.stat}>
            <Text className={styles.statNum}>{userStats.receivedCount}</Text>
            <Text className={styles.statLabel}>收到回应</Text>
          </View>
          <View className={styles.stat}>
            <Text className={styles.statNum}>{userStats.thankedCount}</Text>
            <Text className={styles.statLabel}>收获感谢</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickLinks}>
        <View className={styles.linkCard} onClick={handleGotoFavorites}>
          <Text className={styles.linkEmoji}>⭐</Text>
          <Text className={styles.linkText}>我的收藏</Text>
        </View>
        <View className={styles.linkCard} onClick={handleGotoHistory}>
          <Text className={styles.linkEmoji}>📖</Text>
          <Text className={styles.linkText}>交换记录</Text>
        </View>
        <View className={styles.linkCard} onClick={() => Taro.navigateTo({ url: '/pages/mood/index' })}>
          <Text className={styles.linkEmoji}>🌈</Text>
          <Text className={styles.linkText}>情绪打卡</Text>
        </View>
        <View className={styles.linkCard} onClick={handleGotoSettings}>
          <Text className={styles.linkEmoji}>⚙️</Text>
          <Text className={styles.linkText}>设置</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'all' && styles.activeTab)}
          onClick={() => setActiveTab('all')}
        >
          全部
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'responded' && styles.activeTab)}
          onClick={() => setActiveTab('responded')}
        >
          已回应
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'pending' && styles.activeTab)}
          onClick={() => setActiveTab('pending')}
        >
          等待中
        </View>
      </View>

      {filteredWorries.length === 0 ? (
        <EmptyState
          emoji="💌"
          title="还没有交换记录"
          desc="去写一条烦恼，或者回应他人的烦恼吧"
        />
      ) : (
        filteredWorries.map(worry => {
          const category = getCategoryInfo(worry.category)
          const hasResponse = !!worry.response

          return (
            <View
              key={worry.id}
              className={styles.worryCard}
              onClick={() => handleWorryClick(worry.id)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.tags}>
                  <View className={classnames(styles.tag, styles.categoryTag)}>
                    {category.emoji} {category.label}
                  </View>
                  <View className={classnames(
                    styles.tag,
                    hasResponse ? styles.respondedTag : styles.statusTag
                  )}>
                    {STATUS_LABELS[worry.status]}
                  </View>
                </View>
              </View>
              <Text className={styles.content}>{worry.content}</Text>

              {hasResponse && worry.response && (
                <View className={styles.respPreview}>
                  <View className={styles.respLabel}>
                    <Text>
                      {worry.response.type === 'suggestion' ? '💡' :
                       worry.response.type === 'empathy' ? '🤗' : '🌙'}
                    </Text>
                    <Text>来自陌生人的回应</Text>
                  </View>
                  <Text className={styles.respContent}>{worry.response.content}</Text>
                </View>
              )}

              <View className={styles.actions}>
                <Text className={styles.time} style={{ flex: 1 }}>
                  查看详情 →
                </Text>
                {hasResponse && worry.response && (
                  <>
                    <Button
                      className={styles.actionBtn}
                      onClick={(e) => handleFavorite(e, worry)}
                    >
                      {worry.response.isFavorite ? '⭐ 已收藏' : '☆ 收藏'}
                    </Button>
                    <Button
                      className={classnames(styles.actionBtn, worry.response.isThanked && styles.primaryBtn)}
                      onClick={(e) => handleThank(e, worry)}
                      disabled={worry.response.isThanked}
                    >
                      {worry.response.isThanked ? '💖 已感谢' : '💌 感谢'}
                    </Button>
                  </>
                )}
              </View>
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

export default MinePage
