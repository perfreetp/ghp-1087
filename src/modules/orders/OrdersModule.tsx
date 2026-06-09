import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { getCustomerById } from '@/data/customers'
import { getRecipeById } from '@/data/recipes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Gift, Truck, Sparkles, Clock, Target } from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'

export const OrdersModule = () => {
  const orders = useGameStore((s) => s.orders)
  const customers = useGameStore((s) => s.customers)
  const dailyGoals = useGameStore((s) => s.dailyGoals)
  const deliveryOrder = useGameStore((s) => s.deliveryOrder)
  const preparedItems = useGameStore((s) => s.preparedItems)
  const customerReviews = useGameStore((s) => s.customerReviews)
  const statistics = useGameStore((s) => s.statistics)

  const deliverToCustomer = useGameStore((s) => s.deliverToCustomer)
  const claimDailyGoal = useGameStore((s) => s.claimDailyGoal)
  const cancelOrder = useGameStore((s) => s.cancelOrder)
  const deliverOrder = useGameStore((s) => s.deliverOrder)
  const spawnCustomer = useGameStore((s) => s.spawnCustomer)
  const triggerDelivery = useGameStore((s) => s.triggerDelivery)
  const deliverDelivery = useGameStore((s) => s.deliverDelivery)

  const [showDaily, setShowDaily] = useState(true)

  const remainingRecipes = (order: { recipeIds: string[]; deliveredRecipes: string[] }) => {
    const remaining = [...order.recipeIds]
    order.deliveredRecipes.forEach((r) => {
      const i = remaining.indexOf(r)
      if (i >= 0) remaining.splice(i, 1)
    })
    return remaining
  }

  const allReady = (orderId: string, order: { recipeIds: string[] }) => {
    const items = preparedItems
    const reqCount: Record<string, number> = {}
    order.recipeIds.forEach((r) => {
      reqCount[r] = (reqCount[r] || 0) + 1
    })
    for (const item of items) {
      if (reqCount[item.recipeId] && reqCount[item.recipeId] > 0) {
        reqCount[item.recipeId]--
      }
    }
    return Object.values(reqCount).every((c) => c <= 0)
  }

  const handleQuickDeliver = (custId: string, order: { recipeIds: string[]; deliveredRecipes: string[]; id: string }) => {
    const remaining = remainingRecipes(order)
    if (remaining.length === 0) return
    for (const item of preparedItems) {
      if (remaining.includes(item.recipeId)) {
        deliverToCustomer(custId, item.id)
        return
      }
    }
  }

  const totalReviews = statistics.totalGoodReviews + statistics.totalPoorReviews
  const goodRatePercent = totalReviews > 0
    ? Math.floor((statistics.totalGoodReviews / totalReviews) * 100)
    : null
  const excellentCount = statistics.totalExcellentReviews
  const goodOnlyCount = statistics.totalGoodReviews - statistics.totalExcellentReviews
  const poorCount = statistics.totalPoorReviews

  const ratingStars: Record<string, string> = {
    excellent: '⭐⭐⭐⭐⭐',
    good: '⭐⭐⭐',
    average: '⭐⭐⭐',
    poor: '⭐',
  }

  const ratingBorderClass: Record<string, string> = {
    excellent: 'border-green-400',
    good: 'border-blue-400',
    average: 'border-gray-400',
    poor: 'border-red-400',
  }

  const ratingBgClass: Record<string, string> = {
    excellent: 'bg-green-50',
    good: 'bg-blue-50',
    average: 'bg-gray-50',
    poor: 'bg-red-50',
  }

  return (
    <div className="h-full w-full">
      <Card variant="default" padding="none" className="h-full overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-fuchsia-100 border-b-2 border-pink-200 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="font-extrabold text-pink-800 text-lg flex items-center gap-2">
            <span className="text-2xl">📋</span>订单管理中心
            <span className="text-xs font-bold text-pink-600 bg-pink-200 px-2 py-0.5 rounded-full">
              {orders.filter((o) => o.status === 'pending').length} 单进行中
            </span>
          </div>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            icon={<span className="text-base">⭐</span>}
          >
            好评率 {goodRatePercent !== null ? `${goodRatePercent}%` : '--%'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Target size={16} />}
            onClick={() => setShowDaily(!showDaily)}
          >
            日常任务
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles size={16} />}
            onClick={() => spawnCustomer()}
          >
            召唤顾客
          </Button>
          {!deliveryOrder && (
            <Button
              variant="danger"
              size="sm"
              icon={<Truck size={16} />}
              onClick={() => triggerDelivery()}
            >
              模拟外卖
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {showDaily && (
            <Card variant="paper" className="border-2 border-rose-300">
              <div className="flex items-center justify-between mb-3">
                <div className="font-extrabold text-rose-900 flex items-center gap-2 text-lg">
                  <Gift size={20} className="text-rose-600" />
                  今日目标 · 第 {useGameStore.getState().day} 天
                </div>
                <span className="text-xs font-bold text-rose-700">完成领取金币奖励</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {dailyGoals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    whileHover={{ scale: 1.02 }}
                    className={clsx(
                      'rounded-xl p-4 border-2 transition-all relative overflow-hidden',
                      goal.completed
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-400'
                        : 'bg-white border-stone-200'
                    )}
                  >
                    {goal.completed && !goal.claimed && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute top-2 right-2 text-xl"
                      >
                        🎁
                      </motion.span>
                    )}
                    <div className="font-extrabold text-stone-800 text-base mb-1 flex items-center gap-2">
                      {goal.completed ? '✅' : '⬜'} {goal.title}
                    </div>
                    <div className="text-xs text-stone-500 mb-3 font-bold">{goal.description}</div>
                    <ProgressBar
                      value={Math.min(goal.current, goal.target)}
                      max={goal.target}
                      size="sm"
                      color={goal.completed ? 'green' : 'pink'}
                      showLabel
                      label="进度"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs font-extrabold text-amber-700 flex items-center gap-1">
                        🎁 奖励 💰 {goal.reward}
                      </div>
                      <Button
                        size="sm"
                        variant={goal.completed && !goal.claimed ? 'success' : 'ghost'}
                        onClick={() => claimDailyGoal(goal.id)}
                        disabled={!goal.completed || goal.claimed}
                      >
                        {goal.claimed ? '已领取' : goal.completed ? '领取' : '加油'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {deliveryOrder && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="rounded-2xl p-5 border-4 border-red-400 shadow-2xl bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 text-8xl opacity-10">🛵</div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-5xl"
                  >
                    🛵
                  </motion.span>
                  <div>
                    <div className="font-extrabold text-2xl text-red-700 flex items-center gap-2">
                      外卖大单来袭！
                      <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                        紧急
                      </span>
                    </div>
                    <div className="text-sm text-red-600 font-bold">限时完成，奖励翻倍！</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-xl p-3 border-2 border-red-200">
                    <div className="text-xs font-bold text-stone-500">订单内容</div>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {deliveryOrder.recipeIds.map((rid, idx) => (
                        <span key={idx} className="text-2xl">{getRecipeById(rid)?.emoji}</span>
                      ))}
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      已交付 <span className="font-bold text-green-600">{deliveryOrder.deliveredRecipes.length}</span>
                      /{deliveryOrder.recipeIds.length}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border-2 border-red-200">
                    <div className="text-xs font-bold text-stone-500 flex items-center gap-1">
                      <Clock size={12} /> 剩余时间
                    </div>
                    <div className="font-extrabold text-red-700 text-xl mt-1 tabular-nums">
                      ⏱ 限时任务
                    </div>
                    <ProgressBar
                      value={Math.max(0, deliveryOrder.timeLimit - (Date.now() - deliveryOrder.createdAt))}
                      max={deliveryOrder.timeLimit}
                      size="sm"
                      color="red"
                    />
                  </div>
                  <div className="bg-white rounded-xl p-3 border-2 border-red-200">
                    <div className="text-xs font-bold text-stone-500">奖励</div>
                    <div className="font-extrabold text-2xl text-amber-600 mt-1">💰 {deliveryOrder.baseReward}</div>
                    <div className="text-xs text-stone-500">小费概率 60%</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    icon={<Sparkles size={16} />}
                    disabled={!allReady('delivery', deliveryOrder)}
                    onClick={() => deliverDelivery()}
                    fullWidth
                    size="lg"
                  >
                    {allReady('delivery', deliveryOrder) ? '🚀 立即交付外卖' : '准备好食材后交付'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-8xl mb-4"
              >
                🍽️
              </motion.div>
              <div className="text-stone-500 font-extrabold text-xl mb-2">暂无订单</div>
              <div className="text-stone-400 text-sm">顾客马上就会来啦，先去厨房准备些点心吧～</div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, idx) => {
                const customer = customers.find((c) => c.instanceId === order.customerInstanceId)
                const custDef = customer ? getCustomerById(customer.customerDefId) : null
                const ratio = customer ? customer.patience / customer.maxPatience : 1
                const remaining = remainingRecipes(order)
                const ready = preparedItems.some((p) => remaining.includes(p.recipeId))
                return (
                  <motion.div
                    key={order.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    className={clsx(
                      'rounded-2xl p-4 border-2 shadow-md transition-all',
                      ratio < 0.3
                        ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                        : ratio < 0.6
                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300'
                        : 'bg-gradient-to-br from-white to-green-50 border-stone-200'
                    )}
                    style={{ transform: `rotate(${(idx % 3 - 1) * 0.8}deg)` }}
                  >
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <motion.div
                          animate={
                            ratio < 0.3
                              ? { scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }
                              : { y: [0, -3, 0] }
                          }
                          transition={{ repeat: Infinity, duration: ratio < 0.3 ? 0.4 : 2 }}
                          className="text-5xl"
                          style={{ filter: custDef ? `drop-shadow(0 0 8px ${custDef.color}60)` : '' }}
                        >
                          {custDef?.emoji || '🐱'}
                        </motion.div>
                        <div className="text-xs font-extrabold mt-1 text-stone-700">
                          {custDef?.name || '顾客'}
                        </div>
                        <div className="w-16 mt-1">
                          <ProgressBar value={customer?.patience || 0} max={customer?.maxPatience || 1} size="sm" color="auto" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-extrabold text-stone-800 text-sm">订单详情</span>
                          <span className="text-xs font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                            共 {order.recipeIds.length} 份
                          </span>
                          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            💰 {order.baseReward}
                          </span>
                          {order.tipChance > 0.4 && (
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              ✨ 小费概率高
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {order.recipeIds.map((rid, i) => {
                            const r = getRecipeById(rid)
                            const delivered = order.deliveredRecipes.filter((d) => d === rid).length >
                              order.recipeIds.slice(0, i).filter((d) => d === rid).length
                            const isDeliveredList = delivered || order.deliveredRecipes.includes(rid) && order.deliveredRecipes.indexOf(rid) <= i
                            return (
                              <div
                                key={i}
                                className={clsx(
                                  'rounded-xl p-2 border-2 text-center',
                                  isDeliveredList
                                    ? 'bg-green-50 border-green-300 opacity-60 line-through'
                                    : 'bg-white border-stone-200'
                                )}
                              >
                                <div className="text-2xl">{r?.emoji}</div>
                                <div className="text-[10px] font-extrabold text-stone-700 mt-0.5">{r?.name}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="md"
                          variant={ready ? 'success' : 'secondary'}
                          onClick={() => handleQuickDeliver(order.customerInstanceId, order)}
                          disabled={!ready}
                        >
                          {ready ? '🍱 交付一份' : '制作中'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            cancelOrder(order.id)
                          }}
                        >
                          取消订单
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          <Card variant="paper" className="border-2 border-amber-300">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="font-extrabold text-amber-900 flex items-center gap-2 text-lg">
                <span className="text-xl">💬</span> 最近顾客评价
              </div>
              <div className="flex items-center gap-3 text-sm font-bold">
                <span className="text-green-700">⭐优秀 {excellentCount}</span>
                <span className="text-blue-700">👍良好 {goodOnlyCount}</span>
                <span className="text-red-700">👎差评 {poorCount}</span>
              </div>
            </div>
            {customerReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">💭</div>
                <div className="text-stone-500 font-bold">暂无评价，做好服务让顾客满意吧～</div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {customerReviews.slice(0, 20).map((review, idx) => {
                  const custDef = review.isDelivery ? null : getCustomerById(review.customerDefId)
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={clsx(
                        'rounded-xl p-3 border-2 flex items-start gap-3',
                        ratingBorderClass[review.rating],
                        ratingBgClass[review.rating]
                      )}
                    >
                      <div className="text-4xl shrink-0">
                        {review.isDelivery ? '🛵' : (custDef?.emoji || '🐱')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm mb-1">
                          {ratingStars[review.rating]}
                        </div>
                        <div className="text-stone-800 font-bold text-sm mb-1">
                          {review.comment}
                        </div>
                        <div className="text-[11px] text-stone-500 font-bold flex items-center gap-2 flex-wrap">
                          <span>{review.isDelivery ? '外卖' : '堂食'}</span>
                          <span>·</span>
                          <span>剩余耐心{review.patienceLeft}%</span>
                          <span>·</span>
                          <span>餐品齐全{review.itemsComplete ? '✅' : '❌'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </Card>
    </div>
  )
}
