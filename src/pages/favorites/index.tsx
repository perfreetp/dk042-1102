import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useApp } from '@/store/AppContext'
import { formatTime } from '@/utils'
import EmptyState from '@/components/EmptyState'

const FavoritesPage: React.FC = () => {
  const { favorites, toggleFavorite } = useApp()

  const handleRemove = (id: string) => {
    Taro.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这条回应吗？',
      success: (res) => {
        if (res.confirm) {
          toggleFavorite(id)
          Taro.showToast({ title: '已取消收藏', icon: 'none' })
        }
      }
    })
  }

  return (
    <View className={styles.pageContainer}>
      <Text className={styles.title}>我的收藏 ⭐</Text>
      <Text className={styles.subTitle}>这些温暖的话语，在需要时可以回看</Text>

      {favorites.length === 0 ? (
        <EmptyState
          emoji="⭐"
          title="还没有收藏"
          desc="看到有帮助的回应，点击收藏保存下来吧"
        />
      ) : (
        favorites.map(item => (
          <View key={item.id} className={styles.card}>
            <View className={styles.typeBadge}>
              <Text>
                {item.type === 'suggestion' ? '💡' : item.type === 'empathy' ? '🤗' : '🌙'}
              </Text>
              <Text>
                {item.type === 'suggestion' ? '建议' : item.type === 'empathy' ? '共情' : '陪伴'}
              </Text>
            </View>
            <Text className={styles.content}>{item.content}</Text>
            <View className={styles.footer}>
              <Text className={styles.time}>{formatTime(item.createdAt)}</Text>
              <Button className={styles.removeBtn} onClick={() => handleRemove(item.id)}>
                取消收藏
              </Button>
            </View>
          </View>
        ))
      )}
    </View>
  )
}

export default FavoritesPage
