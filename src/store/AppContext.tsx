import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { Worry, Response, AssignedTask, MoodCheckin, UserStats, BlockedUser, MyResponse } from '@/types'
import { mockMyWorries, mockAssignedTasks, mockMoodHistory, mockUserStats, mockFavorites } from '@/data/mock'
import { generateId } from '@/utils'

const STORAGE_KEYS = {
  MY_WORRIES: 'worry_my_worries',
  ASSIGNED_TASKS: 'worry_assigned_tasks',
  MOOD_HISTORY: 'worry_mood_history',
  USER_STATS: 'worry_user_stats',
  FAVORITES: 'worry_favorites',
  BLOCKED_USERS: 'worry_blocked_users',
  MY_RESPONSES: 'worry_my_responses'
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

const checkAndUpdateTimeouts = (worries: Worry[]): Worry[] => {
  const now = Date.now()
  return worries.map(w => {
    if ((w.status === 'pending' || w.status === 'matched') && new Date(w.expiresAt).getTime() <= now) {
      return { ...w, status: 'timeout' as const }
    }
    return w
  })
}

interface AppContextType {
  myWorries: Worry[]
  assignedTasks: AssignedTask[]
  moodHistory: MoodCheckin[]
  userStats: UserStats
  favorites: Response[]
  blockedUsers: BlockedUser[]
  myResponses: MyResponse[]
  addWorry: (worry: Omit<Worry, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => void
  completeTask: (taskId: string, response: Omit<Response, 'id' | 'worryId' | 'createdAt' | 'isAnonymous' | 'isFavorite' | 'isThanked' | 'canFollowUp'>) => void
  skipTask: (taskId: string) => void
  toggleFavorite: (responseId: string) => void
  thankResponse: (responseId: string) => void
  addFollowUp: (responseId: string, content: string) => void
  checkinMood: (mood: MoodCheckin['mood'], note: string) => void
  addBlockedUser: (user: Omit<BlockedUser, 'id' | 'blockedAt'>) => void
  removeBlockedUser: (userId: string) => void
  refreshTimeouts: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myWorries, setMyWorries] = useState<Worry[]>(() => {
    const stored = getFromStorage<Worry[]>(STORAGE_KEYS.MY_WORRIES, [])
    return checkAndUpdateTimeouts(stored.length > 0 ? stored : mockMyWorries)
  })

  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(() => {
    const stored = getFromStorage<AssignedTask[]>(STORAGE_KEYS.ASSIGNED_TASKS, [])
    return stored.length > 0 ? stored : mockAssignedTasks
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
    return stored.length > 0 ? stored : mockFavorites
  })

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    return getFromStorage<BlockedUser[]>(STORAGE_KEYS.BLOCKED_USERS, [])
  })

  const [myResponses, setMyResponses] = useState<MyResponse[]>(() => {
    return getFromStorage<MyResponse[]>(STORAGE_KEYS.MY_RESPONSES, [])
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

  const refreshTimeouts = useCallback(() => {
    setMyWorries(prev => checkAndUpdateTimeouts(prev))
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

    setAssignedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    ))

    const myResp: MyResponse = {
      id: generateId(),
      worryId: task.worry.id,
      worryContent: task.worry.content,
      worryCategory: task.worry.category,
      type: resp.type,
      content: resp.content,
      createdAt: new Date().toISOString()
    }
    setMyResponses(prev => [myResp, ...prev])
    setUserStats(prev => ({
      ...prev,
      respondedCount: prev.respondedCount + 1,
      dailyUsed: prev.dailyUsed + 1
    }))

    setMyWorries(prev => {
      const pendingWorry = prev.find(w => w.status === 'pending' || w.status === 'matched')
      if (!pendingWorry) return prev

      const mockResponses: Record<string, string[]> = {
        empathy: [
          '我特别能理解你的感受，这种心情我也经历过。你已经做得很好了，允许自己有这样的情绪，慢慢来。',
          '看到你说的这些，我心里也跟着难受。你不是一个人，有很多人都在默默关心着你。',
          '抱抱你，辛苦了。能说出来已经很勇敢了，给自己一点时间，一切都会慢慢好起来的。'
        ],
        suggestion: [
          '也许你可以试着把大问题拆分成小步骤，每次只解决一个小问题，压力会小很多。',
          '建议你找个信任的人聊聊，有时候说出来就会轻松很多。也可以试试写下来，整理一下思路。',
          '或许可以给自己安排一点放松的时间，哪怕只是散散步、听听音乐，对心情会有帮助的。'
        ],
        companionship: [
          '我在这里陪着你，你不是一个人。想说什么都可以，我在听。',
          '静静地陪着你，这种感觉我懂。不用急，我们慢慢来。',
          '有我在呢，你可以放心地脆弱一会儿。明天会更好的。'
        ]
      }

      const typeResponses = mockResponses[resp.type] || mockResponses.empathy
      const randomContent = typeResponses[Math.floor(Math.random() * typeResponses.length)]

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

      return prev.map(w =>
        w.id === pendingWorry.id
          ? { ...w, status: 'responded' as const, response: newResponse }
          : w
      )
    })

    setUserStats(prev => ({ ...prev, receivedCount: prev.receivedCount + 1 }))
  }

  const skipTask = (taskId: string) => {
    setAssignedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, skipped: true } : t
    ))
  }

  const toggleFavorite = (responseId: string) => {
    setMyWorries(prev => {
      let respToToggle: Response | null = null
      const updated = prev.map(w => {
        if (w.response && w.response.id === responseId) {
          respToToggle = { ...w.response, isFavorite: !w.response.isFavorite }
          return { ...w, response: respToToggle }
        }
        return w
      })

      if (respToToggle) {
        setFavorites(prevFavs => {
          const exists = prevFavs.some(f => f.id === responseId)
          if (respToToggle!.isFavorite && !exists) {
            return [{ ...respToToggle!, isFavorite: true }, ...prevFavs]
          } else if (!respToToggle!.isFavorite && exists) {
            return prevFavs.filter(f => f.id !== responseId)
          }
          return prevFavs
        })
      }

      return updated
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
    const newCheckin: MoodCheckin = {
      id: generateId(),
      mood,
      note,
      createdAt: new Date().toISOString()
    }
    setMoodHistory(prev => [newCheckin, ...prev])
  }

  const addBlockedUser = (user: Omit<BlockedUser, 'id' | 'blockedAt'>) => {
    const newBlocked: BlockedUser = {
      ...user,
      id: generateId(),
      blockedAt: new Date().toISOString()
    }
    setBlockedUsers(prev => {
      if (prev.some(u => u.name === user.name)) return prev
      return [newBlocked, ...prev]
    })
  }

  const removeBlockedUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== userId))
  }

  return (
    <AppContext.Provider value={{
      myWorries,
      assignedTasks,
      moodHistory,
      userStats,
      favorites,
      blockedUsers,
      myResponses,
      addWorry,
      completeTask,
      skipTask,
      toggleFavorite,
      thankResponse,
      addFollowUp,
      checkinMood,
      addBlockedUser,
      removeBlockedUser,
      refreshTimeouts
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
