import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'yellow' | 'red' | 'pink' | 'blue' | 'auto'
  showLabel?: boolean
  label?: string
  striped?: boolean
  animated?: boolean
  className?: string
}

export const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  color = 'auto',
  showLabel = false,
  label,
  striped = false,
  animated = true,
  className,
}: ProgressBarProps) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  let finalColor = color
  if (color === 'auto') {
    if (pct > 60) finalColor = 'green'
    else if (pct > 30) finalColor = 'yellow'
    else finalColor = 'red'
  }
  const colors: Record<string, string> = {
    green: 'from-green-400 to-green-500',
    yellow: 'from-amber-300 to-amber-500',
    red: 'from-red-400 to-red-600',
    pink: 'from-pink-300 to-pink-500',
    blue: 'from-sky-300 to-sky-500',
  }
  const sizes = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  }
  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-bold text-stone-600">
          <span>{label}</span>
          <span>{Math.floor(pct)}%</span>
        </div>
      )}
      <div className={clsx(
        'w-full bg-stone-200 rounded-full overflow-hidden shadow-inner',
        sizes[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: animated ? 0.4 : 0, ease: 'easeOut' }}
          className={clsx(
            'h-full bg-gradient-to-r rounded-full relative',
            colors[finalColor],
            striped && 'bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.2)_8px,rgba(255,255,255,0.2)_16px)]',
            pct < 30 && 'animate-pulse'
          )}
        />
      </div>
    </div>
  )
}
