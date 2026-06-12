import { Worry, Response, AssignedTask, MoodCheckin, UserStats } from '@/types'

const now = Date.now()

export const mockUserStats: UserStats = {
  postedCount: 12,
  respondedCount: 28,
  receivedCount: 10,
  dailyQuota: 5,
  dailyUsed: 2,
  streak: 7,
  thankedCount: 15
}

export const mockMyWorries: Worry[] = [
  {
    id: 'w1',
    content: '最近工作压力特别大，每天加班到很晚，感觉自己快撑不住了。项目进度很紧，领导又一直在催，真的不知道该怎么办才好。',
    category: 'work',
    severity: 'severe',
    expectedResponse: 'empathy',
    status: 'responded',
    createdAt: new Date(now - 3600000 * 5).toISOString(),
    expiresAt: new Date(now + 3600000 * 19).toISOString(),
    isAnonymous: true,
    response: {
      id: 'r1',
      worryId: 'w1',
      type: 'empathy',
      content: '我特别能理解这种感受，被工作压得喘不过气的感觉真的很难受。你已经很努力了，试着给自己安排一点休息的时间，哪怕只是十分钟也好。如果实在撑不住，可以和领导沟通一下进度的，你不是一个人在扛。',
      createdAt: new Date(now - 3600000 * 2).toISOString(),
      isAnonymous: true,
      isFavorite: true,
      isThanked: false,
      canFollowUp: true
    }
  },
  {
    id: 'w2',
    content: '和男朋友吵架了，冷战了三天，我很想主动和好但又拉不下脸。不知道他是不是也在想我，还是真的不在乎了。',
    category: 'love',
    severity: 'moderate',
    expectedResponse: 'suggestion',
    status: 'pending',
    createdAt: new Date(now - 3600000 * 2).toISOString(),
    expiresAt: new Date(now + 3600000 * 22).toISOString(),
    isAnonymous: true
  },
  {
    id: 'w3',
    content: '考研二战了，还是没考上。不知道是该三战还是直接找工作，感觉人生好迷茫。',
    category: 'study',
    severity: 'moderate',
    expectedResponse: 'companionship',
    status: 'completed',
    createdAt: new Date(now - 86400000 * 3).toISOString(),
    expiresAt: new Date(now - 86400000 * 1).toISOString(),
    isAnonymous: true,
    response: {
      id: 'r3',
      worryId: 'w3',
      type: 'companionship',
      content: '我在这里陪着你，这种迷茫和失落我也经历过。不管你选择哪条路，都不是失败，只是人生的不同风景。给自己一点时间，答案会慢慢清晰的。',
      createdAt: new Date(now - 86400000 * 2).toISOString(),
      isAnonymous: true,
      isFavorite: false,
      isThanked: true,
      canFollowUp: false
    }
  }
]

export const mockAssignedTasks: AssignedTask[] = [
  {
    id: 't1',
    worry: {
      id: 'aw1',
      content: '室友的作息和我完全不一样，她凌晨两点还在大声打电话，我已经连续一周没睡好了。说过很多次都没用，又不想把关系闹僵，好烦。',
      category: 'social',
      severity: 'moderate',
      expectedResponse: 'suggestion',
      status: 'matched',
      createdAt: new Date(now - 3600000).toISOString(),
      expiresAt: new Date(now + 3600000 * 5).toISOString(),
      isAnonymous: true
    },
    assignedAt: new Date(now - 1800000).toISOString(),
    expiresAt: new Date(now + 3600000 * 4).toISOString(),
    skipped: false,
    completed: false
  },
  {
    id: 't2',
    worry: {
      id: 'aw2',
      content: '妈妈总是逼我考公务员，说稳定。但我真的不想考，我想去互联网公司做产品。每次沟通都是吵架，好痛苦。',
      category: 'family',
      severity: 'severe',
      expectedResponse: 'empathy',
      status: 'matched',
      createdAt: new Date(now - 7200000).toISOString(),
      expiresAt: new Date(now + 3600000 * 6).toISOString(),
      isAnonymous: true
    },
    assignedAt: new Date(now - 5400000).toISOString(),
    expiresAt: new Date(now + 3600000 * 3).toISOString(),
    skipped: false,
    completed: false
  },
  {
    id: 't3',
    worry: {
      id: 'aw3',
      content: '最近总是失眠，脑子里全是乱七八糟的事情，越想越睡不着。白天又很困，什么事都做不好。',
      category: 'health',
      severity: 'mild',
      expectedResponse: 'companionship',
      status: 'matched',
      createdAt: new Date(now - 5400000).toISOString(),
      expiresAt: new Date(now + 3600000 * 10).toISOString(),
      isAnonymous: true
    },
    assignedAt: new Date(now - 3600000).toISOString(),
    expiresAt: new Date(now + 3600000 * 8).toISOString(),
    skipped: false,
    completed: false
  }
]

export const mockMoodHistory: MoodCheckin[] = [
  { id: 'm1', mood: 'calm', note: '今天状态还不错', createdAt: new Date(now - 86400000 * 6).toISOString() },
  { id: 'm2', mood: 'anxious', note: '工作有点焦虑', createdAt: new Date(now - 86400000 * 5).toISOString() },
  { id: 'm3', mood: 'sad', note: '心情不好', createdAt: new Date(now - 86400000 * 4).toISOString() },
  { id: 'm4', mood: 'calm', note: '', createdAt: new Date(now - 86400000 * 3).toISOString() },
  { id: 'm5', mood: 'happy', note: '收到温暖的回应', createdAt: new Date(now - 86400000 * 2).toISOString() },
  { id: 'm6', mood: 'calm', note: '', createdAt: new Date(now - 86400000 * 1).toISOString() }
]

export const mockFavorites: Response[] = [
  {
    id: 'fav1',
    worryId: 'w1',
    type: 'empathy',
    content: '我特别能理解这种感受，被工作压得喘不过气的感觉真的很难受。你已经很努力了，试着给自己安排一点休息的时间。',
    createdAt: new Date(now - 3600000 * 2).toISOString(),
    isAnonymous: true,
    isFavorite: true,
    isThanked: false,
    canFollowUp: true
  },
  {
    id: 'fav2',
    worryId: 'w99',
    type: 'suggestion',
    content: '也许可以试着把大目标拆分成小步骤，每天只完成一小步，压力会小很多。你已经很棒了！',
    createdAt: new Date(now - 86400000 * 5).toISOString(),
    isAnonymous: true,
    isFavorite: true,
    isThanked: true,
    canFollowUp: false
  }
]
