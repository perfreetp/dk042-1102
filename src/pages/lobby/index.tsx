import React from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useApp } from '@/store/AppContext'
import ProgressBar from '@/components/ProgressBar'
import WorryCard from '@/components/WorryCard'
import EmptyState from '@/components/EmptyState'

const LobbyPage: React.FC = () => {
  const { userStats, myWorries, assignedTasks, refreshTimeouts } = useApp()

  useDidShow(() => {
    refreshTimeouts()
  })

  const pendingWorries = myWorries.filter(w => w.status === 'pending' || w.status === 'matched')
  const activeTasks = assignedTasks.filter(t => !t.completed && !t.skipped)

  const handleGotoCreate = () => {
    Taro.switchTab({ url: '/pages/create/index' })
  }

  const handleGotoTasks = () => {
    Taro.switchTab({ url: '/pages/tasks/index' })
  }

  const handleGotoMine = () => {
    Taro.switchTab({ url: '/pages/mine/index' })
  }

  const handleGotoMood = () => {
    Taro.navigateTo({ url: '/pages/mood/index' })
  }

  const handleGotoHistory = () => {
    Taro.navigateTo({ url: '/pages/history/index' })
  }

  const handleWorryClick = (worryId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${worryId}` })
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.greeting}>你好呀 🌿</Text>
        <Text className={styles.subGreeting}>把烦恼放下，这里有人听你说</Text>

        <View className={styles.statsCard}>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{userStats.postedCount}</Text>
              <Text className={styles.statLabel}>发布烦恼</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{userStats.respondedCount}</Text>
              <Text className={styles.statLabel}>回应他人</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{userStats.thankedCount}</Text>
              <Text className={styles.statLabel}>收获感谢</Text>
            </View>
          </View>
          <View className={styles.streakBadge}>
            <Text>🔥</Text>
            <Text>已连续陪伴 {userStats.streak} 天</Text>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.actionCard} onClick={handleGotoCreate}>
            <Text className={styles.actionEmoji}>💭</Text>
            <Text className={styles.actionTitle}>写烦恼</Text>
            <Text className={styles.actionDesc}>把心事说出来</Text>
          </View>
          <View className={styles.actionCard} onClick={handleGotoTasks}>
            <Text className={styles.actionEmoji}>🤗</Text>
            <Text className={styles.actionTitle}>回应任务</Text>
            <Text className={styles.actionDesc}>给陌生人温暖</Text>
          </View>
          <View className={styles.actionCard} onClick={handleGotoMood}>
            <Text className={styles.actionEmoji}>🌈</Text>
            <Text className={styles.actionTitle}>情绪打卡</Text>
            <Text className={styles.actionDesc}>记录今日心情</Text>
          </View>
          <View className={styles.actionCard} onClick={handleGotoHistory}>
            <Text className={styles.actionEmoji}>📖</Text>
            <Text className={styles.actionTitle}>交换记录</Text>
            <Text className={styles.actionDesc}>回看所有温暖</Text>
          </View>
        </View>

        <View className={styles.progressSection}>
          <View className={styles.progressInfo}>
            <Text className={styles.progressLeft}>
              今日还可回应
              <Text className={styles.quotaNum}>{userStats.dailyQuota - userStats.dailyUsed}</Text>
              条
            </Text>
          </View>
          <ProgressBar current={userStats.dailyUsed} total={userStats.dailyQuota} />
          <Text className={styles.tipText}>
            💡 每帮助一位陌生人，你也会收到一份来自他人的回应
          </Text>
        </View>

        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>进行中的交换</Text>
          {pendingWorries.length > 0 && (
            <Text className={styles.sectionMore} onClick={handleGotoMine}>查看全部</Text>
          )}
        </View>

        {pendingWorries.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="暂无进行中的交换"
            desc="写下第一条烦恼，开启温暖交换吧"
          />
        ) : (
          <View className={styles.activeSection}>
            {pendingWorries.map(worry => (
              <WorryCard
                key={worry.id}
                worry={worry}
                onClick={() => handleWorryClick(worry.id)}
              />
            ))}
          </View>
        )}

        {activeTasks.length > 0 && (
          <>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>等待回应</Text>
              <Text className={styles.sectionMore} onClick={handleGotoTasks}>去回应</Text>
            </View>
            <Text className={styles.tipText}>
              还有 {activeTasks.length} 个陌生人的烦恼等你回应
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  )
}

export default LobbyPage
