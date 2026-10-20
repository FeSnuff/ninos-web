import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { seed, type Client, type Db } from './data'

/* ---------- Data store: in memory only (a reload restores the demo seed) ---------- */

type Store = {
  db: Db
  /** mutate a copy of the data; React re-renders with the new copy */
  update: (fn: (draft: Db) => void) => void
  reset: () => void
  /** changes on every reset, so views with local copies can remount */
  version: number
  client: (id?: string) => Client | undefined
  /** short confirmation at the bottom of the screen */
  toast: (text: string) => void
  /** record a simulated message/send in the activity log + toast */
  log: (text: string, toastText?: string) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(seed)
  const [version, setVersion] = useState(0)
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([])
  const n = useRef(0)
  const box = useRef<HTMLDivElement>(null)

  // Toasts live in the browser's top layer (popover) so they also show above open dialogs.
  // Re-showing moves them above a dialog opened after them.
  useEffect(() => {
    const el = box.current
    if (!el?.showPopover) return
    if (el.matches(':popover-open')) el.hidePopover()
    if (toasts.length) el.showPopover()
  }, [toasts])

  const update = useCallback((fn: (draft: Db) => void) => {
    setDb((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }, [])

  const toast = useCallback((text: string) => {
    const id = ++n.current
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const log = useCallback(
    (text: string, toastText?: string) => {
      update((d) => {
        d.activity.unshift({ at: new Date().toISOString(), text })
      })
      toast(toastText ?? text)
    },
    [update, toast],
  )

  const value = useMemo<Store>(
    () => ({
      db,
      update,
      reset: () => {
        setDb(seed())
        setVersion((v) => v + 1)
      },
      version,
      client: (id) => db.clients.find((c) => c.id === id),
      toast,
      log,
    }),
    [db, version, update, toast, log],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <div ref={box} className="toasts" popover="manual" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}

/* ---------- Hash router: #/clientes/c3?tab=facturas ---------- */

function readHash() {
  const raw = location.hash.replace(/^#/, '') || '/hoy'
  const [path, query = ''] = raw.split('?')
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(query) }
}

export function useRoute() {
  const [route, setRoute] = useState(readHash)
  useEffect(() => {
    const on = () => {
      setRoute(readHash())
      document.querySelector('.app-main')?.scrollTo({ top: 0 })
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (path: string) => {
  location.hash = path
}
