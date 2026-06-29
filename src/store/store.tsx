import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Channel,
  CodeMatch,
  JerseyColors,
  KitType,
  Pattern,
  Product,
  ProductStatus,
  Sale,
} from '../lib/types'
import { makeCode } from '../lib/id'
import { buildSeed, buildSeedSales } from '../data/seed'

const STORAGE_KEY = 'inventar.kitroom.v1'
export const LOW_STOCK_THRESHOLD = 5

export interface NewProductInput {
  name: string
  team: string
  kit: KitType
  season: string
  brand: string
  category: string
  channel: Channel
  colors: JerseyColors
  pattern: Pattern
  number?: number
  retail: number
  wholesale: number
  cost: number
  status: ProductStatus
  returnable: boolean
  description?: string
  variants: { size: string; stock: number }[]
}

interface Persisted {
  products: Product[]
  sales: Sale[]
  seq: number
}

interface SellResult {
  ok: boolean
  reason?: 'not_found' | 'out_of_stock'
  match?: CodeMatch
  sale?: Sale
}

interface StoreValue extends Persisted {
  addProduct: (input: NewProductInput) => Product
  adjustStock: (uid: string, variantId: string, delta: number) => void
  setStatus: (uid: string, status: ProductStatus) => void
  deleteProduct: (uid: string) => void
  findByCode: (code: string) => CodeMatch | null
  sellByCode: (code: string, opts?: { qty?: number; channel?: Channel }) => SellResult
  undoSale: (saleId: string) => void
  previewCodes: (name: string, sizes: string[]) => string[]
  resetDemo: () => void
}

const StoreCtx = createContext<StoreValue | null>(null)

const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted
      if (parsed?.products?.length) return parsed
    }
  } catch {
    /* ignore corrupt storage */
  }
  const { products, seq } = buildSeed()
  const sales = buildSeedSales(products)
  return { products, sales, seq }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load)
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full / unavailable — keep running in-memory */
    }
  }, [state])

  const takenCodes = useCallback((products: Product[]) => {
    const set = new Set<string>()
    products.forEach((p) => p.variants.forEach((v) => set.add(v.id)))
    return set
  }, [])

  const addProduct = useCallback<StoreValue['addProduct']>(
    (input) => {
      const taken = takenCodes(state.products)
      let seq = state.seq
      const variants = input.variants.map((v) => {
        const { code, nextSeq } = makeCode(input.name, v.size, seq, taken)
        seq = nextSeq
        return { id: code, size: v.size, stock: Math.max(0, v.stock) }
      })
      const created: Product = {
        uid: `p-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
        name: input.name.trim(),
        team: input.team.trim() || input.name.trim(),
        kit: input.kit,
        season: input.season,
        brand: input.brand,
        category: input.category,
        channel: input.channel,
        colors: input.colors,
        pattern: input.pattern,
        number: input.number,
        retail: input.retail,
        wholesale: input.wholesale,
        cost: input.cost,
        status: input.status,
        returnable: input.returnable,
        description: input.description,
        createdAt: Date.now(),
        variants,
      }
      setState((prev) => ({ ...prev, products: [created, ...prev.products], seq }))
      return created
    },
    [state.products, state.seq, takenCodes],
  )

  const previewCodes = useCallback<StoreValue['previewCodes']>(
    (name, sizes) => {
      const taken = takenCodes(state.products)
      let seq = state.seq
      return sizes.map((size) => {
        const { code, nextSeq } = makeCode(name || 'XX', size, seq, taken)
        seq = nextSeq
        return code
      })
    },
    [state.products, state.seq, takenCodes],
  )

  const adjustStock = useCallback<StoreValue['adjustStock']>((uid, variantId, delta) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.uid !== uid
          ? p
          : {
              ...p,
              variants: p.variants.map((v) =>
                v.id === variantId
                  ? { ...v, stock: Math.max(0, v.stock + delta) }
                  : v,
              ),
            },
      ),
    }))
  }, [])

  const setStatus = useCallback<StoreValue['setStatus']>((uid, status) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.uid === uid ? { ...p, status } : p)),
    }))
  }, [])

  const deleteProduct = useCallback<StoreValue['deleteProduct']>((uid) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.uid !== uid),
    }))
  }, [])

  const findByCode = useCallback<StoreValue['findByCode']>(
    (code) => {
      const target = norm(code)
      if (!target) return null
      for (const product of state.products) {
        for (const variant of product.variants) {
          if (norm(variant.id) === target) return { product, variant }
        }
      }
      return null
    },
    [state.products],
  )

  const sellByCode = useCallback<StoreValue['sellByCode']>(
    (code, opts) => {
      const match = findByCode(code)
      if (!match) return { ok: false, reason: 'not_found' }
      if (match.variant.stock <= 0)
        return { ok: false, reason: 'out_of_stock', match }

      const qty = Math.max(1, opts?.qty ?? 1)
      const channel = opts?.channel ?? match.product.channel
      const price =
        channel === 'Wholesale' ? match.product.wholesale : match.product.retail
      const sale: Sale = {
        id: `s-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
        productUid: match.product.uid,
        productName: `${match.product.name} · ${match.variant.size}`,
        code: match.variant.id,
        size: match.variant.size,
        qty,
        price,
        channel,
        ts: Date.now(),
      }

      setState((prev) => ({
        ...prev,
        sales: [sale, ...prev.sales],
        products: prev.products.map((p) =>
          p.uid !== match.product.uid
            ? p
            : {
                ...p,
                variants: p.variants.map((v) =>
                  v.id === match.variant.id
                    ? { ...v, stock: Math.max(0, v.stock - qty) }
                    : v,
                ),
              },
        ),
      }))

      return { ok: true, match, sale }
    },
    [findByCode],
  )

  const undoSale = useCallback<StoreValue['undoSale']>((saleId) => {
    setState((prev) => {
      const sale = prev.sales.find((s) => s.id === saleId)
      if (!sale) return prev
      return {
        ...prev,
        sales: prev.sales.filter((s) => s.id !== saleId),
        products: prev.products.map((p) =>
          p.uid !== sale.productUid
            ? p
            : {
                ...p,
                variants: p.variants.map((v) =>
                  v.id === sale.code ? { ...v, stock: v.stock + sale.qty } : v,
                ),
              },
        ),
      }
    })
  }, [])

  const resetDemo = useCallback<StoreValue['resetDemo']>(() => {
    const { products, seq } = buildSeed()
    const sales = buildSeedSales(products)
    setState({ products, sales, seq })
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      addProduct,
      adjustStock,
      setStatus,
      deleteProduct,
      findByCode,
      sellByCode,
      undoSale,
      previewCodes,
      resetDemo,
    }),
    [
      state,
      addProduct,
      adjustStock,
      setStatus,
      deleteProduct,
      findByCode,
      sellByCode,
      undoSale,
      previewCodes,
      resetDemo,
    ],
  )

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}
