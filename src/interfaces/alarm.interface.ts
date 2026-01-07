export interface Alarm {
  status: string
  id: number
  orderId: string | number // ID de la orden asociada
  timeStamp: string // Marca de tiempo de la alarma
  temperature: number // Temperatura registrada
  observations?: string | null // Observación opcional
  user?: string | null // responsable
}

export interface AlarmResponse {
  alarms: Alarm[]
  pagination: {
    currentPage: number
    totalElements: number
    totalPages: number
  }
}
