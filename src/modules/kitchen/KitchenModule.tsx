import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { INGREDIENTS, getIngredientById } from '@/data/ingredients'
import { RECIPES, getRecipeById, getRecipesByCategory } from '@/data/recipes'
import type { Recipe } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowUp, ShoppingCart, Unlock, X, ChefHat } from 'lucide-react'
import { clsx } from 'clsx'

type StationType = 'oven' | 'pot' | 'fridge'

export const KitchenModule = () => {
  const inventory = useGameStore((s) => s.inventory)
  const unlockedRecipeIds = useGameStore((s) => s.unlockedRecipeIds)
  const cookingSlots = useGameStore((s) => s.cookingSlots)
  const cookingPreps = useGameStore((s) => s.cookingPreps)
  const preparedItems = useGameStore((s) => s.preparedItems)
  const ovenLevel = useGameStore((s) => s.ovenLevel)
  const potLevel = useGameStore((s) => s.potLevel)
  const fridgeLevel = useGameStore((s) => s.fridgeLevel)
  const coins = useGameStore((s) => s.coins)
  const cookingQueue = useGameStore((s) => s.cookingQueue)

  const startCooking = useGameStore((s) => s.startCooking)
  const collectCooked = useGameStore((s) => s.collectCooked)
  const buyIngredient = useGameStore((s) => s.buyIngredient)
  const upgradeStation = useGameStore((s) => s.upgradeStation)
  const unlockRecipe = useGameStore((s) => s.unlockRecipe)
  const hasIngredients = useGameStore((s) => s.hasIngredients)
  const setPrepRecipe = useGameStore((s) => s.setPrepRecipe)
  const addIngredientToPrep = useGameStore((s) => s.addIngredientToPrep)
  const removeIngredientFromPrep = useGameStore((s) => s.removeIngredientFromPrep)
  const clearPrep = useGameStore((s) => s.clearPrep)
  const startCookingFromPrep = useGameStore((s) => s.startCookingFromPrep)
  const addCookingQueueItem = useGameStore((s) => s.addCookingQueueItem)
  const cancelCookingQueueItem = useGameStore((s) => s.cancelCookingQueueItem)
  const getShiftBonuses = useGameStore((s) => s.getShiftBonuses)

  const [activeCategory, setActiveCategory] = useState<'donut' | 'tea' | 'pudding'>('donut')
  const [showShop, setShowShop] = useState(true)
  const [showQueue, setShowQueue] = useState(false)
  const [queueCounts, setQueueCounts] = useState<Record<string, number>>({})

  const { cookSpeedBonus } = getShiftBonuses()
  const chefBonusPercent = Math.round(cookSpeedBonus * 100)

  const categories = [
    { id: 'donut' as const, name: '甜甜圈', emoji: '🍩', station: 'oven' as StationType },
    { id: 'tea' as const, name: '奶茶', emoji: '🧋', station: 'pot' as StationType },
    { id: 'pudding' as const, name: '布丁', emoji: '🍮', station: 'fridge' as StationType },
  ]

  const visibleRecipes = getRecipesByCategory(activeCategory)

  const getStationLevel = (type: StationType) =>
    type === 'oven' ? ovenLevel : type === 'pot' ? potLevel : fridgeLevel

  const upgradeCost = (type: StationType) =>
    ({ oven: 200, pot: 180, fridge: 250 }[type] * getStationLevel(type))

  const getPrep = (type: StationType) => cookingPreps.find((p) => p.stationType === type)

  const handleDragIngredientStart = (e: React.DragEvent, ingredientId: string) => {
    e.dataTransfer.setData('ingredientId', ingredientId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnPrep = (e: React.DragEvent, station: StationType) => {
    e.preventDefault()
    const ingredientId = e.dataTransfer.getData('ingredientId')
    if (ingredientId) addIngredientToPrep(station, ingredientId)
  }

  const handleSelectRecipeForPrep = (recipe: Recipe) => {
    const station =
      recipe.category === 'donut' ? 'oven' : recipe.category === 'tea' ? 'pot' : 'fridge'
    setPrepRecipe(station, recipe.id)
    setActiveCategory(recipe.category)
  }

  const getSlotDisplayIndex = (slotIndex: number) => {
    if (slotIndex < 3) return slotIndex + 1
    if (slotIndex < 5) return slotIndex - 2
    return slotIndex - 4
  }

  const renderPrepArea = (station: StationType, slotIndices: number[]) => {
    const prep = getPrep(station)
    const recipe = prep?.targetRecipeId ? getRecipeById(prep.targetRecipeId) : null
    const needed = recipe ? [...recipe.ingredientIds] : []
    const added = prep?.addedIngredients || []
    for (const ing of added) {
      const idx = needed.indexOf(ing)
      if (idx >= 0) needed.splice(idx, 1)
    }
    const complete = !!recipe && added.length === recipe.ingredientIds.length
    const freeSlots = slotIndices.filter((i) => !cookingSlots[i].recipeId)

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDropOnPrep(e, station)}
        className={clsx(
          'mt-3 rounded-2xl border-2 border-dashed p-3 transition-all',
          complete
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-inner'
            : prep?.targetRecipeId
            ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
            : 'bg-stone-50 border-stone-200'
        )}
      >
        {!prep?.targetRecipeId ? (
          <div className="text-center py-2">
            <ChefHat size={24} className="mx-auto text-stone-400 mb-1" />
            <div className="text-xs font-bold text-stone-400">
              点击食谱选菜，然后拖食材到这里 👇
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{recipe?.emoji}</span>
              <div className="flex-1">
                <div className="font-extrabold text-stone-700 text-sm">{recipe?.name}</div>
                <div className="text-[10px] text-stone-500">
                  还差 <span className="font-bold text-amber-600">{needed.length}</span> 种 · 已加{' '}
                  <span className="font-bold text-green-600">{added.length}</span>/
                  {recipe?.ingredientIds.length}
                </div>
              </div>
              <button
                onClick={() => clearPrep(station)}
                className="p-1 rounded-lg hover:bg-red-100 text-stone-500 hover:text-red-600 transition-colors"
                title="清空"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[2.25rem]">
              {added.map((ingId, idx) => {
                const ing = getIngredientById(ingId)
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeIngredientFromPrep(station, idx)}
                    className="bg-white rounded-lg px-2 py-1 border-2 border-green-300 shadow-sm hover:border-red-400"
                    title="点击取回"
                  >
                    <span className="text-lg">{ing?.emoji}</span>
                  </motion.button>
                )
              })}
              {needed.map((ingId, idx) => {
                const ing = getIngredientById(ingId)
                return (
                  <div
                    key={`need-${idx}`}
                    className="bg-stone-100 rounded-lg px-2 py-1 border-2 border-stone-300 border-dashed opacity-60"
                  >
                    <span className="text-lg grayscale">{ing?.emoji}</span>
                  </div>
                )
              })}
            </div>
            {complete && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {freeSlots.length === 0 ? (
                  <div className="text-[11px] font-bold text-red-500 w-full text-center">
                    ⚠️ 炉具全满了，等空位～
                  </div>
                ) : (
                  freeSlots.map((idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant="success"
                      onClick={() => startCookingFromPrep(station, idx)}
                    >
                      🔥 入炉#{idx - slotIndices[0] + 1}
                    </Button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  const cookingItems = cookingQueue.filter((q) => q.status === 'cooking')
  const queuedItems = cookingQueue.filter((q) => q.status === 'queued')

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
          <div className="flex gap-2 items-center">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowQueue(!showQueue)}
              className={clsx(
                showQueue && 'bg-amber-200 border-amber-400 text-amber-900'
              )}
            >
              📋 队列 ({cookingQueue.length})
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<ShoppingCart size={18} />}
              onClick={() => setShowShop(!showShop)}
            >
              {showShop ? '收起' : '采购食材'}
            </Button>
          </div>
        </div>

        <div className="h-[calc(100%-60px)] overflow-y-auto p-4">
          <AnimatePresence>
            {showQueue && cookingQueue.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-4">
                  <div className="font-extrabold text-amber-900 flex items-center gap-2 text-lg mb-3">
                    <span>📋</span>制作队列
                  </div>
                  {cookingItems.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-bold text-orange-600 mb-2 flex items-center gap-1">
                        <span>🔄</span>制作中
                      </div>
                      <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                        {cookingItems.map((item) => {
                          const recipe = getRecipeById(item.recipeId)
                          return (
                            <div
                              key={item.id}
                              className="flex justify-between items-center gap-3 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{recipe?.emoji}</span>
                                <div>
                                  <div className="font-bold text-sm text-stone-700">
                                    {recipe?.name}
                                  </div>
                                  <div className="text-[10px] text-orange-600 font-bold">
                                    炉位 #{item.slotIndex !== null ? getSlotDisplayIndex(item.slotIndex) : '-'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs font-bold text-orange-500 animate-pulse">
                                🔥 制作中
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {queuedItems.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-sky-600 mb-2 flex items-center gap-1">
                        <span>⏳</span>排队中 ({queuedItems.length})
                      </div>
                      <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                        {queuedItems.map((item) => {
                          const recipe = getRecipeById(item.recipeId)
                          return (
                            <div
                              key={item.id}
                              className="flex justify-between items-center gap-3 px-3 py-2 bg-white hover:bg-sky-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{recipe?.emoji}</span>
                                <div className="font-bold text-sm text-stone-700">
                                  {recipe?.name}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelCookingQueueItem(item.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                取消
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
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
                      <span>🛒</span>食材库 · 拖到下面准备区
                      <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full ml-2">
                        💰 {coins}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-8 gap-2.5">
                    {INGREDIENTS.map((ing) => {
                      const cost5 = ing.baseCost * 5
                      const count = inventory[ing.id] || 0
                      return (
                        <div
                          key={ing.id}
                          className={clsx(
                            'bg-white rounded-xl p-2 border-2 shadow-md hover:shadow-lg transition-all',
                            count > 0 ? 'border-green-200' : 'border-stone-200 opacity-70'
                          )}
                        >
                          <div
                            draggable={count > 0}
                            onDragStart={(e) => handleDragIngredientStart(e, ing.id)}
                            className={clsx(
                              'text-3xl text-center select-none',
                              count > 0 ? 'cursor-grab active:cursor-grabbing hover:scale-110 transition-transform' : 'cursor-not-allowed grayscale'
                            )}
                            title={count > 0 ? '拖到准备区～' : '没库存啦，快采购！'}
                          >
                            {ing.emoji}
                          </div>
                          <div className="font-bold text-stone-700 text-center text-[11px] mt-0.5">
                            {ing.name}
                          </div>
                          <div className="text-[10px] text-center mb-1.5">
                            库存：
                            <span
                              className={clsx(
                                'font-bold',
                                count > 0 ? 'text-green-700' : 'text-red-500'
                              )}
                            >
                              {count}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            fullWidth
                            onClick={() => buyIngredient(ing.id, 5)}
                            disabled={coins < cost5}
                          >
                            +5💰{cost5}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-4">
            <div className="text-sm font-extrabold text-stone-700 mb-2 flex items-center gap-2">
              <span>📋</span>菜单列表
              <span className="text-xs text-stone-500 font-bold">
                （点卡片选菜→拖食材；也可直接按制作按钮）
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleRecipes.map((recipe) => {
                const unlocked = unlockedRecipeIds.includes(recipe.id)
                const canCook = unlocked && hasIngredients(recipe.id)
                const unlockCost = recipe.basePrice * 3
                const station =
                  recipe.category === 'donut' ? 'oven' : recipe.category === 'tea' ? 'pot' : 'fridge'
                const stLevel = getStationLevel(station)
                const prep = getPrep(station)
                const isActive = prep?.targetRecipeId === recipe.id
                const stName = station === 'oven' ? '烤箱' : station === 'pot' ? '煮锅' : '冰箱'

                const slots: number[] =
                  station === 'oven' ? [0, 1, 2] : station === 'pot' ? [3, 4] : [5]

                const qCount = queueCounts[recipe.id] || 1

                return (
                  <motion.div
                    key={recipe.id}
                    whileHover={{ y: isActive ? 0 : -2 }}
                    onClick={() => unlocked && handleSelectRecipeForPrep(recipe)}
                    className={clsx(
                      'rounded-2xl p-4 border-2 transition-all relative overflow-hidden cursor-pointer',
                      isActive
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-100 border-orange-400 shadow-xl ring-4 ring-orange-200 ring-offset-2 scale-[1.02]'
                        : unlocked
                        ? 'bg-gradient-to-br from-white to-amber-50 border-amber-200 shadow-md hover:border-amber-400'
                        : 'bg-gradient-to-br from-stone-100 to-stone-50 border-stone-300 opacity-90 cursor-not-allowed'
                    )}
                  >
                    {!unlocked && (
                      <div className="absolute top-2 right-2 bg-stone-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        🔒 未解锁
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                        ✨ 制作中
                      </div>
                    )}
                    <div className="flex gap-3">
                      <div className="text-5xl shrink-0 drop-shadow-md">{recipe.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-stone-800 text-base">{recipe.name}</div>
                        <div className="text-[11px] text-stone-500 mb-1">{recipe.description}</div>
                        <div className="text-[10px] text-amber-600 font-bold mb-1">
                          📍 设备：{stName} · Lv.{recipe.requiredLevel}+
                        </div>
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
                        <div className="flex items-center gap-2 text-[11px] text-stone-600 flex-wrap">
                          <span className="bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                            ⏱ {(recipe.cookTime / 1000).toFixed(0)}秒
                          </span>
                          <span className="bg-pink-100 px-2 py-0.5 rounded-full font-bold">
                            💰 {recipe.basePrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    {unlocked ? (
                      <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[0, 1, 2].map((slotIdx) => {
                            const idx = slots[slotIdx % slots.length]
                            const occupied = cookingSlots[idx]?.recipeId
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
                        <div className="flex items-center gap-2">
                          <select
                            value={qCount}
                            onChange={(e) =>
                              setQueueCounts({ ...queueCounts, [recipe.id]: parseInt(e.target.value) })
                            }
                            className="flex-1 min-w-0 px-2 py-1.5 text-xs font-bold border-2 border-amber-200 rounded-lg bg-white text-stone-700 focus:outline-none focus:border-amber-400"
                            disabled={!canCook}
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}份
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!canCook}
                            onClick={() => addCookingQueueItem(recipe.id, qCount)}
                            className="shrink-0"
                          >
                            📋 加入队列
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        fullWidth
                        variant="success"
                        size="sm"
                        icon={<Unlock size={14} />}
                        onClick={(e) => {
                          e.stopPropagation()
                          unlockRecipe(recipe.id)
                        }}
                        disabled={coins < unlockCost || recipe.requiredLevel > stLevel}
                        className="mt-3"
                      >
                        解锁 💰{unlockCost}
                        {recipe.requiredLevel > stLevel && ` (需${stName}Lv${recipe.requiredLevel})`}
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
                    <div className="flex items-center gap-2">
                      烤箱
                      {chefBonusPercent > 0 && (
                        <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                          🐱厨师加成+{chefBonusPercent}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-amber-700">
                      Lv.{ovenLevel} · 甜甜圈 · 速度+{((ovenLevel - 1) * 8)}%
                    </div>
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
                            <Button size="sm" variant="success" onClick={() => collectCooked(slot.index)}>
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
              {renderPrepArea('oven', [0, 1, 2])}
            </Card>

            <Card variant="wood">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-amber-900 flex items-center gap-2">
                  <span className="text-3xl">🫖</span>
                  <div>
                    <div className="flex items-center gap-2">
                      煮锅
                      {chefBonusPercent > 0 && (
                        <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                          🐱厨师加成+{chefBonusPercent}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-amber-700">
                      Lv.{potLevel} · 奶茶 · 速度+{((potLevel - 1) * 8)}%
                    </div>
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
                            <Button size="sm" variant="success" onClick={() => collectCooked(slot.index)}>
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
              {renderPrepArea('pot', [3, 4])}
            </Card>

            <Card variant="wood">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-amber-900 flex items-center gap-2">
                  <span className="text-3xl">❄️</span>
                  <div>
                    <div className="flex items-center gap-2">
                      冰箱
                      {chefBonusPercent > 0 && (
                        <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                          🐱厨师加成+{chefBonusPercent}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-amber-700">
                      Lv.{fridgeLevel} · 布丁 · 速度+{((fridgeLevel - 1) * 8)}%
                    </div>
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
                            <Button size="sm" variant="success" onClick={() => collectCooked(slot.index)}>
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
              {renderPrepArea('fridge', [5])}
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
                        <div className="text-[9px] text-stone-500 text-center mt-0.5">拖到店铺/订单 →</div>
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
