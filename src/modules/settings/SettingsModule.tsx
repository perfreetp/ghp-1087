import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Settings, Save, Trash2, Plus, Volume2, VolumeX, Zap, Sparkles, HelpCircle, Download, Upload } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDate } from '@/utils'

export const SettingsModule = () => {
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const slots = useGameStore((s) => s.slots)
  const currentSlotId = useGameStore((s) => s.currentSlotId)
  const day = useGameStore((s) => s.day)
  const coins = useGameStore((s) => s.coins)

  const createSlot = useGameStore((s) => s.createSlot)
  const loadSlot = useGameStore((s) => s.loadSlot)
  const saveSlot = useGameStore((s) => s.saveSlot)
  const deleteSlot = useGameStore((s) => s.deleteSlot)

  const [newSlotName, setNewSlotName] = useState('')
  const [showNewSlot, setShowNewSlot] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newSlotName.trim()) return
    createSlot(newSlotName.trim())
    setNewSlotName('')
    setShowNewSlot(false)
  }

  return (
    <div className="h-full w-full">
      <Card variant="default" padding="none" className="h-full overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-slate-100 via-zinc-100 to-stone-100 border-b-2 border-stone-300 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="font-extrabold text-stone-700 text-lg flex items-center gap-2">
            <Settings size={22} className="text-stone-600" />
            存档 & 游戏设置
          </div>
          <div className="flex-1" />
          <Button
            variant="secondary"
            size="sm"
            icon={<HelpCircle size={16} />}
            onClick={() => setShowHelp(true)}
          >
            游戏帮助
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card variant="wood">
              <div className="font-extrabold text-amber-900 mb-4 flex items-center gap-2 text-lg">
                <Save size={20} /> 存档管理
                <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full ml-auto">
                  {slots.length}/3 存档槽
                </span>
              </div>

              <div className="space-y-3">
                {[0, 1, 2].map((slotIdx) => {
                  const slot = slots[slotIdx]
                  const isCurrent = slot && slot.id === currentSlotId
                  const dayNum = slot ? slot.day : null
                  const playTime = slot ? Math.floor(slot.totalPlayTime / 60) : 0
                  return (
                    <motion.div
                      key={slotIdx}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: slotIdx * 0.1 }}
                      className={clsx(
                        'rounded-2xl p-4 border-3 transition-all relative overflow-hidden',
                        slot
                          ? isCurrent
                            ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-400 border-4 shadow-xl'
                            : 'bg-gradient-to-br from-white to-amber-50 border-amber-300 shadow-md'
                          : 'bg-gradient-to-br from-stone-50 to-stone-100 border-dashed border-stone-300 border-2'
                      )}
                    >
                      {slot && isCurrent && (
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg"
                        >
                          🎮 游戏中
                        </motion.span>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={clsx(
                          'w-16 h-16 rounded-xl flex items-center justify-center text-4xl shrink-0',
                          slot ? 'bg-gradient-to-br from-amber-200 to-orange-300 shadow-inner' : 'bg-stone-200'
                        )}>
                          {slot ? '📖' : '➕'}
                        </div>
                        <div className="flex-1 min-w-0">
                          {slot ? (
                            <>
                              <div className="font-extrabold text-xl text-stone-800 flex items-center gap-2">
                                {slot.name}
                                <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                                  第{slot.day}天
                                </span>
                              </div>
                              <div className="text-xs text-stone-500 mt-1 space-x-3">
                                <span>🕐 {formatDate(slot.savedAt)}</span>
                                <span>⏱ {playTime}分钟</span>
                              </div>
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <Button
                                  size="sm"
                                  variant={isCurrent ? 'success' : 'primary'}
                                  icon={isCurrent ? <Sparkles size={14} /> : <Upload size={14} />}
                                  onClick={() => isCurrent ? saveSlot() : loadSlot(slot.id)}
                                >
                                  {isCurrent ? '💾 保存进度' : '📂 读取存档'}
                                </Button>
                                {confirmDelete === slot.id ? (
                                  <div className="flex gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => {
                                        deleteSlot(slot.id)
                                        setConfirmDelete(null)
                                      }}
                                    >
                                      ✓ 确认删除
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setConfirmDelete(null)}
                                    >
                                      取消
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    icon={<Trash2 size={14} />}
                                    onClick={() => setConfirmDelete(slot.id)}
                                    disabled={isCurrent}
                                  >
                                    删除
                                  </Button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-extrabold text-lg text-stone-500">空存档槽</div>
                              <div className="text-xs text-stone-400 mt-1">创建一个新的游戏存档</div>
                              {!showNewSlot || slots.length >= 3 ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon={<Plus size={14} />}
                                  className="mt-3"
                                  onClick={() => setShowNewSlot(true)}
                                  disabled={slots.length >= 3}
                                >
                                  🆕 创建新存档
                                </Button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>

                      {!slot && showNewSlot && slots.length < 3 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-4 border-t-2 border-stone-200 pt-3"
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSlotName}
                              onChange={(e) => setNewSlotName(e.target.value)}
                              placeholder="输入存档名称..."
                              maxLength={20}
                              className="flex-1 px-4 py-2 rounded-xl border-2 border-amber-300 focus:border-amber-500 outline-none font-bold text-stone-700 bg-white"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />
                            <Button variant="primary" size="sm" onClick={handleCreate}>
                              确定
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setShowNewSlot(false)}>
                              取消
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-3 border-2 border-sky-200">
                <div className="text-xs font-extrabold text-sky-800 flex items-center gap-2">
                  <Zap size={14} /> 自动存档：
                  <span className={clsx(
                    'ml-auto px-2 py-0.5 rounded-full',
                    settings.autoSave ? 'bg-green-200 text-green-700' : 'bg-stone-200 text-stone-600'
                  )}>
                    {settings.autoSave ? '✅ 已开启' : '❌ 已关闭'}
                  </span>
                </div>
              </div>
            </Card>

            <Card variant="glass">
              <div className="font-extrabold text-stone-700 mb-4 flex items-center gap-2 text-lg">
                <Settings size={20} /> 游戏设置
              </div>

              <div className="space-y-5">
                <div>
                  <div className="font-bold text-sm text-stone-700 mb-2 flex items-center gap-2">
                    🎮 游戏难度
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'relaxed', name: '轻松模式', desc: '顾客耐心更长，收益适中', emoji: '🌸', color: 'from-pink-200 to-rose-200 border-pink-400' },
                      { id: 'challenge', name: '挑战模式', desc: '顾客更急躁，小费更高', emoji: '🔥', color: 'from-orange-200 to-red-200 border-red-400' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => updateSettings({ difficulty: d.id as any })}
                        className={clsx(
                          `rounded-2xl p-4 border-3 bg-gradient-to-br text-left transition-all ${d.color}`,
                          settings.difficulty === d.id ? 'ring-4 ring-green-400 scale-105 shadow-xl' : 'opacity-80 hover:opacity-100 hover:scale-102'
                        )}
                      >
                        <div className="text-3xl mb-1">{d.emoji}</div>
                        <div className="font-extrabold text-stone-800">{d.name}</div>
                        <div className="text-[11px] text-stone-600 font-bold mt-0.5">{d.desc}</div>
                        {settings.difficulty === d.id && (
                          <div className="text-[10px] font-extrabold text-green-700 mt-1.5">✓ 已选择</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-sm text-stone-700 mb-2 flex items-center gap-2">
                    ⏰ 自动存档
                    <span className="ml-auto text-xs font-bold text-stone-500">
                      {settings.autoSaveInterval / 1000}秒
                    </span>
                  </div>
                  <div
                    className={clsx(
                      'flex items-center justify-between bg-gradient-to-r rounded-xl p-3 border-2 cursor-pointer transition-all',
                      settings.autoSave
                        ? 'from-green-100 to-emerald-100 border-green-300'
                        : 'from-stone-100 to-stone-200 border-stone-300'
                    )}
                    onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                  >
                    <div>
                      <div className="font-extrabold text-stone-700">自动保存进度</div>
                      <div className="text-xs text-stone-500 font-bold">{settings.autoSave ? '每隔一段时间自动保存游戏' : '需手动保存，当心丢失进度！'}</div>
                    </div>
                    <div
                      className={clsx(
                        'w-14 h-8 rounded-full p-1 transition-all',
                        settings.autoSave ? 'bg-green-500' : 'bg-stone-400'
                      )}
                    >
                      <motion.div
                        animate={{ x: settings.autoSave ? 24 : 0 }}
                        className="w-6 h-6 rounded-full bg-white shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-sm text-stone-700 mb-2 flex items-center gap-2">
                    🔊 音量控制
                    <span className="ml-auto text-xs font-bold text-stone-500">
                      {Math.round(settings.masterVolume * 100)}%
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-3 border-2 border-purple-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateSettings({ masterVolume: settings.masterVolume === 0 ? 0.7 : 0 })}
                        className="text-3xl hover:scale-110 transition-transform"
                      >
                        {settings.masterVolume === 0 ? <VolumeX className="text-purple-600" /> : <Volume2 className="text-purple-600" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={settings.masterVolume}
                        onChange={(e) => updateSettings({ masterVolume: parseFloat(e.target.value) })}
                        className="flex-1 h-3 accent-purple-500 cursor-pointer"
                      />
                      <div className="font-extrabold text-purple-700 tabular-nums min-w-[40px] text-right">
                        {Math.round(settings.masterVolume * 100)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-sm text-stone-700 mb-2">📖 新手教程提示</div>
                  <button
                    onClick={() => updateSettings({ showTutorial: !settings.showTutorial })}
                    className={clsx(
                      'w-full flex items-center justify-between bg-gradient-to-r rounded-xl p-3 border-2 text-left transition-all',
                      settings.showTutorial
                        ? 'from-amber-100 to-yellow-100 border-amber-300'
                        : 'from-stone-100 to-stone-200 border-stone-300'
                    )}
                  >
                    <div>
                      <div className="font-extrabold text-stone-700">显示操作提示</div>
                      <div className="text-xs text-stone-500 font-bold">在各个模块显示帮助气泡</div>
                    </div>
                    <div
                      className={clsx(
                        'w-12 h-7 rounded-full p-1 transition-all',
                        settings.showTutorial ? 'bg-amber-500' : 'bg-stone-400'
                      )}
                    >
                      <motion.div
                        animate={{ x: settings.showTutorial ? 20 : 0 }}
                        className="w-5 h-5 rounded-full bg-white shadow-md"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <Card variant="paper">
            <div className="font-extrabold text-stone-700 mb-3 flex items-center gap-2">
              <Download size={18} /> 当前进度快照
              {currentSlotId ? (
                <span className="ml-auto text-xs font-bold bg-green-200 text-green-700 px-3 py-1 rounded-full">
                  🎮 正在游戏中
                </span>
              ) : (
                <span className="ml-auto text-xs font-bold bg-stone-200 text-stone-500 px-3 py-1 rounded-full">
                  未选择存档
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: '营业天数', value: day, emoji: '📅', color: 'text-sky-700' },
                { label: '金币余额', value: coins.toLocaleString(), emoji: '💰', color: 'text-amber-700' },
                { label: '订单进行中', value: useGameStore.getState().orders.length, emoji: '📋', color: 'text-pink-700' },
                { label: '在岗员工', value: useGameStore.getState().employees.filter(e => e.status === 'working').length, emoji: '🐾', color: 'text-green-700' },
                { label: '待取菜品', value: useGameStore.getState().preparedItems.length, emoji: '🍰', color: 'text-purple-700' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-xl p-3 border-2 border-stone-200 shadow-sm text-center"
                >
                  <div className="text-3xl mb-1">{s.emoji}</div>
                  <div className="text-[10px] font-bold text-stone-500">{s.label}</div>
                  <div className={`font-extrabold text-lg tabular-nums mt-0.5 ${s.color}`}>{s.value}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </Card>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="bg-gradient-to-br from-amber-50 via-white to-pink-50 rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-white relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-extrabold text-stone-600"
              >
                ✕
              </button>
              <div className="text-center mb-5">
                <div className="text-6xl mb-2">📚</div>
                <div className="font-extrabold text-2xl text-amber-800">猫咪点心店 · 游戏指南</div>
                <div className="text-sm text-amber-600 mt-1">一起经营最可爱的猫咪甜点店吧！</div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { icon: '🏪', title: '店铺窗口', desc: '接待猫客，把成品拖到顾客身上完成交付。顾客有耐心条，归零会生气离开扣声誉！' },
                  { icon: '🍳', title: '厨房窗口', desc: '选择要制作的菜单，点击「制作」放入炉具。烹饪完成后点击「收取」放入成品台。也可以在这里购买食材、升级炉具、解锁新菜单。' },
                  { icon: '📋', title: '订单窗口', desc: '查看所有进行中的订单，完成日常目标领取奖励。偶尔会触发外卖大单，完成有丰厚报酬！' },
                  { icon: '🏠', title: '猫咪宿舍', desc: '雇佣更多猫员工帮你经营店铺，记得合理安排工作与休息时间，精力不足可是会效率低下的哦～' },
                  { icon: '🎨', title: '装饰商店', desc: '用赚到的金币购买桌椅、壁纸和各种可爱装饰，打造属于你自己的独特风格点心店！' },
                  { icon: '📖', title: '图鉴成就', desc: '查看顾客故事、营业数据、收集成就贴纸。解锁所有菜谱和故事可是资深店长的标志呢！' },
                  { icon: '⚙️', title: '存档设置', desc: '管理你的3个存档槽，调整游戏难度和音量。推荐开启自动存档，不怕丢失进度！' },
                ].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white/80 rounded-xl p-3 border-2 border-amber-200"
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-2xl shrink-0">{h.icon}</span>
                      <div>
                        <div className="font-extrabold text-stone-800">{h.title}</div>
                        <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">{h.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 text-center text-xs text-stone-500 font-bold">
                💡 小提示：顾客喜欢的餐品如果出现在订单里，他们会给更多小费哦～
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
