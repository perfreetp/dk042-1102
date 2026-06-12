import React from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import { useApp } from '@/store/AppContext'
import { formatTime } from '@/utils'

const HOTLINES = [
  { name: '全国心理援助热线', number: '400-161-9995' },
  { name: '北京心理危机研究与干预中心', number: '010-82951332' },
  { name: '上海市心理援助热线', number: '021-12320-5' }
]

const GUIDELINES = [
  { icon: '✅', text: '所有交换均为匿名，不会泄露你的个人信息' },
  { icon: '⚠️', text: '如遇骚扰或不当内容，可随时举报并拉黑用户' },
  { icon: '⏰', text: '烦恼卡片24小时未匹配将自动回收，保护你的隐私' },
  { icon: '🔒', text: '你的情绪记录仅自己可见，安心打卡' },
  { icon: '💚', text: '如果情况严重，请及时寻求专业心理援助' }
]

const SafetyPage: React.FC = () => {
  const { blockedUsers, removeBlockedUser, refreshTimeouts } = useApp()

  useDidShow(() => {
    refreshTimeouts()
  })

  const handleCall = (number: string) => {
    Taro.showModal({
      title: '拨打电话',
      content: `是否拨打 ${number}？`,
      success: (res) => {
        if (res.confirm) {
          Taro.makePhoneCall({ phoneNumber: number }).catch(err => {
            console.error('[Safety] Call failed:', err)
            Taro.showToast({ title: '拨号失败', icon: 'none' })
          })
        }
      }
    })
  }

  const handleGotoMood = () => {
    Taro.navigateTo({ url: '/pages/mood/index' })
  }

  const handleGotoReport = () => {
    Taro.navigateTo({ url: '/pages/report/index' })
  }

  const handleGotoSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' })
  }

  const handleTimeoutInfo = () => {
    Taro.showModal({
      title: '超时自动回收',
      content: '为了保护你的隐私：\n\n1. 发布的烦恼24小时内未匹配，将自动回收删除\n2. 匹配到的烦恼需要在规定时间内回应，否则会被回收并分配给其他人\n3. 所有已完成的交换记录可在"交换记录"中回看',
      showCancel: false,
      confirmText: '我知道了'
    })
  }

  const handleUnblock = (userId: string, userName: string) => {
    Taro.showModal({
      title: '解除拉黑',
      content: `确定要解除对 ${userName} 的拉黑吗？`,
      success: (res) => {
        if (res.confirm) {
          removeBlockedUser(userId)
          Taro.showToast({ title: '已解除拉黑', icon: 'success' })
        }
      }
    })
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <Text className={styles.title}>安全中心 🛡️</Text>
      <Text className={styles.subTitle}>你的安全和隐私是我们最在意的事</Text>

      <View className={styles.emergencyCard}>
        <View className={styles.emergencyTitle}>
          <Text>🆘</Text>
          <Text>紧急心理援助</Text>
        </View>
        <Text className={styles.emergencyDesc}>
          如果你或身边的人正在经历心理危机，请立即拨打以下援助热线，你不是一个人。
        </Text>
        <View className={styles.hotlineList}>
          {HOTLINES.map(h => (
            <View key={h.number} className={styles.hotlineItem}>
              <View className={styles.hotlineInfo}>
                <Text className={styles.hotlineName}>{h.name}</Text>
                <Text className={styles.hotlineNum}>{h.number}</Text>
              </View>
              <Button className={styles.callBtn} onClick={() => handleCall(h.number)}>
                拨打
              </Button>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>安全功能</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleGotoMood}>
            <View className={styles.menuIcon}>🌈</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuName}>情绪打卡</Text>
              <Text className={styles.menuDesc}>记录每日心情，关注自己的情绪变化</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleGotoReport}>
            <View className={styles.menuIcon} style={{ background: 'rgba(255, 107, 107, 0.1)' }}>⚠️</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuName}>举报与拉黑</Text>
              <Text className={styles.menuDesc}>举报不当内容，拉黑不友善用户</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleTimeoutInfo}>
            <View className={styles.menuIcon} style={{ background: 'rgba(250, 173, 20, 0.1)' }}>⏰</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuName}>超时自动回收</Text>
              <Text className={styles.menuDesc}>了解超时回收机制，保护你的隐私</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleGotoSettings}>
            <View className={styles.menuIcon} style={{ background: 'rgba(129, 199, 132, 0.15)' }}>🔒</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuName}>隐私设置</Text>
              <Text className={styles.menuDesc}>管理你的隐私和通知偏好</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>社区守则</Text>
        <View className={styles.guidelinesCard}>
          {GUIDELINES.map((g, i) => (
            <View key={i} className={styles.guidelineItem}>
              <Text className={styles.guidelineIcon}>{g.icon}</Text>
              <Text className={styles.guidelineText}>{g.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.blockedHeader}>
          <Text className={styles.sectionTitle}>我的黑名单</Text>
          <Text className={styles.blockedCount}>{blockedUsers.length} 人</Text>
        </View>
        {blockedUsers.length === 0 ? (
          <View className={styles.emptyBlocked}>
            <Text className={styles.emptyBlockedEmoji}>🟢</Text>
            <Text className={styles.emptyBlockedText}>暂无拉黑的用户</Text>
            <Text className={styles.emptyBlockedSub}>你可以在回应详情页举报并拉黑不当用户</Text>
          </View>
        ) : (
          <View className={styles.blockedCardList}>
            {blockedUsers.map(u => (
              <View key={u.id} className={styles.blockedCardItem}>
                <View className={styles.blockedCardInfo}>
                  <View className={styles.blockedCardAvatar}>{u.emoji}</View>
                  <View>
                    <Text className={styles.blockedCardName}>{u.name}</Text>
                    <Text className={styles.blockedCardTime}>拉黑于 {formatTime(u.blockedAt)}</Text>
                  </View>
                </View>
                <Button
                  className={styles.blockedCardUnblock}
                  onClick={() => handleUnblock(u.id, u.name)}
                >
                  解除拉黑
                </Button>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default SafetyPage
