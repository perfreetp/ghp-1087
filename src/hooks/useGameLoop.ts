import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/useGameStore'

export const useGameLoop = () => {
  const lastTimeRef = useRef<number>(0)
  const spawnTimerRef = useRef<number>(0)
  const saveTimerRef = useRef<number>(0)
  const deliveryTimerRef = useRef<number>(0)
  const dayTimerRef = useRef<number>(0)

  useEffect(() => {
    let rafId: number
    const tick = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const delta = time - lastTimeRef.current
      lastTimeRef.current = time

      const store = useGameStore.getState()
      if (store.currentSlotId && !store.isPaused) {
        store.tickGame(delta)

        spawnTimerRef.current += delta
        if (spawnTimerRef.current > 8000 + Math.random() * 7000) {
          spawnTimerRef.current = 0
          store.spawnCustomer()
        }

        saveTimerRef.current += delta
        if (saveTimerRef.current > store.settings.autoSaveInterval) {
          saveTimerRef.current = 0
          store.quickSave()
        }

        deliveryTimerRef.current += delta
        if (deliveryTimerRef.current > 90000 && Math.random() < 0.3) {
          deliveryTimerRef.current = 0
          if (!store.deliveryOrder) store.triggerDelivery()
        }

        dayTimerRef.current += delta
        if (store.timeOfDay > 1200) {
          dayTimerRef.current = 0
          store.nextDay()
        }
      }

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])
}
