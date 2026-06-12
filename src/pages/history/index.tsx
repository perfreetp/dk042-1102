import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { formatTime } from '@/utils'
import EmptyState from '@/components/EmptyState'

type TabType = 'posted' | 'responded'

const HistoryPage: React.FC = () => {
  const { myWorries, userStats, assignedTasks } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('posted')

  const completedTasks = assignedTasks.filter(t => t.completed)

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
          myWorries.map(worry => (
            <View key={worry.id} className={styles.recordCard}>
              <Text className={styles.recordType}>
                {worry.response ? '💚 已收到回应' : '⏳ 等待中'}
              </Text>
              <Text className={styles.recordContent}>{worry.content}</Text>
              <View className={styles.recordMeta}>
                <Text>{formatTime(worry.createdAt)}</Text>
                <Text>{worry.response ? '已完成' : '进行中'}</Text>
              </View>
            </View>
          ))
        )
      ) : (
        completedTasks.length === 0 ? (
          <EmptyState emoji="🤗" title="暂无回应记录" desc="去回应别人的烦恼吧" />
        ) : (
          completedTasks.map(task => (
            <View key={task.id} className={styles.recordCard}>
              <Text className={styles.recordType}>🤝 我回应了这条烦恼</Text>
              <Text className={styles.recordContent}>{task.worry.content}</Text>
              <View className={styles.recordMeta}>
                <Text>{formatTime(task.assignedAt)}</Text>
                <Text>已完成</Text>
              </View>
            </View>
          ))
        )
      )}
    </View>
  )
}

export default HistoryPage
