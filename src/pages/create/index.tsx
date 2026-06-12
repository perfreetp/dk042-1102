import React, { useState, useEffect } from 'react'
import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { CATEGORIES, SEVERITIES, RESPONSE_TYPES, CategoryType, SeverityType, ResponseType } from '@/types'
import { containsSensitiveContent } from '@/utils'

const CreatePage: React.FC = () => {
  const { addWorry } = useApp()

  const [content, setContent] = useState('')
  const [category, setCategory] = useState<CategoryType>('other')
  const [severity, setSeverity] = useState<SeverityType>('moderate')
  const [expectedResponse, setExpectedResponse] = useState<ResponseType>('empathy')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [hasSensitive, setHasSensitive] = useState(false)

  useEffect(() => {
    setHasSensitive(containsSensitiveContent(content))
  }, [content])

  const canSubmit = content.trim().length >= 10

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请至少写10个字', icon: 'none' })
      return
    }

    addWorry({
      content: content.trim(),
      category,
      severity,
      expectedResponse,
      isAnonymous
    })

    Taro.showToast({ title: '发布成功！', icon: 'success' })
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/lobby/index' })
    }, 1500)
  }

  const handleHelpLine = () => {
    Taro.showModal({
      title: '需要帮助？',
      content: '如果你正在经历艰难时刻，请记住你不是一个人。\n\n全国心理援助热线：400-161-9995\n北京心理危机研究与干预中心：010-82951332',
      showCancel: false,
      confirmText: '我知道了'
    })
  }

  return (
    <View className={styles.pageContainer}>
      <Text className={styles.title}>写下你的烦恼 💭</Text>
      <Text className={styles.subTitle}>
        把心里的事都说出来吧，会有陌生人温柔地回应你。所有交换都是匿名的，请放心倾诉。
      </Text>

      {hasSensitive && (
        <View className={styles.sensitiveAlert}>
          <Text className={styles.alertIcon}>🆘</Text>
          <View className={styles.alertContent}>
            <Text className={styles.alertTitle}>我们在关心你</Text>
            <Text className={styles.alertText}>
              检测到你可能正在经历很艰难的时刻，请一定记得，生命是最宝贵的。
            </Text>
            <Text className={styles.helpLine} onClick={handleHelpLine}>点击查看援助热线 →</Text>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>说说你的烦恼</Text>
        <View className={styles.textAreaWrap}>
          <Textarea
            className={styles.textArea}
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            placeholder="发生了什么？你现在的感受是怎样的？"
            maxlength={500}
            autoHeight
          />
        </View>
        <Text className={styles.count}>{content.length}/500</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>属于哪种烦恼？</Text>
        <View className={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <View
              key={cat.value}
              className={classnames(styles.categoryItem, category === cat.value && styles.activeCat)}
              onClick={() => setCategory(cat.value)}
            >
              <Text className={styles.catEmoji}>{cat.emoji}</Text>
              <Text className={styles.catLabel}>{cat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>目前的严重程度</Text>
        <View className={styles.optionRow}>
          {SEVERITIES.map(sev => (
            <View
              key={sev.value}
              className={classnames(
                styles.optionItem,
                severity === sev.value && styles.activeOpt,
                severity === sev.value && styles.severityActive
              )}
              style={severity === sev.value ? { background: sev.color } : {}}
              onClick={() => setSeverity(sev.value)}
            >
              {sev.label}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>希望收到怎样的回应？</Text>
        {RESPONSE_TYPES.map(rt => (
          <View
            key={rt.value}
            className={classnames(styles.responseCard, expectedResponse === rt.value && styles.respActive)}
            onClick={() => setExpectedResponse(rt.value)}
          >
            <Text className={styles.respEmoji}>{rt.emoji}</Text>
            <View className={styles.respContent}>
              <Text className={styles.respLabel}>{rt.label}</Text>
              <Text className={styles.respDesc}>{rt.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.anonymousRow}>
          <View>
            <Text className={styles.anonymousLabel}>匿名发布</Text>
            <Text className={styles.anonymousSub}>其他人不会看到你的身份信息</Text>
          </View>
          <View
            className={classnames(styles.switch, isAnonymous && styles.switchOn)}
            onClick={() => setIsAnonymous(!isAnonymous)}
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
        发布烦恼，等待温暖
      </Button>
    </View>
  )
}

export default CreatePage
