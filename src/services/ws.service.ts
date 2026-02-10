import { ref } from 'vue'
import { Client as StompClient, type IMessage } from '@stomp/stompjs'

let stompClient: StompClient | null = null

const isConnected = ref(false)
const activeSubscriptions = ref(0)
let isActivating = false

/**
 * Servicio STOMP centralizado.
 * - Expone `connect/subscribe/unsubscribe/disconnect` para que los composables se suscriban sin gestionar sockets manualmente.
 * - Mantiene un registro de suscripciones para reanudar automáticamente tras reconexiones.
 * - Solo cierra la conexión cuando no quedan subs activas para evitar cortar otras vistas.
 */
// Cada tópico guardado: su callback y la suscripción interna STOMP
const subscriptions: Record<string, { callback: (msg: any) => void; stompSubscription: any }> = {}
//con este servicio me conecto al backend para conexión bidireccional
export const webSocketService = () => {
  const connect = (token: string) => {
    if (stompClient || isActivating) return

    isActivating = true

    stompClient = new StompClient({
      webSocketFactory: () => new WebSocket(import.meta.env.VITE_WS_URL),

      // Habilitar debug para ver mensajes STOMP en consola (útil en prod para diagnosticar suscripciones)
      debug: (msg: string) => console.debug('[STOMP]', msg),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,

      onConnect: () => {
        console.log('STOMP CONNECTED')
        console.log('Registered topics to subscribe:', Object.keys(subscriptions))
        isConnected.value = true
        isActivating = false

        Object.entries(subscriptions).forEach(([topic, sub]) => {
          if (!sub.stompSubscription) {
            sub.stompSubscription = stompClient!.subscribe(topic, (message: IMessage) => {
              try {
                sub.callback(JSON.parse(message.body))
              } catch {
                console.error('Invalid JSON message:', message.body)
              }
            })
            activeSubscriptions.value++
          }
        })
      },

      onWebSocketClose: () => {
        console.log('WebSocket closed')
        isConnected.value = false
        isActivating = false
        // marcar las suscripciones internas como "no activas" para que onConnect las resuscriba
        Object.keys(subscriptions).forEach((t) => {
          const sub = subscriptions[t]
          if (sub) {
            sub.stompSubscription = null
          }
        })
        // en este momento no hay subs activas
        activeSubscriptions.value = 0
        // NO hacer stompClient = null aquí — permitir que el cliente maneje la reconexión interna
      },

      onStompError: (frame) => {
        console.error('STOMP error', frame)
        isConnected.value = false
      },
    })

    stompClient.activate()
  }

  const subscribe = (topic: string, callback: (msg: any) => void) => {
    // registrar intención y actualizar callback
    if (!subscriptions[topic]) {
      subscriptions[topic] = { callback, stompSubscription: null }
    } else {
      subscriptions[topic].callback = callback
    }

    // todavía no conectado → listo
    if (!stompClient || !isConnected.value) return

    // ya existe suscripción activa → no volver a suscribir
    if (subscriptions[topic].stompSubscription) return

    subscriptions[topic].stompSubscription = stompClient.subscribe(topic, (message: IMessage) => {
      try {
        // usar siempre el callback registrado en el map (puede haber sido actualizado)
        const sub = subscriptions[topic]
        if (sub && sub.callback) {
          sub.callback(JSON.parse(message.body))
        }
      } catch (e) {
        console.error('Invalid JSON message:', message.body)
      }
    })

    activeSubscriptions.value++
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
