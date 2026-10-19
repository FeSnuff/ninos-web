/**
 * The only JavaScript on the site (~2 KB). Everything works without it; this just improves things.
 */

/* 1. Swipe rails: when a keyboard user tabs to a card that is off-screen, bring it into view */
document.querySelectorAll<HTMLElement>('.rail').forEach((rail) =>
  rail.addEventListener('focusin', (e) => {
    const card = (e.target as HTMLElement).closest('.rail > *')
    card?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }),
)

/* 2. Mobile menu (<details>): close with Escape, outside click, or after choosing a link */
const menu = document.querySelector<HTMLDetailsElement>('.nav-mobile')
if (menu) {
  const summary = menu.querySelector('summary')
  summary?.setAttribute('aria-controls', 'mobile-menu')
  menu.querySelector('.nav-mobile__panel')?.setAttribute('id', 'mobile-menu')
  const sync = () => summary?.setAttribute('aria-expanded', String(menu.open))
  sync()
  menu.addEventListener('toggle', () => {
    sync()
    document.documentElement.classList.toggle('menu-open', menu.open)
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) {
      menu.open = false
      summary?.focus()
    }
  })
  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target as Node)) menu.open = false
  })
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => (menu.open = false)))
  // Keyboard users: close the panel when focus moves outside it (keeps focus from going behind it)
  menu.addEventListener('focusout', (e) => {
    if (menu.open && e.relatedTarget && !menu.contains(e.relatedTarget as Node)) menu.open = false
  })
  // Close it if the window grows to desktop width (the panel is hidden there)
  // (also keeps the dock from showing under an open menu)
  matchMedia('(min-width: 1100px)').addEventListener('change', (e) => {
    if (e.matches) menu.open = false
  })
}

/* 3. FAQ: only one answer open at a time per list */
document.querySelectorAll<HTMLElement>('.faq').forEach((faq) => {
  const items = Array.from(faq.querySelectorAll<HTMLDetailsElement>('details'))
  items.forEach((d) =>
    d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => o !== d && (o.open = false))
    }),
  )
})

/* 4. Estimate form: validate, send with fetch, show result without reloading */
const form = document.querySelector<HTMLFormElement>('[data-estimate-form]')
if (form) {
  const status = form.querySelector<HTMLElement>('[data-form-status]')!
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!

  const checks: [string, (v: string) => boolean][] = [
    ['name', (v) => v.trim().length >= 2],
    ['phone', (v) => v.replace(/\D/g, '').length >= 10],
    ['email', (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)],
    ['zip', (v) => /^\d{5}$/.test(v.trim())],
  ]

  const validate = () => {
    let first: HTMLInputElement | null = null
    for (const [name, ok] of checks) {
      const input = form.elements.namedItem(name) as HTMLInputElement | null
      if (!input) continue
      const err = document.getElementById(`${input.id}-err`)
      const valid = ok(input.value)
      input.setAttribute('aria-invalid', String(!valid))
      if (err) {
        err.hidden = valid
        if (!valid) input.setAttribute('aria-describedby', err.id)
        else input.removeAttribute('aria-describedby')
      }
      if (!valid && !first) first = input
    }
    first?.focus()
    return !first
  }

  // Clear an error as soon as the field becomes valid while typing
  // (not on blur: hiding the message on blur shifts the layout under the pointer and swallows clicks)
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement
    if (t.getAttribute('aria-invalid') === 'true') {
      const rule = checks.find(([n]) => n === t.name)
      if (rule && rule[1](t.value)) {
        t.setAttribute('aria-invalid', 'false')
        t.removeAttribute('aria-describedby')
        const err = document.getElementById(`${t.id}-err`)
        if (err) err.hidden = true
      }
    }
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    status.className = 'form-status'
    status.textContent = ''
    if (!validate()) return

    const thanksUrl = form.querySelector<HTMLInputElement>('input[name="redirect"]')?.value || '/'
    const data = new FormData(form)
    // several checkboxes share the name "services": join them into one readable line
    const servicesList = data.getAll('services').join(', ')
    data.delete('services')
    data.set('services', servicesList || form.dataset.msgNone || '-')
    data.delete('redirect')

    button.disabled = true
    button.textContent = form.dataset.msgSending || '…'
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) throw new Error(json.message || `HTTP ${res.status}`)
      window.location.assign(thanksUrl)
    } catch {
      status.className = 'form-status is-error'
      status.textContent = form.dataset.msgError || 'Error'
      button.disabled = false
      button.textContent = form.dataset.msgSend || 'Send'
    }
  })
}

/* 5. Mobile dock: slides away while scrolling down to read, comes back when scrolling up */
const dock = document.querySelector<HTMLElement>('.dock')
if (dock) {
  let lastY = window.scrollY
  let ticking = false
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const goingDown = y > lastY + 6
        const goingUp = y < lastY - 6
        if (goingDown && y > 240 && !dock.contains(document.activeElement)) dock.classList.add('is-hidden')
        else if (goingUp || y < 240) dock.classList.remove('is-hidden')
        if (goingDown || goingUp) lastY = y
        ticking = false
      })
    },
    { passive: true },
  )
  // never hide it from keyboard users
  dock.addEventListener('focusin', () => dock.classList.remove('is-hidden', 'is-parked'))

  // On the home page the hero already shows the same buttons: keep the dock away while they are on screen
  const heroActions = document.querySelector('.hero__actions')
  if (heroActions && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => dock.classList.toggle('is-parked', entry.isIntersecting)).observe(heroActions)
  }
}
