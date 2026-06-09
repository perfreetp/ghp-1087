import { create } from 'zustand'
import type {
  GameState,
  ModuleId,
  SaveSlot,
  Order,
  CustomerInstance,
  Employee,
  CookingSlot,
  PreparedItem,
  DailyGoal,
  ToastMessage,
  Achievement,
  GameSettings,
  ActiveDecor,
  Statistics,
} from '@/types'
import { RECIPES, getRecipeById } from '@/data/recipes'
import { DEFAULT_INVENTORY } from '@/data/ingredients'
import { CUSTOMERS } from '@/data/customers'
import { CAT_EMPLOYEES, getCatEmployeeById } from '@/data/employees'
import { INITIAL_ACHIEVEMENTS } from '@/data/achievements'
import { uid, randomChoice, randomInt, clamp } from '@/utils'
import { loadFromStorage, saveToStorage, deleteFromStorage } from '@/utils/storage'

const INITIAL_SETTINGS: GameSettings = {
  difficulty: 'relaxed',
  autoSave: true,
  autoSaveInterval: 60000,
  masterVolume: 0.7,
  showTutorial: true,
}

const INITIAL_STATISTICS: Statistics = {
  totalCoinsEarned: 0,
  totalCustomersServed: 0,
  totalOrdersCompleted: 0,
  totalDeliveriesCompleted: 0,
  totalRecipesCooked: 0,
  totalTipsReceived: 0,
  favoriteRecipeId: null,
  busiestDay: 0,
  perfectDayCount: 0,
  playTimeSeconds: 0,
}

const INITIAL_ACTIVE_DECOR: ActiveDecor = {
  wallpaperId: 'wall-cream',
  floorId: 'floor-wood',
  furnitureIds: ['table-wood', 'chair-wood', 'chair-wood'],
  decorationIds: ['deco-plant'],
}

const INITIAL_DAILY_GOALS: DailyGoal[] = [
  { id: 'goal-1', title: '新手任务', description: '完成5份订单', target: 5, current: 0, reward: 100, completed: false, claimed: false },
  { id: 'goal-2', title: '点心师傅', description: '制作8份点心', target: 8, current: 0, reward: 80, completed: false, claimed: false },
  { id: 'goal-3', title: '人气店铺', description: '接待10位顾客', target: 10, current: 0, reward: 120, completed: false, claimed: false },
]

const MAX_CUSTOMERS = 5
const COOKING_SLOTS_COUNT = 6

interface GameStore extends GameState {
  init: () => void
  setActiveModule: (module: ModuleId) => void
  updateSettings: (patch: Partial<GameSettings>) => void

  createSlot: (name: string) => void
  loadSlot: (slotId: string) => void
  saveSlot: () => void
  deleteSlot: (slotId: string) => void
  quickSave: () => void

  addCoins: (amount: number, reason?: string) => void
  spendCoins: (amount: number) => boolean
  addReputation: (amount: number) => void

  spawnCustomer: () => void
  deliverToCustomer: (customerInstanceId: string, preparedItemId: string) => void
  customerLeave: (customerInstanceId: string, happy: boolean) => void

  createOrder: (customerInstanceId: string) => Order
  deliverOrder: (orderId: string, recipeIds: string[]) => void
  cancelOrder: (orderId: string) => void

  hasIngredients: (recipeId: string) => boolean
  startCooking: (recipeId: string, slotIndex: number) => boolean
  updateCooking: () => void
  collectCooked: (slotIndex: number) => void

  setPrepRecipe: (station: 'oven' | 'pot' | 'fridge', recipeId: string | null) => void
  addIngredientToPrep: (station: 'oven' | 'pot' | 'fridge', ingredientId: string) => boolean
  removeIngredientFromPrep: (station: 'oven' | 'pot' | 'fridge', ingredientIdx: number) => void
  clearPrep: (station: 'oven' | 'pot' | 'fridge') => void
  startCookingFromPrep: (station: 'oven' | 'pot' | 'fridge', slotIndex: number) => boolean

  buyIngredient: (ingredientId: string, amount: number) => boolean
  upgradeStation: (station: 'oven' | 'pot' | 'fridge') => boolean
  unlockRecipe: (recipeId: string) => boolean

  hireEmployee: (catDefId: string) => boolean
  setEmployeeStatus: (empId: string, status: Employee['status']) => void
  assignEmployeeStation: (empId: string, station: Employee['assignedStation']) => void

  buyDecor: (decorId: string) => boolean
  applyDecor: (decorId: string) => void

  showToast: (toast: Omit<ToastMessage, 'id'>) => void
  hideToast: () => void

  triggerDelivery: () => void
  deliverDelivery: () => boolean
  completeDelivery: () => void

  tickGame: (deltaMs: number) => void
  nextDay: () => void
  setPaused: (paused: boolean) => void
  checkAchievements: () => void
  claimDailyGoal: (goalId: string) => void
  unlockStory: (customerId: string) => void
}

const createInitialCookingSlots = (): CookingSlot[] => {
  const slots: CookingSlot[] = []
  for (let i = 0; i < COOKING_SLOTS_COUNT; i++) {
    slots.push({
      index: i,
      recipeId: null,
      startTime: null,
      endTime: null,
      progress: 0,
      stationType: i < 3 ? 'oven' : i < 5 ? 'pot' : 'fridge',
    })
  }
  return slots
}

const createInitialEmployees = (): Employee[] => {
  const starter = CAT_EMPLOYEES[0]
  return [
    {
      id: 'emp-starter',
      catDefId: starter.id,
      nickname: starter.name.split('·')[1] || starter.name,
      level: 1,
      exp: 0,
      expToNext: 100,
      status: 'working',
      energy: 100,
      maxEnergy: 100,
      assignedStation: 'kitchen',
      hiredAt: Date.now(),
    },
  ]
}

const createInitialCookingPreps = (): GameState['cookingPreps'] => [
  { stationType: 'oven', targetRecipeId: null, addedIngredients: [] },
  { stationType: 'pot', targetRecipeId: null, addedIngredients: [] },
  { stationType: 'fridge', targetRecipeId: null, addedIngredients: [] },
]

export const useGameStore = create<GameStore>((set, get) => ({
  settings: { ...INITIAL_SETTINGS },
  slots: [],
  currentSlotId: null,
  activeModule: 'SHOP',

  coins: 150,
  reputation: 0,
  day: 1,
  timeOfDay: 480,

  unlockedRecipeIds: ['donut-plain', 'donut-chocolate', 'tea-milk', 'pudding-egg'],
  inventory: { ...DEFAULT_INVENTORY },
  ovenLevel: 1,
  potLevel: 1,
  fridgeLevel: 1,

  customers: [],
  orders: [],
  cookingSlots: createInitialCookingSlots(),
  cookingPreps: createInitialCookingPreps(),
  preparedItems: [],

  employees: createInitialEmployees(),
  ownedCatIds: ['cat-chef-1'],

  ownedDecorIds: ['wall-cream', 'floor-wood', 'table-wood', 'chair-wood', 'deco-plant'],
  activeDecor: { ...INITIAL_ACTIVE_DECOR },

  unlockedCustomerStoryIds: [],
  achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
  statistics: { ...INITIAL_STATISTICS },
  dailyGoals: INITIAL_DAILY_GOALS.map((g) => ({ ...g })),

  deliveryOrder: null,
  toast: null,
  isPaused: false,

  init: () => {
    const slotsData = loadFromStorage<SaveSlot[]>('slots-index')
    if (slotsData) set({ slots: slotsData })
  },

  setActiveModule: (module) => set({ activeModule: module }),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  createSlot: (name) => {
    const slotId = 'slot-' + uid()
    const slot: SaveSlot = {
      id: slotId,
      name,
      savedAt: Date.now(),
      day: 1,
      totalPlayTime: 0,
    }
    const newEmployees = createInitialEmployees()
    const newState: Partial<GameState> = {
      coins: 150,
      reputation: 0,
      day: 1,
      timeOfDay: 480,
      unlockedRecipeIds: ['donut-plain', 'donut-chocolate', 'tea-milk', 'pudding-egg'],
      inventory: { ...DEFAULT_INVENTORY },
      ovenLevel: 1,
      potLevel: 1,
      fridgeLevel: 1,
      customers: [],
      orders: [],
      cookingSlots: createInitialCookingSlots(),
      cookingPreps: createInitialCookingPreps(),
      preparedItems: [],
      employees: newEmployees,
      ownedCatIds: ['cat-chef-1'],
      ownedDecorIds: ['wall-cream', 'floor-wood', 'table-wood', 'chair-wood', 'deco-plant'],
      activeDecor: { ...INITIAL_ACTIVE_DECOR },
      unlockedCustomerStoryIds: [],
      achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
      statistics: { ...INITIAL_STATISTICS },
      dailyGoals: INITIAL_DAILY_GOALS.map((g) => ({ ...g })),
      deliveryOrder: null,
      currentSlotId: slotId,
    }
    saveToStorage(slotId, { ...newState, settings: get().settings })
    set((s) => {
      const newSlots = [...s.slots, slot]
      saveToStorage('slots-index', newSlots)
      return { ...newState, slots: newSlots }
    })
  },

  loadSlot: (slotId) => {
    const data = loadFromStorage<Partial<GameState>>(slotId)
    if (data) {
      const migrated: Partial<GameState> = { ...data }
      if (!migrated.cookingPreps || migrated.cookingPreps.length === 0) {
        migrated.cookingPreps = createInitialCookingPreps()
      }
      if (migrated.employees) {
        migrated.employees = migrated.employees.map((e) => ({
          ...e,
          expToNext: e.expToNext || Math.floor(100 * Math.pow(1.3, (e.level || 1) - 1)),
          energy: typeof e.energy === 'number' ? e.energy : 100,
          maxEnergy: e.maxEnergy || 100,
          status: e.status || 'working',
        }))
      }
      if (migrated.statistics) {
        migrated.statistics = {
          ...INITIAL_STATISTICS,
          ...migrated.statistics,
          totalDeliveriesCompleted: migrated.statistics.totalDeliveriesCompleted || 0,
        }
      } else {
        migrated.statistics = { ...INITIAL_STATISTICS }
      }
      if (migrated.cookingSlots) {
        migrated.cookingSlots = migrated.cookingSlots.map((s, i) => ({
          ...s,
          stationType: s.stationType || (i < 3 ? 'oven' : i < 5 ? 'pot' : 'fridge'),
        }))
      }
      set({ ...migrated, currentSlotId: slotId, activeModule: 'SHOP' })
    }
  },

  saveSlot: () => {
    const state = get()
    if (!state.currentSlotId) return
    const slotIndex = state.slots.findIndex((s) => s.id === state.currentSlotId)
    if (slotIndex >= 0) {
      const updatedSlot: SaveSlot = {
        ...state.slots[slotIndex],
        savedAt: Date.now(),
        day: state.day,
        totalPlayTime: state.statistics.playTimeSeconds,
      }
      const newSlots = [...state.slots]
      newSlots[slotIndex] = updatedSlot
      saveToStorage('slots-index', newSlots)
      saveToStorage(state.currentSlotId, state)
      set({ slots: newSlots })
      get().showToast({ type: 'success', title: '存档成功！', emoji: '💾', duration: 1500 })
    }
  },

  deleteSlot: (slotId) => {
    set((s) => {
      const newSlots = s.slots.filter((slot) => slot.id !== slotId)
      deleteFromStorage(slotId)
      saveToStorage('slots-index', newSlots)
      return {
        slots: newSlots,
        currentSlotId: s.currentSlotId === slotId ? null : s.currentSlotId,
      }
    })
  },

  quickSave: () => {
    const state = get()
    if (!state.currentSlotId || !state.settings.autoSave) return
    const slotIndex = state.slots.findIndex((s) => s.id === state.currentSlotId)
    if (slotIndex >= 0) {
      const updatedSlot: SaveSlot = {
        ...state.slots[slotIndex],
        savedAt: Date.now(),
        day: state.day,
        totalPlayTime: state.statistics.playTimeSeconds,
      }
      const newSlots = [...state.slots]
      newSlots[slotIndex] = updatedSlot
      saveToStorage('slots-index', newSlots)
      saveToStorage(state.currentSlotId, state)
      set({ slots: newSlots })
    }
  },

  addCoins: (amount, reason) => {
    set((s) => ({
      coins: s.coins + amount,
      statistics: {
        ...s.statistics,
        totalCoinsEarned: s.statistics.totalCoinsEarned + amount,
      },
    }))
    if (reason === 'tip') {
      set((s) => ({
        statistics: {
          ...s.statistics,
          totalTipsReceived: s.statistics.totalTipsReceived + amount,
        },
      }))
    }
  },

  spendCoins: (amount) => {
    const state = get()
    if (state.coins < amount) {
      get().showToast({ type: 'warning', title: '金币不足！', emoji: '😿', duration: 1500 })
      return false
    }
    set({ coins: state.coins - amount })
    return true
  },

  addReputation: (amount) => {
    set((s) => ({ reputation: Math.max(0, s.reputation + amount) }))
  },

  spawnCustomer: () => {
    const state = get()
    if (state.customers.length >= MAX_CUSTOMERS) return
    const availableCustomers = CUSTOMERS.filter((c) => {
      if (['cat-orange', 'cat-black', 'cat-white'].includes(c.id)) return true
      if (c.id === 'cat-calico' && state.statistics.totalCustomersServed >= 10) return true
      if (c.id === 'cat-gray' && state.statistics.totalRecipesCooked >= 20) return true
      if (c.id === 'cat-persian' && state.statistics.totalCoinsEarned >= 500) return true
      if (c.id === 'cat-siamese' && state.unlockedRecipeIds.length >= 5) return true
      if (c.id === 'cat-tabby' && state.day >= 3) return true
      if (c.id === 'cat-ragdoll' && state.statistics.perfectDayCount >= 1) return true
      if (c.id === 'cat-maine' && state.day >= 5 && state.statistics.totalCustomersServed >= 50) return true
      return false
    })
    const def = randomChoice(availableCustomers)
    const difficultyMult = state.settings.difficulty === 'relaxed' ? 1.3 : 0.9
    const maxPatience = Math.floor((30000 + randomInt(0, 20000)) * def.patienceMultiplier * difficultyMult)
    const instance: CustomerInstance = {
      instanceId: 'cust-' + uid(),
      customerDefId: def.id,
      status: 'waiting',
      patience: maxPatience,
      maxPatience,
      orderId: null,
      seatIndex: state.customers.length,
      arrivalTime: Date.now(),
      mood: 'happy',
    }
    const order = get().createOrder(instance.instanceId)
    instance.orderId = order.id
    set((s) => ({
      customers: [...s.customers, instance],
      orders: [...s.orders, order],
    }))
  },

  createOrder: (customerInstanceId) => {
    const state = get()
    const customer = CUSTOMERS.find((c) => state.customers.find((cs) => cs.instanceId === customerInstanceId)?.customerDefId === c.id)
    const availableRecipes = state.unlockedRecipeIds
    const preferredRecipes = customer?.favoriteRecipes.filter((r) => availableRecipes.includes(r)) || []
    const numItems = randomInt(1, 2)
    const recipeIds: string[] = []
    for (let i = 0; i < numItems; i++) {
      if (preferredRecipes.length > 0 && Math.random() < 0.7) {
        recipeIds.push(randomChoice(preferredRecipes))
      } else {
        recipeIds.push(randomChoice(availableRecipes))
      }
    }
    const difficultyMult = state.settings.difficulty === 'relaxed' ? 1.2 : 0.9
    return {
      id: 'order-' + uid(),
      customerInstanceId,
      recipeIds,
      deliveredRecipes: [],
      createdAt: Date.now(),
      timeLimit: numItems * 25000 * difficultyMult,
      baseReward: recipeIds.reduce((sum, id) => sum + (getRecipeById(id)?.basePrice || 0), 0),
      tipChance: (customer?.tipMultiplier || 1) * 0.4,
      isDelivery: false,
      status: 'pending',
    }
  },

  deliverOrder: (orderId, recipeIds) => {
    set((s) => {
      const order = s.orders.find((o) => o.id === orderId)
      if (!order) return {}
      const customer = s.customers.find((c) => c.instanceId === order.customerInstanceId)
      if (!customer) return {}
      const allDelivered = recipeIds.length >= order.recipeIds.length
      const patienceRatio = customer.patience / customer.maxPatience
      let multiplier = 1
      if (patienceRatio > 0.6) multiplier = 1.2
      else if (patienceRatio < 0.2) multiplier = 0.6
      const reward = Math.floor(order.baseReward * multiplier)
      const gotTip = Math.random() < order.tipChance * patienceRatio
      const tip = gotTip ? Math.floor(reward * randomInt(20, 50) / 100) : 0
      const newCustomers = s.customers.map((c) =>
        c.instanceId === customer.instanceId
          ? { ...c, status: 'eating' as const, mood: (multiplier >= 1 ? 'happy' : 'neutral') as CustomerInstance['mood'] }
          : c
      )
      const newOrders = s.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'completed' as const, deliveredRecipes: recipeIds } : o
      )
      const newGoals = s.dailyGoals.map((g) => {
        let cur = g.current
        if (g.id === 'goal-1') cur += 1
        return { ...g, current: cur, completed: cur >= g.target }
      })
      return {
        orders: newOrders,
        customers: newCustomers,
        coins: s.coins + reward + tip,
        reputation: s.reputation + (multiplier >= 1 ? 3 : multiplier >= 0.6 ? 1 : -1),
        statistics: {
          ...s.statistics,
          totalCoinsEarned: s.statistics.totalCoinsEarned + reward + tip,
          totalOrdersCompleted: s.statistics.totalOrdersCompleted + 1,
          totalTipsReceived: s.statistics.totalTipsReceived + tip,
        },
        dailyGoals: newGoals,
      }
    })
    get().showToast({
      type: 'success',
      title: '订单完成！',
      message: `获得金币+奖励`,
      emoji: '🎉',
      duration: 2000,
    })
    setTimeout(() => {
      const state = get()
      const order = state.orders.find((o) => o.id === orderId)
      if (order) get().customerLeave(order.customerInstanceId, true)
    }, 3000)
  },

  deliverToCustomer: (customerInstanceId, preparedItemId) => {
    const state = get()
    const order = state.orders.find((o) => o.customerInstanceId === customerInstanceId && o.status === 'pending')
    const item = state.preparedItems.find((p) => p.id === preparedItemId)
    if (!order || !item) return
    if (!order.recipeIds.includes(item.recipeId)) {
      get().showToast({ type: 'warning', title: '这不是顾客点的餐！', emoji: '🤔', duration: 1500 })
      return
    }
    const delivered = [...order.deliveredRecipes, item.recipeId]
    const remaining = [...order.recipeIds]
    for (const r of delivered) {
      const idx = remaining.indexOf(r)
      if (idx >= 0) remaining.splice(idx, 1)
    }
    set((s) => ({
      preparedItems: s.preparedItems.filter((p) => p.id !== preparedItemId),
    }))
    if (remaining.length === 0) {
      get().deliverOrder(order.id, delivered)
    } else {
      set((s) => ({
        orders: s.orders.map((o) => (o.id === order.id ? { ...o, deliveredRecipes: delivered } : o)),
      }))
      get().showToast({ type: 'info', title: '已送达一份', message: `还剩 ${remaining.length} 份`, emoji: '📦', duration: 1200 })
    }
  },

  customerLeave: (customerInstanceId, happy) => {
    set((s) => {
      const customer = s.customers.find((c) => c.instanceId === customerInstanceId)
      if (!customer) return {}
      const custDef = CUSTOMERS.find((c) => c.id === customer.customerDefId)
      const visitStory = !s.unlockedCustomerStoryIds.includes(customer.customerDefId) && happy && s.statistics.totalCustomersServed > 5
      return {
        customers: s.customers.filter((c) => c.instanceId !== customerInstanceId),
        orders: s.orders.filter((o) => o.customerInstanceId !== customerInstanceId),
        statistics: {
          ...s.statistics,
          totalCustomersServed: s.statistics.totalCustomersServed + (happy ? 1 : 0),
        },
        unlockedCustomerStoryIds: visitStory && custDef
          ? [...s.unlockedCustomerStoryIds, customer.customerDefId]
          : s.unlockedCustomerStoryIds,
        dailyGoals: s.dailyGoals.map((g) => {
          let cur = g.current
          if (g.id === 'goal-3' && happy) cur += 1
          return { ...g, current: cur, completed: cur >= g.target }
        }),
      }
    })
    if (happy) {
      get().checkAchievements()
    }
  },

  cancelOrder: (orderId) => {
    set((s) => {
      const order = s.orders.find((o) => o.id === orderId)
      if (!order) return {}
      return {
        orders: s.orders.filter((o) => o.id !== orderId),
        customers: s.customers.filter((c) => c.instanceId !== order.customerInstanceId),
      }
    })
  },

  hasIngredients: (recipeId) => {
    const recipe = getRecipeById(recipeId)
    if (!recipe) return false
    const inv = get().inventory
    return recipe.ingredientIds.every((id) => (inv[id] || 0) > 0)
  },

  startCooking: (recipeId, slotIndex) => {
    const state = get()
    const recipe = getRecipeById(recipeId)
    if (!recipe) return false
    if (!state.unlockedRecipeIds.includes(recipeId)) {
      get().showToast({ type: 'warning', title: '还未解锁该食谱！', duration: 1500 })
      return false
    }
    const slot = state.cookingSlots[slotIndex]
    if (!slot || slot.recipeId) {
      get().showToast({ type: 'warning', title: '该位置已被占用', duration: 1500 })
      return false
    }
    const correctStation = recipe.category === 'donut' ? 'oven' : recipe.category === 'tea' ? 'pot' : 'fridge'
    const stationName = correctStation === 'oven' ? '烤箱' : correctStation === 'pot' ? '煮锅' : '冰箱'
    if (slot.stationType !== correctStation) {
      get().showToast({ type: 'warning', title: `${recipe.name}只能放入${stationName}！`, duration: 1800 })
      return false
    }
    const stationLevel = correctStation === 'oven' ? state.ovenLevel : correctStation === 'pot' ? state.potLevel : state.fridgeLevel
    if (recipe.requiredLevel > stationLevel) {
      get().showToast({ type: 'warning', title: `需要${stationName}Lv.${recipe.requiredLevel}才能制作！`, duration: 2000 })
      return false
    }
    if (!get().hasIngredients(recipeId)) {
      get().showToast({ type: 'warning', title: '食材不足！', duration: 1500 })
      return false
    }
    const inv = { ...state.inventory }
    recipe.ingredientIds.forEach((id) => {
      inv[id] = (inv[id] || 0) - 1
    })
    const speedBonus = stationLevel * 0.08
    const cookTime = Math.floor(recipe.cookTime / (1 + speedBonus))
    const slots = [...state.cookingSlots]
    slots[slotIndex] = {
      ...slot,
      recipeId,
      startTime: Date.now(),
      endTime: Date.now() + cookTime,
      progress: 0,
    }
    set({ inventory: inv, cookingSlots: slots })
    return true
  },

  setPrepRecipe: (station, recipeId) => {
    set((s) => ({
      cookingPreps: s.cookingPreps.map((p) =>
        p.stationType === station ? { ...p, targetRecipeId: recipeId, addedIngredients: [] } : p
      ),
    }))
  },

  addIngredientToPrep: (station, ingredientId) => {
    const state = get()
    const prep = state.cookingPreps.find((p) => p.stationType === station)
    if (!prep) return false
    if (!prep.targetRecipeId) {
      get().showToast({ type: 'warning', title: '先在食谱上点击选好要做的点心！', duration: 1800 })
      return false
    }
    const recipe = getRecipeById(prep.targetRecipeId)
    if (!recipe) return false
    if ((state.inventory[ingredientId] || 0) <= 0) {
      get().showToast({ type: 'warning', title: '这个食材库存不够啦', duration: 1500 })
      return false
    }
    const needed = [...recipe.ingredientIds]
    for (const added of prep.addedIngredients) {
      const idx = needed.indexOf(added)
      if (idx >= 0) needed.splice(idx, 1)
    }
    if (!needed.includes(ingredientId)) {
      get().showToast({ type: 'info', title: '这个食材不需要啦', duration: 1200 })
      return false
    }
    const inv = { ...state.inventory, [ingredientId]: state.inventory[ingredientId] - 1 }
    const newAdded = [...prep.addedIngredients, ingredientId]
    const isComplete = newAdded.length === recipe.ingredientIds.length
    set({
      inventory: inv,
      cookingPreps: state.cookingPreps.map((p) =>
        p.stationType === station ? { ...p, addedIngredients: newAdded } : p
      ),
    })
    if (isComplete) {
      get().showToast({ type: 'success', title: '材料齐了！点炉具空位开始烹饪～', emoji: recipe.emoji, duration: 2000 })
    }
    return true
  },

  removeIngredientFromPrep: (station, ingredientIdx) => {
    const state = get()
    const prep = state.cookingPreps.find((p) => p.stationType === station)
    if (!prep) return
    const ingId = prep.addedIngredients[ingredientIdx]
    if (!ingId) return
    set({
      inventory: { ...state.inventory, [ingId]: (state.inventory[ingId] || 0) + 1 },
      cookingPreps: state.cookingPreps.map((p) =>
        p.stationType === station
          ? { ...p, addedIngredients: p.addedIngredients.filter((_, i) => i !== ingredientIdx) }
          : p
      ),
    })
  },

  clearPrep: (station) => {
    const state = get()
    const prep = state.cookingPreps.find((p) => p.stationType === station)
    if (!prep) return
    const inv = { ...state.inventory }
    prep.addedIngredients.forEach((id) => {
      inv[id] = (inv[id] || 0) + 1
    })
    set({
      inventory: inv,
      cookingPreps: state.cookingPreps.map((p) =>
        p.stationType === station ? { ...p, targetRecipeId: null, addedIngredients: [] } : p
      ),
    })
  },

  startCookingFromPrep: (station, slotIndex) => {
    const state = get()
    const prep = state.cookingPreps.find((p) => p.stationType === station)
    if (!prep || !prep.targetRecipeId) {
      get().showToast({ type: 'warning', title: '先把材料拖进准备台哦～', duration: 1500 })
      return false
    }
    const recipe = getRecipeById(prep.targetRecipeId)
    if (!recipe) return false
    if (prep.addedIngredients.length !== recipe.ingredientIds.length) {
      get().showToast({ type: 'warning', title: '材料还没凑齐！', duration: 1500 })
      return false
    }
    const slot = state.cookingSlots[slotIndex]
    if (!slot || slot.recipeId) {
      get().showToast({ type: 'warning', title: '这个炉位被占了', duration: 1500 })
      return false
    }
    if (slot.stationType !== station) {
      get().showToast({ type: 'warning', title: '这个炉位类型不对', duration: 1500 })
      return false
    }
    const stationLevel = station === 'oven' ? state.ovenLevel : station === 'pot' ? state.potLevel : state.fridgeLevel
    const speedBonus = stationLevel * 0.08
    const cookTime = Math.floor(recipe.cookTime / (1 + speedBonus))
    const slots = [...state.cookingSlots]
    slots[slotIndex] = {
      ...slot,
      recipeId: prep.targetRecipeId,
      startTime: Date.now(),
      endTime: Date.now() + cookTime,
      progress: 0,
    }
    set({
      cookingSlots: slots,
      cookingPreps: state.cookingPreps.map((p) =>
        p.stationType === station ? { ...p, targetRecipeId: null, addedIngredients: [] } : p
      ),
    })
    return true
  },

  updateCooking: () => {
    const now = Date.now()
    set((s) => ({
      cookingSlots: s.cookingSlots.map((slot) => {
        if (!slot.startTime || !slot.endTime) return slot
        const total = slot.endTime - slot.startTime
        const elapsed = now - slot.startTime
        const progress = clamp((elapsed / total) * 100, 0, 100)
        return { ...slot, progress }
      }),
    }))
  },

  collectCooked: (slotIndex) => {
    const state = get()
    const slot = state.cookingSlots[slotIndex]
    if (!slot || !slot.recipeId || slot.progress < 100) return
    const newItem: PreparedItem = {
      id: 'prep-' + uid(),
      recipeId: slot.recipeId,
      createdAt: Date.now(),
    }
    const slots = [...state.cookingSlots]
    slots[slotIndex] = {
      ...slots[slotIndex],
      recipeId: null,
      startTime: null,
      endTime: null,
      progress: 0,
    }
    set((s) => ({
      cookingSlots: slots,
      preparedItems: [...s.preparedItems, newItem],
      statistics: {
        ...s.statistics,
        totalRecipesCooked: s.statistics.totalRecipesCooked + 1,
      },
      dailyGoals: s.dailyGoals.map((g) => {
        let cur = g.current
        if (g.id === 'goal-2') cur += 1
        return { ...g, current: cur, completed: cur >= g.target }
      }),
    }))
    const recipe = getRecipeById(slot.recipeId)
    get().showToast({ type: 'success', title: `${recipe?.name || '点心'}做好啦！`, emoji: recipe?.emoji || '✨', duration: 1200 })
    get().checkAchievements()
  },

  buyIngredient: (ingredientId, amount) => {
    const ING = [
      { id: 'flour', baseCost: 5 }, { id: 'sugar', baseCost: 3 }, { id: 'egg', baseCost: 4 },
      { id: 'milk', baseCost: 6 }, { id: 'cream', baseCost: 10 }, { id: 'chocolate', baseCost: 12 },
      { id: 'strawberry', baseCost: 15 }, { id: 'matcha', baseCost: 14 }, { id: 'tea', baseCost: 6 },
      { id: 'tapioca', baseCost: 5 }, { id: 'taro', baseCost: 11 }, { id: 'honey', baseCost: 13 },
      { id: 'caramel', baseCost: 8 }, { id: 'mango', baseCost: 14 }, { id: 'redbean', baseCost: 7 },
    ]
    const ing = ING.find((i) => i.id === ingredientId)
    if (!ing) return false
    const cost = ing.baseCost * amount
    if (!get().spendCoins(cost)) return false
    set((s) => ({
      inventory: { ...s.inventory, [ingredientId]: (s.inventory[ingredientId] || 0) + amount },
    }))
    return true
  },

  upgradeStation: (station) => {
    const state = get()
    const costs = { oven: 200, pot: 180, fridge: 250 }
    const level = state[station + 'Level' as 'ovenLevel']
    const cost = costs[station] * level
    if (!get().spendCoins(cost)) return false
    set({ [station + 'Level']: level + 1 } as Partial<GameState>)
    get().showToast({ type: 'success', title: `${station === 'oven' ? '烤箱' : station === 'pot' ? '煮锅' : '冰箱'}升级成功！`, emoji: '🔧', duration: 1800 })
    return true
  },

  unlockRecipe: (recipeId) => {
    const state = get()
    const recipe = getRecipeById(recipeId)
    if (!recipe) return false
    if (state.unlockedRecipeIds.includes(recipeId)) return false
    const cost = recipe.basePrice * 3
    if (!get().spendCoins(cost)) return false
    set((s) => ({ unlockedRecipeIds: [...s.unlockedRecipeIds, recipeId] }))
    get().showToast({ type: 'success', title: `解锁新食谱：${recipe.name}`, emoji: recipe.emoji, duration: 2000 })
    get().checkAchievements()
    return true
  },

  hireEmployee: (catDefId) => {
    const state = get()
    if (state.ownedCatIds.includes(catDefId)) return false
    const cat = getCatEmployeeById(catDefId)
    if (!cat) return false
    if (!get().spendCoins(cat.baseCost)) return false
    const newEmp: Employee = {
      id: 'emp-' + uid(),
      catDefId,
      nickname: cat.name.split('·')[1] || cat.name,
      level: 1,
      exp: 0,
      expToNext: 100,
      status: 'working',
      energy: cat.baseStamina,
      maxEnergy: cat.baseStamina,
      assignedStation: cat.role === 'chef' ? 'kitchen' : cat.role === 'waiter' ? 'floor' : 'register',
      hiredAt: Date.now(),
    }
    set((s) => ({
      employees: [...s.employees, newEmp],
      ownedCatIds: [...s.ownedCatIds, catDefId],
    }))
    get().showToast({ type: 'success', title: `${newEmp.nickname}加入了店铺！`, emoji: cat.emoji, duration: 2000 })
    get().checkAchievements()
    return true
  },

  setEmployeeStatus: (empId, status) => {
    set((s) => ({
      employees: s.employees.map((e) => (e.id === empId ? { ...e, status } : e)),
    }))
  },

  assignEmployeeStation: (empId, station) => {
    set((s) => ({
      employees: s.employees.map((e) => (e.id === empId ? { ...e, assignedStation: station } : e)),
    }))
  },

  buyDecor: (decorId) => {
    const DECOR = [
      { id: 'table-wood', price: 100 }, { id: 'table-marble', price: 450 }, { id: 'table-vintage', price: 800 },
      { id: 'chair-wood', price: 60 }, { id: 'chair-cushion', price: 280 }, { id: 'chair-throne', price: 1200 },
      { id: 'wall-cream', price: 80 }, { id: 'wall-pink', price: 250 }, { id: 'wall-starry', price: 650 },
      { id: 'floor-wood', price: 120 }, { id: 'floor-tile', price: 380 }, { id: 'floor-cloud', price: 900 },
      { id: 'deco-plant', price: 80 }, { id: 'deco-lamp', price: 320 }, { id: 'deco-fish', price: 550 },
      { id: 'deco-piano', price: 2000 }, { id: 'deco-cat-tree', price: 1500 },
    ]
    if (get().ownedDecorIds.includes(decorId)) return false
    const d = DECOR.find((x) => x.id === decorId)
    if (!d) return false
    if (!get().spendCoins(d.price)) return false
    set((s) => ({ ownedDecorIds: [...s.ownedDecorIds, decorId] }))
    get().showToast({ type: 'success', title: '购买成功！', emoji: '🛍️', duration: 1500 })
    get().checkAchievements()
    return true
  },

  applyDecor: (decorId) => {
    const CAT = ['table', 'chair', 'wallpaper', 'floor', 'decoration']
    const decorCat = decorId.startsWith('table') ? 'table' :
      decorId.startsWith('chair') ? 'chair' :
      decorId.startsWith('wall') ? 'wallpaper' :
      decorId.startsWith('floor') ? 'floor' : 'decoration'
    set((s) => {
      const decor = { ...s.activeDecor }
      if (decorCat === 'wallpaper') decor.wallpaperId = decorId
      else if (decorCat === 'floor') decor.floorId = decorId
      else if (decorCat === 'table') decor.furnitureIds = [...decor.furnitureIds.filter((f) => !f.startsWith('table')), decorId]
      else if (decorCat === 'chair') decor.furnitureIds = [...decor.furnitureIds.filter((f) => !f.startsWith('chair')), decorId, decorId]
      else if (decorCat === 'decoration') {
        if (decor.decorationIds.includes(decorId)) {
          decor.decorationIds = decor.decorationIds.filter((d) => d !== decorId)
        } else {
          decor.decorationIds = [...decor.decorationIds, decorId]
        }
      }
      return { activeDecor: decor }
    })
  },

  showToast: (toast) => {
    set({ toast: { ...toast, id: 'toast-' + uid() } })
    if (toast.duration > 0) {
      setTimeout(() => {
        if (get().toast?.id === 'toast-' + uid()) get().hideToast()
      }, toast.duration)
    }
  },

  hideToast: () => set({ toast: null }),

  triggerDelivery: () => {
    const state = get()
    if (state.deliveryOrder) return
    const availableRecipes = state.unlockedRecipeIds
    const count = randomInt(3, 6)
    const recipeIds: string[] = []
    for (let i = 0; i < count; i++) recipeIds.push(randomChoice(availableRecipes))
    const baseReward = recipeIds.reduce((sum, id) => sum + (getRecipeById(id)?.basePrice || 0), 0)
    const order: Order = {
      id: 'delivery-' + uid(),
      customerInstanceId: 'delivery-cat',
      recipeIds,
      deliveredRecipes: [],
      createdAt: Date.now(),
      timeLimit: 120000,
      baseReward: Math.floor(baseReward * 1.8),
      tipChance: 0.6,
      isDelivery: true,
      status: 'pending',
    }
    set({ deliveryOrder: order })
    get().showToast({ type: 'info', title: '外卖大单来了！', message: `共${count}份奖励丰厚`, emoji: '🛵', duration: 3000 })
  },

  deliverDelivery: () => {
    const state = get()
    if (!state.deliveryOrder) return false
    const required = [...state.deliveryOrder.recipeIds]
    const usedPrepIds: string[] = []
    for (const r of required) {
      const found = state.preparedItems.find((p) => !usedPrepIds.includes(p.id) && p.recipeId === r)
      if (!found) {
        get().showToast({ type: 'warning', title: '餐品还没备齐！', duration: 1800 })
        return false
      }
      usedPrepIds.push(found.id)
    }
    set((s) => ({ preparedItems: s.preparedItems.filter((p) => !usedPrepIds.includes(p.id)) }))
    get().completeDelivery()
    return true
  },

  completeDelivery: () => {
    set((s) => {
      if (!s.deliveryOrder) return {}
      const order = s.deliveryOrder
      const gotTip = Math.random() < order.tipChance
      const tip = gotTip ? Math.floor(order.baseReward * 0.4) : 0
      return {
        deliveryOrder: null,
        coins: s.coins + order.baseReward + tip,
        reputation: s.reputation + 5,
        statistics: {
          ...s.statistics,
          totalCoinsEarned: s.statistics.totalCoinsEarned + order.baseReward + tip,
          totalTipsReceived: s.statistics.totalTipsReceived + tip,
          totalOrdersCompleted: s.statistics.totalOrdersCompleted + 1,
          totalDeliveriesCompleted: s.statistics.totalDeliveriesCompleted + 1,
        },
      }
    })
    get().showToast({ type: 'success', title: '外卖完成！金币+声誉双丰收', emoji: '🏆', duration: 2500 })
    get().checkAchievements()
  },

  tickGame: (deltaMs) => {
    const state = get()
    if (state.isPaused || !state.currentSlotId) return
    const diffMult = state.settings.difficulty === 'relaxed' ? 0.85 : 1.15
    const deltaSeconds = deltaMs / 1000

    set((s) => {
      const customers = s.customers.map((c) => {
        let patience = c.patience - deltaMs * diffMult
        let mood: CustomerInstance['mood'] = c.mood
        let status: CustomerInstance['status'] = c.status
        const ratio = patience / c.maxPatience
        if (ratio > 0.5) mood = 'happy'
        else if (ratio > 0.2) mood = 'neutral'
        else mood = 'unhappy'
        if (patience <= 0) {
          status = 'angry'
          patience = 0
        }
        return { ...c, patience, mood, status }
      })

      const employees = s.employees.map((e) => {
        let energy = e.energy
        let exp = e.exp
        let level = e.level
        let expToNext = e.expToNext
        let status: Employee['status'] = e.status

        if (status === 'working') {
          energy -= deltaSeconds * 1.2
          if (energy <= 0) {
            energy = 0
            status = 'tired'
          } else {
            exp += deltaSeconds * (1 + level * 0.2)
          }
        } else if (status === 'resting' || status === 'tired') {
          energy = Math.min(e.maxEnergy, energy + deltaSeconds * 4)
          if (status === 'tired' && energy >= e.maxEnergy * 0.6) {
            status = 'resting'
          }
          if (energy >= e.maxEnergy) {
            energy = e.maxEnergy
            status = 'working'
          }
        }

        while (exp >= expToNext) {
          exp -= expToNext
          level += 1
          expToNext = Math.floor(100 * Math.pow(1.3, level - 1))
        }

        return { ...e, energy, exp, level, expToNext, status }
      })

      return {
        customers,
        employees,
        timeOfDay: s.timeOfDay + deltaSeconds,
        statistics: {
          ...s.statistics,
          playTimeSeconds: s.statistics.playTimeSeconds + deltaSeconds,
        },
      }
    })

    const leveledAny = get().employees.some((e, i) => e.level !== state.employees[i]?.level)
    if (leveledAny) {
      const diffs = get().employees.filter((e, i) => !state.employees[i] || e.level > state.employees[i].level)
      diffs.forEach((e) => {
        get().showToast({ type: 'achievement', title: `${e.nickname}升级了！`, message: `Lv.${e.level} 岗位加成+${(e.level - 1) * 5}%`, emoji: '🎖️', duration: 2800 })
      })
      get().checkAchievements()
    }

    get().updateCooking()
    const angry = get().customers.filter((c) => c.status === 'angry')
    angry.forEach((c) => get().customerLeave(c.instanceId, false))
  },

  nextDay: () => {
    set((s) => {
      const perfectDay = s.customers.filter((c) => c.mood === 'unhappy').length === 0 && s.day > 1
      return {
        day: s.day + 1,
        timeOfDay: 480,
        customers: [],
        orders: [],
        dailyGoals: INITIAL_DAILY_GOALS.map((g) => ({ ...g, id: 'goal-' + uid() })),
        statistics: {
          ...s.statistics,
          perfectDayCount: perfectDay ? s.statistics.perfectDayCount + 1 : s.statistics.perfectDayCount,
        },
      }
    })
    get().showToast({ type: 'success', title: `第 ${get().day} 天开始啦！`, emoji: '🌅', duration: 2000 })
  },

  setPaused: (paused) => set({ isPaused: paused }),

  checkAchievements: () => {
    const state = get()
    const stats = state.statistics
    const counts: Record<string, number> = {
      customersServed: stats.totalCustomersServed,
      coinsEarned: stats.totalCoinsEarned,
      recipesCooked: stats.totalRecipesCooked,
      recipesUnlocked: state.unlockedRecipeIds.length,
      storiesUnlocked: state.unlockedCustomerStoryIds.length,
      employeesHired: state.ownedCatIds.length,
      deliveriesCompleted: stats.totalDeliveriesCompleted,
      perfectDays: stats.perfectDayCount,
      decorOwned: state.ownedDecorIds.length,
    }
    set((s) => {
      let anyUnlocked = false
      const achievements = s.achievements.map((a) => {
        if (a.unlocked) return a
        const count = counts[a.condition.type] || 0
        if (count >= a.condition.target) {
          anyUnlocked = true
          setTimeout(() => {
            get().showToast({ type: 'achievement', title: `成就解锁：${a.title}`, message: a.description, emoji: a.emoji, duration: 3500 })
          }, 500)
          return { ...a, unlocked: true, unlockedAt: Date.now() }
        }
        return a
      })
      if (anyUnlocked) return { achievements }
      return {}
    })
  },

  claimDailyGoal: (goalId) => {
    set((s) => {
      const goals = s.dailyGoals.map((g) => {
        if (g.id !== goalId || !g.completed || g.claimed) return g
        return { ...g, claimed: true }
      })
      const goal = s.dailyGoals.find((g) => g.id === goalId)
      return {
        dailyGoals: goals,
        coins: goal && goal.completed && !goal.claimed ? s.coins + goal.reward : s.coins,
      }
    })
    const goal = get().dailyGoals.find((g) => g.id === goalId)
    if (goal) get().showToast({ type: 'success', title: `领取${goal.reward}金币奖励！`, emoji: '🎁', duration: 1800 })
  },

  unlockStory: (customerId) => {
    if (get().unlockedCustomerStoryIds.includes(customerId)) return
    set((s) => ({ unlockedCustomerStoryIds: [...s.unlockedCustomerStoryIds, customerId] }))
    get().checkAchievements()
  },
}))
