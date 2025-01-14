'use client'

interface TimerControlsProps {
  isRunning: boolean
  isPaused: boolean
  isDisabled: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onReset: () => void
}

export function TimerControls({
  isRunning,
  isPaused,
  isDisabled,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset
}: TimerControlsProps) {
  return (
    <div className="flex justify-center space-x-4">
      {!isRunning ? (
        <button
          onClick={onStart}
          disabled={isDisabled}
          className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start
        </button>
      ) : (
        <>
          {!isPaused ? (
            <button
              onClick={onPause}
              className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Resume
            </button>
          )}
          <button
            onClick={onStop}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
          >
            Stop
          </button>
        </>
      )}
      <button
        onClick={onReset}
        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
  )
} 