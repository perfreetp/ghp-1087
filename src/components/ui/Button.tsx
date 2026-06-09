import { motion, useReducedMotion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd' | 'animate' | 'initial'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
  fullWidth?: boolean
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const reduce = useReducedMotion()
  const base = 'inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 rounded-2xl border-b-4 active:border-b-2 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap'
  const variants = {
    primary: 'bg-pink-300 hover:bg-pink-400 border-pink-500 text-pink-900 shadow-lg shadow-pink-200/50',
    secondary: 'bg-amber-200 hover:bg-amber-300 border-amber-400 text-amber-900 shadow-lg shadow-amber-100/50',
    ghost: 'bg-white/60 hover:bg-white/90 border-stone-300 text-stone-700 shadow',
    danger: 'bg-red-300 hover:bg-red-400 border-red-500 text-red-900 shadow-lg shadow-red-200/50',
    success: 'bg-green-300 hover:bg-green-400 border-green-500 text-green-900 shadow-lg shadow-green-200/50',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
    xl: 'px-9 py-4 text-xl',
  }
  return (
    <motion.button
      whileHover={reduce || disabled ? {} : { scale: 1.03 }}
      whileTap={reduce || disabled ? {} : { scale: 0.97 }}
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  )
}
