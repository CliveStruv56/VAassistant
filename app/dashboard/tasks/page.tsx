'use client'

import * as React from 'react'
import { TaskList } from '../components/TaskList'
import { NewTaskForm } from '@/components/tasks/NewTaskForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function TasksPage() {
  const [showNewTaskForm, setShowNewTaskForm] = React.useState(false)

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-gray-500">Manage all your client tasks</p>
          </div>
          <Button 
            onClick={() => setShowNewTaskForm(true)}
            className="bg-orange hover:bg-orange-dark text-white font-medium px-6 py-2 
                       shadow-sm transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">+</span>
            <span>Add New Task</span>
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white shadow rounded-lg p-6">
        <TaskList />
      </div>

      {/* New Task Modal */}
      <Dialog open={showNewTaskForm} onOpenChange={setShowNewTaskForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Fill in the task details below. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <NewTaskForm 
            onSuccess={() => {
              setShowNewTaskForm(false)
              window.location.reload()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 