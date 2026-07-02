export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  hasVariants?: boolean
}

export interface CartItem extends Product {
  quantity: number
}

export interface Customer {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
  avatar_url?: string
  billing?: {
    first_name?: string
    last_name?: string
    company?: string
    address_1?: string
    address_2?: string
    city?: string
    postcode?: string
    country?: string
    state?: string
    email?: string
    phone?: string
  }
  shipping?: {
    first_name?: string
    last_name?: string
    company?: string
    address_1?: string
    address_2?: string
    city?: string
    postcode?: string
    country?: string
    state?: string
    phone?: string
  }
}

