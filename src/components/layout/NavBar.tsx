import { motion, useReducedMotion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import type { ModuleId } from '@/types'
import { clsx } from 'clsx'
import {
  Store,
  ChefHat,
  ClipboardList,
  BedDouble,
  Palette,
  BookOpen,
  Settings,
} from 'lucide-react'

const MODULES: { id: ModuleId; name: string; icon: typeof Store }[] = [
  { id: 'SHOP', name: '店铺', icon: Store },
  { id: 'KITCHEN', name: '厨房', icon: ChefHat },
  { id: 'ORDERS', name: '订单', icon: ClipboardList },
  { id: 'DORMITORY', name: '宿舍', icon: BedDouble },
  { id: 'DECOR', name: '装饰', icon: Palette },
  { id: 'COLLECTION', name: '图鉴', icon: BookOpen },
  { id: 'SETTINGS', name: '设置', icon: Settings },
]

export const NavBar = () => {
  const active = useGameStore((s) => s.activeModule)
  const setActive = useGameStore((s) => s.setActiveModule)
  const reduce = useReducedMotion()

  return (
    <nav className="w-full bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 border-b-4 border-amber-300 shadow-lg">
      <div className="max-w-[1280px] mx-auto px-4 py-3">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 pr-4 md:pr-6 border-r-2 border-amber-300 shrink-0">
            <motion.span
              animate={reduce ? {} : { rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.8 }}
              className="text-4xl"
            >
              🍰
            </motion.span>
            <div className="shrink-0">
              <div className="font-extrabold text-lg md:text-xl text-amber-800 drop-shadow-sm leading-tight">
                猫咪点心店
              </div>
              <div className="text-[10px] md:text-xs text-amber-600 font-bold">
                Cat's Sweet Shop
              </div>
            </div>
          </div>
          <div className="flex gap-1 md:gap-2">
            {MODULES.map((m) => {
              const Icon = m.icon
              const isActive = active === m.id
              return (
                <motion.button
                  key={m.id}
                  onClick={() => setActive(m.id)}
                  whileHover={reduce ? {} : { y: -2 }}
                  whileTap={reduce ? {} : { scale: 0.95 }}
                  className={clsx(
                    'flex flex-col items-center justify-center px-3 md:px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all relative whitespace-nowrap',
                    isActive
                      ? 'bg-white text-amber-700 shadow-lg shadow-amber-200/50 border-2 border-amber-300'
                      : 'text-amber-700/80 hover:bg-white/60 border-2 border-transparent'
                  )}
                >
                  <Icon size={20} className={clsx('mb-0.5', isActive && 'animate-pulse')} strokeWidth={2.5} />
                  {m.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full shadow"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
