import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { getCustomerById } from '@/data/customers'
import { getRecipeById } from '@/data/recipes'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'

export const ShopModule = () => {
  const customers = useGameStore((s) => s.customers)
  const orders = useGameStore((s) => s.orders)
  const preparedItems = useGameStore((s) => s.preparedItems)
  const employees = useGameStore((s) => s.employees)
  const deliverToCustomer = useGameStore((s) => s.deliverToCustomer)
  const activeDecor = useGameStore((s) => s.activeDecor)

  const wallColors = useMemo(() => {
    const w = activeDecor.wallpaperId
    if (w === 'wall-pink') return 'from-pink-100 via-pink-50 to-rose-100'
    if (w === 'wall-starry') return 'from-indigo-200 via-purple-100 to-sky-100'
    return 'from-amber-50 via-stone-50 to-amber-100'
  }, [activeDecor.wallpaperId])

  const floorColors = useMemo(() => {
    const f = activeDecor.floorId
    if (f === 'floor-tile') return 'from-amber-200 to-amber-300'
    if (f === 'floor-cloud') return 'from-sky-100 to-blue-100'
    return 'from-amber-100 to-amber-200'
  }, [activeDecor.floorId])

  const decoEmojis = useMemo(() => {
    return activeDecor.decorationIds.map((id) => {
      if (id === 'deco-plant') return { e: '🪴', pos: { top: '18%', left: '5%' } }
      if (id === 'deco-lamp') return { e: '💡', pos: { top: '10%', right: '8%' } }
      if (id === 'deco-fish') return { e: '🐠', pos: { top: '15%', left: '22%' } }
      if (id === 'deco-piano') return { e: '🎹', pos: { bottom: '42%', left: '3%' } }
      if (id === 'deco-cat-tree') return { e: '🏰', pos: { bottom: '42%', right: '3%' } }
      return null
    }).filter(Boolean) as { e: string; pos: Record<string, string> }[]
  }, [activeDecor.decorationIds])

  const seatStyle = activeDecor.furnitureIds.find((f) => f.startsWith('table'))
  const chairStyle = activeDecor.furnitureIds.find((f) => f.startsWith('chair'))

  const handleDrop = (e: React.DragEvent, custId: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('preparedId')
    if (id) deliverToCustomer(custId, id)
  }

  return (
    <div className="h-full w-full">
      <Card variant="default" padding="none" className="h-full overflow-hidden">
        <div className={`relative h-[620px] overflow-hidden bg-gradient-to-b ${wallColors}`}>
          <div className="absolute inset-x-0 top-0 h-20 flex items-center justify-center pt-3">
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-lg shadow-2xl border-4 border-amber-700 px-8 py-3">
              <div className="text-amber-100 font-extrabold text-center text-lg">🍩🧋🍮 今日菜单</div>
              <div className="text-amber-200 text-[10px] font-bold text-center">Today&apos;s Menu</div>
            </div>
          </div>

          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-6 right-10 text-5xl"
          >
            ☁️
          </motion.div>
          <motion.div
            animate={{ x: [0, -12, 0], y: [0, 3, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-14 left-1/4 text-4xl opacity-70"
          >
            ☁️
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 right-1/3 text-3xl"
          >
            🌸
          </motion.div>
          <div className="absolute top-20 right-1/4 text-2xl opacity-80">🌸</div>

          {decoEmojis.map((d, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: i * 0.12 }}
              className="absolute text-4xl md:text-5xl drop-shadow-lg"
              style={d.pos}
            >
              {d.e}
            </motion.div>
          ))}

          <div className="absolute bottom-0 inset-x-0 h-[330px]">
            <div className="absolute inset-x-0 bottom-32 h-32" />
            <div className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b ${floorColors} border-t-4 border-amber-400`}>
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] bg-[length:20px_20px]" />
            </div>

            <div className="absolute inset-x-0 bottom-20 h-56 flex items-end justify-around px-6 gap-4">
              <div className="grid grid-cols-5 gap-3 w-full max-w-5xl mx-auto items-end">
                {Array.from({ length: 5 }).map((_, i) => {
                  const customer = customers[i]
                  const customerDef = customer ? getCustomerById(customer.customerDefId) : null
                  const order = customer ? orders.find((o) => o.customerInstanceId === customer.instanceId) : null
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center min-h-[220px] justify-end"
                      onDragOver={(e) => customer && e.preventDefault()}
                      onDrop={(e) => customer && handleDrop(e, customer.instanceId)}
                    >
                      <div className="relative w-full flex flex-col items-center justify-end h-full">
                        <AnimatePresence mode="wait">
                          {customer && customerDef && (
                            <motion.div
                              key={customer.instanceId}
                              initial={{ y: -100, opacity: 0, scale: 0.7 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              exit={{ y: 40, opacity: 0, scale: 0.7 }}
                              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                              className="flex flex-col items-center mb-3"
                            >
                              {order && (
                                <motion.div
                                  initial={{ y: 12, opacity: 0, scale: 0.8 }}
                                  animate={{ y: 0, opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.25, type: 'spring' }}
                                  className="bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-stone-700 shadow-lg border-2 border-stone-200 mb-1 relative z-10"
                                >
                                  <div className="flex items-center gap-1 flex-wrap justify-center">
                                    {order.recipeIds.map((rid, idx) => {
                                      const r = getRecipeById(rid)
                                      const delivered = order.deliveredRecipes.slice(0, idx + 1).filter(d => d === rid).length > 0
                                      return r ? (
                                        <span key={idx} className={delivered ? 'opacity-40 line-through' : ''}>
                                          {r.emoji}
                                        </span>
                                      ) : null
                                    })}
                                  </div>
                                  {order.deliveredRecipes.length > 0 && (
                                    <div className="text-[10px] text-green-600 mt-0.5 text-center font-bold">
                                      ✔ {order.deliveredRecipes.length}/{order.recipeIds.length}
                                    </div>
                                  )}
                                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-transparent border-t-white" />
                                </motion.div>
                              )}

                              <motion.div
                                animate={
                                  customer.mood === 'unhappy'
                                    ? { x: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.25 } }
                                    : customer.mood === 'happy'
                                    ? { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }
                                    : {}
                                }
                                className="text-5xl md:text-6xl relative drop-shadow-2xl"
                                style={{ filter: `drop-shadow(0 0 12px ${customerDef.color}50)` }}
                              >
                                {customerDef.emoji}
                                {customer.mood === 'happy' && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0, y: 0 }}
                                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1], y: -20 }}
                                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                    className="absolute -top-2 -right-1 text-lg"
                                  >
                                    ✨
                                  </motion.span>
                                )}
                                {customer.mood === 'unhappy' && (
                                  <motion.span
                                    animate={{ opacity: [0, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.6 }}
                                    className="absolute -top-3 right-0 text-lg"
                                  >
                                    💢
                                  </motion.span>
                                )}
                              </motion.div>

                              <div className="w-24 mt-2">
                                <ProgressBar
                                  value={customer.patience}
                                  max={customer.maxPatience}
                                  size="sm"
                                  color="auto"
                                />
                              </div>
                              <div
                                className={
                                  customer.mood === 'happy'
                                    ? 'text-green-700'
                                    : customer.mood === 'neutral'
                                    ? 'text-amber-700'
                                    : 'text-red-700'
                                }
                              >
                                <div className="text-[11px] font-extrabold text-center mt-1 bg-white/70 px-2 py-0.5 rounded-full">
                                  {customerDef.name}
                                  {customer.mood === 'happy' && ' �'}
                                  {customer.mood === 'unhappy' && ' �'}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {!customer && (
                          <div className="text-3xl opacity-25 mb-8 animate-pulse">💭</div>
                        )}

                        <div className="text-4xl drop-shadow">
                          {seatStyle === 'table-marble' ? '⚪' : seatStyle === 'table-vintage' ? '🎻' : '🪵'}
                        </div>
                        <div className="flex gap-2 -mt-1">
                          <span className="text-2xl drop-shadow-sm">
                            {chairStyle === 'chair-cushion' ? '💺' : chairStyle === 'chair-throne' ? '👑' : '🪑'}
                          </span>
                          <span className="text-2xl drop-shadow-sm transform -scale-x-100">
                            {chairStyle === 'chair-cushion' ? '💺' : chairStyle === 'chair-throne' ? '👑' : '🪑'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-3xl px-12 py-4 shadow-2xl border-4 border-amber-500 min-w-[240px] text-center">
                <div className="text-amber-100 font-extrabold text-xl">🏪 前台柜台</div>
                <div className="text-xs text-amber-200 font-bold">
                  {employees.filter((e) => e.assignedStation === 'register' && e.status === 'working').length > 0
                    ? '✨ 店员在岗'
                    : '等待服务中...'}
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-10 flex gap-3 z-10">
              {employees
                .filter((e) => e.status === 'working' && (e.assignedStation === 'floor' || e.assignedStation === 'kitchen'))
                .slice(0, 2)
                .map((emp, i) => (
                  <motion.div
                    key={emp.id}
                    animate={{ x: [0, 25, -15, 0] }}
                    transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-4xl drop-shadow-lg"
                  >
                    {i === 0 ? '🧑‍🍳' : '💁'}
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl border-2 border-stone-200">
              <div className="text-sm font-extrabold text-stone-700 mb-2 flex items-center gap-2">
                <span className="text-xl">📦</span>
                <span>成品台（拖拽点心到顾客座位上完成交付）</span>
              </div>
              {preparedItems.length === 0 ? (
                <div className="text-stone-400 text-sm text-center py-5 font-bold">
                  🍳 去厨房做一些点心吧～
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap justify-center">
                  {preparedItems.map((item) => {
                    const recipe = getRecipeById(item.recipeId)
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('preparedId', item.id)
                        }}
                        className="cursor-grab active:cursor-grabbing bg-gradient-to-b from-amber-50 to-orange-100 px-4 py-2.5 rounded-2xl border-2 border-amber-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                        title="拖拽到顾客座位"
                      >
                        <div className="text-3xl text-center">{recipe?.emoji}</div>
                        <div className="text-[11px] font-extrabold text-amber-800 text-center mt-0.5">
                          {recipe?.name}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 text-center bg-gradient-to-r from-amber-50 to-stone-50 border-t-2 border-stone-200">
          <div className="text-xs text-stone-600 font-bold">
            💡 小提示：把成品台的点心拖到顾客身上即可交付，顾客耐心归零会生气离开扣声誉！
          </div>
        </div>
      </Card>
    </div>
  )
}
