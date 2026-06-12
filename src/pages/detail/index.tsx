import React, { useState } from 'react'
import { View, Text, Button, Textarea } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { STATUS_LABELS, FEEDBACK_TAGS, FeedbackTag } from '@/types'
import { getCategoryInfo, getSeverityInfo, formatTime, getRemainingTime } from '@/utils'
import ResponseCard from '@/components/ResponseCard'
import EmptyState from '@/components/EmptyState'

const DetailPage: React.FC = () => {
  const router = useRouter()
  const { myWorries, toggleFavorite, thankResponse, refreshTimeouts, submitResponseFeedback } = useApp()
  const worryId = router.params.id

  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedTags, setSelectedTags] = useState<FeedbackTag[]>([])
  const [feedbackComment, setFeedbackComment] = useState('')

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

  const toggleTag = (tag: FeedbackTag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmitFeedback = () => {
    if (selectedTags.length === 0) {
      Taro.showToast({ title: '请至少选择一个标签', icon: 'none' })
      return
    }
    if (worry.response) {
      submitResponseFeedback(worry.response.id, selectedTags, feedbackComment.trim())
      Taro.showToast({ title: '反馈已提交，谢谢你！', icon: 'success' })
      setShowFeedback(false)
      setSelectedTags([])
      setFeedbackComment('')
    }
  }

  const renderFeedbackDisplay = () => {
    if (!worry.response?.feedback) return null
    const fb = worry.response.feedback
    return (
      <View className={styles.feedbackDisplay}>
        <View className={styles.feedbackHeader}>
          <Text className={styles.feedbackTitle}>🎯 你对这条回应的反馈</Text>
        </View>
        <View className={styles.feedbackTags}>
          {fb.tags.map(tag => {
            const ti = FEEDBACK_TAGS.find(t => t.value === tag)
            return (
              <View key={tag} className={styles.feedbackTag}>
                {ti?.emoji} {ti?.label}
              </View>
            )
          })}
        </View>
        {fb.comment && (
          <Text className={styles.feedbackComment}>"{fb.comment}"</Text>
        )}
      </View>
    )
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
          <View>
            <ResponseCard
              response={worry.response}
              onFavorite={handleFavorite}
              onThank={handleThank}
              onFollowUp={handleFollowUp}
              onReport={handleReport}
            />

            {renderFeedbackDisplay()}

            {!worry.response.feedback && !showFeedback ? (
              <Button className={styles.feedbackBtn} onClick={() => setShowFeedback(true)}>
                ✍️ 给这条回应打个分
              </Button>
            ) : null}

            {showFeedback && (
              <View className={styles.feedbackModal}>
                <View className={styles.feedbackModalHeader}>
                  <Text className={styles.feedbackModalTitle}>这条回应对你有帮助吗？</Text>
                  <Text className={styles.feedbackClose} onClick={() => setShowFeedback(false)}>✕</Text>
                </View>

                <Text className={styles.feedbackLabel}>选择标签（可多选）</Text>
                <View className={styles.feedbackTagGrid}>
                  {FEEDBACK_TAGS.map(tag => (
                    <View
                      key={tag.value}
                      className={classnames(styles.feedbackTagItem, selectedTags.includes(tag.value) && styles.feedbackTagSelected)}
                      onClick={() => toggleTag(tag.value)}
                    >
                      <Text>{tag.emoji} {tag.label}</Text>
                    </View>
                  ))}
                </View>

                <Text className={styles.feedbackLabel}>写一句短评（选填）</Text>
                <Textarea
                  className={styles.feedbackInput}
                  value={feedbackComment}
                  onInput={(e) => setFeedbackComment(e.detail.value)}
                  placeholder="对方会收到你的反馈，会更有动力继续温暖他人..."
                  maxlength={100}
                  autoHeight
                />

                <Button
                  className={classnames(styles.feedbackSubmit, selectedTags.length === 0 && styles.disabledBtn)}
                  onClick={handleSubmitFeedback}
                  disabled={selectedTags.length === 0}
                >
                  提交反馈
                </Button>
              </View>
            )}
          </View>
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
