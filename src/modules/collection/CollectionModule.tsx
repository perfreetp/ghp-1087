import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { CUSTOMERS, getCustomerById } from '@/data/customers'
import { RECIPES, getRecipeById } from '@/data/recipes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BookOpen, Trophy, BarChart3, Users, BookMarked } from 'lucide-react'
import { clsx } from 'clsx'

type TabId = 'stories' | 'stats' | 'achievements' | 'recipes'

export const CollectionModule = () => {
  const unlockedStories = useGameStore((s) => s.unlockedCustomerStoryIds)
  const achievements = useGameStore((s) => s.achievements)
  const statistics = useGameStore((s) => s.statistics)
  const unlockedRecipeIds = useGameStore((s) => s.unlockedRecipeIds)
  const reputation = useGameStore((s) => s.reputation)
  const day = useGameStore((s) => s.day)
  const employees = useGameStore((s) => s.employees)
  const ownedDecorIds = useGameStore((s) => s.ownedDecorIds)

  const [activeTab, setActiveTab] = useState<TabId>('stories')
  const [selectedStory, setSelectedStory] = useState<string | null>(null)

  const TABS: { id: TabId; name: string; icon: typeof BookOpen }[] = [
    { id: 'stories', name: '顾客故事', icon: Users },
    { id: 'stats', name: '营业统计', icon: BarChart3 },
    { id: 'achievements', name: '成就墙', icon: Trophy },
    { id: 'recipes', name: '菜单图鉴', icon: BookMarked },
  ]

  const achieveCats = ['economy', 'customer', 'cooking', 'collection', 'special']
  const achieveCatNames: Record<string, string> = {
    economy: '💰 经济成就',
    customer: '🐱 顾客成就',
    cooking: '🍳 烹饪成就',
    collection: '📚 收集成就',
    special: '⭐ 特殊成就',
  }

  const recipeCats: Record<string, { name: string; emoji: string }> = {
    donut: { name: '甜甜圈', emoji: '🍩' },
    tea: { name: '奶茶', emoji: '🧋' },
    pudding: { name: '布丁', emoji: '🍮' },
  }

  const unlockedCount = unlockedStories.length
  const totalCats = CUSTOMERS.length
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length

  const selectedCustomer = selectedStory ? getCustomerById(selectedStory) : null

  return (
    <div className="h-full w-full">
      <Card variant="default" padding="none" className="h-full overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 border-b-2 border-amber-200 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="font-extrabold text-amber-800 text-lg flex items-center gap-2">
            <BookOpen size={22} className="text-amber-700" />
            图鉴 & 成就
            <div className="flex gap-2 ml-2">
              <span className="text-xs font-bold bg-pink-200 text-pink-700 px-2 py-0.5 rounded-full">
                🐱 {unlockedCount}/{totalCats} 故事
              </span>
              <span className="text-xs font-bold bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                🏆 {unlockedAchievements}/{achievements.length} 成就
              </span>
              <span className="text-xs font-bold bg-green-200 text-green-700 px-2 py-0.5 rounded-full">
                📖 {unlockedRecipeIds.length}/{RECIPES.length} 菜谱
              </span>
            </div>
          </div>
          <div className="flex-1" />
        </div>

        <div className="bg-gradient-to-b from-amber-50 to-white px-5 py-3 border-b border-amber-100 flex gap-2 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={clsx(
                  'px-4 py-2 rounded-xl font-extrabold text-sm transition-all border-2 flex items-center gap-2 shrink-0',
                  activeTab === t.id
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white border-orange-600 shadow-lg scale-105'
                    : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                )}
              >
                <Icon size={16} />
                {t.name}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'stories' && (
              <motion.div
                key="stories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border-2 border-pink-200">
                  <div className="font-extrabold text-pink-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">💌</span>顾客故事集
                    <ProgressBar value={unlockedCount} max={totalCats} size="sm" color="pink" className="flex-1 ml-4" />
                  </div>
                  <div className="text-xs text-pink-700 font-bold">
                    接待顾客并让他们满意离开，就有机会解锁属于他们的独特故事哦～
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {CUSTOMERS.map((c, i) => {
                    const unlocked = unlockedStories.includes(c.id)
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => unlocked && setSelectedStory(c.id)}
                        whileHover={unlocked ? { scale: 1.05, y: -4 } : {}}
                        className={clsx(
                          'rounded-2xl p-4 border-2 text-center cursor-pointer transition-all shadow-md',
                          unlocked
                            ? 'bg-gradient-to-b from-white to-pink-50 border-pink-300 hover:shadow-xl'
                            : 'bg-gradient-to-b from-stone-100 to-stone-200 border-stone-300'
                        )}
                      >
                        <div className={clsx('text-5xl mb-2', !unlocked && 'grayscale blur-sm')}>
                          {unlocked ? c.emoji : '❓'}
                        </div>
                        <div className={clsx('font-extrabold text-sm', !unlocked && 'text-stone-400')}>
                          {unlocked ? c.name : '???'}
                        </div>
                        <div className="text-[10px] mt-1 font-bold" style={{ color: unlocked ? c.color : '#999' }}>
                          {unlocked ? c.personality : '性格未知'}
                        </div>
                        {unlocked && (
                          <div className="mt-2 text-[10px] font-bold bg-pink-200 text-pink-700 inline-block px-2 py-0.5 rounded-full">
                            📖 查看故事
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                <AnimatePresence>
                  {selectedCustomer && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                      onClick={() => setSelectedStory(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                        className="bg-gradient-to-br from-amber-50 via-white to-pink-50 rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-white relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedStory(null)}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-extrabold text-stone-600 transition-all"
                        >
                          ✕
                        </button>
                        <div className="text-center">
                          <motion.div
                            animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-8xl mb-3"
                            style={{ filter: `drop-shadow(0 0 20px ${selectedCustomer.color}80)` }}
                          >
                            {selectedCustomer.emoji}
                          </motion.div>
                          <div className="font-extrabold text-3xl text-stone-800 mb-1">{selectedCustomer.name}</div>
                          <div className="flex gap-2 justify-center mb-4 flex-wrap">
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                              {selectedCustomer.personality}
                            </span>
                            <span className="text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                              💫 小费 x{selectedCustomer.tipMultiplier}
                            </span>
                            <span className="text-xs font-bold bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
                              ⏱ 耐心 x{selectedCustomer.patienceMultiplier}
                            </span>
                          </div>
                          <div className="bg-white/80 rounded-2xl p-4 mb-3 text-left border-2 border-pink-200">
                            <div className="text-xs font-extrabold text-pink-700 mb-1 flex items-center gap-1">
                              📖 故事档案
                            </div>
                            <div className="text-sm text-stone-700 leading-relaxed">
                              {selectedCustomer.story}
                            </div>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-3 text-left border-2 border-amber-200">
                            <div className="text-xs font-extrabold text-amber-700 mb-1">❤️ 最爱菜单</div>
                            <div className="flex gap-2 flex-wrap">
                              {selectedCustomer.favoriteRecipes.map((rid) => {
                                const r = getRecipeById(rid)
                                return r ? (
                                  <span key={rid} className="text-sm bg-white px-2 py-1 rounded-lg border border-amber-300">
                                    {r.emoji} {r.name}
                                  </span>
                                ) : null
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '营业天数', value: day, emoji: '📅', color: 'from-sky-100 to-blue-100 border-blue-300 text-blue-800' },
                    { label: '当前声誉', value: reputation, emoji: '⭐', color: 'from-pink-100 to-rose-100 border-pink-300 text-pink-800' },
                    { label: '员工人数', value: employees.length, emoji: '🐾', color: 'from-green-100 to-emerald-100 border-green-300 text-green-800' },
                    { label: '装饰拥有', value: ownedDecorIds.length, emoji: '🎨', color: 'from-purple-100 to-fuchsia-100 border-purple-300 text-purple-800' },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-2xl p-4 border-2 bg-gradient-to-br ${s.color}`}
                    >
                      <div className="text-3xl mb-1">{s.emoji}</div>
                      <div className="text-xs font-bold opacity-75">{s.label}</div>
                      <div className="font-extrabold text-2xl tabular-nums">{s.value}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="wood">
                    <div className="font-extrabold text-amber-900 mb-4 flex items-center gap-2 text-lg">
                      <BarChart3 size={20} /> 累计经营数据
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: '总金币收入', value: statistics.totalCoinsEarned, emoji: '💰' },
                        { label: '收到的小费', value: statistics.totalTipsReceived, emoji: '💝' },
                        { label: '服务顾客总数', value: statistics.totalCustomersServed, emoji: '🐱' },
                        { label: '完成订单数', value: statistics.totalOrdersCompleted, emoji: '📦' },
                        { label: '制作点心总数', value: statistics.totalRecipesCooked, emoji: '🍳' },
                        { label: '完美天数', value: statistics.perfectDayCount, emoji: '☀️' },
                        { label: '游戏时长', value: `${Math.floor(statistics.playTimeSeconds / 60)} 分钟`, emoji: '⏱️' },
                      ].map((row, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2.5 border-2 border-amber-200"
                        >
                          <div className="font-bold text-stone-700 flex items-center gap-2 text-sm">
                            <span className="text-xl">{row.emoji}</span>
                            {row.label}
                          </div>
                          <div className="font-extrabold text-amber-800 tabular-nums">{row.value.toLocaleString()}</div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>

                  <Card variant="paper">
                    <div className="font-extrabold text-stone-800 mb-4 flex items-center gap-2 text-lg">
                      <Trophy size={20} className="text-amber-600" /> 成长进度
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: '顾客图鉴收集', cur: unlockedStories.length, max: CUSTOMERS.length, color: 'pink' },
                        { label: '菜谱解锁进度', cur: unlockedRecipeIds.length, max: RECIPES.length, color: 'green' },
                        { label: '成就贴纸收集', cur: unlockedAchievements, max: achievements.length, color: 'blue' },
                        { label: '总金币里程碑', cur: statistics.totalCoinsEarned, max: 10000, color: 'yellow' },
                        { label: '服务顾客目标', cur: statistics.totalCustomersServed, max: 100, color: 'red' },
                      ].map((g, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs font-bold text-stone-600 mb-1">
                            <span>{g.label}</span>
                            <span>{Math.min(g.cur, g.max).toLocaleString()}/{g.max.toLocaleString()}</span>
                          </div>
                          <ProgressBar
                            value={g.cur}
                            max={g.max}
                            size="md"
                            color={g.color as any}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <div className="space-y-6">
                  {achieveCats.map((catId, ci) => {
                    const list = achievements.filter((a) => a.category === catId)
                    return (
                      <div key={catId}>
                        <div className="font-extrabold text-xl text-stone-800 mb-3 flex items-center gap-2">
                          <motion.div
                            initial={{ rotate: -10 }}
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, delay: ci * 0.5 }}
                          >
                            ✨
                          </motion.div>
                          {achieveCatNames[catId]}
                          <span className="text-xs font-bold text-stone-400 ml-2">
                            {list.filter(a => a.unlocked).length}/{list.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {list.map((a, i) => (
                            <motion.div
                              key={a.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: ci * 0.1 + i * 0.05 }}
                              className={clsx(
                                'rounded-2xl p-4 border-3 shadow-lg relative overflow-hidden',
                                a.unlocked
                                  ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-pink-50 border-amber-400 border-4'
                                  : 'bg-gradient-to-br from-stone-100 to-stone-200 border-stone-300 border-2 opacity-70'
                              )}
                            >
                              {a.unlocked && (
                                <div className="absolute -top-3 -right-3 text-4xl opacity-30 rotate-12">🌟</div>
                              )}
                              <div className="flex gap-3 relative">
                                <motion.div
                                  animate={a.unlocked ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                                  transition={{ repeat: Infinity, duration: 3 }}
                                  className={clsx(
                                    'text-5xl shrink-0 w-16 h-16 rounded-xl flex items-center justify-center',
                                    a.unlocked ? 'bg-gradient-to-br from-amber-200 to-yellow-300 shadow-inner' : 'bg-stone-300 grayscale'
                                  )}
                                >
                                  {a.unlocked ? a.emoji : '🔒'}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className={clsx('font-extrabold text-base', a.unlocked ? 'text-amber-900' : 'text-stone-500')}>
                                    {a.title}
                                  </div>
                                  <div className={clsx('text-xs mt-0.5', a.unlocked ? 'text-stone-600' : 'text-stone-400')}>
                                    {a.description}
                                  </div>
                                  {a.unlocked && a.unlockedAt && (
                                    <div className="text-[10px] font-bold text-green-700 mt-1 bg-green-100 inline-block px-2 py-0.5 rounded-full">
                                      ✅ {new Date(a.unlockedAt).toLocaleDateString()} 解锁
                                    </div>
                                  )}
                                  {!a.unlocked && (
                                    <div className="text-[10px] font-bold text-stone-500 mt-1 bg-stone-200 inline-block px-2 py-0.5 rounded-full">
                                      目标：{a.condition.target}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'recipes' && (
              <motion.div
                key="recipes"
                initial={{ opacity: 0, rotate: -2 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 2 }}
              >
                <div className="space-y-5">
                  {Object.entries(recipeCats).map(([catId, info], ci) => {
                    const list = RECIPES.filter(r => r.category === catId)
                    return (
                      <div key={catId}>
                        <div className="font-extrabold text-xl text-stone-800 mb-3 flex items-center gap-2">
                          <span className="text-3xl">{info.emoji}</span>
                          {info.name}系列
                          <span className="text-xs font-bold text-stone-400 ml-2">
                            {list.filter(r => unlockedRecipeIds.includes(r.id)).length}/{list.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {list.map((recipe, i) => {
                            const unlocked = unlockedRecipeIds.includes(recipe.id)
                            return (
                              <motion.div
                                key={recipe.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: ci * 0.1 + i * 0.05 }}
                                whileHover={unlocked ? { y: -3, scale: 1.02 } : {}}
                                className={clsx(
                                  'rounded-2xl p-4 border-2 shadow-md',
                                  unlocked
                                    ? 'bg-gradient-to-br from-white to-amber-50 border-amber-300'
                                    : 'bg-gradient-to-br from-stone-100 to-stone-200 border-stone-300'
                                )}
                              >
                                <div className="flex gap-3 items-center">
                                  <div className={clsx('text-5xl shrink-0', !unlocked && 'grayscale opacity-60')}>
                                    {unlocked ? recipe.emoji : '🔒'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={clsx('font-extrabold text-base', !unlocked && 'text-stone-500')}>
                                      {unlocked ? recipe.name : '???'}
                                    </div>
                                    <div className="text-[11px] text-stone-500 mt-0.5">
                                      {unlocked ? recipe.description : '需要先解锁才能查看'}
                                    </div>
                                    {unlocked && (
                                      <div className="flex gap-2 mt-2 text-[10px]">
                                        <span className="bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
                                          💰 售价 {recipe.basePrice}
                                        </span>
                                        <span className="bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full">
                                          ⏱ {(recipe.cookTime / 1000).toFixed(0)}秒
                                        </span>
                                        <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                                          🔓 Lv.{recipe.requiredLevel}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const toUnlock = list.find(r => !unlockedRecipeIds.includes(r.id))
                              if (toUnlock) useGameStore.getState().unlockRecipe(toUnlock.id)
                            }}
                          >
                            🔓 解锁下一款（自动扣除金币）
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}
