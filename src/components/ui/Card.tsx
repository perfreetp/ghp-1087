import { motion } from 'framer-motion'
import type { ReactNode, HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd' | 'animate' | 'initial'> {
  children: ReactNode
  variant?: 'default' | 'paper' | 'wood' | 'glass'
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export const Card = ({
  children,
  variant = 'default',
  hover,
  padding = 'md',
  className,
  ...props
}: CardProps) => {
  const variants = {
    default: 'bg-white border-stone-200 rounded-2xl shadow-lg',
    paper: 'bg-amber-50 border-amber-200 rounded-xl shadow-md',
    wood: 'bg-amber-100 border-amber-300 rounded-2xl shadow-lg',
    glass: 'bg-white/70 backdrop-blur-md border-white/50 rounded-2xl shadow-xl',
  }
  const paddings = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
    none: '',
  }
  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={clsx('border-2', variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
