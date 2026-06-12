import React, { useState, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import classnames from 'classnames'
import { useApp } from '@/store/AppContext'
import { STATUS_LABELS, Worry, MyResponse, MoodCheckin, RESPONSE_TYPES, MOODS, FEEDBACK_TAGS } from '@/types'
import { getCategoryInfo } from '@/utils'
import EmptyState from '@/components/EmptyState'

type TabType = 'all' | 'responded' | 'pending'
type PeriodType = 'week' | 'month'
type SummaryKey = 'posted' | 'responded' | 'thanked' | 'checkin'
type TrendKey = 'streak' | 'recognized' | 'category'

const isThisWeek = (d: Date): boolean => {
  const today = new Date()
  const startOfWeek = new Date(today)
  const day = today.getDay() || 7
  startOfWeek.setDate(today.getDate() - day + 1)
  startOfWeek.setHours(0, 0, 0, 0)
  return d >= startOfWeek
}

const isThisMonth = (d: Date): boolean => {
  const today = new Date()
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
}

const MinePage: React.FC = () => {
  const { myWorries, userStats, toggleFavorite, thankResponse, refreshTimeouts, getSummary, myResponses, moodHistory, getTrendStats } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [period, setPeriod] = useState<PeriodType>('week')
  const [activeSummary, setActiveSummary] = useState<SummaryKey | null>(null)
  const [activeTrend, setActiveTrend] = useState<TrendKey | null>(null)

  useDidShow(() => {
    refreshTimeouts()
  })

  const filteredWorries = myWorries.filter(w => {
    if (activeTab === 'all') return true
    if (activeTab === 'responded') return !!w.response
    if (activeTab === 'pending') return w.status === 'pending' || w.status === 'matched'
    return true
  })

  const summary = getSummary(period)
  const trend = getTrendStats()

  const inPeriod = (d: Date) => period === 'week' ? isThisWeek(d) : isThisMonth(d)

  const periodWorries = useMemo(() => myWorries.filter(w => inPeriod(new Date(w.createdAt))), [myWorries, period])
  const periodThankedResponses = useMemo(() => myResponses.filter(r => r.isThanked && inPeriod(new Date(r.createdAt))), [myResponses, period])
  const periodResponses = useMemo(() => myResponses.filter(r => inPeriod(new Date(r.createdAt))), [myResponses, period])
  const periodMoods = useMemo(() => moodHistory.filter(m => inPeriod(new Date(m.createdAt))), [moodHistory, period])
  const thankedResponses = useMemo(() => myResponses.filter(r => r.isThanked), [myResponses])

  const handleWorryClick = (worryId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${worryId}` })
  }

  const handleGotoFavorites = () => {
    Taro.navigateTo({ url: '/pages/favorites/index' })
  }

  const handleGotoHistory = () => {
    Taro.navigateTo({ url: '/pages/history/index' })
  }

  const handleGotoSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' })
  }

  const handleFavorite = (e, worry: Worry) => {
    e.stopPropagation()
    if (worry.response) {
      toggleFavorite(worry.response.id)
    }
  }

  const handleThank = (e, worry: Worry) => {
    e.stopPropagation()
    if (worry.response && !worry.response.isThanked) {
      thankResponse(worry.response.id)
      Taro.showToast({ title: '感谢已送出 💖', icon: 'none' })
    }
  }

  const summaryItems: { key: SummaryKey; label: string; emoji: string; count: number; color: string }[] = [
    { key: 'posted', label: '发布烦恼', emoji: '💭', count: summary.postedCount, color: '#7C6FE6' },
    { key: 'responded', label: '回应他人', emoji: '🤗', count: summary.respondedCount, color: '#FF9A76' },
    { key: 'thanked', label: '收到感谢', emoji: '💖', count: summary.thankedCount, color: '#FA8C16' },
    { key: 'checkin', label: '情绪打卡', emoji: '🌈', count: summary.checkinCount, color: '#52C41A' }
  ]

  const trendItems = [
    { key: 'streak' as TrendKey, label: '连续打卡', emoji: '🔥', value: trend.currentStreak, sub: `历史最高 ${trend.maxStreak} 天`, color: '#FA8C16' },
    { key: 'recognized' as TrendKey, label: '回应被认可', emoji: '🏆', value: trend.thankedResponseCount, sub: '我的回应被感谢次数', color: '#7C6FE6' },
    { key: 'category' as TrendKey, label: '常见分类', emoji: '📊', value: trend.categoryStats[0]?.count || 0, sub: trend.categoryStats[0] ? getCategoryInfo(trend.categoryStats[0].category).label : '暂无', color: '#52C41A' }
  ]

  const renderSummaryDetail = () => {
    if (activeSummary === 'posted') {
      if (periodWorries.length === 0) return <EmptyState emoji="💭" title={`${period === 'week' ? '本周' : '本月'}还没有发布烦恼`} desc="去分享一条吧" />
      return periodWorries.map(worry => {
        const category = getCategoryInfo(worry.category)
        return (
          <View key={worry.id} className={styles.detailCard} onClick={() => handleWorryClick(worry.id)}>
            <View className={styles.detailTop}>
              <Text className={styles.detailCat}>{category.emoji} {category.label}</Text>
              <Text className={styles.detailTime}>{new Date(worry.createdAt).toLocaleDateString('zh-CN')}</Text>
            </View>
            <Text className={styles.detailContent}>{worry.content}</Text>
            <Text className={styles.detailStatus}>{STATUS_LABELS[worry.status]}</Text>
          </View>
        )
      })
    }
    if (activeSummary === 'responded') {
      if (periodResponses.length === 0) return <EmptyState emoji="🤗" title={`${period === 'week' ? '本周' : '本月'}还没有回应`} desc="做一次温暖回应吧" />
      return periodResponses.map((r: MyResponse) => {
        const category = getCategoryInfo(r.worryCategory)
        const rt = RESPONSE_TYPES.find(t => t.value === r.type)
        return (
          <View key={r.id} className={styles.detailCard}>
            <View className={styles.detailTop}>
              <Text className={styles.detailCat}>{category.emoji} {category.label}</Text>
              <Text className={styles.detailTime}>{new Date(r.createdAt).toLocaleDateString('zh-CN')}</Text>
            </View>
            <Text className={styles.detailContent}>对方烦恼：{r.worryContent}</Text>
            <View className={styles.myRespTag}>
              <Text>{rt?.emoji} 我的{rt?.label}：{r.content}</Text>
            </View>
          </View>
        )
      })
    }
    if (activeSummary === 'thanked') {
      if (periodThankedResponses.length === 0) return <EmptyState emoji="💖" title={`${period === 'week' ? '本周' : '本月'}还没有回应被感谢`} desc="继续温暖他人吧" />
      return periodThankedResponses.map((r: MyResponse) => {
        const category = getCategoryInfo(r.worryCategory)
        const rt = RESPONSE_TYPES.find(t => t.value === r.type)
        return (
          <View key={r.id} className={styles.detailCard}>
            <View className={styles.detailTop}>
              <Text className={styles.detailCat}>{category.emoji} {category.label}</Text>
              <Text className={styles.detailTime}>{new Date(r.createdAt).toLocaleDateString('zh-CN')}</Text>
            </View>
            <Text className={styles.detailContent}>对方烦恼：{r.worryContent}</Text>
            <View className={styles.myRespTag}>
              <Text>{rt?.emoji} 我的{rt?.label}：{r.content}</Text>
            </View>
            {r.feedback && (
              <View className={styles.feedbackMini}>
                <Text className={styles.feedbackMiniTitle}>🎯 对方反馈</Text>
                <View className={styles.feedbackMiniTags}>
                  {r.feedback.tags.map(tag => {
                    const ti = FEEDBACK_TAGS.find(t => t.value === tag)
                    return <Text key={tag} className={styles.feedbackMiniTag}>{ti?.emoji} {ti?.label}</Text>
                  })}
                </View>
                {r.feedback.comment && <Text className={styles.feedbackMiniComment}>"{r.feedback.comment}"</Text>}
              </View>
            )}
          </View>
        )
      })
    }
    if (activeSummary === 'checkin') {
      if (periodMoods.length === 0) return <EmptyState emoji="🌈" title={`${period === 'week' ? '本周' : '本月'}还没有打卡`} desc="去记录今天的心情吧" />
      return periodMoods.map((m: MoodCheckin) => {
        const md = MOODS.find(x => x.value === m.mood)
        return (
          <View key={m.id} className={styles.detailCard}>
            <View className={styles.detailTop}>
              <Text className={styles.detailCat}>{md?.emoji} {md?.label}</Text>
              <Text className={styles.detailTime}>{new Date(m.createdAt).toLocaleDateString('zh-CN')}</Text>
            </View>
            {m.note && <Text className={styles.detailContent}>{m.note}</Text>}
          </View>
        )
      })
    }
    return null
  }

  const renderTrendDetail = () => {
    if (activeTrend === 'streak') {
      if (moodHistory.length === 0) return <EmptyState emoji="🔥" title="还没有打卡记录" desc="从今天开始打卡吧" />
      return (
        <View>
          <View className={styles.streakSummary}>
            <Text className={styles.streakBig}>🔥 已连续打卡 {trend.currentStreak} 天</Text>
            <Text className={styles.streakSub}>历史最高：{trend.maxStreak} 天</Text>
          </View>
          {moodHistory.map((m: MoodCheckin) => {
            const md = MOODS.find(x => x.value === m.mood)
            return (
              <View key={m.id} className={styles.detailCard}>
                <View className={styles.detailTop}>
                  <Text className={styles.detailCat}>{md?.emoji} {md?.label}</Text>
                  <Text className={styles.detailTime}>{new Date(m.createdAt).toLocaleDateString('zh-CN')}</Text>
                </View>
                {m.note && <Text className={styles.detailContent}>{m.note}</Text>}
              </View>
            )
          })}
        </View>
      )
    }
    if (activeTrend === 'recognized') {
      if (thankedResponses.length === 0) return <EmptyState emoji="🏆" title="还没有回应被感谢" desc="多回应他人吧" />
      return thankedResponses.map((r: MyResponse) => {
        const category = getCategoryInfo(r.worryCategory)
        const rt = RESPONSE_TYPES.find(t => t.value === r.type)
        return (
          <View key={r.id} className={styles.detailCard}>
            <View className={styles.detailTop}>
              <Text className={styles.detailCat}>{category.emoji} {category.label}</Text>
              <Text className={styles.detailTime}>{new Date(r.createdAt).toLocaleDateString('zh-CN')}</Text>
            </View>
            <Text className={styles.detailContent}>对方烦恼：{r.worryContent}</Text>
            <View className={styles.myRespTag}>
              <Text>{rt?.emoji} 我的{rt?.label}：{r.content}</Text>
            </View>
            {r.feedback && (
              <View className={styles.feedbackMini}>
                <Text className={styles.feedbackMiniTitle}>🎯 对方反馈</Text>
                <View className={styles.feedbackMiniTags}>
                  {r.feedback.tags.map(tag => {
                    const ti = FEEDBACK_TAGS.find(t => t.value === tag)
                    return <Text key={tag} className={styles.feedbackMiniTag}>{ti?.emoji} {ti?.label}</Text>
                  })}
                </View>
                {r.feedback.comment && <Text className={styles.feedbackMiniComment}>"{r.feedback.comment}"</Text>}
              </View>
            )}
          </View>
        )
      })
    }
    if (activeTrend === 'category') {
      if (trend.categoryStats.length === 0) return <EmptyState emoji="📊" title="还没有发布记录" desc="去发布一条烦恼吧" />
      return trend.categoryStats.map(item => {
        const category = getCategoryInfo(item.category)
        const worriesOfCategory = myWorries.filter(w => w.category === item.category)
        return (
          <View key={item.category} className={styles.categoryGroup}>
            <View className={styles.categoryHeader}>
              <Text className={styles.categoryName}>{category.emoji} {category.label}</Text>
              <Text className={styles.categoryCount}>{item.count} 条</Text>
            </View>
            {worriesOfCategory.map(worry => (
              <View key={worry.id} className={styles.detailCard} onClick={() => handleWorryClick(worry.id)}>
                <Text className={styles.detailContent}>{worry.content}</Text>
                <Text className={styles.detailStatus}>{STATUS_LABELS[worry.status]}</Text>
              </View>
            ))}
          </View>
        )
      })
    }
    return null
  }

  const renderFeedbackForWorry = (worry: Worry) => {
    if (!worry.response?.feedback) return null
    const fb = worry.response.feedback
    return (
      <View className={styles.feedbackMini}>
        <Text className={styles.feedbackMiniTitle}>🎯 你给这条回应的反馈</Text>
        <View className={styles.feedbackMiniTags}>
          {fb.tags.map(tag => {
            const ti = FEEDBACK_TAGS.find(t => t.value === tag)
            return <Text key={tag} className={styles.feedbackMiniTag}>{ti?.emoji} {ti?.label}</Text>
          })}
        </View>
        {fb.comment && <Text className={styles.feedbackMiniComment}>"{fb.comment}"</Text>}
      </View>
    )
  }

  return (
    <ScrollView scrollY className={styles.pageContainer}>
      <View className={styles.headerCard}>
        <Text className={styles.greeting}>我的交换档案 🌸</Text>
        <Text className={styles.streakText}>🔥 已连续陪伴 {userStats.streak} 天，你真的很棒</Text>
        <View className={styles.statsGrid}>
          <View className={styles.stat}>
            <Text className={styles.statNum}>{userStats.postedCount}</Text>
            <Text className={styles.statLabel}>发布烦恼</Text>
          </View>
          <View className={styles.stat}>
            <Text className={styles.statNum}>{userStats.receivedCount}</Text>
            <Text className={styles.statLabel}>收到回应</Text>
          </View>
          <View className={styles.stat}>
            <Text className={styles.statNum}>{userStats.thankedCount}</Text>
            <Text className={styles.statLabel}>收获感谢</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickLinks}>
        <View className={styles.linkCard} onClick={handleGotoFavorites}>
          <Text className={styles.linkEmoji}>⭐</Text>
          <Text className={styles.linkText}>我的收藏</Text>
        </View>
        <View className={styles.linkCard} onClick={handleGotoHistory}>
          <Text className={styles.linkEmoji}>📖</Text>
          <Text className={styles.linkText}>交换记录</Text>
        </View>
        <View className={styles.linkCard} onClick={() => Taro.navigateTo({ url: '/pages/mood/index' })}>
          <Text className={styles.linkEmoji}>🌈</Text>
          <Text className={styles.linkText}>情绪打卡</Text>
        </View>
        <View className={styles.linkCard} onClick={handleGotoSettings}>
          <Text className={styles.linkEmoji}>⚙️</Text>
          <Text className={styles.linkText}>设置</Text>
        </View>
      </View>

      <View className={styles.reviewCard}>
        <View className={styles.reviewHeader}>
          <Text className={styles.reviewTitle}>✨ 温暖回顾</Text>
          <View className={styles.periodToggle}>
            <View className={classnames(styles.periodBtn, period === 'week' && styles.periodActive)} onClick={() => setPeriod('week')}>
              本周
            </View>
            <View className={classnames(styles.periodBtn, period === 'month' && styles.periodActive)} onClick={() => setPeriod('month')}>
              本月
            </View>
          </View>
        </View>

        <View className={styles.summaryGrid}>
          {summaryItems.map(item => (
            <View
              key={item.key}
              className={classnames(styles.summaryItem, activeSummary === item.key && styles.summaryActive)}
              onClick={() => { setActiveSummary(activeSummary === item.key ? null : item.key); setActiveTrend(null) }}
            >
              <Text className={styles.summaryEmoji}>{item.emoji}</Text>
              <Text className={styles.summaryNum} style={{ color: item.color }}>{item.count}</Text>
              <Text className={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {activeSummary && (
          <View className={styles.summaryDetail}>
            <View className={styles.detailHeader}>
              <Text className={styles.detailTitle}>
                {period === 'week' ? '本周' : '本月'}{summaryItems.find(i => i.key === activeSummary)?.label}记录
              </Text>
              <Text className={styles.detailClose} onClick={() => setActiveSummary(null)}>收起 ↑</Text>
            </View>
            <View className={styles.detailList}>
              {renderSummaryDetail()}
            </View>
          </View>
        )}
      </View>

      <View className={styles.reviewCard}>
        <View className={styles.reviewHeader}>
          <Text className={styles.reviewTitle}>📈 成长轨迹</Text>
        </View>

        <View className={styles.summaryGrid}>
          {trendItems.map(item => (
            <View
              key={item.key}
              className={classnames(styles.summaryItem, activeTrend === item.key && styles.summaryActive)}
              onClick={() => { setActiveTrend(activeTrend === item.key ? null : item.key); setActiveSummary(null) }}
            >
              <Text className={styles.summaryEmoji}>{item.emoji}</Text>
              <Text className={styles.summaryNum} style={{ color: item.color }}>{item.value}</Text>
              <Text className={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {activeTrend && (
          <View className={styles.summaryDetail}>
            <View className={styles.detailHeader}>
              <Text className={styles.detailTitle}>
                {trendItems.find(i => i.key === activeTrend)?.label}
              </Text>
              <Text className={styles.detailClose} onClick={() => setActiveTrend(null)}>收起 ↑</Text>
            </View>
            <View className={styles.detailList}>
              {renderTrendDetail()}
            </View>
          </View>
        )}
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tab, activeTab === 'all' && styles.activeTab)}
          onClick={() => setActiveTab('all')}
        >
          全部
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'responded' && styles.activeTab)}
          onClick={() => setActiveTab('responded')}
        >
          已回应
        </View>
        <View
          className={classnames(styles.tab, activeTab === 'pending' && styles.activeTab)}
          onClick={() => setActiveTab('pending')}
        >
          等待中
        </View>
      </View>

      {filteredWorries.length === 0 ? (
        <EmptyState
          emoji="💌"
          title="还没有交换记录"
          desc="去写一条烦恼，或者回应他人的烦恼吧"
        />
      ) : (
        filteredWorries.map(worry => {
          const category = getCategoryInfo(worry.category)
          const hasResponse = !!worry.response

          return (
            <View
              key={worry.id}
              className={styles.worryCard}
              onClick={() => handleWorryClick(worry.id)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.tags}>
                  <View className={classnames(styles.tag, styles.categoryTag)}>
                    {category.emoji} {category.label}
                  </View>
                  <View className={classnames(
                    styles.tag,
                    hasResponse ? styles.respondedTag : styles.statusTag
                  )}>
                    {STATUS_LABELS[worry.status]}
                  </View>
                </View>
              </View>
              <Text className={styles.content}>{worry.content}</Text>

              {hasResponse && worry.response && (
                <View className={styles.respPreview}>
                  <View className={styles.respLabel}>
                    <Text>
                      {worry.response.type === 'suggestion' ? '💡' :
                       worry.response.type === 'empathy' ? '🤗' : '🌙'}
                    </Text>
                    <Text>来自陌生人的回应</Text>
                  </View>
                  <Text className={styles.respContent}>{worry.response.content}</Text>
                </View>
              )}

              {hasResponse && renderFeedbackForWorry(worry)}

              <View className={styles.actions}>
                <Text className={styles.time} style={{ flex: 1 }}>
                  查看详情 →
                </Text>
                {hasResponse && worry.response && (
                  <>
                    <Button
                      className={styles.actionBtn}
                      onClick={(e) => handleFavorite(e, worry)}
                    >
                      {worry.response.isFavorite ? '⭐ 已收藏' : '☆ 收藏'}
                    </Button>
                    <Button
                      className={classnames(styles.actionBtn, worry.response.isThanked && styles.primaryBtn)}
                      onClick={(e) => handleThank(e, worry)}
                      disabled={worry.response.isThanked}
                    >
                      {worry.response.isThanked ? '💖 已感谢' : '💌 感谢'}
                    </Button>
                  </>
                )}
              </View>
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

export default MinePage
