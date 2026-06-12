import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Worry, Response, AssignedTask, MoodCheckin, UserStats } from '@/types'
import { mockMyWorries, mockAssignedTasks, mockMoodHistory, mockUserStats, mockFavorites } from '@/data/mock'
import { generateId } from '@/utils'

interface AppContextType {
  myWorries: Worry[]
  assignedTasks: AssignedTask[]
  moodHistory: MoodCheckin[]
  userStats: UserStats
  favorites: Response[]
  addWorry: (worry: Omit<Worry, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => void
  completeTask: (taskId: string, response: Omit<Response, 'id' | 'worryId' | 'createdAt' | 'isAnonymous' | 'isFavorite' | 'isThanked' | 'canFollowUp'>) => void
  skipTask: (taskId: string) => void
  toggleFavorite: (responseId: string) => void
  thankResponse: (responseId: string) => void
  addFollowUp: (responseId: string, content: string) => void
  checkinMood: (mood: MoodCheckin['mood'], note: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myWorries, setMyWorries] = useState<Worry[]>(mockMyWorries)
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(mockAssignedTasks)
  const [moodHistory, setMoodHistory] = useState<MoodCheckin[]>(mockMoodHistory)
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats)
  const [favorites, setFavorites] = useState<Response[]>(mockFavorites)

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
    setAssignedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    ))
    setUserStats(prev => ({
      ...prev,
      respondedCount: prev.respondedCount + 1,
      dailyUsed: prev.dailyUsed + 1
    }))
  }

  const skipTask = (taskId: string) => {
    setAssignedTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, skipped: true } : t
    ))
  }

  const toggleFavorite = (responseId: string) => {
    setMyWorries(prev => prev.map(w => {
      if (w.response && w.response.id === responseId) {
        const newIsFav = !w.response.isFavorite
        if (newIsFav) {
          setFavorites(favs => [...favs, { ...w.response, isFavorite: true }])
        } else {
          setFavorites(favs => favs.filter(f => f.id !== responseId))
        }
        return { ...w, response: { ...w.response, isFavorite: newIsFav } }
      }
      return w
    }))
  }

  const thankResponse = (responseId: string) => {
    setMyWorries(prev => prev.map(w => {
      if (w.response && w.response.id === responseId) {
        return { ...w, response: { ...w.response, isThanked: true } }
      }
      return w
    }))
    setUserStats(prev => ({ ...prev, thankedCount: prev.thankedCount + 1 }))
  }

  const addFollowUp = (responseId: string, content: string) => {
    setMyWorries(prev => prev.map(w => {
      if (w.response && w.response.id === responseId) {
        return { ...w, response: { ...w.response, canFollowUp: false, followUpContent: content } }
      }
      return w
    }))
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

  return (
    <AppContext.Provider value={{
      myWorries,
      assignedTasks,
      moodHistory,
      userStats,
      favorites,
      addWorry,
      completeTask,
      skipTask,
      toggleFavorite,
      thankResponse,
      addFollowUp,
      checkinMood
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
