import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavBar } from '@/components/layout/NavBar'
import { StatusBar } from '@/components/layout/StatusBar'
import { Toast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useGameStore } from '@/store/useGameStore'
import { useGameLoop } from '@/hooks/useGameLoop'
import { ShopModule } from '@/modules/shop/ShopModule'
import { KitchenModule } from '@/modules/kitchen/KitchenModule'
import { OrdersModule } from '@/modules/orders/OrdersModule'
import { DormitoryModule } from '@/modules/dormitory/DormitoryModule'
import { DecorModule } from '@/modules/decor/DecorModule'
import { CollectionModule } from '@/modules/collection/CollectionModule'
import { SettingsModule } from '@/modules/settings/SettingsModule'
import { Save, Play, Sparkles } from 'lucide-react'

const MODULE_COMPONENTS: Record<string, () => JSX.Element> = {
  SHOP: ShopModule,
  KITCHEN: KitchenModule,
  ORDERS: OrdersModule,
  DORMITORY: DormitoryModule,
  DECOR: DecorModule,
  COLLECTION: CollectionModule,
  SETTINGS: SettingsModule,
}

const NewGameScreen = () => {
  const init = useGameStore((s) => s.init)
  const slots = useGameStore((s) => s.slots)
  const loadSlot = useGameStore((s) => s.loadSlot)
  const createSlot = useGameStore((s) => s.createSlot)
  const [name, setName] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [init])

  const startGame = (slotId?: string) => {
    if (slotId) {
      loadSlot(slotId)
    } else if (name.trim()) {
      createSlot(name.trim())
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-100 via-pink-50 to-orange-100 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['🌸', '🍩', '🧋', '🍮', '🐱', '⭐', '✨', '☁️'].map((e, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl md:text-6xl opacity-25"
            initial={{ y: '-10vh', x: `${(i * 13) % 100}%` }}
            animate={{ y: '110vh', rotate: [0, 180, 360] }}
            transition={{ duration: 25 + i * 5, repeat: Infinity, delay: i * 3, ease: 'linear' }}
          >
            {e}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="relative z-10 max-w-3xl w-full"
      >
        <Card variant="default" padding="none" className="overflow-hidden shadow-2xl border-4 border-white">
          <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-rose-400 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] bg-[length:18px_18px]" />
            <motion.div
              animate={{ rotate: [0, 8, -8, 0], y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-7xl md:text-8xl mb-4 relative z-10 inline-block drop-shadow-xl"
            >
              🍰🐱🍩
            </motion.div>
            <h1 className="font-extrabold text-4xl md:text-5xl text-white drop-shadow-lg mb-2 tracking-wider">
              猫咪点心店
            </h1>
            <p className="text-white/90 font-bold text-sm md:text-base relative z-10">
              Cat&apos;s Sweet Shop · 治愈系经营模拟游戏
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-white to-amber-50">
            {slots.length > 0 && (
              <div>
                <h2 className="font-extrabold text-lg text-stone-700 mb-3 flex items-center gap-2">
                  <Save size={20} className="text-amber-600" />
                  选择存档继续游戏
                </h2>
                <div className="space-y-2">
                  {slots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedSlot(slot.id)
                        startGame(slot.id)
                      }}
                      className={
                        'w-full flex items-center gap-4 p-4 rounded-2xl border-3 transition-all text-left ' +
                        (selectedSlot === slot.id
                          ? 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-400 shadow-lg'
                          : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-md')
                      }
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-3xl shadow-inner">
                        📖
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-lg text-stone-800 flex items-center gap-2">
                          {slot.name}
                          <span className="text-xs font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                            第 {slot.day} 天
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5">
                          最近保存：{new Date(slot.savedAt).toLocaleString()} · 游戏时长 {Math.floor(slot.totalPlayTime / 60)} 分钟
                        </div>
                      </div>
                      <div className="text-2xl text-green-500">▶</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-stone-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-b from-white to-amber-50 px-4 text-sm font-bold text-stone-400">
                  {slots.length > 0 ? '或开启新冒险' : '开始你的经营之旅'}
                </span>
              </div>
            </div>

            {slots.length < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-pink-50 to-amber-50 rounded-2xl p-5 border-2 border-pink-200"
              >
                <h2 className="font-extrabold text-lg text-pink-800 mb-3 flex items-center gap-2">
                  <Sparkles size={20} />
                  开设新店铺
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1.5">
                      ✨ 店铺/存档名称
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="例如：喵喵甜品屋"
                      maxLength={20}
                      className="w-full px-4 py-3 rounded-xl border-3 border-stone-200 focus:border-pink-400 outline-none font-extrabold text-stone-800 bg-white transition-all text-lg"
                      onKeyDown={(e) => e.key === 'Enter' && startGame()}
                    />
                  </div>
                  <Button
                    size="xl"
                    variant="primary"
                    icon={<Play size={20} />}
                    fullWidth
                    onClick={() => startGame()}
                    disabled={!name.trim()}
                  >
                    🚀 开始新游戏
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { e: '🍩', t: '制作点心', d: '甜甜圈/奶茶/布丁' },
                { e: '🐱', t: '接待猫客', d: '收集有趣故事' },
                { e: '🎨', t: '装饰店铺', d: '打造梦想小店' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-white/70 rounded-xl p-3 border border-stone-200"
                >
                  <div className="text-3xl mb-1">{f.e}</div>
                  <div className="font-extrabold text-xs text-stone-700">{f.t}</div>
                  <div className="text-[10px] text-stone-500 font-bold">{f.d}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6 text-center text-[11px] text-stone-400 font-bold bg-gradient-to-b from-amber-50 to-white">
            💝 用爱和耐心经营你的猫咪点心店吧！
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

const GameScreen = () => {
  useGameLoop()
  const activeModule = useGameStore((s) => s.activeModule)
  const currentSlotId = useGameStore((s) => s.currentSlotId)
  const ModuleComponent = MODULE_COMPONENTS[activeModule] || ShopModule
  const isPaused = useGameStore((s) => s.isPaused)
  const setPaused = useGameStore((s) => s.setPaused)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-100 via-amber-50 to-pink-50 flex flex-col overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-sky-200 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <NavBar />
        <StatusBar />

        <main className="flex-1 p-3 md:p-4 overflow-hidden">
          <div className="max-w-[1280px] mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                className="h-full"
              >
                {currentSlotId ? (
                  <ModuleComponent />
                ) : (
                  <Card variant="default" className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎮</div>
                      <div className="font-extrabold text-xl text-stone-700">请先选择存档</div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.7, rotate: 5 }}
              className="bg-gradient-to-br from-amber-50 to-pink-50 rounded-3xl p-8 shadow-2xl border-4 border-white text-center max-w-md"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-8xl mb-4"
              >
                ⏸️
              </motion.div>
              <h2 className="font-extrabold text-3xl text-stone-800 mb-2">游戏暂停</h2>
              <p className="text-stone-500 mb-6 font-bold">休息一下，喝口水吧～</p>
              <Button
                size="xl"
                variant="success"
                icon={<Play size={22} />}
                fullWidth
                onClick={() => setPaused(false)}
              >
                继续游戏
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast />
    </div>
  )
}

const App = () => {
  const currentSlotId = useGameStore((s) => s.currentSlotId)
  const slots = useGameStore((s) => s.slots)
  const init = useGameStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  if (!currentSlotId && slots.length === 0) {
    return <NewGameScreen />
  }

  if (!currentSlotId) {
    return <NewGameScreen />
  }

  return <GameScreen />
}

export default App
