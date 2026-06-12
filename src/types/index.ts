export type CategoryType = 'work' | 'love' | 'family' | 'study' | 'health' | 'finance' | 'social' | 'other'

export type SeverityType = 'mild' | 'moderate' | 'severe'

export type ResponseType = 'suggestion' | 'empathy' | 'companionship'

export type WorryStatus = 'pending' | 'matched' | 'responded' | 'completed' | 'timeout'

export type MoodType = 'happy' | 'calm' | 'anxious' | 'sad'

export interface Worry {
  id: string
  content: string
  category: CategoryType
  severity: SeverityType
  expectedResponse: ResponseType
  status: WorryStatus
  createdAt: string
  expiresAt: string
  isAnonymous: boolean
  response?: Response
  respondedTo?: string
}

export interface Response {
  id: string
  worryId: string
  type: ResponseType
  content: string
  createdAt: string
  isAnonymous: boolean
  isFavorite: boolean
  isThanked: boolean
  canFollowUp: boolean
  followUpContent?: string
}

export interface AssignedTask {
  id: string
  worry: Worry
  assignedAt: string
  expiresAt: string
  skipped: boolean
  completed: boolean
}

export interface MoodCheckin {
  id: string
  mood: MoodType
  note: string
  createdAt: string
}

export interface UserStats {
  postedCount: number
  respondedCount: number
  receivedCount: number
  dailyQuota: number
  dailyUsed: number
  streak: number
  thankedCount: number
}

export interface BlockedUser {
  id: string
  name: string
  emoji: string
  blockedAt: string
}

export interface MyResponse {
  id: string
  worryId: string
  worryContent: string
  worryCategory: CategoryType
  type: ResponseType
  content: string
  createdAt: string
}

export interface CategoryOption {
  value: CategoryType
  label: string
  emoji: string
}

export const CATEGORIES: CategoryOption[] = [
  { value: 'work', label: '工作', emoji: '💼' },
  { value: 'love', label: '感情', emoji: '💕' },
  { value: 'family', label: '家庭', emoji: '🏠' },
  { value: 'study', label: '学业', emoji: '📚' },
  { value: 'health', label: '健康', emoji: '🌿' },
  { value: 'finance', label: '财务', emoji: '💰' },
  { value: 'social', label: '社交', emoji: '👥' },
  { value: 'other', label: '其他', emoji: '💭' }
]

export const SEVERITIES = [
  { value: 'mild' as SeverityType, label: '轻微', color: '#81C784' },
  { value: 'moderate' as SeverityType, label: '中等', color: '#FAAD14' },
  { value: 'severe' as SeverityType, label: '较重', color: '#FF8A65' }
]

export const RESPONSE_TYPES = [
  { value: 'suggestion' as ResponseType, label: '建议建议', emoji: '💡', desc: '希望获得实用的解决建议' },
  { value: 'empathy' as ResponseType, label: '共情理解', emoji: '🤗', desc: '希望被理解和安慰' },
  { value: 'companionship' as ResponseType, label: '陪伴倾听', emoji: '🌙', desc: '只需要有人陪着倾听' }
]

export const MOODS = [
  { value: 'happy' as MoodType, label: '开心', emoji: '😊', color: '#FFB74D' },
  { value: 'calm' as MoodType, label: '平静', emoji: '😌', color: '#81C784' },
  { value: 'anxious' as MoodType, label: '焦虑', emoji: '😟', color: '#FF8A65' },
  { value: 'sad' as MoodType, label: '低落', emoji: '😔', color: '#90A4AE' }
]

export const STATUS_LABELS: Record<WorryStatus, string> = {
  pending: '等待匹配',
  matched: '已匹配',
  responded: '已回应',
  completed: '已完成',
  timeout: '已超时'
}
