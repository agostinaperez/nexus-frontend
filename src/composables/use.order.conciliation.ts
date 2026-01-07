import { ref } from 'vue'

import { getConciliationPdf } from '@/services/order.service'

/**
 * Descarga el PDF de conciliación de una orden.
 * Expone flags de estado (`isDownloading`, `error`) para que el componente controle el botón y muestre feedback.
 */
export const useOrderConciliation = () => {
  const isDownloading = ref(false)
  const error = ref<string | null>(null)

  const downloadConciliation = async (orderId: string | number) => {
    isDownloading.value = true
    error.value = null

    try {
      await getConciliationPdf(orderId)
    } catch (err) {
      console.error('Error al descargar la conciliación:', err)
      error.value = 'Error al descargar el archivo.'
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading,
    error,
    downloadConciliation,
  }
}
