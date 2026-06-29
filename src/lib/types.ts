export type KitType = 'Home' | 'Away' | 'Third' | 'Goalkeeper'

export type Pattern = 'solid' | 'stripes' | 'hoops' | 'sash' | 'halves'

export type ProductStatus = 'Active' | 'Inactive' | 'Draft'

export type Channel = 'Retail' | 'Wholesale'

export interface JerseyColors {
  /** main torso colour */
  body: string
  /** sleeves / shoulder colour */
  sleeve: string
  /** stripe / sash / trim accent */
  accent: string
}

export interface Variant {
  /** the short, human-writable scan id, e.g. "AR-L-01" */
  id: string
  /** size label: S / M / L / XL ... */
  size: string
  stock: number
}

export interface Product {
  /** internal uuid */
  uid: string
  /** display name, e.g. "Arsenal Home" */
  name: string
  team: string
  kit: KitType
  season: string
  brand: string
  category: string
  channel: Channel
  colors: JerseyColors
  pattern: Pattern
  /** optional printed squad number shown on the jersey art */
  number?: number
  retail: number
  wholesale: number
  cost: number
  status: ProductStatus
  returnable: boolean
  description?: string
  createdAt: number
  variants: Variant[]
}

export interface Sale {
  id: string
  productUid: string
  productName: string
  /** the scanned short id of the variant sold */
  code: string
  size: string
  qty: number
  /** unit price captured at sale time */
  price: number
  channel: Channel
  ts: number
}

/** flattened result of resolving a scanned/typed code */
export interface CodeMatch {
  product: Product
  variant: Variant
}
