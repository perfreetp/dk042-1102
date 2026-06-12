import React, { useState } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'

const FollowupPage: React.FC = () => {
  const router = useRouter()
  const { myWorries, addFollowUp } = useApp()
  const responseId = router.params.id
  const [content, setContent] = useState('')

  const worry = myWorries.find(w => w.response?.id === responseId)
  const response = worry?.response

  const canSubmit = content.trim().length >= 5

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请至少写5个字', icon: 'none' })
      return
    }
    if (!responseId) return

    addFollowUp(responseId, content.trim())
    Taro.showToast({ title: '追问已发送', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  if (!response) {
    return (
      <View className={styles.pageContainer}>
        <Text style={{ fontSize: '28rpx', color: '#9A9AB0' }}>未找到相关回应</Text>
      </View>
    )
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.tipCard}>
        <Text className={styles.tipText}>
          每条回应只支持 <Text className={styles.tipHighlight}>追问一次</Text>，
          请清晰描述你想进一步了解的内容。
        </Text>
      </View>

      <View className={styles.responseCard}>
        <View className={styles.cardLabel}>
          <Text>🤗</Text>
          <Text>对方的回应</Text>
        </View>
        <Text className={styles.responseContent}>{response.content}</Text>
      </View>

      <View className={styles.inputSection}>
        <Text className={styles.inputLabel}>写下你的追问</Text>
        <Textarea
          className={styles.inputArea}
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          placeholder="你想进一步问对方什么？比如具体的建议细节、类似经历等..."
          maxlength={300}
          autoHeight
        />
        <Text className={styles.charCount}>{content.length}/300</Text>
      </View>

      <Button
        className={classnames(styles.submitBtn, !canSubmit && styles.disabledBtn)}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        发送追问
      </Button>
    </View>
  )
}

export default FollowupPage
