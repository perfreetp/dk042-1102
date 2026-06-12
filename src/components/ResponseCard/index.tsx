import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { Response } from '@/types'
import { formatTime } from '@/utils'

interface ResponseCardProps {
  response: Response
  onFavorite?: () => void
  onThank?: () => void
  onFollowUp?: () => void
  onReport?: () => void
  showActions?: boolean
}

const ResponseCard: React.FC<ResponseCardProps> = ({
  response,
  onFavorite,
  onThank,
  onFollowUp,
  onReport,
  showActions = true
}) => {
  const typeInfo = {
    suggestion: { emoji: '💡', label: '建议' },
    empathy: { emoji: '🤗', label: '共情' },
    companionship: { emoji: '🌙', label: '陪伴' }
  }[response.type]

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.typeBadge}>
          <Text>{typeInfo.emoji}</Text>
          <Text>来自陌生人的{typeInfo.label}</Text>
        </View>
        <Text className={styles.time}>{formatTime(response.createdAt)}</Text>
      </View>
      <Text className={styles.content}>{response.content}</Text>
      {response.followUpContent && (
        <View style={{
          padding: '20rpx',
          background: 'rgba(124, 111, 230, 0.06)',
          borderRadius: '12rpx',
          marginBottom: '24rpx'
        }}>
          <Text style={{ fontSize: '22rpx', color: '#7C6FE6' }}>我的追问：</Text>
          <Text style={{ fontSize: '26rpx', color: '#2C2C3D', marginTop: '8rpx', display: 'block' }}>
            {response.followUpContent}
          </Text>
        </View>
      )}
      {showActions && (
        <View className={styles.actions}>
          <Button
            className={classnames(styles.actionBtn, response.isFavorite && styles.activeBtn)}
            onClick={onFavorite}
          >
            {response.isFavorite ? '⭐ 已收藏' : '☆ 收藏'}
          </Button>
          <Button
            className={classnames(styles.actionBtn, response.isThanked && styles.thankedBtn)}
            onClick={onThank}
            disabled={response.isThanked}
          >
            {response.isThanked ? '💖 已感谢' : '💌 匿名感谢'}
          </Button>
          <Button
            className={classnames(styles.actionBtn, !response.canFollowUp && styles.disabled)}
            onClick={onFollowUp}
            disabled={!response.canFollowUp}
          >
            {response.canFollowUp ? '❓ 追问一次' : '已追问'}
          </Button>
          <Button className={styles.actionBtn} onClick={onReport}>
            ⚠️ 举报
          </Button>
        </View>
      )}
    </View>
  )
}

export default ResponseCard
