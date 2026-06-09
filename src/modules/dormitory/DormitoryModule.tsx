import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { CAT_EMPLOYEES, getCatEmployeeById } from '@/data/employees'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { clsx } from 'clsx'
import { BedDouble, ChefHat, UserCheck, Coins, Zap, Moon, Sun } from 'lucide-react'

export const DormitoryModule = () => {
  const employees = useGameStore((s) => s.employees)
  const ownedCatIds = useGameStore((s) => s.ownedCatIds)
  const coins = useGameStore((s) => s.coins)
  const day = useGameStore((s) => s.day)

  const hireEmployee = useGameStore((s) => s.hireEmployee)
  const setEmployeeStatus = useGameStore((s) => s.setEmployeeStatus)
  const assignEmployeeStation = useGameStore((s) => s.assignEmployeeStation)
  const showToast = useGameStore((s) => s.showToast)

  const [activeTab, setActiveTab] = useState<'working' | 'hire'>('working')

  const roleLabels: Record<string, { name: string; icon: string; color: string }> = {
    chef: { name: '厨师', icon: '👨‍🍳', color: 'from-orange-200 to-amber-200' },
    waiter: { name: '服务员', icon: '💁', color: 'from-sky-200 to-cyan-200' },
    cashier: { name: '收银员', icon: '💰', color: 'from-green-200 to-emerald-200' },
  }

  const stationLabels = [
    { id: 'kitchen', name: '厨房', icon: ChefHat },
    { id: 'floor', name: '大堂', icon: UserCheck },
    { id: 'register', name: '收银台', icon: Coins },
  ] as const

  return (
    <div className="h-full w-full">
      <Card variant="default" padding="none" className="h-full overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-fuchsia-100 border-b-2 border-purple-200 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="font-extrabold text-purple-800 text-lg flex items-center gap-2">
            <span className="text-2xl">🏠</span>猫咪宿舍 & 员工中心
            <span className="text-xs font-bold text-purple-600 bg-purple-200 px-2 py-0.5 rounded-full">
              已雇佣 {employees.length} 只
            </span>
          </div>
          <div className="flex-1" />
          <div className="flex gap-1 bg-white/70 p-1 rounded-xl border-2 border-purple-200">
            <button
              onClick={() => setActiveTab('working')}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-sm font-extrabold transition-all',
                activeTab === 'working'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-purple-700 hover:bg-purple-100'
              )}
            >
              💼 在职员工
            </button>
            <button
              onClick={() => setActiveTab('hire')}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-sm font-extrabold transition-all',
                activeTab === 'hire'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-purple-700 hover:bg-purple-100'
              )}
            >
              🐾 雇佣中心
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'working' ? (
              <motion.div
                key="working"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {employees.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-7xl mb-4">😿</div>
                    <div className="text-stone-500 font-extrabold text-xl">还没有员工呢...</div>
                    <div className="text-stone-400 text-sm mt-1">去雇佣中心请一只猫咪员工吧！</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employees.map((emp, i) => {
                      const def = getCatEmployeeById(emp.catDefId)
                      const role = roleLabels[def?.role || 'chef']
                      const stationBonus = (emp.level - 1) * 5
                      return (
                        <motion.div
                          key={emp.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`rounded-2xl p-5 border-2 bg-gradient-to-br ${role.color} border-white shadow-xl relative overflow-hidden`}
                        >
                          <div className="absolute -right-6 -top-6 text-[120px] opacity-10 rotate-12">
                            {def?.emoji}
                          </div>
                          <div className="relative">
                            <div className="flex items-start gap-4 mb-4">
                              <motion.div
                                animate={
                                  emp.status === 'resting'
                                    ? { y: [0, -4, 0], transition: { repeat: Infinity, duration: 3 } }
                                    : { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 2 } }
                                }
                                className="text-7xl shrink-0 drop-shadow-lg"
                              >
                                {def?.emoji}
                                {emp.status === 'resting' && (
                                  <motion.span
                                    animate={{ opacity: [0, 1, 0], y: -20 }}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                    className="absolute top-0 right-0 text-2xl"
                                  >
                                    💤
                                  </motion.span>
                                )}
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-extrabold text-2xl text-stone-800 flex items-center gap-2">
                                      {emp.nickname}
                                      <span className="text-xs font-bold bg-white/80 text-purple-700 px-2 py-0.5 rounded-full">
                                        Lv.{emp.level}
                                      </span>
                                    </div>
                                    <div className="text-sm text-stone-600 font-bold mt-0.5">
                                      {role.icon} {def?.name}
                                    </div>
                                  </div>
                                  <span
                                    className={clsx(
                                      'text-xs font-extrabold px-3 py-1 rounded-full shrink-0',
                                      emp.status === 'working'
                                        ? 'bg-green-500 text-white'
                                        : emp.status === 'resting'
                                        ? 'bg-blue-400 text-white'
                                        : 'bg-red-400 text-white'
                                    )}
                                  >
                                    {emp.status === 'working' && <Sun size={12} className="inline mr-1" />}
                                    {emp.status === 'resting' && <Moon size={12} className="inline mr-1" />}
                                    {emp.status === 'working' ? '工作中' : emp.status === 'resting' ? '休息中' : '疲劳'}
                                  </span>
                                </div>

                                <div className="mt-3 space-y-2">
                                  <div className="bg-white/80 rounded-lg px-3 py-2 border border-stone-300">
                                    <div className="text-[11px] font-bold text-purple-700 flex items-center justify-between">
                                      <span>🎖️ 当前岗位加成</span>
                                      <span className="text-green-700">+{stationBonus}%</span>
                                    </div>
                                    <div className="text-[10px] text-stone-500 mt-0.5">
                                      {emp.assignedStation === 'kitchen' && '提升烹饪速度 + 缩短顾客等餐'}
                                      {emp.assignedStation === 'floor' && '提升顾客耐心 + 小费几率'}
                                      {emp.assignedStation === 'register' && '提升收银效率 + 金币收入'}
                                      {!emp.assignedStation && '分配岗位后生效'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1">
                                      <span>经验值</span>
                                      <span>{Math.floor(emp.exp)}/{emp.expToNext}</span>
                                    </div>
                                    <ProgressBar value={emp.exp} max={emp.expToNext} size="sm" color="pink" />
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-[11px] font-bold text-stone-600 mb-1">
                                      <span className="flex items-center gap-1"><Zap size={12} /> 精力值</span>
                                      <span>{Math.floor(emp.energy)}/{emp.maxEnergy}</span>
                                    </div>
                                    <ProgressBar value={emp.energy} max={emp.maxEnergy} size="sm" color="blue" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/60 rounded-xl p-3 mb-3">
                              <div className="text-xs font-extrabold text-stone-700 mb-2">✨ 技能与特性</div>
                              <div className="flex flex-wrap gap-1.5">
                                {def?.skills.map((sk, i) => (
                                  <span
                                    key={i}
                                    className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-lg border border-amber-300"
                                  >
                                    ⭐ {sk}
                                  </span>
                                ))}
                              </div>
                              <div className="text-[11px] text-stone-600 mt-2 italic border-t border-stone-300 pt-2">
                                &ldquo;{def?.description}&rdquo;
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <div className="text-xs font-bold text-stone-600 mb-1.5">📍 分配岗位</div>
                                <div className="flex gap-1.5">
                                  {stationLabels.map((st) => (
                                    <button
                                      key={st.id}
                                      onClick={() => assignEmployeeStation(emp.id, st.id)}
                                      className={clsx(
                                        'flex-1 px-3 py-2 rounded-xl text-xs font-extrabold border-2 transition-all flex items-center justify-center gap-1',
                                        emp.assignedStation === st.id
                                          ? 'bg-purple-500 text-white border-purple-700 shadow-md scale-105'
                                          : 'bg-white text-stone-600 border-stone-200 hover:bg-purple-50 hover:border-purple-300'
                                      )}
                                    >
                                      <st.icon size={14} />
                                      {st.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {emp.status === 'working' ? (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={<BedDouble size={14} />}
                                    fullWidth
                                    onClick={() => {
                                      setEmployeeStatus(emp.id, 'resting')
                                      showToast({ type: 'info', title: `${emp.nickname}去休息啦～`, emoji: '😴', duration: 1500 })
                                    }}
                                  >
                                    💤 安排休息
                                  </Button>
                                ) : (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    icon={<Sun size={14} />}
                                    fullWidth
                                    onClick={() => {
                                      if (emp.energy < 30) {
                                        showToast({ type: 'warning', title: '精力不足，再多休息一会儿吧', emoji: '😪', duration: 1800 })
                                        return
                                      }
                                      setEmployeeStatus(emp.id, 'working')
                                      showToast({ type: 'success', title: `${emp.nickname}充满活力地开工！`, emoji: '💪', duration: 1500 })
                                    }}
                                  >
                                    ☀️ 开始工作
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="hire"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border-2 border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🐾</span>
                    <div>
                      <div className="font-extrabold text-amber-900 text-lg">猫咪雇佣中心</div>
                      <div className="text-sm text-amber-700 font-bold">
                        找到最适合你店铺的猫咪伙伴吧～ 💰 当前金币：{coins}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CAT_EMPLOYEES.map((cat, i) => {
                    const owned = ownedCatIds.includes(cat.id)
                    const role = roleLabels[cat.role]
                    const canAfford = coins >= cat.baseCost
                    return (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={!owned ? { y: -6, scale: 1.02 } : {}}
                        className={clsx(
                          'rounded-2xl border-2 p-5 relative overflow-hidden transition-all',
                          owned
                            ? 'bg-gradient-to-br from-stone-100 to-stone-50 border-stone-300 opacity-75'
                            : `bg-gradient-to-br ${role.color} border-white shadow-xl`
                        )}
                      >
                        {owned && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg z-10">
                            ✅ 已雇佣
                          </div>
                        )}
                        <div className="text-center mb-3">
                          <motion.span
                            animate={!owned ? { y: [0, -8, 0], rotate: [0, 5, -5, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            className="text-7xl inline-block drop-shadow-lg"
                          >
                            {cat.emoji}
                          </motion.span>
                        </div>
                        <div className="text-center mb-2">
                          <div className="font-extrabold text-xl text-stone-800">{cat.name}</div>
                          <div className="text-xs font-bold bg-white/70 inline-block px-2 py-0.5 rounded-full mt-1 text-stone-700">
                            {role.icon} {role.name}
                          </div>
                        </div>

                        <div className="bg-white/60 rounded-xl p-3 mb-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-orange-100 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-stone-500">⚡ 速度</div>
                              <div className="font-extrabold text-orange-700">x{cat.baseSpeed}</div>
                            </div>
                            <div className="bg-sky-100 rounded-lg px-2 py-1.5 text-center">
                              <div className="font-bold text-stone-500">💪 耐力</div>
                              <div className="font-extrabold text-sky-700">{cat.baseStamina}</div>
                            </div>
                          </div>
                          <div className="text-[11px] text-stone-600 italic">
                            &ldquo;{cat.description}&rdquo;
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-stone-600 mb-1">🎯 技能</div>
                            <div className="flex flex-wrap gap-1">
                              {cat.skills.map((sk, i) => (
                                <span key={i} className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant={owned ? 'ghost' : canAfford ? 'primary' : 'danger'}
                          fullWidth
                          icon={owned ? null : <Coins size={14} />}
                          onClick={() => !owned && canAfford && hireEmployee(cat.id)}
                          disabled={owned || !canAfford}
                          size="lg"
                        >
                          {owned ? '🎉 已加入团队' : canAfford ? `雇佣 💰${cat.baseCost}` : `💰 金币不足 (${cat.baseCost})`}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-t-2 border-purple-200 text-center">
          <div className="text-xs text-purple-700 font-bold">
            🏠 第 {day} 天 · 好好照顾你的猫咪员工们，他们会给你带来更多收益的！
          </div>
        </div>
      </Card>
    </div>
  )
}
