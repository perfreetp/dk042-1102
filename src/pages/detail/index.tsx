import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { STATUS_LABELS } from '@/types'
import { getCategoryInfo, getSeverityInfo, formatTime, getRemainingTime } from '@/utils'
import ResponseCard from '@/components/ResponseCard'
import EmptyState from '@/components/EmptyState'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const { myWorries, toggleFavorite, thankResponse, refreshTimeouts } = useApp()
  const worryId = router.params.id

  useDidShow(() => {
    refreshTimeouts()
  })

  const worry = myWorries.find(w => w.id === worryId)

  if (!worry) {
    return (
      <View className={styles.pageContainer}>
        <EmptyState emoji="🤔" title="未找到该烦恼" desc="可能已超时回收" />
      </View>
    )
  }

  const category = getCategoryInfo(worry.category)
  const severity = getSeverityInfo(worry.severity)

  const handleFavorite = () => {
    if (worry.response) toggleFavorite(worry.response.id)
  }

  const handleThank = () => {
    if (worry.response && !worry.response.isThanked) {
      thankResponse(worry.response.id)
      Taro.showToast({ title: '感谢已送出 💖', icon: 'none' })
    }
  }

  const handleFollowUp = () => {
    if (worry.response?.id) {
      Taro.navigateTo({ url: `/pages/followup/index?id=${worry.response.id}` })
    }
  }

  const handleReport = () => {
    Taro.navigateTo({ url: `/pages/report/index?type=response&id=${worry.response?.id || ''}` })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.worryCard}>
        <View className={styles.header}>
          <View className={classnames(styles.tag, styles.categoryTag)}>
            {category.emoji} {category.label}
          </View>
          <View
            className={classnames(styles.tag, styles.severityTag)}
            style={{ background: severity.color }}
          >
            {severity.label}
          </View>
          <View className={classnames(styles.tag, styles.statusTag)}>
            {STATUS_LABELS[worry.status]}
          </View>
        </View>
        <View className={styles.meta}>
          <Text className={styles.metaText}>{formatTime(worry.createdAt)}</Text>
          <Text className={classnames(styles.metaText, styles.expireText)}>
            ⏳ {getRemainingTime(worry.expiresAt)}
          </Text>
        </View>
        <Text className={styles.content}>{worry.content}</Text>
      </View>

      <View className={styles.responseSection}>
        <Text className={styles.sectionTitle}>收到的回应</Text>
        {worry.response ? (
          <ResponseCard
            response={worry.response}
            onFavorite={handleFavorite}
            onThank={handleThank}
            onFollowUp={handleFollowUp}
            onReport={handleReport}
          />
        ) : worry.status === 'timeout' ? (
          <View className={styles.emptyResponse}>
            <Text className={styles.emptyEmoji}>⏰</Text>
            <Text className={styles.emptyText}>
              这条烦恼已超时回收{'\n'}下次有烦恼可以早点发布哦
            </Text>
          </View>
        ) : (
          <View className={styles.emptyResponse}>
            <Text className={styles.emptyEmoji}>💭</Text>
            <Text className={styles.emptyText}>
              正在匹配善良的陌生人...{'\n'}请耐心等待，温暖正在路上
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default DetailPage
