import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { Worry, Response, AssignedTask, MoodCheckin, UserStats, BlockedUser, MyResponse, ResponseType, FeedbackTag, CategoryType } from '@/types'
import { mockMyWorries, mockAssignedTasks, mockMoodHistory, mockUserStats, mockFavorites } from '@/data/mock'
import { generateId } from '@/utils'

const STORAGE_KEYS = {
  MY_WORRIES: 'worry_my_worries',
  ASSIGNED_TASKS: 'worry_assigned_tasks',
  MOOD_HISTORY: 'worry_mood_history',
  USER_STATS: 'worry_user_stats',
  FAVORITES: 'worry_favorites',
  BLOCKED_USERS: 'worry_blocked_users',
  MY_RESPONSES: 'worry_my_responses',
  TASK_DRAFTS: 'worry_task_drafts'
}

export interface TaskDraft {
  taskId: string
  type: ResponseType
  content: string
  savedAt: string
}

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = Taro.getStorageSync(key)
    if (data) {
      return JSON.parse(data) as T
    }
  } catch (e) {
    console.error('[Storage] Get error:', key, e)
  }
  return defaultValue
}

const setToStorage = <T,>(key: string, value: T): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.error('[Storage] Set error:', key, e)
  }
}

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
}

const checkAndUpdateTimeouts = (worries: Worry[]): Worry[] => {
  const now = Date.now()
  return worries.map(w => {
    if ((w.status === 'pending' || w.status === 'matched') && new Date(w.expiresAt).getTime() <= now) {
      return { ...w, status: 'timeout' as const }
    }
    return w
  })
}

const checkAndUpdateTaskTimeouts = (tasks: AssignedTask[]): AssignedTask[] => {
  const now = Date.now()
  return tasks.map(t => {
    if (!t.completed && !t.skipped && !t.expired && new Date(t.expiresAt).getTime() <= now) {
      return { ...t, expired: true }
    }
    return t
  })
}

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

export interface PeriodSummary {
  postedCount: number
  respondedCount: number
  thankedCount: number
  checkinCount: number
}

export interface TrendStats {
  currentStreak: number
  maxStreak: number
  thankedResponseCount: number
  categoryStats: { category: CategoryType; count: number }[]
}

const EMPTY_RESPONSES_POOL: Record<ResponseType, string[]> = {
  empathy: [
    '我特别能理解你的感受，这种心情我也经历过。你已经做得很好了，允许自己有这样的情绪，慢慢来。',
    '看到你说的这些，我心里也跟着难受。你不是一个人，有很多人都在默默关心着你。',
    '抱抱你，辛苦了。能说出来已经很勇敢了，给自己一点时间，一切都会慢慢好起来的。',
    '我懂那种说不出口的委屈，你已经很坚强了。有时候哭一哭也没关系的。'
  ],
  suggestion: [
    '也许你可以试着把大问题拆分成小步骤，每次只解决一个小问题，压力会小很多。',
    '建议你找个信任的人聊聊，有时候说出来就会轻松很多。也可以试试写下来，整理一下思路。',
    '或许可以给自己安排一点放松的时间，哪怕只是散散步、听听音乐，对心情会有帮助的。',
    '可以先列一个清单，把事情按重要程度排序，一件一件来，不用急。'
  ],
  companionship: [
    '我在这里陪着你，你不是一个人。想说什么都可以，我在听。',
    '静静地陪着你，这种感觉我懂。不用急，我们慢慢来。',
    '有我在呢，你可以放心地脆弱一会儿。明天会更好的。',
    '不用说话也没关系，我就陪你一会儿。你已经很棒了。'
  ]
}

interface AppContextType {
  myWorries: Worry[]
  assignedTasks: AssignedTask[]
  moodHistory: MoodCheckin[]
  userStats: UserStats
  favorites: Response[]
  blockedUsers: BlockedUser[]
  myResponses: MyResponse[]
  taskDrafts: TaskDraft[]
  hasCheckedInToday: boolean
  addWorry: (worry: Omit<Worry, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => void
  completeTask: (taskId: string, response: Omit<Response, 'id' | 'worryId' | 'createdAt' | 'isAnonymous' | 'isFavorite' | 'isThanked' | 'canFollowUp'>) => void
  skipTask: (taskId: string) => void
  toggleFavorite: (responseId: string) => void
  thankResponse: (responseId: string) => void
  addFollowUp: (responseId: string, content: string) => void
  submitResponseFeedback: (responseId: string, tags: FeedbackTag[], comment: string) => void
  checkinMood: (mood: MoodCheckin['mood'], note: string) => void
  addBlockedUser: (user: Omit<BlockedUser, 'id' | 'blockedAt'>) => void
  removeBlockedUser: (userId: string) => void
  isBlockedByName: (name: string) => boolean
  getBlockedByResponseId: (responseId: string) => BlockedUser | undefined
  refreshTimeouts: () => void
  getWeeklyMoods: () => (MoodCheckin | null)[]
  getSummary: (period: 'week' | 'month') => PeriodSummary
  getTrendStats: () => TrendStats
  saveTaskDraft: (taskId: string, type: ResponseType, content: string) => void
  getTaskDraft: (taskId: string) => TaskDraft | undefined
  clearTaskDraft: (taskId: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myWorries, setMyWorries] = useState<Worry[]>(() => {
    const stored = getFromStorage<Worry[]>(STORAGE_KEYS.MY_WORRIES, [])
    return checkAndUpdateTimeouts(stored.length > 0 ? stored : mockMyWorries)
  })

  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(() => {
    const stored = getFromStorage<AssignedTask[]>(STORAGE_KEYS.ASSIGNED_TASKS, [])
    return checkAndUpdateTaskTimeouts(stored.length > 0 ? stored : mockAssignedTasks)
  })

  const [moodHistory, setMoodHistory] = useState<MoodCheckin[]>(() => {
    const stored = getFromStorage<MoodCheckin[]>(STORAGE_KEYS.MOOD_HISTORY, [])
    return stored.length > 0 ? stored : mockMoodHistory
  })

  const [userStats, setUserStats] = useState<UserStats>(() => {
    return getFromStorage<UserStats>(STORAGE_KEYS.USER_STATS, mockUserStats)
  })

  const [favorites, setFavorites] = useState<Response[]>(() => {
    const stored = getFromStorage<Response[]>(STORAGE_KEYS.FAVORITES, [])
    return stored
  })

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    return getFromStorage<BlockedUser[]>(STORAGE_KEYS.BLOCKED_USERS, [])
  })

  const [myResponses, setMyResponses] = useState<MyResponse[]>(() => {
    return getFromStorage<MyResponse[]>(STORAGE_KEYS.MY_RESPONSES, [])
  })

  const [taskDrafts, setTaskDrafts] = useState<TaskDraft[]>(() => {
    return getFromStorage<TaskDraft[]>(STORAGE_KEYS.TASK_DRAFTS, [])
  })

  useEffect(() => {
    setToStorage(STORAGE_KEYS.MY_WORRIES, myWorries)
  }, [myWorries])

  useEffect(() => {
    setToStorage(STORAGE_KEYS.ASSIGNED_TASKS, assignedTasks)
  }, [assignedTasks])

  useEffect(() => {
    setToStorage(STORAGE_KEYS.MOOD_HISTORY, moodHistory)
  }, [moodHistory])

  useEffect(() => {
    setToStorage(STORAGE_KEYS.USER_STATS, userStats)
  }, [userStats])

  useEffect(() => {
    setToStorage(STORAGE_KEYS.FAVORITES, favorites)
  }, [favorites])

  useEffect(() => {
    setToStorage(STORAGE_KEYS.BLOCKED_USERS, blockedUsers)
  }, [blockedUsers])

  useEffect(() => {
    setToStorage(STORAGE_KEYS.MY_RESPONSES, myResponses)
  }, [myResponses])

  useEffect(() => {
    setToStorage(STORAGE_KEYS.TASK_DRAFTS, taskDrafts)
  }, [taskDrafts])

  const hasCheckedInToday = useMemo(() => {
    const today = new Date()
    return moodHistory.some(m => isSameDay(new Date(m.createdAt), today))
  }, [moodHistory])

  const getWeeklyMoods = useCallback((): (MoodCheckin | null)[] => {
    const result: (MoodCheckin | null)[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const found = moodHistory.find(m => isSameDay(new Date(m.createdAt), date))
      result.push(found || null)
    }
    return result
  }, [moodHistory])

  const refreshTimeouts = useCallback(() => {
    setMyWorries(prev => checkAndUpdateTimeouts(prev))
    setAssignedTasks(prev => checkAndUpdateTaskTimeouts(prev))
  }, [])

  const addWorry = (worry: Omit<Worry, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => {
    const now = Date.now()
    const newWorry: Worry = {
      ...worry,
      id: generateId(),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 86400000).toISOString(),
      status: 'pending'
    }
    setMyWorries(prev => [newWorry, ...prev])
    setUserStats(prev => ({ ...prev, postedCount: prev.postedCount + 1 }))
  }

  const completeTask = (taskId: string, resp: Omit<Response, 'id' | 'worryId' | 'createdAt' | 'isAnonymous' | 'isFavorite' | 'isThanked' | 'canFollowUp'>) => {
    const task = assignedTasks.find(t => t.id === taskId)
    if (!task) return

    const now = Date.now()
    const isExpired = new Date(task.expiresAt).getTime() <= now

    setAssignedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: true, expired: isExpired } : t
    ))

    const myResp: MyResponse = {
      id: generateId(),
      worryId: task.worry.id,
      worryContent: task.worry.content,
      worryCategory: task.worry.category,
      type: resp.type,
      content: resp.content,
      createdAt: new Date().toISOString(),
      isThanked: false
    }
    setMyResponses(prev => [myResp, ...prev])
    setUserStats(prev => ({
      ...prev,
      respondedCount: prev.respondedCount + 1,
      dailyUsed: prev.dailyUsed + 1
    }))

    setTaskDrafts(prev => prev.filter(d => d.taskId !== taskId))

    if (!isExpired) {
      setMyWorries(prev => {
        const refreshed = checkAndUpdateTimeouts(prev)
        const pendingWorry = refreshed.find(w => w.status === 'pending' || w.status === 'matched')
        if (!pendingWorry) return refreshed

        const pool = EMPTY_RESPONSES_POOL[pendingWorry.expectedResponse] || EMPTY_RESPONSES_POOL.empathy
        const randomContent = pool[Math.floor(Math.random() * pool.length)]

        const newResponse: Response = {
          id: generateId(),
          worryId: pendingWorry.id,
          type: pendingWorry.expectedResponse,
          content: randomContent,
          createdAt: new Date().toISOString(),
          isAnonymous: true,
          isFavorite: false,
          isThanked: false,
          canFollowUp: true
        }

        return refreshed.map(w =>
          w.id === pendingWorry.id
            ? { ...w, status: 'responded' as const, response: newResponse }
            : w
        )
      })

      setUserStats(prev => ({ ...prev, receivedCount: prev.receivedCount + 1 }))
    }
  }

  const skipTask = (taskId: string) => {
    setAssignedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, skipped: true } : t
    ))
  }

  const toggleFavorite = (responseId: string) => {
    let targetResponse: Response | undefined

    const worryWithResp = myWorries.find(w => w.response?.id === responseId)
    const favWithResp = favorites.find(f => f.id === responseId)
    targetResponse = worryWithResp?.response || favWithResp

    if (!targetResponse) return

    const willBeFavorite = !targetResponse.isFavorite

    setMyWorries(prev => prev.map(w => {
      if (w.response && w.response.id === responseId) {
        return { ...w, response: { ...w.response, isFavorite: willBeFavorite } }
      }
      return w
    }))

    setFavorites(prev => {
      const exists = prev.some(f => f.id === responseId)
      if (willBeFavorite && !exists) {
        const toSave: Response = { ...targetResponse!, isFavorite: true }
        const worryWithIt = myWorries.find(w => w.response?.id === responseId)
        if (worryWithIt?.response) {
          return [{ ...worryWithIt.response, isFavorite: true }, ...prev]
        }
        return [toSave, ...prev]
      } else if (!willBeFavorite && exists) {
        return prev.filter(f => f.id !== responseId)
      }
      return prev
    })
  }

  const thankResponse = (responseId: string) => {
    setMyWorries(prev => prev.map(w => {
      if (w.response && w.response.id === responseId) {
        return { ...w, response: { ...w.response, isThanked: true } }
      }
      return w
    }))

    setFavorites(prev => prev.map(f =>
      f.id === responseId ? { ...f, isThanked: true } : f
    ))

    setUserStats(prev => ({ ...prev, thankedCount: prev.thankedCount + 1 }))
  }

  const submitResponseFeedback = (responseId: string, tags: FeedbackTag[], comment: string) => {
    const feedback = {
      tags,
      comment,
      createdAt: new Date().toISOString()
    }

    setMyWorries(prev => prev.map(w => {
      if (w.response && w.response.id === responseId) {
        return { ...w, response: { ...w.response, feedback } }
      }
      return w
    }))

    setFavorites(prev => prev.map(f =>
      f.id === responseId ? { ...f, feedback } : f
    ))
  }

  const addFollowUp = (responseId: string, content: string) => {
    setMyWorries(prev => prev.map(w => {
      if (w.response && w.response.id === responseId) {
        return { ...w, response: { ...w.response, canFollowUp: false, followUpContent: content } }
      }
      return w
    }))

    setFavorites(prev => prev.map(f =>
      f.id === responseId ? { ...f, canFollowUp: false, followUpContent: content } : f
    ))
  }

  const checkinMood = (mood: MoodCheckin['mood'], note: string) => {
    const now = new Date()
    setMoodHistory(prev => {
      const filtered = prev.filter(m => !isSameDay(new Date(m.createdAt), now))
      const newCheckin: MoodCheckin = {
        id: generateId(),
        mood,
        note,
        createdAt: now.toISOString()
      }
      return [newCheckin, ...filtered]
    })
  }

  const addBlockedUser = (user: Omit<BlockedUser, 'id' | 'blockedAt'>) => {
    setBlockedUsers(prev => {
      if (user.responseId) {
        const existing = prev.find(u => u.responseId === user.responseId)
        if (existing) return prev
      }
      const newBlocked: BlockedUser = {
        ...user,
        id: generateId(),
        blockedAt: new Date().toISOString()
      }
      return [newBlocked, ...prev]
    })
  }

  const removeBlockedUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const isBlockedByName = useCallback((name: string): boolean => {
    return blockedUsers.some(u => u.name === name)
  }, [blockedUsers])

  const getBlockedByResponseId = useCallback((responseId: string): BlockedUser | undefined => {
    return blockedUsers.find(u => u.responseId === responseId)
  }, [blockedUsers])

  const getSummary = useCallback((period: 'week' | 'month'): PeriodSummary => {
    const filter = period === 'week' ? isThisWeek : isThisMonth
    const postedCount = myWorries.filter(w => filter(new Date(w.createdAt))).length
    const respondedCount = myResponses.filter(r => filter(new Date(r.createdAt))).length
    const thankedCount = myResponses.filter(r => r.isThanked && filter(new Date(r.createdAt))).length
    const checkinCount = moodHistory.filter(m => filter(new Date(m.createdAt))).length
    return { postedCount, respondedCount, thankedCount, checkinCount }
  }, [myWorries, myResponses, moodHistory])

  const getTrendStats = useCallback((): TrendStats => {
    const sortedCheckins = [...moodHistory].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = sortedCheckins.length - 1; i >= 0; i--) {
      const checkinDate = new Date(sortedCheckins[i].createdAt)
      checkinDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays <= 1 && diffDays >= 0) {
        tempStreak++
        if (diffDays === 0) currentStreak = tempStreak
        maxStreak = Math.max(maxStreak, tempStreak)
        today.setDate(today.getDate() - 1)
      } else if (diffDays > 1) {
        break
      }
    }

    const thankedResponseCount = myResponses.filter(r => r.isThanked).length

    const categoryMap = new Map<CategoryType, number>()
    myWorries.forEach(w => {
      categoryMap.set(w.category, (categoryMap.get(w.category) || 0) + 1)
    })
    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    return { currentStreak, maxStreak, thankedResponseCount, categoryStats }
  }, [myWorries, myResponses, moodHistory])

  const saveTaskDraft = useCallback((taskId: string, type: ResponseType, content: string) => {
    setTaskDrafts(prev => {
      const others = prev.filter(d => d.taskId !== taskId)
      if (!content && type === 'empathy') return others
      const draft: TaskDraft = {
        taskId,
        type,
        content,
        savedAt: new Date().toISOString()
      }
      return [draft, ...others]
    })
  }, [])

  const getTaskDraft = useCallback((taskId: string): TaskDraft | undefined => {
    return taskDrafts.find(d => d.taskId === taskId)
  }, [taskDrafts])

  const clearTaskDraft = useCallback((taskId: string) => {
    setTaskDrafts(prev => prev.filter(d => d.taskId !== taskId))
  }, [])

  return (
    <AppContext.Provider value={{
      myWorries,
      assignedTasks,
      moodHistory,
      userStats,
      favorites,
      blockedUsers,
      myResponses,
      taskDrafts,
      hasCheckedInToday,
      addWorry,
      completeTask,
      skipTask,
      toggleFavorite,
      thankResponse,
      addFollowUp,
      submitResponseFeedback,
      checkinMood,
      addBlockedUser,
      removeBlockedUser,
      isBlockedByName,
      getBlockedByResponseId,
      refreshTimeouts,
      getWeeklyMoods,
      getSummary,
      getTrendStats,
      saveTaskDraft,
      getTaskDraft,
      clearTaskDraft
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
