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
