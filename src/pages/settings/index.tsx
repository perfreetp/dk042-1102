import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'

const SettingsPage: React.FC = () => {
  const [notifyNew, setNotifyNew] = useState(true)
  const [notifyResponse, setNotifyResponse] = useState(true)
  const [showMoodReminder, setShowMoodReminder] = useState(true)

  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  }

  const handleAbout = () => {
    Taro.showModal({
      title: '关于烦恼交换',
      content: '烦恼交换 v1.0.0\n\n一个让陌生人互相倾听、互相温暖的地方。\n\n希望你在这里，能被温柔以待。',
      showCancel: false,
      confirmText: '知道了'
    })
  }

  return (
    <View className={styles.pageContainer}>
      <Text className={styles.groupTitle}>通知设置</Text>
      <View className={styles.group}>
        <View className={styles.item}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>📬</View>
            <Text className={styles.itemLabel}>新烦恼匹配通知</Text>
          </View>
          <View
            className={classnames(styles.switch, notifyNew && styles.switchOn)}
            onClick={() => setNotifyNew(!notifyNew)}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.item}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>💌</View>
            <Text className={styles.itemLabel}>收到回应通知</Text>
          </View>
          <View
            className={classnames(styles.switch, notifyResponse && styles.switchOn)}
            onClick={() => setNotifyResponse(!notifyResponse)}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.item}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>🌈</View>
            <Text className={styles.itemLabel}>每日情绪打卡提醒</Text>
          </View>
          <View
            className={classnames(styles.switch, showMoodReminder && styles.switchOn)}
            onClick={() => setShowMoodReminder(!showMoodReminder)}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
      </View>

      <Text className={styles.groupTitle}>隐私与安全</Text>
      <View className={styles.group}>
        <View className={styles.item} onClick={() => Taro.navigateTo({ url: '/pages/safety/index' })}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon}>🛡️</View>
            <Text className={styles.itemLabel}>安全中心</Text>
          </View>
          <View className={styles.itemRight}>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.item} onClick={() => Taro.navigateTo({ url: '/pages/report/index' })}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon} style={{ background: 'rgba(255, 107, 107, 0.1)' }}>⚠️</View>
            <Text className={styles.itemLabel}>举报与拉黑管理</Text>
          </View>
          <View className={styles.itemRight}>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
      </View>

      <Text className={styles.groupTitle}>通用</Text>
      <View className={styles.group}>
        <View className={styles.item} onClick={handleClearCache}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon} style={{ background: 'rgba(250, 173, 20, 0.1)' }}>🧹</View>
            <Text className={styles.itemLabel}>清除缓存</Text>
          </View>
          <View className={styles.itemRight}>
            <Text className={styles.itemValue}>2.3 MB</Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
        <View className={styles.item} onClick={handleAbout}>
          <View className={styles.itemLeft}>
            <View className={styles.itemIcon} style={{ background: 'rgba(129, 199, 132, 0.15)' }}>ℹ️</View>
            <Text className={styles.itemLabel}>关于我们</Text>
          </View>
          <View className={styles.itemRight}>
            <Text className={styles.itemValue}>v1.0.0</Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>
      </View>

      <Button className={styles.dangerBtn}>退出登录</Button>
      <Text className={styles.version}>— 用心倾听，温柔回应 —</Text>
    </View>
  )
}

export default SettingsPage
