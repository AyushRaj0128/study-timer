import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CloudRain,
  Coffee,
  FileDown,
  FileUp,
  Flame,
  Headphones,
  Keyboard,
  Leaf,
  ListTodo,
  Maximize2,
  Menu,
  Moon,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  SkipForward,
  Sparkles,
  Sun,
  TimerReset,
  Trash2,
  Volume2,
  X,
} from 'lucide-react'
import { durations, useStore } from './store'
import type { Mode, Priority, StoreState, Task, ThemeId } from './types'

const themes: Array<{ id: ThemeId; name: string; mood: string; swatch: string }> = [
  { id: 'sakura', name: 'Sakura Dawn', mood: 'soft and rosy', swatch: '#f28fa6' },
  { id: 'midnight', name: 'Midnight Lofi', mood: 'quiet and deep', swatch: '#9a86df' },
  { id: 'matcha', name: 'Matcha Study', mood: 'fresh and grounded', swatch: '#7eab39' },
  { id: 'golden', name: 'Golden Hour', mood: 'warm and cinematic', swatch: '#ef8556' },
  { id: 'ocean', name: 'Ocean Calm', mood: 'clear and airy', swatch: '#2aa6ae' },
  { id: 'mocha', name: 'Mocha Cafe', mood: 'slow and warm', swatch: '#d49f70' },
  { id: 'neon', name: 'Neon Tokyo', mood: 'electric and focused', swatch: '#34d4da' },
  { id: 'lavender', name: 'Lavender Mist', mood: 'dreamy and light', swatch: '#9e83dc' },
]

const modeLabels: Record<Mode, string> = { focus: 'Focus', short: 'Short break', long: 'Long break', stopwatch: 'Stopwatch', custom: 'Custom' }
const modeDescriptions: Record<Mode, string> = { focus: 'One quiet block at a time.', short: 'Let your mind reset.', long: 'Step away for a longer breath.', stopwatch: 'Track an open-ended session.', custom: 'Make the block fit your day.' }

function formatTime(ms: number, stopwatch = false) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (stopwatch || hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function dayLabel() {
  return new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
}

function isTypingTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null
  return element?.tagName === 'INPUT' || element?.tagName === 'TEXTAREA' || element?.isContentEditable
}

function App() {
  const theme = useStore((state) => state.theme)
  const autoTheme = useStore((state) => state.autoTheme)
  const setTheme = useStore((state) => state.setTheme)
  const setAutoTheme = useStore((state) => state.setAutoTheme)
  const timer = useStore((state) => state.timer)
  const syncTimer = useStore((state) => state.syncTimer)
  const completeTimer = useStore((state) => state.completeTimer)
  const startTimer = useStore((state) => state.startTimer)
  const pauseTimer = useStore((state) => state.pauseTimer)
  const resetTimer = useStore((state) => state.resetTimer)
  const navigate = useNavigate()
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [zen, setZen] = useState(false)

  useEffect(() => {
    const resolvedTheme = autoTheme ? (new Date().getHours() >= 18 || new Date().getHours() < 7 ? 'midnight' : 'sakura') : theme
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.dataset.zen = String(zen)
  }, [theme, autoTheme, zen])

  useEffect(() => {
    const tick = () => {
      if (!timer.isRunning) return
      if (timer.mode === 'stopwatch') {
        syncTimer(Date.now() - (timer.startedAt ?? Date.now()))
        return
      }
      const remaining = Math.max(0, (timer.endAt ?? Date.now()) - Date.now())
      if (remaining <= 0) {
        completeTimer()
        if (useStore.getState().soundEnabled) navigator.vibrate?.([80, 40, 120])
      } else {
        syncTimer(remaining)
      }
    }
    const interval = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    tick()
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [timer.isRunning, timer.mode, timer.endAt, timer.startedAt, completeTimer, syncTimer])

  useEffect(() => {
    document.title = `${formatTime(timer.remainingMs, timer.mode === 'stopwatch')} · ${modeLabels[timer.mode]} | Focus Nook`
  }, [timer.remainingMs, timer.mode])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      if (event.code === 'Space') {
        event.preventDefault()
        timer.isRunning ? pauseTimer(timer.remainingMs) : startTimer()
      }
      if (event.key.toLowerCase() === 'r') resetTimer()
      if (event.key.toLowerCase() === 'f') setZen((value) => !value)
      if (event.key.toLowerCase() === 't') {
        const index = themes.findIndex((item) => item.id === theme)
        setTheme(themes[(index + 1) % themes.length].id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pauseTimer, resetTimer, startTimer, setTheme, theme, timer.isRunning, timer.remainingMs])

  return (
    <div className="app-shell">
      <BackgroundCanvas />
      {!zen && <Header themeOpen={themeOpen} setThemeOpen={setThemeOpen} setSettingsOpen={setSettingsOpen} />}
      <main className={zen ? 'main-content zen-content' : 'main-content'}>
        <Routes>
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Dashboard onZen={() => setZen((value) => !value)} />} />
        </Routes>
      </main>
      {!zen && <BottomDock />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {location.pathname === '/stats' && <button className="mobile-home" onClick={() => navigate('/')} aria-label="Back to desk"><X size={18} /></button>}
    </div>
  )
}

function BackgroundCanvas() {
  return <div className="background-canvas" aria-hidden="true"><div className="grain" /><div className="sun-wash" /><div className="floating-leaf leaf-one">✦</div><div className="floating-leaf leaf-two">·</div><div className="floating-leaf leaf-three">✧</div></div>
}

function Header({ themeOpen, setThemeOpen, setSettingsOpen }: { themeOpen: boolean; setThemeOpen: (value: boolean) => void; setSettingsOpen: (value: boolean) => void }) {
  const theme = useStore((state) => state.theme)
  const setTheme = useStore((state) => state.setTheme)
  const autoTheme = useStore((state) => state.autoTheme)
  const setAutoTheme = useStore((state) => state.setAutoTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const selected = themes.find((item) => item.id === theme) ?? themes[0]

  return <header className="topbar">
    <Link to="/" className="brand" aria-label="Focus Nook home"><span className="brand-mark"><Leaf size={18} /></span><span>Focus Nook</span></Link>
    <nav className="main-nav" aria-label="Main navigation"><NavLink end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/">Desk</NavLink><NavLink className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} to="/stats">Insights</NavLink></nav>
    <div className="top-actions">
      <div className="theme-menu">
        <button className="theme-trigger" onClick={() => setThemeOpen(!themeOpen)} aria-expanded={themeOpen}><span className="color-dot" style={{ background: selected.swatch }} /><span>{selected.name}</span><ChevronDown size={15} /></button>
        {themeOpen && <div className="theme-popover">
          <div className="popover-heading"><span>Choose your atmosphere</span><span className="eyebrow">8 THEMES</span></div>
          {themes.map((item) => <button key={item.id} className={item.id === theme ? 'theme-option selected' : 'theme-option'} onClick={() => { setTheme(item.id); setThemeOpen(false) }}><span className="color-dot" style={{ background: item.swatch }} /><span><strong>{item.name}</strong><small>{item.mood}</small></span>{item.id === theme && <Check size={15} />}</button>)}
          <label className="switch-row"><span><Sun size={15} /> Auto atmosphere</span><input type="checkbox" checked={autoTheme} onChange={(event) => setAutoTheme(event.target.checked)} /><span className="switch" /></label>
        </div>}
      </div>
      <button className="icon-button desktop-only" onClick={() => setSettingsOpen(true)} aria-label="Open settings" title="Settings"><Settings size={18} /></button>
      <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><Menu size={18} /></button>
      {menuOpen && <div className="mobile-menu-popover"><Link to="/stats">Insights</Link><button onClick={() => setSettingsOpen(true)}>Settings</button></div>}
    </div>
  </header>
}

function Dashboard({ onZen }: { onZen: () => void }) {
  const timer = useStore((state) => state.timer)
  const sessions = useStore((state) => state.sessions)
  const tasks = useStore((state) => state.tasks)
  const currentTaskId = useStore((state) => state.currentTaskId)
  const dailyGoalMin = useStore((state) => state.dailyGoalMin)
  const todaySeconds = sessions.filter((session) => session.mode === 'focus' && new Date(session.endedAt).toDateString() === new Date().toDateString()).reduce((sum, session) => sum + session.durationSec, 0)
  const focusCountToday = sessions.filter((session) => session.mode === 'focus' && new Date(session.endedAt).toDateString() === new Date().toDateString()).length
  const currentTask = tasks.find((task) => task.id === currentTaskId)
  const progress = Math.min(100, (todaySeconds / 60 / dailyGoalMin) * 100)

  return <>
    <section className="welcome-row"><div><p className="eyebrow">{dayLabel()}</p><h1>Make room for <em>deep work.</em></h1><p className="subtle-copy">A small, steady rhythm is enough for today.</p></div><div className="today-chip"><div className="goal-ring" style={{ '--goal-progress': `${progress * 3.6}deg` } as React.CSSProperties}><span>{Math.round(progress)}<small>%</small></span></div><div><span className="eyebrow">TODAY'S GOAL</span><strong>{Math.round(todaySeconds / 60)} / {dailyGoalMin} min</strong><small>{focusCountToday} focus {focusCountToday === 1 ? 'session' : 'sessions'}</small></div></div></section>
    <div className="dashboard-grid">
      <aside className="left-rail"><QuickStats todaySeconds={todaySeconds} focusCountToday={focusCountToday} /><NotesCard /></aside>
      <section className="timer-column"><TimerCard onZen={onZen} currentTask={currentTask} /><div className="session-hint"><span className="pulse-dot" />{timer.isRunning ? `${modeLabels[timer.mode]} in progress` : currentTask ? `Working on ${currentTask.title}` : 'Choose a task to make this block count'}</div></section>
      <TaskPanel />
    </div>
  </>
}

function QuickStats({ todaySeconds, focusCountToday }: { todaySeconds: number; focusCountToday: number }) {
  const tasks = useStore((state) => state.tasks)
  const completed = tasks.filter((task) => task.done).length
  return <section className="quick-stats"><div className="section-kicker"><span>YOUR RHYTHM</span><Flame size={15} /></div><div className="stat-grid"><div className="stat-item"><strong>{Math.round(todaySeconds / 60)}<small>m</small></strong><span>focus today</span></div><div className="stat-item"><strong>{focusCountToday}</strong><span>sessions</span></div><div className="stat-item"><strong>{completed}<small>/{tasks.length}</small></strong><span>tasks done</span></div></div><div className="streak-line"><span className="streak-icon"><Flame size={14} /></span><span><strong>3 day streak</strong><small>Keep the gentle momentum.</small></span></div></section>
}

function TimerCard({ onZen, currentTask }: { onZen: () => void; currentTask?: Task }) {
  const timer = useStore((state) => state.timer)
  const setMode = useStore((state) => state.setMode)
  const setCustomMinutes = useStore((state) => state.setCustomMinutes)
  const startTimer = useStore((state) => state.startTimer)
  const pauseTimer = useStore((state) => state.pauseTimer)
  const resetTimer = useStore((state) => state.resetTimer)
  const skipTimer = useStore((state) => state.skipTimer)
  const soundEnabled = useStore((state) => state.soundEnabled)
  const setSoundEnabled = useStore((state) => state.setSoundEnabled)
  const [showCustom, setShowCustom] = useState(false)
  const durationMs = timer.mode === 'stopwatch' ? Math.max(timer.remainingMs, 1) : (timer.mode === 'custom' ? timer.customMinutes : durations[timer.mode]) * 60_000
  const progress = timer.mode === 'stopwatch' ? Math.min(100, (timer.remainingMs / 3_600_000) * 100) : Math.min(100, Math.max(0, (1 - timer.remainingMs / durationMs) * 100))
  const circumference = 2 * Math.PI * 148
  const offset = circumference - (progress / 100) * circumference

  return <section className="timer-card glass-card">
    <div className="timer-card-top"><span className="live-badge"><span className={timer.isRunning ? 'live-dot active' : 'live-dot'} />{timer.isRunning ? 'IN FLOW' : 'READY WHEN YOU ARE'}</span><div className="timer-tools"><button className="quiet-button" onClick={() => setSoundEnabled(!soundEnabled)} aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'} title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}>{soundEnabled ? <Volume2 size={16} /> : <Volume2 size={16} className="muted-icon" />}</button><button className="quiet-button" onClick={onZen} aria-label="Toggle zen mode" title="Zen mode"><Maximize2 size={16} /></button></div></div>
    <div className="mode-tabs" role="tablist" aria-label="Timer modes">{(['focus', 'short', 'long', 'stopwatch'] as Mode[]).map((mode) => <button key={mode} role="tab" aria-selected={timer.mode === mode} className={timer.mode === mode ? 'mode-tab active' : 'mode-tab'} onClick={() => setMode(mode)}>{modeLabels[mode]}</button>)}<button role="tab" aria-selected={timer.mode === 'custom'} className={timer.mode === 'custom' ? 'mode-tab active' : 'mode-tab'} onClick={() => { setMode('custom'); setShowCustom(true) }}>Custom</button></div>
    <div className="timer-face"><svg className="progress-ring" viewBox="0 0 320 320" aria-label={`${formatTime(timer.remainingMs, timer.mode === 'stopwatch')} remaining`}><circle className="ring-track" cx="160" cy="160" r="148" /><circle className="ring-progress" cx="160" cy="160" r="148" strokeDasharray={circumference} strokeDashoffset={offset} /></svg><div className="timer-readout"><span className="timer-mode-label">{modeLabels[timer.mode]}</span><strong>{formatTime(timer.remainingMs, timer.mode === 'stopwatch')}</strong><span className="timer-description">{modeDescriptions[timer.mode]}</span></div></div>
    {showCustom && timer.mode === 'custom' && <div className="custom-time"><label htmlFor="custom-minutes">Custom block</label><input id="custom-minutes" type="number" min="1" max="240" value={timer.customMinutes} onChange={(event) => setCustomMinutes(Math.min(240, Math.max(1, Number(event.target.value) || 1)))} /><span>minutes</span><button onClick={() => setShowCustom(false)} aria-label="Close custom duration"><Check size={15} /></button></div>}
    <div className="timer-task-pill">{currentTask ? <><CheckCircle2 size={15} /><span>{currentTask.title}</span></> : <><Sparkles size={15} /><span>No current task selected</span></>}</div>
    <div className="timer-controls"><button className="round-control" onClick={resetTimer} aria-label="Reset timer" title="Reset"><RotateCcw size={18} /></button><button className="primary-control" onClick={() => timer.isRunning ? pauseTimer(timer.remainingMs) : startTimer()}>{timer.isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}<span>{timer.isRunning ? 'Pause' : 'Start focus'}</span></button><button className="round-control" onClick={skipTimer} aria-label="Skip session" title="Skip"><SkipForward size={18} /></button></div>
    <div className="session-dots" aria-label={`${timer.focusCount} focus sessions completed in this cycle`}>{[0, 1, 2, 3].map((dot) => <span className={dot < timer.focusCount % 4 ? 'session-dot filled' : 'session-dot'} key={dot} />)}<span className="session-count">{timer.focusCount % 4}/4</span></div>
  </section>
}

function NotesCard() {
  const notes = useStore((state) => state.notes)
  const setNotes = useStore((state) => state.setNotes)
  return <section className="notes-card glass-card"><div className="card-heading"><span><Sparkles size={15} /> Quick notes</span><span className="save-label">autosaved</span></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} aria-label="Quick notes" /></section>
}

function TaskPanel() {
  const tasks = useStore((state) => state.tasks)
  const currentTaskId = useStore((state) => state.currentTaskId)
  const setCurrentTask = useStore((state) => state.setCurrentTask)
  const addTask = useStore((state) => state.addTask)
  const updateTask = useStore((state) => state.updateTask)
  const removeTask = useStore((state) => state.removeTask)
  const clearCompleted = useStore((state) => state.clearCompleted)
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')
  const [newTitle, setNewTitle] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const visibleTasks = tasks.filter((task) => filter === 'all' || filter === 'active' ? !task.done : task.done)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!newTitle.trim()) return
    addTask({ title: newTitle.trim(), priority: 'medium', tag: '', estimate: 1, note: '' })
    setNewTitle('')
  }

  return <section className="task-panel glass-card"><div className="panel-title-row"><div><div className="eyebrow">YOUR PLAN</div><h2>Task list <span>{tasks.filter((task) => !task.done).length}</span></h2></div><button className="icon-button soft" onClick={clearCompleted} aria-label="Clear completed tasks" title="Clear completed"><Trash2 size={16} /></button></div><div className="task-filter" role="tablist"><button className={filter === 'all' ? 'filter-button active' : 'filter-button'} onClick={() => setFilter('all')}>All <span>{tasks.length}</span></button><button className={filter === 'active' ? 'filter-button active' : 'filter-button'} onClick={() => setFilter('active')}>Active <span>{tasks.filter((task) => !task.done).length}</span></button><button className={filter === 'done' ? 'filter-button active' : 'filter-button'} onClick={() => setFilter('done')}>Done <span>{tasks.filter((task) => task.done).length}</span></button></div><div className="task-list">{visibleTasks.length === 0 ? <div className="empty-tasks"><ListTodo size={24} /><p>{filter === 'done' ? 'No finished tasks yet.' : 'Nothing here yet. What will you tackle first?'}</p></div> : visibleTasks.map((task) => <TaskRow key={task.id} task={task} isCurrent={task.id === currentTaskId} expanded={expanded === task.id} onExpand={() => setExpanded(expanded === task.id ? null : task.id)} onCurrent={() => setCurrentTask(task.id === currentTaskId ? null : task.id)} onToggle={() => updateTask(task.id, { done: !task.done, completedAt: !task.done ? Date.now() : undefined })} onDelete={() => removeTask(task.id)} onUpdate={(patch) => updateTask(task.id, patch)} />)}</div><form className="add-task-form" onSubmit={submit}><Plus size={17} /><input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Add a task..." aria-label="New task title" /><button type="submit" aria-label="Add task"><ArrowRight size={17} /></button></form></section>
}

function TaskRow({ task, isCurrent, expanded, onExpand, onCurrent, onToggle, onDelete, onUpdate }: { task: Task; isCurrent: boolean; expanded: boolean; onExpand: () => void; onCurrent: () => void; onToggle: () => void; onDelete: () => void; onUpdate: (patch: Partial<Task>) => void }) {
  const priorityClass = `priority-${task.priority}`
  return <div className={isCurrent ? 'task-row current' : 'task-row'}><div className="task-main"><button className={task.done ? 'task-check checked' : 'task-check'} onClick={onToggle} aria-label={task.done ? `Reopen ${task.title}` : `Complete ${task.title}`}>{task.done && <Check size={12} />}</button><button className="task-copy" onClick={onCurrent}><span className={task.done ? 'task-title done' : 'task-title'}>{task.title}</span><span className="task-meta"><span className={`priority-dot ${priorityClass}`} />{task.tag || 'General'}<span className="meta-divider" />{task.completedPomodoros}/{task.estimate} blocks</span></button><button className="task-more" onClick={onExpand} aria-label={`Edit ${task.title}`}><ChevronDown size={15} className={expanded ? 'rotate-icon' : ''} /></button></div>{expanded && <div className="task-edit"><input value={task.title} onChange={(event) => onUpdate({ title: event.target.value })} aria-label="Edit task title" /><div className="edit-row"><select value={task.priority} onChange={(event) => onUpdate({ priority: event.target.value as Priority })} aria-label="Task priority"><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select><input value={task.tag} onChange={(event) => onUpdate({ tag: event.target.value })} placeholder="Subject tag" aria-label="Subject tag" /><button className="delete-button" onClick={onDelete} aria-label="Delete task"><Trash2 size={15} /></button></div></div>}</div>
}

function BottomDock() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showPlayer, setShowPlayer] = useState(false)
  const [mixerOpen, setMixerOpen] = useState(false)
  const embedUrl = getYouTubeEmbedUrl(youtubeUrl)
  return <div className={showPlayer && embedUrl ? 'bottom-dock player-open' : 'bottom-dock'}><div className="dock-music"><div className="album-art"><Music2 size={18} /></div><div className="track-info"><span className="eyebrow">FOCUS SOUNDTRACK</span><strong>{showPlayer && embedUrl ? 'YouTube focus link' : 'Bring your own calm'}</strong></div><div className="equalizer" aria-hidden="true"><i /><i /><i /><i /><i /></div><input className="youtube-input" value={youtubeUrl} onChange={(event) => { setYoutubeUrl(event.target.value); setShowPlayer(false) }} placeholder="Paste a YouTube link" aria-label="YouTube focus link" /><button className="dock-play" onClick={() => { if (embedUrl) setShowPlayer(true); else window.open('https://www.youtube.com/results?search_query=lofi+study+music', '_blank', 'noopener,noreferrer') }} aria-label={showPlayer ? 'Reload focus link' : 'Play focus link'}>{showPlayer ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}</button></div>{showPlayer && embedUrl && <div className="youtube-frame"><iframe title="Focus Nook YouTube player" src={embedUrl} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /><button className="frame-close" onClick={() => setShowPlayer(false)} aria-label="Close YouTube player"><X size={14} /></button></div>}<div className="dock-divider" /><button className={mixerOpen ? 'dock-tool active' : 'dock-tool'} onClick={() => setMixerOpen(!mixerOpen)}><CloudRain size={17} /><span>Ambience</span><span className="mixer-level" /></button>{mixerOpen && <div className="mixer-popover"><div className="popover-heading"><span>Ambient mix</span><span className="eyebrow">SOFTLY ON</span></div><MixerRow icon={<CloudRain size={15} />} label="Rain" /><MixerRow icon={<Coffee size={15} />} label="Cafe" /><MixerRow icon={<Moon size={15} />} label="Night" /></div>}</div>
}

function getYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value)
    const playlistId = url.searchParams.get('list')
    if (playlistId) return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&rel=0`
    const videoId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v')
    return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0` : ''
  } catch {
    return ''
  }
}

function MixerRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  const [level, setLevel] = useState(42)
  return <label className="mixer-row"><span>{icon}{label}</span><input type="range" min="0" max="100" value={level} onChange={(event) => setLevel(Number(event.target.value))} /><span>{level}%</span></label>
}

function StatsPage() {
  const sessions = useStore((state) => state.sessions)
  const tasks = useStore((state) => state.tasks)
  const dailyGoalMin = useStore((state) => state.dailyGoalMin)
  const [showImport, setShowImport] = useState(false)
  const focusSessions = sessions.filter((session) => session.mode === 'focus')
  const totalMinutes = Math.round(focusSessions.reduce((sum, session) => sum + session.durationSec, 0) / 60)
  const todayMinutes = Math.round(focusSessions.filter((session) => new Date(session.endedAt).toDateString() === new Date().toDateString()).reduce((sum, session) => sum + session.durationSec, 0) / 60)
  const week = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const minutes = Math.round(focusSessions.filter((session) => new Date(session.endedAt).toDateString() === date.toDateString()).reduce((sum, session) => sum + session.durationSec, 0) / 60); return { label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date), minutes } })
  const maxWeek = Math.max(...week.map((day) => day.minutes), 25)
  const exportData = () => { const data = { exportedAt: new Date().toISOString(), sessions, tasks, notes: useStore.getState().notes }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'focus-nook-data.json'; link.click(); URL.revokeObjectURL(url) }
  return <section className="stats-page"><div className="stats-heading"><div><p className="eyebrow">YOUR PROGRESS</p><h1>Make the quiet work <em>visible.</em></h1><p className="subtle-copy">A little evidence that your time is adding up.</p></div><div className="stats-actions"><button className="secondary-button" onClick={exportData}><FileDown size={16} />Export</button><button className="secondary-button" onClick={() => setShowImport(!showImport)}><FileUp size={16} />Import</button>{showImport && <ImportInput onDone={() => setShowImport(false)} />}</div></div><div className="stats-overview"><div className="overview-card"><span className="eyebrow">TOTAL FOCUS</span><strong>{totalMinutes}<small>min</small></strong><span className="trend-up"><Sparkles size={14} /> Keep building your archive</span></div><div className="overview-card"><span className="eyebrow">THIS WEEK</span><strong>{week.reduce((sum, day) => sum + day.minutes, 0)}<small>min</small></strong><span className="trend-up"><Clock3 size={14} /> {focusSessions.length} sessions logged</span></div><div className="overview-card goal-overview"><span className="eyebrow">TODAY'S GOAL</span><div className="goal-progress-line"><strong>{todayMinutes}<small> / {dailyGoalMin} min</small></strong><div className="mini-progress"><span style={{ width: `${Math.min(100, todayMinutes / dailyGoalMin * 100)}%` }} /></div></div><span className="trend-up"><Flame size={14} /> 3 day streak</span></div></div><div className="stats-main-grid"><section className="chart-card glass-card"><div className="card-heading"><span><BarChart3 size={16} /> Focus minutes</span><span className="muted-label">LAST 7 DAYS</span></div><div className="bar-chart">{week.map((day) => <div className="bar-column" key={day.label}><span className="bar-value">{day.minutes || ''}</span><div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(5, day.minutes / maxWeek * 100)}%` }} /></div><span>{day.label}</span></div>)}</div></section><section className="chart-card glass-card"><div className="card-heading"><span><ListTodo size={16} /> Task progress</span><span className="muted-label">ALL TIME</span></div><div className="task-progress-chart"><div className="donut" style={{ '--done': `${tasks.length ? tasks.filter((task) => task.done).length / tasks.length * 360 : 0}deg` } as React.CSSProperties}><div><strong>{tasks.filter((task) => task.done).length}</strong><span>done</span></div></div><div className="progress-legend"><span><i className="legend-dot done-dot" />Completed <strong>{tasks.filter((task) => task.done).length}</strong></span><span><i className="legend-dot active-dot" />In progress <strong>{tasks.filter((task) => !task.done).length}</strong></span><span><i className="legend-dot focus-dot" />Goal blocks <strong>{focusSessions.length}</strong></span></div></div></section></div><section className="heatmap-card glass-card"><div className="card-heading"><span><Flame size={16} /> Consistency</span><span className="muted-label">LAST 12 WEEKS</span></div><Heatmap sessions={focusSessions} /></section></section>
}

function Heatmap({ sessions }: { sessions: StoreState['sessions'] }) {
  const cells = Array.from({ length: 84 }, (_, index) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (83 - index)); const minutes = sessions.filter((session) => new Date(session.endedAt).toDateString() === date.toDateString()).reduce((sum, session) => sum + session.durationSec, 0) / 60; return { date, minutes } })
  return <div className="heatmap-wrap"><div className="weekday-labels"><span>Mon</span><span>Wed</span><span>Fri</span></div><div className="heatmap-grid">{cells.map((cell) => <span key={cell.date.toISOString()} className={`heat-cell level-${cell.minutes === 0 ? 0 : cell.minutes < 30 ? 1 : cell.minutes < 90 ? 2 : 3}`} title={`${Math.round(cell.minutes)} minutes on ${cell.date.toLocaleDateString()}`} />)}</div><div className="heatmap-legend"><span>Less</span><i className="heat-cell level-0" /><i className="heat-cell level-1" /><i className="heat-cell level-2" /><i className="heat-cell level-3" /><span>More</span></div></div>
}

function ImportInput({ onDone }: { onDone: () => void }) {
  const importData = useStore((state) => state.importData)
  const onChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(String(reader.result)) as Partial<StoreState>; importData(data); onDone() } catch { window.alert('That file could not be imported.') } }; reader.readAsText(file) }
  return <label className="import-popover"><FileUp size={15} />Choose JSON<input type="file" accept="application/json" onChange={onChange} /></label>
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const dailyGoalMin = useStore((state) => state.dailyGoalMin)
  const setDailyGoalMin = useStore((state) => state.setDailyGoalMin)
  const soundEnabled = useStore((state) => state.soundEnabled)
  const setSoundEnabled = useStore((state) => state.setSoundEnabled)
  const autoTheme = useStore((state) => state.autoTheme)
  const setAutoTheme = useStore((state) => state.setAutoTheme)
  const [saved, setSaved] = useState(false)
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="modal-heading"><div><span className="eyebrow">PERSONALISE YOUR DESK</span><h2 id="settings-title">Settings</h2></div><button className="icon-button" onClick={onClose} aria-label="Close settings"><X size={18} /></button></div><div className="settings-section"><h3>Daily rhythm</h3><label className="setting-line"><span><strong>Daily focus goal</strong><small>How much focused time would feel good today?</small></span><span className="number-control"><input type="number" min="15" max="720" value={dailyGoalMin} onChange={(event) => setDailyGoalMin(Number(event.target.value) || 120)} /><span>min</span></span></label><label className="setting-line"><span><strong>Sound cues</strong><small>Use subtle haptics when a session ends.</small></span><input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} /><span className="switch" /></label><label className="setting-line"><span><strong>Auto atmosphere</strong><small>Use a lighter desk by day and a darker one at night.</small></span><input type="checkbox" checked={autoTheme} onChange={(event) => setAutoTheme(event.target.checked)} /><span className="switch" /></label></div><div className="settings-section"><h3>Keyboard shortcuts</h3><div className="shortcut-list"><span><kbd>Space</kbd> Start or pause</span><span><kbd>R</kbd> Reset timer</span><span><kbd>F</kbd> Zen mode</span><span><kbd>T</kbd> Cycle atmosphere</span></div></div><div className="privacy-note"><LockIcon /><span>Your data stays in this browser. Focus Nook has no analytics or account.</span></div><button className="save-settings" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800) }}>{saved ? <><Check size={16} />Saved</> : 'Done'}</button></section></div>
}

function LockIcon() { return <span className="lock-icon"><Keyboard size={15} /></span> }

export default App
