interface Product {
  product: string
  thresholdTemperature: number
  density: string
}
interface Driver {
  name: string
  lastName: string
  dni: string
}
interface Client {
  name: string
}
interface Truck {
  licensePlate: string
  tanks: Tank[]
}
interface Tank {
  capacityLiters: number
  licensePlate: string
}

export interface Order {
  id: string | number
  status: string
  truck: Truck
  client: Client
  driver: Driver
  product: Product
  preset: number
  receptionDate: string
  estimatedDate: string
  initialWeighingDate: string
  fuelingStartDate: string
  fuelingEndDate: string
  finalWeighingDate: string
  lastAccumulatedMass: string
}
