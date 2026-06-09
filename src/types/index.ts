export type Difficulty = 'relaxed' | 'challenge'

export type ModuleId = 'SHOP' | 'KITCHEN' | 'ORDERS' | 'DORMITORY' | 'DECOR' | 'COLLECTION' | 'SETTINGS'

export interface GameSettings {
  difficulty: Difficulty
  autoSave: boolean
  autoSaveInterval: number
  masterVolume: number
  showTutorial: boolean
}

export interface SaveSlot {
  id: string
  name: string
  savedAt: number
  day: number
  totalPlayTime: number
  thumbnail?: string
}

export interface Recipe {
  id: string
  name: string
  emoji: string
  category: 'donut' | 'tea' | 'pudding'
  ingredientIds: string[]
  cookTime: number
  basePrice: number
  requiredLevel: number
  description: string
}

export interface Ingredient {
  id: string
  name: string
  emoji: string
  baseCost: number
  category: 'base' | 'topping' | 'drink' | 'sweet'
}

export interface CustomerDefinition {
  id: string
  name: string
  emoji: string
  color: string
  personality: string
  patienceMultiplier: number
  tipMultiplier: number
  favoriteRecipes: string[]
  story: string
  unlockCondition: string
}

export interface CustomerInstance {
  instanceId: string
  customerDefId: string
  status: 'waiting' | 'seated' | 'ordering' | 'eating' | 'leaving' | 'angry'
  patience: number
  maxPatience: number
  orderId: string | null
  seatIndex: number | null
  arrivalTime: number
  mood: 'happy' | 'neutral' | 'unhappy'
}

export interface Order {
  id: string
  customerInstanceId: string
  recipeIds: string[]
  deliveredRecipes: string[]
  createdAt: number
  timeLimit: number
  baseReward: number
  tipChance: number
  isDelivery: boolean
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'failed'
}

export interface CatEmployeeDefinition {
  id: string
  name: string
  emoji: string
  role: 'chef' | 'waiter' | 'cashier'
  baseCost: number
  baseSpeed: number
  baseStamina: number
  description: string
  skills: string[]
}

export interface Employee {
  id: string
  catDefId: string
  nickname: string
  level: number
  exp: number
  expToNext: number
  status: 'working' | 'resting' | 'tired'
  energy: number
  maxEnergy: number
  assignedStation: 'kitchen' | 'floor' | 'register' | null
  hiredAt: number
}

export interface CookingSlot {
  index: number
  recipeId: string | null
  startTime: number | null
  endTime: number | null
  progress: number
  stationType: 'oven' | 'pot' | 'fridge'
}

export interface CookingPrep {
  stationType: 'oven' | 'pot' | 'fridge'
  targetRecipeId: string | null
  addedIngredients: string[]
}

export interface PreparedItem {
  id: string
  recipeId: string
  createdAt: number
}

export interface DecorItem {
  id: string
  name: string
  emoji: string
  category: 'table' | 'chair' | 'wallpaper' | 'floor' | 'decoration' | 'music'
  price: number
  rarity: 'common' | 'rare' | 'epic'
  bonus: { type: string; value: number } | null
  description: string
}

export interface ActiveDecor {
  wallpaperId: string | null
  floorId: string | null
  furnitureIds: string[]
  decorationIds: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  unlocked: boolean
  unlockedAt: number | null
  category: 'economy' | 'customer' | 'cooking' | 'collection' | 'special'
  condition: { type: string; target: number }
}

export interface DailyGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  reward: number
  completed: boolean
  claimed: boolean
}

export interface Statistics {
  totalCoinsEarned: number
  totalCustomersServed: number
  totalOrdersCompleted: number
  totalDeliveriesCompleted: number
  totalRecipesCooked: number
  totalTipsReceived: number
  favoriteRecipeId: string | null
  busiestDay: number
  perfectDayCount: number
  playTimeSeconds: number
}

export interface GameState {
  settings: GameSettings
  slots: SaveSlot[]
  currentSlotId: string | null
  activeModule: ModuleId

  coins: number
  reputation: number
  day: number
  timeOfDay: number

  unlockedRecipeIds: string[]
  inventory: Record<string, number>
  ovenLevel: number
  potLevel: number
  fridgeLevel: number

  customers: CustomerInstance[]
  orders: Order[]
  cookingSlots: CookingSlot[]
  cookingPreps: CookingPrep[]
  preparedItems: PreparedItem[]

  employees: Employee[]
  ownedCatIds: string[]

  ownedDecorIds: string[]
  activeDecor: ActiveDecor

  unlockedCustomerStoryIds: string[]
  achievements: Achievement[]
  statistics: Statistics
  dailyGoals: DailyGoal[]

  deliveryOrder: Order | null
  toast: ToastMessage | null
  isPaused: boolean
}

export interface ToastMessage {
  id: string
  type: 'success' | 'warning' | 'error' | 'info' | 'achievement'
  title: string
  message?: string
  emoji?: string
  duration: number
}
