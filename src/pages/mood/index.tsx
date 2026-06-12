import React, { useState } from 'react'
import { View, Text, Textarea, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { MOODS, MoodType } from '@/types'
import { formatTime } from '@/utils'
import EmptyState from '@/components/EmptyState'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

const MoodPage: React.FC = () => {
  const { moodHistory, checkinMood, getWeeklyMoods, hasCheckedInToday, refreshTimeouts } = useApp()
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [note, setNote] = useState('')

  useDidShow(() => {
    refreshTimeouts()
  })

  const canSubmit = selectedMood !== null
  const weeklyMoods = getWeeklyMoods()

  const today = new Date()
  const todayDayOfWeek = (today.getDay() + 6) % 7

  const handleSubmit = () => {
    if (!canSubmit || !selectedMood) return
    checkinMood(selectedMood, note.trim())
    Taro.showToast({ title: '打卡成功 🌈', icon: 'success' })
    setSelectedMood(null)
    setNote('')
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <Text className={styles.title}>情绪打卡 🌈</Text>
      <Text className={styles.subTitle}>
        {hasCheckedInToday ? '今天已经打过卡啦，明天继续～' : '记录今天的心情，温柔对待自己'}
      </Text>

      <View className={styles.weekCard}>
        <Text className={styles.weekTitle}>最近七天</Text>
        <View className={styles.weekGrid}>
          {weeklyMoods.map((m, i) => {
            const moodInfo = m ? MOODS.find(x => x.value === m.mood) : null
            const isToday = i === todayDayOfWeek
            return (
              <View key={i} className={classnames(styles.weekItem, isToday && styles.weekItemToday)}>
                <Text className={styles.weekDay}>
                  {WEEKDAYS[i]}
                </Text>
                <View className={styles.weekEmojiBox}>
                  {moodInfo ? (
                    <Text className={styles.weekEmoji}>{moodInfo.emoji}</Text>
                  ) : (
                    <Text className={styles.weekEmpty}>·</Text>
                  )}
                </View>
                {m?.note && (
                  <Text className={styles.weekNote}>{m.note.length > 6 ? m.note.slice(0, 6) + '…' : m.note}</Text>
                )}
              </View>
            )
          })}
        </View>
      </View>

      <View className={styles.checkinCard}>
        <Text className={styles.cardTitle}>
          {hasCheckedInToday ? '更新今天的心情' : '今天的心情怎么样？'}
        </Text>
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
          {hasCheckedInToday ? '更新打卡' : '完成打卡'}
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
    </ScrollView>
  )
}

export default MoodPage
