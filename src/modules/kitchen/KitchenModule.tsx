import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { INGREDIENTS, getIngredientById } from '@/data/ingredients'
import { RECIPES, getRecipeById, getRecipesByCategory } from '@/data/recipes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowUp, ShoppingCart, Unlock } from 'lucide-react'
import { clsx } from 'clsx'

export const KitchenModule = () => {
  const inventory = useGameStore((s) => s.inventory)
  const unlockedRecipeIds = useGameStore((s) => s.unlockedRecipeIds)
  const cookingSlots = useGameStore((s) => s.cookingSlots)
  const preparedItems = useGameStore((s) => s.preparedItems)
  const ovenLevel = useGameStore((s) => s.ovenLevel)
  const potLevel = useGameStore((s) => s.potLevel)
  const fridgeLevel = useGameStore((s) => s.fridgeLevel)
  const coins = useGameStore((s) => s.coins)

  const startCooking = useGameStore((s) => s.startCooking)
  const collectCooked = useGameStore((s) => s.collectCooked)
  const buyIngredient = useGameStore((s) => s.buyIngredient)
  const upgradeStation = useGameStore((s) => s.upgradeStation)
  const unlockRecipe = useGameStore((s) => s.unlockRecipe)
  const hasIngredients = useGameStore((s) => s.hasIngredients)

  const [activeCategory, setActiveCategory] = useState<'donut' | 'tea' | 'pudding'>('donut')
  const [showShop, setShowShop] = useState(false)

  const categories = [
    { id: 'donut' as const, name: '甜甜圈', emoji: '🍩' },
    { id: 'tea' as const, name: '奶茶', emoji: '🧋' },
    { id: 'pudding' as const, name: '布丁', emoji: '🍮' },
  ]

  const visibleRecipes = getRecipesByCategory(activeCategory)

  const getStationLevel = (type: string) => {
    if (type === 'oven') return ovenLevel
    if (type === 'pot') return potLevel
    return fridgeLevel
  }

  const upgradeCost = (type: 'oven' | 'pot' | 'fridge') => {
    const base = { oven: 200, pot: 180, fridge: 250 }
    return base[type] * getStationLevel(type)
  }

  return (
    <div className="h-full w-full">
      <Card variant="default" padding="none" className="h-full overflow-hidden">
        <div className="bg-gradient-to-r from-stone-100 via-amber-50 to-orange-50 border-b-2 border-stone-200 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={clsx(
                  'px-4 py-2 rounded-xl font-extrabold text-sm transition-all border-2',
                  activeCategory === c.id
                    ? 'bg-gradient-to-b from-amber-400 to-orange-400 text-white border-orange-500 shadow-lg scale-105'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-amber-50 hover:border-amber-300'
                )}
              >
                <span className="text-lg mr-1">{c.emoji}</span>
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <Button
            variant="secondary"
            size="md"
            icon={<ShoppingCart size={18} />}
            onClick={() => setShowShop(!showShop)}
          >
            采购食材
          </Button>
        </div>

        <div className="h-[calc(100%-60px)] overflow-y-auto p-4">
          {showShop && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4"
            >
              <Card variant="wood" className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-extrabold text-amber-900 flex items-center gap-2 text-lg">
                    <span>🛒</span>食材采购商店
                    <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                      💰 {coins}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowShop(false)}>收起</Button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {INGREDIENTS.map((ing) => {
                    const cost5 = ing.baseCost * 5
                    return (
                      <div
                        key={ing.id}
                        className="bg-white rounded-xl p-3 border-2 border-amber-200 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <div className="text-4xl text-center mb-1">{ing.emoji}</div>
                        <div className="font-bold text-stone-800 text-center text-sm">{ing.name}</div>
                        <div className="text-xs text-stone-500 text-center mb-2">
                          库存：<span className="font-bold text-amber-700">{inventory[ing.id] || 0}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          fullWidth
                          onClick={() => buyIngredient(ing.id, 5)}
                          disabled={coins < cost5}
                        >
                          +5份💰{cost5}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          <div className="mb-4">
            <div className="text-sm font-extrabold text-stone-700 mb-2 flex items-center gap-2">
              <span>📋</span>菜单列表
              <span className="text-xs text-stone-500 font-bold">（点击「制作」放入炉具）</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleRecipes.map((recipe) => {
                const unlocked = unlockedRecipeIds.includes(recipe.id)
                const canCook = unlocked && hasIngredients(recipe.id)
                const unlockCost = recipe.basePrice * 3
                return (
                  <motion.div
                    key={recipe.id}
                    whileHover={{ y: -2 }}
                    className={clsx(
                      'rounded-2xl p-4 border-2 transition-all relative overflow-hidden',
                      unlocked
                        ? 'bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-md'
                        : 'bg-gradient-to-br from-stone-100 to-stone-50 border-stone-300 opacity-90'
                    )}
                  >
                    {!unlocked && (
                      <div className="absolute top-2 right-2 bg-stone-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        🔒 未解锁
                      </div>
                    )}
                    <div className="flex gap-3">
                      <div className="text-5xl shrink-0 drop-shadow-md">{recipe.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-stone-800 text-base">{recipe.name}</div>
                        <div className="text-[11px] text-stone-500 mb-1">{recipe.description}</div>
                        <div className="flex gap-1 flex-wrap mb-2">
                          {recipe.ingredientIds.map((iid) => {
                            const ing = getIngredientById(iid)
                            const hasEnough = (inventory[iid] || 0) > 0
                            return (
                              <span
                                key={iid}
                                className={clsx(
                                  'text-[10px] px-1.5 py-0.5 rounded-md font-bold',
                                  hasEnough ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                )}
                              >
                                {ing?.emoji} {inventory[iid] || 0}
                              </span>
                            )
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-600 mb-2 flex-wrap">
                          <span className="bg-amber-100 px-2 py-0.5 rounded-full font-bold">⏱ {(recipe.cookTime / 1000).toFixed(0)}秒</span>
                          <span className="bg-pink-100 px-2 py-0.5 rounded-full font-bold">💰 {recipe.basePrice}</span>
                        </div>
                      </div>
                    </div>
                    {unlocked ? (
                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        {[0, 1, 2].map((slotIdx) => {
                          const baseIdx = activeCategory === 'donut' ? 0 : activeCategory === 'tea' ? 3 : 5
                          const idx = baseIdx + (slotIdx % (activeCategory === 'pudding' ? 1 : 3))
                          const slot = cookingSlots[idx]
                          const occupied = slot?.recipeId
                          return (
                            <Button
                              key={slotIdx}
                              size="sm"
                              variant={canCook && !occupied ? 'primary' : 'ghost'}
                              disabled={!canCook || !!occupied}
                              onClick={() => startCooking(recipe.id, idx)}
                            >
                              {occupied ? '占用中' : `制作${slotIdx + 1}`}
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <Button
                        fullWidth
                        variant="success"
                        size="sm"
                        icon={<Unlock size={14} />}
                        onClick={() => unlockRecipe(recipe.id)}
                        disabled={coins < unlockCost || recipe.requiredLevel > ovenLevel}
                        className="mt-3"
                      >
                        解锁 💰{unlockCost}
                        {recipe.requiredLevel > ovenLevel && ` (需烤箱Lv${recipe.requiredLevel})`}
                      </Button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card variant="wood">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-amber-900 flex items-center gap-2">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <div>烤箱</div>
                    <div className="text-xs font-bold text-amber-700">Lv.{ovenLevel} · 甜甜圈</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<ArrowUp size={14} />}
                  onClick={() => upgradeStation('oven')}
                  disabled={coins < upgradeCost('oven')}
                >
                  升级 💰{upgradeCost('oven')}
                </Button>
              </div>
              <div className="space-y-2">
                {cookingSlots.slice(0, 3).map((slot, i) => {
                  const recipe = slot.recipeId ? getRecipeById(slot.recipeId) : null
                  const done = slot.progress >= 100
                  return (
                    <motion.div
                      key={i}
                      className={clsx(
                        'rounded-xl p-2.5 border-2 transition-all',
                        done
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 shadow-lg'
                          : recipe
                          ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
                          : 'bg-stone-100 border-stone-200 border-dashed'
                      )}
                    >
                      {recipe ? (
                        <div className="flex items-center gap-2">
                          <motion.span
                            animate={done ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ repeat: done ? Infinity : 0, duration: 0.8 }}
                            className="text-3xl"
                          >
                            {recipe.emoji}
                          </motion.span>
                          <div className="flex-1">
                            <div className="text-xs font-extrabold text-stone-700">{recipe.name}</div>
                            <ProgressBar value={slot.progress} size="sm" color={done ? 'green' : 'yellow'} />
                          </div>
                          {done && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => collectCooked(slot.index)}
                            >
                              收取
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-stone-400 text-xs font-bold py-1">空位 #{i + 1}</div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </Card>

            <Card variant="wood">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-amber-900 flex items-center gap-2">
                  <span className="text-3xl">🫖</span>
                  <div>
                    <div>煮锅</div>
                    <div className="text-xs font-bold text-amber-700">Lv.{potLevel} · 奶茶</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<ArrowUp size={14} />}
                  onClick={() => upgradeStation('pot')}
                  disabled={coins < upgradeCost('pot')}
                >
                  升级 💰{upgradeCost('pot')}
                </Button>
              </div>
              <div className="space-y-2">
                {cookingSlots.slice(3, 5).map((slot, i) => {
                  const recipe = slot.recipeId ? getRecipeById(slot.recipeId) : null
                  const done = slot.progress >= 100
                  return (
                    <motion.div
                      key={i}
                      className={clsx(
                        'rounded-xl p-2.5 border-2 transition-all',
                        done
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 shadow-lg'
                          : recipe
                          ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-300'
                          : 'bg-stone-100 border-stone-200 border-dashed'
                      )}
                    >
                      {recipe ? (
                        <div className="flex items-center gap-2">
                          <motion.span
                            animate={done ? { scale: [1, 1.2, 1] } : { rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: done ? 0.8 : 0.4, ease: 'linear' }}
                            className="text-3xl"
                          >
                            {recipe.emoji}
                          </motion.span>
                          <div className="flex-1">
                            <div className="text-xs font-extrabold text-stone-700">{recipe.name}</div>
                            <ProgressBar value={slot.progress} size="sm" color={done ? 'green' : 'blue'} />
                          </div>
                          {done && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => collectCooked(slot.index)}
                            >
                              收取
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-stone-400 text-xs font-bold py-2">空位 #{i + 1}</div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </Card>

            <Card variant="wood">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-amber-900 flex items-center gap-2">
                  <span className="text-3xl">❄️</span>
                  <div>
                    <div>冰箱</div>
                    <div className="text-xs font-bold text-amber-700">Lv.{fridgeLevel} · 布丁</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<ArrowUp size={14} />}
                  onClick={() => upgradeStation('fridge')}
                  disabled={coins < upgradeCost('fridge')}
                >
                  升级 💰{upgradeCost('fridge')}
                </Button>
              </div>
              <div className="space-y-2">
                {cookingSlots.slice(5, 6).map((slot, i) => {
                  const recipe = slot.recipeId ? getRecipeById(slot.recipeId) : null
                  const done = slot.progress >= 100
                  return (
                    <motion.div
                      key={i}
                      className={clsx(
                        'rounded-xl p-2.5 border-2 transition-all',
                        done
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 shadow-lg'
                          : recipe
                          ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-300'
                          : 'bg-stone-100 border-stone-200 border-dashed'
                      )}
                    >
                      {recipe ? (
                        <div className="flex items-center gap-2">
                          <motion.span
                            animate={done ? { scale: [1, 1.2, 1] } : { y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: done ? 0.8 : 1.2 }}
                            className="text-3xl"
                          >
                            {recipe.emoji}
                          </motion.span>
                          <div className="flex-1">
                            <div className="text-xs font-extrabold text-stone-700">{recipe.name}</div>
                            <ProgressBar value={slot.progress} size="sm" color={done ? 'green' : 'pink'} />
                          </div>
                          {done && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => collectCooked(slot.index)}
                            >
                              收取
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-stone-400 text-xs font-bold py-3">空位 #1</div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </div>

          <Card variant="paper">
            <div className="font-extrabold text-amber-900 mb-3 flex items-center gap-2 text-lg">
              <span>📦</span>成品架
              <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full ml-auto">
                共 {preparedItems.length} 份
              </span>
            </div>
            {preparedItems.length === 0 ? (
              <div className="text-stone-400 text-center py-8 font-bold">🍳 做好的点心会出现在这里哦～</div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {preparedItems.map((item) => {
                    const recipe = getRecipeById(item.recipeId)
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('preparedId', item.id)}
                        className="cursor-grab active:cursor-grabbing bg-white rounded-2xl px-4 py-3 border-2 border-amber-300 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all duration-200"
                      >
                        <div className="text-4xl text-center">{recipe?.emoji}</div>
                        <div className="text-[11px] font-extrabold text-amber-800 text-center mt-1">
                          {recipe?.name}
                        </div>
                        <div className="text-[9px] text-stone-500 text-center mt-0.5">拖走 →</div>
                      </div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </div>
      </Card>
    </div>
  )
}
