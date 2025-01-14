'use client'

import { useState, useEffect } from 'react'
import { TimerDisplay } from './TimerDisplay'
import { TimerControls } from './TimerControls'

interface TimerProps {
  onComplete: (seconds: number) => void
  onPause: (seconds: number) => void
  isDisabled: boolean
  onStart?: () => void
}

export function Timer({ onComplete, onPause, isDisabled }: TimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [lastTimeChunk, setLastTimeChunk] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, isPaused])

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
    if (lastTimeChunk > 0) {
      setSeconds(lastTimeChunk)
      setLastTimeChunk(0)
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    onPause(seconds)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleStop = () => {
    onComplete(seconds)
    setIsRunning(false)
    setIsPaused(false)
    setLastTimeChunk(0)
    setSeconds(0)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setSeconds(0)
    setLastTimeChunk(0)
  }

  const displayTime = isRunning ? seconds : (lastTimeChunk || seconds)

  return (
    <div className="space-y-4">
      <TimerDisplay seconds={displayTime} />
      {lastTimeChunk > 0 && !isRunning && (
        <div className="text-center text-sm text-gray-600">
          Last time chunk: {Math.floor(lastTimeChunk / 60)}m {lastTimeChunk % 60}s
        </div>
      )}
      <TimerControls
        isRunning={isRunning}
        isPaused={isPaused}
        isDisabled={isDisabled}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onReset={handleReset}
      />
    </div>
  )
} 