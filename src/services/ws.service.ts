import { ref } from 'vue'
import { Client as StompClient, type IMessage } from '@stomp/stompjs'

let stompClient: StompClient | null = null

const isConnected = ref(false)
const activeSubscriptions = ref(0)

// Cada tópico guardado: su callback y la suscripción interna STOMP
const subscriptions: Record<string, { callback: (msg: any) => void; stompSubscription: any }> = {}
//con este servicio me conecto al backend para conexión bidireccional
export const webSocketService = () => {
  const connect = (token: string) => {
    if (isConnected.value) return

    stompClient = new StompClient({
      brokerURL: 'ws://localhost:8080/notifier',
      connectHeaders: { Authorization: `Bearer ${token}` },

      // 🔄 Reintento automático de reconexión
      reconnectDelay: 5000,

      onConnect: () => {
        isConnected.value = true
        console.log('WebSocket connected')

        // 🔄 Re-suscribir todos los tópicos después de reconectar
        Object.keys(subscriptions).forEach((topic) => {
          const sub = subscriptions[topic]
          if (sub) subscribe(topic, sub.callback)
        })
      },

      onStompError(error) {
        console.error('STOMP error:', error)
        isConnected.value = false
      },

      onWebSocketClose() {
        console.log('WebSocket closed')
        isConnected.value = false
      },

      onWebSocketError(error) {
        console.error('WebSocket error:', error)
        isConnected.value = false
      },
    })

    stompClient.activate()
  }

  const subscribe = (topic: string, callback: (msg: any) => void) => {
    // Si NO está conectado -> almacenar suscripción para cuando conecte
    if (!stompClient || !isConnected.value) {
      subscriptions[topic] = { callback, stompSubscription: null }
      return
    }

    activeSubscriptions.value++

    const stompSubscription = stompClient.subscribe(topic, (message: IMessage) => {
      try {
        const parsed = JSON.parse(message.body)
        callback(parsed)
      } catch (e) {
        console.error('Invalid JSON message:', message.body)
      }
    })

    subscriptions[topic] = { callback, stompSubscription }
  }

  const unsubscribe = (topic: string) => {
    if (subscriptions[topic]) {
      const { stompSubscription } = subscriptions[topic]

      if (stompSubscription?.unsubscribe) {
        stompSubscription.unsubscribe()
      }

      delete subscriptions[topic]
      activeSubscriptions.value--
    }
  }

  const disconnect = () => {
    // Solo cerrar si no quedan subs activas
    if (stompClient && activeSubscriptions.value === 0) {
      stompClient.deactivate()
      stompClient = null
      isConnected.value = false
    }
  }

  return {
    isConnected,
    connect,
    subscribe,
    unsubscribe,
    disconnect,
  }
}
