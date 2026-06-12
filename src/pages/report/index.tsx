import React, { useState } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'

const REASONS = [
  { value: 'harassment', label: '骚扰或人身攻击' },
  { value: 'inappropriate', label: '不当或违规内容' },
  { value: 'spam', label: '垃圾信息或广告' },
  { value: 'fake', label: '虚假或欺骗信息' },
  { value: 'other', label: '其他原因' }
]

const BLOCKED_USERS = [
  { id: 'u1', name: '匿名用户#A23F', emoji: '🌑' }
]

const ReportPage: React.FC = () => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [detail, setDetail] = useState('')
  const [shouldBlock, setShouldBlock] = useState(true)

  const canSubmit = selectedReason !== null

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请选择举报原因', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '举报已提交',
      content: '感谢你的反馈，我们会尽快处理。' + (shouldBlock ? '\n\n已同时将该用户加入黑名单。' : ''),
      showCancel: false,
      success: () => {
        Taro.navigateBack()
      }
    })
  }

  const handleUnblock = () => {
    Taro.showToast({ title: '已解除拉黑', icon: 'success' })
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>举报原因</Text>
        <View className={styles.reasonList}>
          {REASONS.map(reason => (
            <View
              key={reason.value}
              className={classnames(
                styles.reasonItem,
                selectedReason === reason.value && styles.activeReason
              )}
              onClick={() => setSelectedReason(reason.value)}
            >
              <View className={styles.radio}>
                {selectedReason === reason.value && <View className={styles.radioDot} />}
              </View>
              <Text className={styles.reasonText}>{reason.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.detailSection}>
          <Text className={styles.detailLabel}>补充说明（选填）</Text>
          <Textarea
            className={styles.detailInput}
            value={detail}
            onInput={(e) => setDetail(e.detail.value)}
            placeholder="请描述具体情况，帮助我们更好地处理..."
            maxlength={500}
            autoHeight
          />
          <Text className={styles.charCount}>{detail.length}/500</Text>
        </View>

        <View className={styles.blockRow}>
          <Text className={styles.blockLabel}>同时拉黑该用户</Text>
          <View
            className={classnames(styles.switch, shouldBlock && styles.switchOn)}
            onClick={() => setShouldBlock(!shouldBlock)}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
      </View>

      <Button
        className={classnames(styles.submitBtn, !canSubmit && styles.disabledBtn)}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        提交举报
      </Button>

      <View className={styles.section} style={{ marginTop: '48rpx' }}>
        <Text className={styles.sectionTitle}>我的黑名单</Text>
        <View className={styles.blockedList}>
          {BLOCKED_USERS.length === 0 ? (
            <Text style={{ fontSize: '26rpx', color: '#9A9AB0', padding: '20rpx 0' }}>
              暂无拉黑的用户
            </Text>
          ) : (
            BLOCKED_USERS.map(u => (
              <View key={u.id} className={styles.blockedItem}>
                <View className={styles.blockedInfo}>
                  <View className={styles.avatar}>{u.emoji}</View>
                  <Text className={styles.blockedName}>{u.name}</Text>
                </View>
                <Button className={styles.unblockBtn} onClick={handleUnblock}>
                  解除拉黑
                </Button>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  )
}

export default ReportPage
