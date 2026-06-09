import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { DECOR_ITEMS, getDecorByCategory } from '@/data/decor'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'
import { ShoppingBag, Check, Sparkles } from 'lucide-react'

type CategoryId = 'all' | 'table' | 'chair' | 'wallpaper' | 'floor' | 'decoration'

const CATEGORIES: { id: CategoryId; name: string; icon: string; label: string }[] = [
  { id: 'all', name: '全部', icon: '🎨', label: '所有装饰' },
  { id: 'table', name: '桌子', icon: '🪵', label: '精美餐桌' },
  { id: 'chair', name: '椅子', icon: '🪑', label: '舒适座椅' },
  { id: 'wallpaper', name: '壁纸', icon: '🖼️', label: '墙面装饰' },
  { id: 'floor', name: '地板', icon: '🟫', label: '地面铺设' },
  { id: 'decoration', name: '装饰', icon: '🪴', label: '小摆件' },
]

const rarityColors: Record<string, string> = {
  common: 'from-stone-50 to-stone-100 border-stone-300',
  rare: 'from-sky-50 to-blue-100 border-blue-400',
  epic: 'from-purple-50 via-pink-50 to-amber-50 border-purple-400',
}

const rarityLabel: Record<string, { name: string; color: string }> = {
  common: { name: '普通', color: 'bg-stone-500 text-white' },
  rare: { name: '稀有', color: 'bg-blue-500 text-white' },
  epic: { name: '史诗', color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white' },
}

export const DecorModule = () => {
  const ownedDecorIds = useGameStore((s) => s.ownedDecorIds)
  const activeDecor = useGameStore((s) => s.activeDecor)
  const coins = useGameStore((s) => s.coins)
  const buyDecor = useGameStore((s) => s.buyDecor)
  const applyDecor = useGameStore((s) => s.applyDecor)

  const [activeCat, setActiveCat] = useState<CategoryId>('all')
  const [previewMode, setPreviewMode] = useState(false)

  const list = activeCat === 'all' ? DECOR_ITEMS : getDecorByCategory(activeCat as any)

  const isActive = (decorId: string, cat: string) => {
    if (cat === 'wallpaper') return activeDecor.wallpaperId === decorId
    if (cat === 'floor') return activeDecor.floorId === decorId
    if (cat === 'table' || cat === 'chair') return activeDecor.furnitureIds.includes(decorId)
    return activeDecor.decorationIds.includes(decorId)
  }

  const toggleDecor = (decorId: string, cat: string) => {
    applyDecor(decorId)
  }

  return (
    <div className="h-full w-full">
      <Card variant="default" padding="none" className="h-full overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 border-b-2 border-teal-200 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="font-extrabold text-teal-800 text-lg flex items-center gap-2">
            <ShoppingBag size={22} className="text-teal-600" />
            喵星装饰商店
            <span className="text-xs font-bold text-teal-600 bg-teal-200 px-2 py-0.5 rounded-full">
              已拥有 {ownedDecorIds.length}/{DECOR_ITEMS.length}
            </span>
          </div>
          <div className="flex-1" />
          <div className="bg-white/80 px-4 py-1.5 rounded-xl border-2 border-teal-300 font-extrabold text-amber-700 text-sm flex items-center gap-1">
            💰 {coins.toLocaleString()}
          </div>
          <Button
            variant={previewMode ? 'primary' : 'ghost'}
            size="sm"
            icon={<Sparkles size={16} />}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? '已开启预览' : '装饰预览'}
          </Button>
        </div>

        <div className="bg-gradient-to-b from-teal-50 to-white px-5 py-3 border-b border-teal-100 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={clsx(
                  'px-4 py-2 rounded-xl font-extrabold text-sm transition-all border-2 flex items-center gap-1.5 shrink-0',
                  activeCat === c.id
                    ? 'bg-gradient-to-b from-teal-400 to-emerald-500 text-white border-teal-600 shadow-lg scale-105'
                    : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50 hover:border-teal-400'
                )}
              >
                <span className="text-lg">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {previewMode && (
            <Card variant="wood" className="mb-4">
              <div className="text-sm font-extrabold text-amber-900 mb-2">🏪 店铺预览（当前已应用装饰）</div>
              <div className="bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl p-4 border-2 border-amber-200 min-h-[140px] relative overflow-hidden">
                <div className="text-center mb-2 font-bold text-amber-700 text-xs">壁纸、地板、装饰效果预览</div>
                <div className="flex justify-center gap-6 text-5xl">
                  {activeDecor.wallpaperId && (
                    <div className="text-center">
                      <div className="text-4xl">
                        {activeDecor.wallpaperId === 'wall-pink' ? '🌸' : activeDecor.wallpaperId === 'wall-starry' ? '🌌' : '🍦'}
                      </div>
                      <div className="text-[10px] font-bold text-stone-600 mt-1">壁纸</div>
                    </div>
                  )}
                  {activeDecor.floorId && (
                    <div className="text-center">
                      <div className="text-4xl">
                        {activeDecor.floorId === 'floor-tile' ? '🔲' : activeDecor.floorId === 'floor-cloud' ? '☁️' : '🟫'}
                      </div>
                      <div className="text-[10px] font-bold text-stone-600 mt-1">地板</div>
                    </div>
                  )}
                  {activeDecor.furnitureIds.filter(f => f.startsWith('table')).slice(0, 1).map((f, i) => (
                    <div key={'t' + i} className="text-center">
                      <div className="text-4xl">
                        {f === 'table-marble' ? '⚪' : f === 'table-vintage' ? '🎻' : '🪵'}
                      </div>
                      <div className="text-[10px] font-bold text-stone-600 mt-1">桌子</div>
                    </div>
                  ))}
                  {activeDecor.decorationIds.slice(0, 3).map((d, i) => (
                    <div key={'d' + i} className="text-center">
                      <div className="text-4xl">
                        {d === 'deco-plant' ? '🪴' : d === 'deco-lamp' ? '💡' : d === 'deco-fish' ? '🐠' : d === 'deco-piano' ? '🎹' : '🏰'}
                      </div>
                      <div className="text-[10px] font-bold text-stone-600 mt-1">装饰{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {list.map((decor, i) => {
                const owned = ownedDecorIds.includes(decor.id)
                const active = isActive(decor.id, decor.category)
                const canAfford = coins >= decor.price
                const rarity = rarityLabel[decor.rarity]
                return (
                  <motion.div
                    key={decor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.04, type: 'spring' }}
                    whileHover={{ y: -6, scale: 1.03 }}
                    className={clsx(
                      'rounded-2xl p-4 border-2 relative overflow-hidden shadow-md',
                      `bg-gradient-to-br ${rarityColors[decor.rarity]}`
                    )}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <span className={clsx('text-[10px] font-extrabold px-2 py-0.5 rounded-full', rarity.color)}>
                        {decor.rarity === 'epic' ? '✨' : decor.rarity === 'rare' ? '💎' : ''} {rarity.name}
                      </span>
                    </div>

                    <motion.div
                      animate={decor.rarity === 'epic' ? { rotate: [0, 3, -3, 0], scale: [1, 1.05, 1] } : { y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: decor.rarity === 'epic' ? 2 : 3, ease: 'easeInOut' }}
                      className="text-center my-4"
                    >
                      <span className="text-6xl drop-shadow-lg">{decor.emoji}</span>
                    </motion.div>

                    <div className="font-extrabold text-stone-800 text-center mb-1">{decor.name}</div>
                    <div className="text-[11px] text-stone-600 text-center mb-2 leading-snug min-h-[32px]">
                      {decor.description}
                    </div>

                    {decor.bonus && (
                      <div className="text-[11px] font-extrabold text-center mb-3 bg-white/70 rounded-lg py-1 text-amber-700">
                        ✨ 加成 +{decor.bonus.value} {decor.bonus.type === 'reputation' ? '声誉' : decor.bonus.type === 'tip' ? '小费' : decor.bonus.type === 'patience' ? '耐心' : '魅力'}
                      </div>
                    )}

                    {owned ? (
                      <Button
                        variant={active ? 'success' : 'secondary'}
                        size="sm"
                        fullWidth
                        icon={active ? <Check size={14} /> : null}
                        onClick={() => toggleDecor(decor.id, decor.category)}
                      >
                        {active ? '✓ 使用中' : (decor.category === 'decoration' ? (activeDecor.decorationIds.includes(decor.id) ? '移除' : '摆放') : '使用')}
                      </Button>
                    ) : (
                      <Button
                        variant={canAfford ? 'primary' : 'danger'}
                        size="sm"
                        fullWidth
                        onClick={() => canAfford && buyDecor(decor.id)}
                        disabled={!canAfford}
                      >
                        {canAfford ? `💰 购买 ${decor.price}` : `💰 金币不足`}
                      </Button>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </div>
  )
}
