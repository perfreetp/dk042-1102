import React, { useState } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { MOODS, MoodType } from '@/types'
import { formatTime } from '@/utils'
import EmptyState from '@/components/EmptyState'

const MoodPage: React.FC = () => {
  const { moodHistory, checkinMood } = useApp()
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [note, setNote] = useState('')

  const canSubmit = selectedMood !== null

  const handleSubmit = () => {
    if (!canSubmit || !selectedMood) return
    checkinMood(selectedMood, note.trim())
    Taro.showToast({ title: '打卡成功 🌈', icon: 'success' })
    setSelectedMood(null)
    setNote('')
  }

  return (
    <View className={styles.pageContainer}>
      <Text className={styles.title}>情绪打卡 🌈</Text>
      <Text className={styles.subTitle}>记录今天的心情，温柔对待自己</Text>

      <View className={styles.checkinCard}>
        <Text className={styles.cardTitle}>今天的心情怎么样？</Text>
        <View className={styles.moodGrid}>
          {MOODS.map(mood => (
            <View
              key={mood.value}
              className={classnames(
                styles.moodItem,
                selectedMood === mood.value && styles.activeMood
              )}
              style={selectedMood === mood.value ? { borderColor: mood.color } : {}}
              onClick={() => setSelectedMood(mood.value)}
            >
              <Text className={styles.moodEmoji}>{mood.emoji}</Text>
              <Text className={styles.moodLabel}>{mood.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.noteSection}>
          <Text className={styles.noteLabel}>想说点什么？（选填）</Text>
          <Textarea
            className={styles.noteInput}
            value={note}
            onInput={(e) => setNote(e.detail.value)}
            placeholder="记录当下的感受..."
            maxlength={200}
            autoHeight
          />
        </View>

        <Button
          className={classnames(styles.submitBtn, !canSubmit && styles.disabledBtn)}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          完成打卡
        </Button>
      </View>

      <View className={styles.historySection}>
        <Text className={styles.historyTitle}>打卡记录</Text>
        {moodHistory.length === 0 ? (
          <EmptyState emoji="📝" title="暂无打卡记录" desc="完成今天的打卡吧" />
        ) : (
          moodHistory.map(item => {
            const moodInfo = MOODS.find(m => m.value === item.mood)
            return (
              <View key={item.id} className={styles.historyCard}>
                <Text className={styles.historyEmoji}>{moodInfo?.emoji}</Text>
                <View className={styles.historyContent}>
                  <Text className={item.note ? styles.historyNote : styles.emptyNote}>
                    {item.note || `${moodInfo?.label}的一天`}
                  </Text>
                  <Text className={styles.historyTime}>{formatTime(item.createdAt)}</Text>
                </View>
              </View>
            )
          })
        )}
      </View>
    </View>
  )
}

export default MoodPage
