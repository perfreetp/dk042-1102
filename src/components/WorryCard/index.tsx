import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'
import { Worry, STATUS_LABELS } from '@/types'
import { getCategoryInfo, getSeverityInfo, formatTime, getRemainingTime } from '@/utils'

interface WorryCardProps {
  worry: Worry
  onClick?: () => void
  showStatus?: boolean
}

const WorryCard: React.FC<WorryCardProps> = ({ worry, onClick, showStatus = true }) => {
  const category = getCategoryInfo(worry.category)
  const severity = getSeverityInfo(worry.severity)

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.tags}>
          <View className={classnames(styles.tag, styles.categoryTag)}>
            {category.emoji} {category.label}
          </View>
          <View
            className={classnames(styles.tag, styles.severityTag)}
            style={{ background: severity.color }}
          >
            {severity.label}
          </View>
          {showStatus && (
            <View className={classnames(styles.tag, styles.statusTag)}>
              {STATUS_LABELS[worry.status]}
            </View>
          )}
        </View>
        <Text className={styles.time}>{formatTime(worry.createdAt)}</Text>
      </View>
      <Text className={styles.content}>{worry.content}</Text>
      <View className={styles.footer}>
        <View className={styles.footerInfo}>
          <Text>期望：</Text>
          <Text style={{ color: '$color-primary' }}>
            {worry.expectedResponse === 'suggestion' ? '💡 建议' :
             worry.expectedResponse === 'empathy' ? '🤗 共情' : '🌙 陪伴'}
          </Text>
        </View>
        <View className={classnames(styles.footerInfo, styles.expireBadge)}>
          ⏳ {getRemainingTime(worry.expiresAt)}
        </View>
      </View>
    </View>
  )
}

export default WorryCard
