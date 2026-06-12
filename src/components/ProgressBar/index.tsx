import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface ProgressBarProps {
  label?: string
  current: number
  total: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, total }) => {
  const percent = Math.min(100, (current / total) * 100)

  return (
    <View className={styles.container}>
      {label && (
        <View className={styles.header}>
          <Text className={styles.label}>{label}</Text>
          <Text className={styles.count}>{current}/{total}</Text>
        </View>
      )}
      <View className={styles.bar}>
        <View className={styles.fill} style={{ width: `${percent}%` }} />
      </View>
    </View>
  )
}

export default ProgressBar
