import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Button, Textarea, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { AssignedTask, ResponseType, RESPONSE_TYPES } from '@/types'
import { getCategoryInfo, getSeverityInfo, getRemainingTime, containsSensitiveContent } from '@/utils'
import EmptyState from '@/components/EmptyState'

type TabType = 'pending' | 'completed'

const COMPANION_TIPS = [
  '我在听，你慢慢说',
  '抱抱你，辛苦了',
  '你不是一个人',
  '辛苦了，先歇一歇',
  '一切都会好起来的',
  '你的感受是真实的'
]

const TasksPage: React.FC = () => {
  const { assignedTasks, userStats, completeTask, skipTask, refreshTimeouts, saveTaskDraft, getTaskDraft, clearTaskDraft } = useApp()

  useDidShow(() => {
    refreshTimeouts()
  })
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [showModal, setShowModal] = useState(false)
  const [currentTask, setCurrentTask] = useState<AssignedTask | null>(null)
  const [respType, setRespType] = useState<ResponseType>('empathy')
  const [respContent, setRespContent] = useState('')
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pendingTasks = assignedTasks.filter(t => !t.completed && !t.skipped && !t.expired)
  const completedTasks = assignedTasks.filter(t => t.completed || t.skipped || t.expired)

  const displayTasks = activeTab === 'pending' ? pendingTasks : completedTasks

  const isTaskExpired = (task: AssignedTask | null): boolean => {
    if (!task) return true
    if (task.expired) return true
    return new Date(task.expiresAt).getTime() <= Date.now()
  }

  const persistDraft = (taskId: string, type: ResponseType, content: string) => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      saveTaskDraft(taskId, type, content)
    }, 300)
  }

  const handleOpenModal = (task: AssignedTask) => {
    if (isTaskExpired(task)) {
      Taro.showToast({ title: '这条任务已超时', icon: 'none' })
      return
    }
    if (containsSensitiveContent(task.worry.content)) {
      Taro.showModal({
        title: '温馨提示',
        content: '检测到内容涉及敏感话题，如果对方情况紧急，建议提醒他/她寻求专业帮助。\n\n全国心理援助热线：400-161-9995',
        confirmText: '我知道了',
        success: () => {
          openModal(task)
        }
      })
    } else {
      openModal(task)
    }
  }

  const openModal = (task: AssignedTask) => {
    setCurrentTask(task)
    const draft = getTaskDraft(task.id)
    if (draft) {
      setRespType(draft.type)
      setRespContent(draft.content)
    } else {
      setRespType(task.worry.expectedResponse)
      setRespContent('')
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    if (currentTask && respContent.trim()) {
      saveTaskDraft(currentTask.id, respType, respContent.trim())
    }
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    setShowModal(false)
    setCurrentTask(null)
    setRespContent('')
  }

  const handleSkip = (taskId: string) => {
    Taro.showModal({
      title: '确认跳过',
      content: '跳过这条任务后，将为你匹配新的烦恼',
      success: (res) => {
        if (res.confirm) {
          skipTask(taskId)
          clearTaskDraft(taskId)
          Taro.showToast({ title: '已跳过', icon: 'success' })
        }
      }
    })
  }

  const handleTipClick = (tip: string) => {
    const newContent = respContent + (respContent ? ' ' : '') + tip
    setRespContent(newContent)
    if (currentTask) persistDraft(currentTask.id, respType, newContent)
  }

  const handleContentChange = (val: string) => {
    setRespContent(val)
    if (currentTask) persistDraft(currentTask.id, respType, val)
  }

  const handleTypeChange = (val: ResponseType) => {
    setRespType(val)
    if (currentTask) persistDraft(currentTask.id, val, respContent)
  }

  const handleSubmit = () => {
    if (!respContent.trim() || respContent.length < 5) {
      Taro.showToast({ title: '请至少写5个字', icon: 'none' })
      return
    }
    if (!currentTask) return

    if (isTaskExpired(currentTask)) {
      Taro.showToast({ title: '这条任务已超时，无法发送', icon: 'none' })
      handleCloseModal()
      return
    }

    if (containsSensitiveContent(respContent)) {
      Taro.showToast({ title: '内容包含敏感词，请调整', icon: 'none' })
      return
    }

    completeTask(currentTask.id, {
      type: respType,
      content: respContent.trim()
    })

    Taro.showToast({ title: '回应已送出 💕', icon: 'success' })
    handleCloseModal()
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>回应任务 🤗</Text>
        <Text className={styles.subTitle}>给陌生人一份温暖，也会收到属于你的回应</Text>
      </View>

      <View className={styles.quotaCard}>
        <View className={styles.quotaTop}>
          <Text className={styles.quotaText}>今日配额</Text>
          <Text className={styles.quotaNum}>
            {userStats.dailyQuota - userStats.dailyUsed} / {userStats.dailyQuota}
          </Text>
        </View>
        <Text style={{ fontSize: '22rpx', opacity: 0.85 }}>
          已完成 {userStats.dailyUsed} 条，还可以回应 {userStats.dailyQuota - userStats.dailyUsed} 位陌生人
        </Text>
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'pending' && styles.activeTab)}
          onClick={() => setActiveTab('pending')}
        >
          待回应 ({pendingTasks.length})
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'completed' && styles.activeTab)}
          onClick={() => setActiveTab('completed')}
        >
          已完成 ({completedTasks.length})
        </View>
      </View>

      <ScrollView scrollY>
        {displayTasks.length === 0 ? (
          activeTab === 'pending' ? (
            <EmptyState
              emoji="💫"
              title="暂无待回应任务"
              desc="休息一下，稍后会有新的烦恼匹配给你"
            />
          ) : (
            <EmptyState
              emoji="📝"
              title="暂无完成记录"
              desc="完成回应任务后记录会显示在这里"
            />
          )
        ) : (
          displayTasks.map(task => {
            const category = getCategoryInfo(task.worry.category)
            const severity = getSeverityInfo(task.worry.severity)
            const expType = RESPONSE_TYPES.find(r => r.value === task.worry.expectedResponse)
            const taskExpired = isTaskExpired(task)

            return (
              <View key={task.id} className={classnames(styles.worryCard, taskExpired && styles.expiredCard)}>
                <View className={styles.cardHeader}>
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
                    <View className={classnames(styles.tag, styles.expectedTag)}>
                      {expType?.emoji} 期望{expType?.label}
                    </View>
                  </View>
                </View>
                <Text className={styles.content}>{task.worry.content}</Text>
                <View className={styles.cardHeader}>
                  {taskExpired ? (
                    <Text className={styles.timeLeft} style={{ color: '#FF4D4F' }}>⏰ 已超时</Text>
                  ) : (
                    <Text className={styles.timeLeft}>⏳ 剩余 {getRemainingTime(task.expiresAt)}</Text>
                  )}
                  {task.skipped && <Text style={{ fontSize: '22rpx', color: '#9A9AB0' }}>已跳过</Text>}
                  {task.completed && <Text style={{ fontSize: '22rpx', color: '#52C41A' }}>✓ 已回应</Text>}
                </View>
                {!task.completed && !task.skipped && !taskExpired && (
                  <View className={styles.cardFooter}>
                    <Button className={styles.skipBtn} onClick={() => handleSkip(task.id)}>跳过</Button>
                    <Button className={styles.respondBtn} onClick={() => handleOpenModal(task)}>
                      写回应
                    </Button>
                  </View>
                )}
                {taskExpired && !task.completed && (
                  <View className={styles.cardFooter}>
                    <Text style={{ fontSize: '24rpx', color: '#9A9AB0' }}>任务已超时，无法回应</Text>
                  </View>
                )}
              </View>
            )
          })
        )}
      </ScrollView>

      {showModal && currentTask && (
        <View className={styles.respondModal} onClick={handleCloseModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>写下你的回应</Text>
              <Text className={styles.closeBtn} onClick={handleCloseModal}>✕</Text>
            </View>

            <View style={{
              padding: '20rpx',
              background: '#F7F5FF',
              borderRadius: '12rpx',
              marginBottom: '32rpx'
            }}>
              <Text style={{ fontSize: '22rpx', color: '#7C6FE6', marginBottom: '8rpx', display: 'block' }}>对方的烦恼：</Text>
              <Text style={{ fontSize: '26rpx', color: '#2C2C3D', lineHeight: 1.6 }}>
                {currentTask.worry.content}
              </Text>
            </View>

            {isTaskExpired(currentTask) ? (
              <View className={styles.expiredNotice}>
                <Text>⏰ 这条任务已超时，无法发送</Text>
              </View>
            ) : null}

            <View className={styles.typeSection}>
              <Text className={styles.typeLabel}>回应方式</Text>
              <View className={styles.typeGrid}>
                {RESPONSE_TYPES.map(rt => (
                  <View
                    key={rt.value}
                    className={classnames(styles.typeItem, respType === rt.value && styles.typeActive)}
                    onClick={() => !isTaskExpired(currentTask) && handleTypeChange(rt.value)}
                  >
                    <Text className={styles.typeEmoji}>{rt.emoji}</Text>
                    <Text className={styles.typeName}>{rt.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.inputSection}>
              <Text className={styles.inputLabel}>你的回应</Text>
              <Textarea
                className={styles.inputArea}
                value={respContent}
                onInput={(e) => handleContentChange(e.detail.value)}
                placeholder={
                  isTaskExpired(currentTask)
                    ? '任务已超时'
                    : respType === 'suggestion'
                    ? '分享一些实用的建议吧...'
                    : respType === 'empathy'
                    ? '表达你的理解和安慰...'
                    : '用几句话陪伴TA...'
                }
                maxlength={300}
                autoHeight
                disabled={isTaskExpired(currentTask)}
              />
              <Text className={styles.charCount}>{respContent.length}/300</Text>
            </View>

            {respType === 'companionship' && !isTaskExpired(currentTask) && (
              <View className={styles.quickTips}>
                <Text className={styles.quickLabel}>💡 试试这些陪伴语</Text>
                <View className={styles.tipChips}>
                  {COMPANION_TIPS.map((tip, i) => (
                    <View key={i} className={styles.tipChip} onClick={() => handleTipClick(tip)}>
                      {tip}
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Button
              className={classnames(styles.submitBtn, (respContent.length < 5 || isTaskExpired(currentTask)) && styles.disabledBtn)}
              onClick={handleSubmit}
              disabled={respContent.length < 5 || isTaskExpired(currentTask)}
            >
              {isTaskExpired(currentTask) ? '任务已超时' : '发送回应'}
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default TasksPage
