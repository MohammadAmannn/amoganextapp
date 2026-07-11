'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  MoreVertical,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ComingSoon } from '@/components/coming-soon'

interface Assignee {
  id: string
  name: string
  avatar: string
  color: string
}

interface Column {
  id: string
  title: string
  order: number
}

interface Task {
  id: string
  columnId: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assigneeId: string
  createdAt: string
}

const MOCK_ASSIGNEES: Assignee[] = [
  { id: '1', name: 'Mohammad Aman', avatar: 'MA', color: 'bg-emerald-500 text-emerald-foreground' },
  { id: '2', name: 'Sarah Anderson', avatar: 'SA', color: 'bg-blue-500 text-blue-foreground' },
  { id: '3', name: 'John Doe', avatar: 'JD', color: 'bg-amber-500 text-amber-foreground' },
  { id: '4', name: 'Oliver Smith', avatar: 'OS', color: 'bg-purple-500 text-purple-foreground' },
]

const INITIAL_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'in-progress', title: 'In Progress', order: 1 },
  { id: 'review', title: 'Under Review', order: 2 },
  { id: 'done', title: 'Completed', order: 3 },
]

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    columnId: 'todo',
    title: 'Implement OAuth Authentication',
    description: 'Integrate Google and GitHub authentication into the main sign-in page.',
    priority: 'HIGH',
    assigneeId: '2',
    createdAt: '2026-06-25T12:00:00.000Z',
  },
  {
    id: 't2',
    columnId: 'in-progress',
    title: 'Design Landing Page Hero Section',
    description: 'Build a premium glassmorphic hero section with micro-animations.',
    priority: 'MEDIUM',
    assigneeId: '1',
    createdAt: '2026-06-25T12:10:00.000Z',
  },
  {
    id: 't3',
    columnId: 'review',
    title: 'WooCommerce API Proxy Integration',
    description: 'Configure backend serverless proxy routes to securely query store products.',
    priority: 'HIGH',
    assigneeId: '4',
    createdAt: '2026-06-25T12:20:00.000Z',
  },
  {
    id: 't4',
    columnId: 'done',
    title: 'Setup Next.js Project Structure',
    description: 'Initialize next-app using Tailwind v4 and clean directory structure.',
    priority: 'LOW',
    assigneeId: '3',
    createdAt: '2026-06-25T12:00:00.000Z',
  },
]

export default function KanbanTemplate() {
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState('board')
  const [isHydrated, setIsHydrated] = useState(false)

  // Drag and Drop States
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)
  const [activeDropdownColId, setActiveDropdownColId] = useState<string | null>(null)

  // Column Modal States
  const [isColModalOpen, setIsColModalOpen] = useState(false)
  const [editingColId, setEditingColId] = useState<string | null>(null)
  const [colTitleInput, setColTitleInput] = useState('')

  // Task Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [taskColumnId, setTaskColumnId] = useState('')
  const [taskTitleInput, setTaskTitleInput] = useState('')
  const [taskDescInput, setTaskDescInput] = useState('')
  const [taskPriorityInput, setTaskPriorityInput] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW')
  const [taskAssigneeInput, setTaskAssigneeInput] = useState('1')

  // Load state on mount
  useEffect(() => {
    const savedCols = localStorage.getItem('kanban_columns')
    const savedTasks = localStorage.getItem('kanban_tasks')

    if (savedCols && savedTasks) {
      setColumns(JSON.parse(savedCols))
      setTasks(JSON.parse(savedTasks))
    } else {
      setColumns(INITIAL_COLUMNS)
      setTasks(INITIAL_TASKS)
      localStorage.setItem('kanban_columns', JSON.stringify(INITIAL_COLUMNS))
      localStorage.setItem('kanban_tasks', JSON.stringify(INITIAL_TASKS))
    }
    setIsHydrated(true)
  }, [])

  // Helper to save state
  const saveState = (newCols: Column[], newTasks: Task[]) => {
    setColumns(newCols)
    setTasks(newTasks)
    localStorage.setItem('kanban_columns', JSON.stringify(newCols))
    localStorage.setItem('kanban_tasks', JSON.stringify(newTasks))
  }

  // Handle Click Outside Dropdowns
  useEffect(() => {
    const closeDropdown = () => setActiveDropdownColId(null)
    window.addEventListener('click', closeDropdown)
    return () => window.removeEventListener('click', closeDropdown)
  }, [])

  // Task Drag Handlers
  const handleDragStartTask = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'task', id: taskId }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOverColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    if (draggedTaskId) {
      setDragOverColumnId(colId)
    }
  }

  const handleDropTask = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    const dataStr = e.dataTransfer.getData('text/plain')
    if (!dataStr) return

    try {
      const data = JSON.parse(dataStr)
      if (data.type === 'task' && draggedTaskId) {
        const updatedTasks = tasks.map((t) =>
          t.id === draggedTaskId ? { ...t, columnId: colId } : t
        )
        saveState(columns, updatedTasks)
      }
    } catch (err) {
      console.error('Drop error:', err)
    } finally {
      setDraggedTaskId(null)
      setDragOverColumnId(null)
    }
  }

  // Column Drag Handlers (for reordering)
  const handleDragStartColumn = (e: React.DragEvent, colId: string) => {
    setDraggedColumnId(colId)
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'column', id: colId }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropColumn = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault()
    if (!draggedColumnId || draggedColumnId === targetColId) return

    const draggedCol = columns.find((c) => c.id === draggedColumnId)
    const targetCol = columns.find((c) => c.id === targetColId)
    if (!draggedCol || !targetCol) return

    const otherCols = columns.filter((c) => c.id !== draggedColumnId)
    const targetIdx = otherCols.findIndex((c) => c.id === targetColId)

    const reordered = [...otherCols]
    reordered.splice(targetIdx, 0, draggedCol)

    const updatedCols = reordered.map((col, index) => ({ ...col, order: index }))
    saveState(updatedCols, tasks)
    setDraggedColumnId(null)
  }

  // Column Add/Edit Action
  const openColModal = (colId: string | null = null) => {
    if (colId) {
      const col = columns.find((c) => c.id === colId)
      if (col) {
        setEditingColId(colId)
        setColTitleInput(col.title)
      }
    } else {
      setEditingColId(null)
      setColTitleInput('')
    }
    setIsColModalOpen(true)
  }

  const handleSaveColumn = () => {
    if (!colTitleInput.trim()) return

    if (editingColId) {
      // Edit
      const updated = columns.map((c) =>
        c.id === editingColId ? { ...c, title: colTitleInput.trim() } : c
      )
      saveState(updated, tasks)
    } else {
      // Add
      const newId = `col-${Date.now()}`
      const newCol: Column = {
        id: newId,
        title: colTitleInput.trim(),
        order: columns.length,
      }
      saveState([...columns, newCol], tasks)
    }
    setIsColModalOpen(false)
  }

  const handleDeleteColumn = (colId: string) => {
    const updatedCols = columns
      .filter((c) => c.id !== colId)
      .map((col, index) => ({ ...col, order: index }))
    const updatedTasks = tasks.filter((t) => t.columnId !== colId)
    saveState(updatedCols, updatedTasks)
  }

  // Task Add/Edit Action
  const openTaskModal = (colId: string, taskId: string | null = null) => {
    setTaskColumnId(colId)
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        setEditingTaskId(taskId)
        setTaskTitleInput(task.title)
        setTaskDescInput(task.description)
        setTaskPriorityInput(task.priority)
        setTaskAssigneeInput(task.assigneeId)
      }
    } else {
      setEditingTaskId(null)
      setTaskTitleInput('')
      setTaskDescInput('')
      setTaskPriorityInput('LOW')
      setTaskAssigneeInput('1')
    }
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = () => {
    if (!taskTitleInput.trim()) return

    if (editingTaskId) {
      // Edit
      const updated = tasks.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              title: taskTitleInput.trim(),
              description: taskDescInput.trim(),
              priority: taskPriorityInput,
              assigneeId: taskAssigneeInput,
            }
          : t
      )
      saveState(columns, updated)
    } else {
      // Add
      const newId = `task-${Date.now()}`
      const newTask: Task = {
        id: newId,
        columnId: taskColumnId,
        title: taskTitleInput.trim(),
        description: taskDescInput.trim(),
        priority: taskPriorityInput,
        assigneeId: taskAssigneeInput,
        createdAt: new Date().toISOString(),
      }
      saveState(columns, [...tasks, newTask])
    }
    setIsTaskModalOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId)
    saveState(columns, updated)
    setIsTaskModalOpen(false)
  }

  if (!isHydrated) {
    return (
      <div className='flex h-screen items-center justify-center bg-background text-foreground'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='flex h-[calc(100vh-56px)] flex-col w-full overflow-hidden bg-background text-foreground'>
      <AppHeader title='Kanban Template' />
      
      <Main fixed className='flex flex-col h-full p-4 md:p-6 overflow-hidden'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full overflow-hidden space-y-4">
          {/* Header Options */}
          <div className='flex items-center justify-between pb-2 shrink-0 border-b border-border gap-4'>
            <div className='overflow-x-auto pb-2 flex-1 no-scrollbar'>
              <TabsList className='h-auto gap-6 border-0 bg-transparent p-0 shadow-none'>
                <TabsTrigger
                  value='board'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Board
                </TabsTrigger>
                <TabsTrigger
                  value='list'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Kanban List
                </TabsTrigger>
                <TabsTrigger
                  value='analytics'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value='history'
                  className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
                >
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            {activeTab === 'board' && (
              <div className='shrink-0 pb-2'>
                <Button onClick={() => openColModal(null)} size='sm' className='h-9 gap-1.5 shadow-sm'>
                  <Plus className='h-4 w-4' />
                  Add Column
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="board" className="flex-1 overflow-hidden flex flex-col mt-0 focus-visible:outline-none gap-4">
            {/* Kanban Board Columns Scrollable Container */}
            <div className='flex-1 overflow-x-auto pb-6 flex gap-4 items-start select-none no-scrollbar'>
              {columns
                .sort((a, b) => a.order - b.order)
                .map((col) => {
                  const colTasks = tasks.filter((t) => t.columnId === col.id)
                  const isOver = dragOverColumnId === col.id

                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => handleDragOverColumn(e, col.id)}
                      onDrop={(e) => handleDropTask(e, col.id)}
                      onDragEnter={() => draggedTaskId && setDragOverColumnId(col.id)}
                      onDragLeave={() => draggedTaskId && dragOverColumnId === col.id && setDragOverColumnId(null)}
                      className={`w-72 sm:w-80 shrink-0 border rounded-xl flex flex-col max-h-[calc(100vh-175px)] transition-all duration-200 ${
                        isOver
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.01]'
                          : 'border-border/80 bg-muted/20 hover:border-border/100'
                      }`}
                    >
                      {/* Column Header */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStartColumn(e, col.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropColumn(e, col.id)}
                        className='flex items-center justify-between p-3 shrink-0 cursor-grab active:cursor-grabbing border-b border-border bg-muted/40 rounded-t-xl group'
                      >
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <GripVertical className='h-4 w-4 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity' />
                      <span className='font-bold text-sm sm:text-base truncate'>{col.title}</span>
                      <Badge variant='secondary' className='rounded-sm text-[10px] px-1.5 py-0.2'>
                        {colTasks.length}
                      </Badge>
                    </div>

                    {/* Column Options Trigger */}
                    <div className='relative'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDropdownColId(activeDropdownColId === col.id ? null : col.id)
                        }}
                      >
                        <MoreVertical className='h-4 w-4 text-muted-foreground' />
                      </Button>

                      {/* Dropdown Options */}
                      {activeDropdownColId === col.id && (
                        <div className='absolute right-0 mt-1 w-40 rounded-lg border border-border bg-background shadow-lg z-20 p-1'>
                          <button
                            onClick={() => openColModal(col.id)}
                            className='flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded transition-colors text-left'
                          >
                            <Edit2 className='h-3.5 w-3.5' />
                            Edit Column
                          </button>
                          <button
                            onClick={() => openTaskModal(col.id)}
                            className='flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted rounded transition-colors text-left'
                          >
                            <Plus className='h-3.5 w-3.5' />
                            Add Task
                          </button>
                          <div className='my-1 border-t border-border' />
                          <button
                            onClick={() => handleDeleteColumn(col.id)}
                            className='flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors text-left'
                          >
                            <Trash2 className='h-3.5 w-3.5' />
                            Delete Column
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tasks Container */}
                  <div className='flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]'>
                    {colTasks.length > 0 ? (
                      colTasks.map((task) => {
                        const assignee = MOCK_ASSIGNEES.find((a) => a.id === task.assigneeId)
                        const priorityColor =
                          task.priority === 'HIGH'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : task.priority === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStartTask(e, task.id)}
                            onClick={() => openTaskModal(col.id, task.id)}
                            className='group/card bg-card border border-border/80 hover:border-primary/50 hover:shadow-xs rounded-xl p-3 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all duration-200 relative shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                          >
                            {/* Card Content */}
                            <div className='flex flex-col gap-2'>
                              <div className='flex items-start justify-between gap-2'>
                                <span className='font-semibold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug group-hover/card:text-primary transition-colors'>
                                  {task.title}
                                </span>
                                <Badge className={`text-[9px] px-1.5 h-4.5 rounded-sm capitalize shrink-0 font-medium ${priorityColor}`}>
                                  {task.priority.toLowerCase()}
                                </Badge>
                              </div>

                              {task.description && (
                                <p className='text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
                                  {task.description}
                                </p>
                              )}

                              {/* Footer details */}
                              <div className='flex items-center justify-between pt-1 border-t border-border/40 shrink-0 text-muted-foreground text-[10px]'>
                                {assignee ? (
                                  <div className='flex items-center gap-1.5'>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${assignee.color}`}>
                                      {assignee.avatar}
                                    </div>
                                    <span className='font-medium truncate max-w-[80px]'>{assignee.name}</span>
                                  </div>
                                ) : (
                                  <div className='flex items-center gap-1'>
                                    <User className='w-3 h-3' />
                                    <span>Unassigned</span>
                                  </div>
                                )}
                                <div className='flex items-center gap-1'>
                                  <Calendar className='w-3 h-3 text-muted-foreground/60' />
                                  <span>{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className='h-full flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-border/60 rounded-xl m-1 opacity-60'>
                        <Plus className='h-6 w-6 text-muted-foreground/60 mb-1' />
                        <span className='text-[11px] text-muted-foreground font-medium'>Drag items here</span>
                      </div>
                    )}
                  </div>

                  {/* Add Task Button at bottom of column */}
                  <div className='p-2 shrink-0 bg-muted/10 rounded-b-xl border-t border-border/30'>
                    <Button
                      variant='ghost'
                      onClick={() => openTaskModal(col.id)}
                      className='w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 h-8 gap-1.5'
                    >
                      <Plus className='h-3.5 w-3.5' />
                      Add Task
                    </Button>
                  </div>
                </div>
              )
            })}
            </div>
          </TabsContent>

          <TabsContent value="list" className="flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px]">
            <ComingSoon />
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px]">
            <ComingSoon />
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px]">
            <ComingSoon />
          </TabsContent>
        </Tabs>
      </Main>

      {/* COLUMN MODAL */}
      {isColModalOpen && (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in'>
          <div className='bg-card border border-border w-full max-w-sm rounded-xl p-5 shadow-lg relative flex flex-col gap-4'>
            <button
              onClick={() => setIsColModalOpen(false)}
              className='absolute top-3 right-3 text-muted-foreground hover:text-foreground rounded'
            >
              <X className='h-4 w-4' />
            </button>
            <h3 className='text-base sm:text-lg font-bold tracking-tight'>
              {editingColId ? 'Edit Column Title' : 'Create New Column'}
            </h3>
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-muted-foreground'>Column Name</label>
              <input
                type='text'
                value={colTitleInput}
                onChange={(e) => setColTitleInput(e.target.value)}
                placeholder='e.g., Backlog'
                className='w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary'
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={() => setIsColModalOpen(false)} size='sm'>
                Cancel
              </Button>
              <Button onClick={handleSaveColumn} size='sm'>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TASK MODAL */}
      {isTaskModalOpen && (
        <div className='fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in'>
          <div className='bg-card border border-border w-full max-w-md rounded-xl p-5 shadow-lg relative flex flex-col gap-4'>
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className='absolute top-3 right-3 text-muted-foreground hover:text-foreground rounded'
            >
              <X className='h-4 w-4' />
            </button>
            <div className='flex items-center justify-between pr-4'>
              <h3 className='text-base sm:text-lg font-bold tracking-tight'>
                {editingTaskId ? 'Edit Task Details' : 'Create New Task'}
              </h3>
              {editingTaskId && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleDeleteTask(editingTaskId)}
                  className='h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                  title='Delete Task'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              )}
            </div>

            <div className='flex flex-col gap-3'>
              {/* Title */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold text-muted-foreground'>Task Title</label>
                <input
                  type='text'
                  value={taskTitleInput}
                  onChange={(e) => setTaskTitleInput(e.target.value)}
                  placeholder='What needs to be done?'
                  className='w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary'
                />
              </div>

              {/* Description */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold text-muted-foreground'>Description</label>
                <textarea
                  value={taskDescInput}
                  onChange={(e) => setTaskDescInput(e.target.value)}
                  placeholder='Add details for this task...'
                  rows={3}
                  className='w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary resize-none'
                />
              </div>

              {/* Priority and Assignee Grid */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>Priority</label>
                  <select
                    value={taskPriorityInput}
                    onChange={(e) => setTaskPriorityInput(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                    className='w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary'
                  >
                    <option value='LOW'>Low</option>
                    <option value='MEDIUM'>Medium</option>
                    <option value='HIGH'>High</option>
                  </select>
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>Assignee</label>
                  <select
                    value={taskAssigneeInput}
                    onChange={(e) => setTaskAssigneeInput(e.target.value)}
                    className='w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary'
                  >
                    {MOCK_ASSIGNEES.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={() => setIsTaskModalOpen(false)} size='sm'>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} size='sm'>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}