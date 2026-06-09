import { motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { Coins, Star, Calendar, Clock, Save, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const StatusBar = () => {
  const coins = useGameStore((s) => s.coins)
  const reputation = useGameStore((s) => s.reputation)
  const day = useGameStore((s) => s.day)
  const timeOfDay = useGameStore((s) => s.timeOfDay)
  const paused = useGameStore((s) => s.isPaused)
  const setPaused = useGameStore((s) => s.setPaused)
  const saveSlot = useGameStore((s) => s.saveSlot)
  const deliveryOrder = useGameStore((s) => s.deliveryOrder)

  const hour = Math.floor(timeOfDay / 60)
  const min = Math.floor(timeOfDay % 60)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const isDay = hour >= 6 && hour < 18

  return (
    <div className="w-full bg-gradient-to-r from-stone-100 via-white to-stone-100 border-b-2 border-stone-200 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 py-2 flex flex-wrap items-center gap-3 md:gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-1.5 rounded-xl border-2 border-amber-300 shadow"
        >
          <div className="relative">
            <Coins size={20} className="text-amber-600 fill-amber-300" />
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 5 }}
              className="absolute -top-1 -right-1 text-xs"
            >
              ✨
            </motion.span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-600 leading-none">金币</div>
            <div className="font-extrabold text-lg text-amber-800 leading-tight tabular-nums">{coins.toLocaleString()}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 px-4 py-1.5 rounded-xl border-2 border-pink-300 shadow"
        >
          <Star size={20} className="text-pink-600 fill-pink-300" />
          <div>
            <div className="text-[10px] font-bold text-pink-600 leading-none">声誉</div>
            <div className="font-extrabold text-lg text-pink-800 leading-tight tabular-nums">{reputation}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-100 to-blue-100 px-4 py-1.5 rounded-xl border-2 border-sky-300 shadow"
        >
          <Calendar size={20} className="text-sky-600" />
          <div>
            <div className="text-[10px] font-bold text-sky-600 leading-none">营业日</div>
            <div className="font-extrabold text-lg text-sky-800 leading-tight">第 {day} 天</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-violet-100 px-4 py-1.5 rounded-xl border-2 border-purple-300 shadow"
        >
          <Clock size={20} className="text-purple-600" />
          <div>
            <div className="text-[10px] font-bold text-purple-600 leading-none">
              {isDay ? '☀️ 白天' : '🌙 夜晚'}
            </div>
            <div className="font-extrabold text-lg text-purple-800 leading-tight tabular-nums">
              {pad(hour)}:{pad(min)}
            </div>
          </div>
        </motion.div>

        {deliveryOrder && (
          <motion.div
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-orange-100 px-4 py-1.5 rounded-xl border-2 border-red-400 shadow-lg animate-pulse"
          >
            <span className="text-2xl">🛵</span>
            <div>
              <div className="text-[10px] font-bold text-red-600 leading-none">外卖大单</div>
              <div className="font-extrabold text-sm text-red-700 leading-tight">限时完成！</div>
            </div>
          </motion.div>
        )}

        <div className="flex-1" />

        <Button
          variant={paused ? 'success' : 'secondary'}
          size="sm"
          icon={paused ? <Play size={16} /> : <Pause size={16} />}
          onClick={() => setPaused(!paused)}
        >
          {paused ? '继续' : '暂停'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={<Save size={16} />}
          onClick={() => saveSlot()}
        >
          存档
        </Button>
      </div>
    </div>
  )
}
