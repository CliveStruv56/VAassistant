'use client'

interface TimerDisplayProps {
  seconds: number
}

export function TimerDisplay({ seconds }: TimerDisplayProps) {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    return [hours, minutes, secs]
      .map(v => v.toString().padStart(2, '0'))
      .join(':')
  }

  return (
    <div className="text-4xl font-mono font-bold text-center py-4">
      {formatTime(seconds)}
    </div>
  )
} 