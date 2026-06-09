import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { useEffect } from 'react'

export const Toast = () => {
  const toast = useGameStore((s) => s.toast)
  const hideToast = useGameStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => hideToast(), toast.duration + 200)
    return () => clearTimeout(t)
  }, [toast, hideToast])

  const colors: Record<string, string> = {
    success: 'from-green-400 to-emerald-500',
    warning: 'from-amber-400 to-orange-500',
    error: 'from-red-400 to-rose-600',
    info: 'from-sky-400 to-blue-500',
    achievement: 'from-purple-400 via-pink-400 to-amber-400',
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 500, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed top-6 right-6 z-50 max-w-sm rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-gradient-to-r ${colors[toast.type]}`}
        >
          <div className="p-4 flex items-start gap-3 text-white">
            {toast.emoji && (
              <motion.span
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="text-3xl shrink-0"
              >
                {toast.emoji}
              </motion.span>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-base drop-shadow-sm">{toast.title}</div>
              {toast.message && (
                <div className="text-sm mt-0.5 opacity-95">{toast.message}</div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
