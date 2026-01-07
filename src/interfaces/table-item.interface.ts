export interface TableItem {
  id: string | number
  status: string
  truck: {
    licensePlate: string
  }
  client: {
    name: string
  }
  alarmStatus: {
    state: string
  }
  receptionDate: string
  estimatedDate: string
}

export interface ItemResponse {
  items: TableItem[]
  pagination: {
    totalElements: number
    currentPage: number
    totalPages: number
  }
}
