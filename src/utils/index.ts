import { CATEGORIES, SEVERITIES, RESPONSE_TYPES, MOODS, CategoryType, SeverityType, ResponseType, MoodType } from '@/types'

export const getCategoryInfo = (value: CategoryType) => {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[7]
}

export const getSeverityInfo = (value: SeverityType) => {
  return SEVERITIES.find(s => s.value === value) || SEVERITIES[0]
}

export const getResponseTypeInfo = (value: ResponseType) => {
  return RESPONSE_TYPES.find(r => r.value === value) || RESPONSE_TYPES[1]
}

export const getMoodInfo = (value: MoodType) => {
  return MOODS.find(m => m.value === value) || MOODS[1]
}

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export const getRemainingTime = (expiresAt: string): string => {
  const now = new Date().getTime()
  const exp = new Date(expiresAt).getTime()
  const diff = exp - now
  if (diff <= 0) return '已超时'
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const containsSensitiveContent = (text: string): boolean => {
  const sensitiveWords = ['自杀', '自残', '死亡', '绝望', '不想活', '结束生命']
  return sensitiveWords.some(word => text.includes(word))
}
