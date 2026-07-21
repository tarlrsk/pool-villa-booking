export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  lineUserId: string
  displayName: string
  phone: string
  checkin: string   // YYYY-MM-DD
  checkout: string  // YYYY-MM-DD
  guests: number
  totalPrice: number
  status: BookingStatus
  createdAt: string
  notes: string
}

export interface DayRate {
  day: string  // Monday, Tuesday, ...
  price: number
}

export interface CustomPeriod {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
  price: number
  description: string
}

export interface PriceBreakdown {
  date: string
  price: number
  source: 'custom' | 'day-rate'
  description?: string
}

export interface PriceResult {
  totalPrice: number
  nights: number
  breakdown: PriceBreakdown[]
}

export interface AvailabilityResult {
  available: boolean
  reason?: string
}

export interface LineProfile {
  userId: string
  displayName: string
  pictureUrl?: string
}
