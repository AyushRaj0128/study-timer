import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Mode, Session, StoreState, Task, ThemeId } from './types'

const durations: Record<Mode, number> = {
  focus: 25,
  short: 5,
  long: 15,
  stopwatch: 0,
  custom: 45,
}

const newTimer = (mode: Mode = 'focus') => ({
  mode,
  isRunning: false,
  remainingMs: durations[mode] * 60_000,
  endAt: null,
  startedAt: null,
  focusCount: 0,
  customMinutes: 45,
})

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: 'sakura',
      autoTheme: false,
      timer: newTimer(),
      tasks: [
        {
          id: makeId(),
          title: 'Review today\'s lecture notes',
          note: 'Pull out three ideas to revisit before the weekend.',
          done: false,
          priority: 'high',
          tag: 'Biology',
          estimate: 2,
          completedPomodoros: 1,
          createdAt: Date.now(),
        },
        {
          id: makeId(),
          title: 'Finish problem set 04',
          note: '',
          done: false,
          priority: 'medium',
          tag: 'Mathematics',
          estimate: 3,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
      sessions: [],
      currentTaskId: null,
      notes: 'A clear desk makes a clear start.\n\nWhat is the one thing that would make this session feel worthwhile?',
      dailyGoalMin: 120,
      soundEnabled: true,
      activePanel: 'tasks',
      setTheme: (theme: ThemeId) => set({ theme }),
      setAutoTheme: (autoTheme: boolean) => set({ autoTheme }),
      setMode: (mode: Mode) => set((state) => ({ timer: { ...state.timer, ...newTimer(mode), customMinutes: state.timer.customMinutes } })),
      setCustomMinutes: (minutes: number) => set((state) => ({ timer: { ...state.timer, customMinutes: minutes, remainingMs: state.timer.mode === 'custom' && !state.timer.isRunning ? minutes * 60_000 : state.timer.remainingMs } })),
      startTimer: () => set((state) => {
        if (state.timer.isRunning) return state
        const now = Date.now()
        const remaining = state.timer.mode === 'stopwatch' ? 0 : state.timer.remainingMs
        return { timer: { ...state.timer, isRunning: true, endAt: state.timer.mode === 'stopwatch' ? now : now + remaining, startedAt: state.timer.startedAt ?? now } }
      }),
      pauseTimer: (remainingMs) => set((state) => ({ timer: { ...state.timer, isRunning: false, remainingMs: remainingMs ?? state.timer.remainingMs, endAt: null } })),
      resetTimer: () => set((state) => ({ timer: { ...state.timer, isRunning: false, remainingMs: (state.timer.mode === 'custom' ? state.timer.customMinutes : durations[state.timer.mode]) * 60_000, endAt: null, startedAt: null } })),
      skipTimer: () => set((state) => ({ timer: { ...state.timer, isRunning: false, remainingMs: (state.timer.mode === 'focus' ? durations.short : durations.focus) * 60_000, mode: state.timer.mode === 'focus' ? 'short' : 'focus', endAt: null, startedAt: null } })),
      syncTimer: (remainingMs) => set((state) => ({ timer: { ...state.timer, remainingMs } })),
      completeTimer: () => {
        const state = get()
        const startedAt = state.timer.startedAt ?? Date.now() - state.timer.remainingMs
        const durationSec = Math.max(1, Math.round(((state.timer.mode === 'stopwatch' ? Date.now() - startedAt : (state.timer.mode === 'custom' ? state.timer.customMinutes : durations[state.timer.mode]) * 60_000)) / 1000))
        const session: Session = { id: makeId(), startedAt, endedAt: Date.now(), durationSec, mode: state.timer.mode, taskId: state.currentTaskId ?? undefined }
        const nextMode: Mode = state.timer.mode === 'focus' ? ((state.timer.focusCount + 1) % 4 === 0 ? 'long' : 'short') : 'focus'
        set((current) => ({
          sessions: [...current.sessions, session],
          tasks: current.currentTaskId && state.timer.mode === 'focus' ? current.tasks.map((task) => task.id === current.currentTaskId ? { ...task, completedPomodoros: task.completedPomodoros + 1 } : task) : current.tasks,
          timer: { ...current.timer, mode: nextMode, isRunning: false, remainingMs: durations[nextMode] * 60_000, endAt: null, startedAt: null, focusCount: current.timer.mode === 'focus' ? current.timer.focusCount + 1 : current.timer.focusCount },
        }))
      },
      addTask: (task) => set((state) => ({ tasks: [{ ...task, id: makeId(), done: false, completedPomodoros: 0, createdAt: Date.now() }, ...state.tasks] })),
      updateTask: (id, patch) => set((state) => ({ tasks: state.tasks.map((task) => task.id === id ? { ...task, ...patch } : task) })),
      removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id), currentTaskId: state.currentTaskId === id ? null : state.currentTaskId })),
      setCurrentTask: (currentTaskId) => set({ currentTaskId }),
      clearCompleted: () => set((state) => ({ tasks: state.tasks.filter((task) => !task.done) })),
      setNotes: (notes) => set({ notes }),
      setDailyGoalMin: (dailyGoalMin) => set({ dailyGoalMin }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setActivePanel: (activePanel) => set({ activePanel }),
      addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
      importData: (data) => set((state) => ({ ...state, ...data, timer: state.timer })),
    }),
    {
      name: 'focus-nook-state',
      partialize: (state) => ({ ...state, setTheme: undefined, setAutoTheme: undefined, setMode: undefined, setCustomMinutes: undefined, startTimer: undefined, pauseTimer: undefined, resetTimer: undefined, skipTimer: undefined, syncTimer: undefined, completeTimer: undefined, addTask: undefined, updateTask: undefined, removeTask: undefined, setCurrentTask: undefined, clearCompleted: undefined, setNotes: undefined, setDailyGoalMin: undefined, setSoundEnabled: undefined, setActivePanel: undefined, addSession: undefined, importData: undefined }),
    },
  ),
)

export { durations }
