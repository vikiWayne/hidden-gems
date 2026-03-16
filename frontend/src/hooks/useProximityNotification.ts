import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function useProximityNotification() {
  const { proximityState, selectedMessage } = useAppStore()
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (proximityState !== 'near' || !selectedMessage) {
      notifiedRef.current = false
      return
    }
    if (selectedMessage.isOwn) return

    const requestPermission = async () => {
      if (!('Notification' in window)) return
      if (Notification.permission === 'granted') return
      if (Notification.permission !== 'denied') {
        await Notification.requestPermission()
      }
    }

    const showNotification = async () => {
      await requestPermission()
      if (Notification.permission === 'granted' && !notifiedRef.current) {
        new Notification('TapTag — Almost there!', {
          body: `You're getting close to a tag. Keep walking to unlock it!`,
          icon: '/vite.svg',
        })
        notifiedRef.current = true
      }
    }

    showNotification()
  }, [proximityState, selectedMessage])
}
