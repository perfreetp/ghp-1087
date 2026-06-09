import type { Ingredient } from '@/types'

export const INGREDIENTS: Ingredient[] = [
  { id: 'flour', name: '面粉', emoji: '🌾', baseCost: 5, category: 'base' },
  { id: 'sugar', name: '砂糖', emoji: '🍬', baseCost: 3, category: 'sweet' },
  { id: 'egg', name: '鸡蛋', emoji: '🥚', baseCost: 4, category: 'base' },
  { id: 'milk', name: '牛奶', emoji: '🥛', baseCost: 6, category: 'drink' },
  { id: 'cream', name: '奶油', emoji: '🍦', baseCost: 10, category: 'sweet' },
  { id: 'chocolate', name: '巧克力', emoji: '🍫', baseCost: 12, category: 'sweet' },
  { id: 'strawberry', name: '草莓', emoji: '🍓', baseCost: 15, category: 'topping' },
  { id: 'matcha', name: '抹茶粉', emoji: '🍵', baseCost: 14, category: 'base' },
  { id: 'tea', name: '红茶包', emoji: '🫖', baseCost: 6, category: 'drink' },
  { id: 'tapioca', name: '珍珠', emoji: '⚫', baseCost: 5, category: 'topping' },
  { id: 'taro', name: '香芋', emoji: '🟣', baseCost: 11, category: 'base' },
  { id: 'honey', name: '蜂蜜', emoji: '🍯', baseCost: 13, category: 'sweet' },
  { id: 'caramel', name: '焦糖', emoji: '🟤', baseCost: 8, category: 'sweet' },
  { id: 'mango', name: '芒果', emoji: '🥭', baseCost: 14, category: 'topping' },
  { id: 'redbean', name: '红豆', emoji: '🫘', baseCost: 7, category: 'topping' },
]

export const getIngredientById = (id: string): Ingredient | undefined =>
  INGREDIENTS.find((i) => i.id === id)

export const DEFAULT_INVENTORY: Record<string, number> = {
  flour: 20,
  sugar: 25,
  egg: 20,
  milk: 20,
  cream: 10,
  chocolate: 10,
  strawberry: 8,
  matcha: 8,
  tea: 15,
  tapioca: 15,
  taro: 8,
  honey: 8,
  caramel: 10,
  mango: 8,
  redbean: 10,
}
