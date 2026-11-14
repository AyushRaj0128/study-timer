export type Mode = 'focus' | 'short' | 'long' | 'stopwatch' | 'custom'
export type ThemeId = 'sakura' | 'midnight' | 'matcha' | 'golden' | 'ocean' | 'mocha' | 'neon' | 'lavender'
export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  note: string
  done: boolean
  priority: Priority
  tag: string
  estimate: number
  completedPomodoros: number
  createdAt: number
  completedAt?: number
}

export interface Session {
  id: string
  startedAt: number
  endedAt: number
  durationSec: number
  mode: Mode
  taskId?: string
}

export interface TimerState {
  mode: Mode
  isRunning: boolean
  remainingMs: number
  endAt: number | null
  startedAt: number | null
  focusCount: number
  customMinutes: number
}

export interface StoreState {
  theme: ThemeId
  autoTheme: boolean
  timer: TimerState
  tasks: Task[]
  sessions: Session[]
  currentTaskId: string | null
  notes: string
  dailyGoalMin: number
  soundEnabled: boolean
  activePanel: 'tasks' | 'notes' | 'mixer'
  setTheme: (theme: ThemeId) => void
  setAutoTheme: (enabled: boolean) => void
  setMode: (mode: Mode) => void
  setCustomMinutes: (minutes: number) => void
  startTimer: () => void
  pauseTimer: (remainingMs?: number) => void
  resetTimer: () => void
  skipTimer: () => void
  syncTimer: (remainingMs: number) => void
  completeTimer: () => void
  addTask: (task: Pick<Task, 'title' | 'priority' | 'tag' | 'estimate' | 'note'>) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  setCurrentTask: (id: string | null) => void
  clearCompleted: () => void
  setNotes: (notes: string) => void
  setDailyGoalMin: (minutes: number) => void
  setSoundEnabled: (enabled: boolean) => void
  setActivePanel: (panel: StoreState['activePanel']) => void
  addSession: (session: Session) => void
  importData: (data: Partial<StoreState>) => void
}
