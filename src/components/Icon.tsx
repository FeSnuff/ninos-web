/** Small inline icons (no icon library needed, no extra requests). Stroke style unless marked as filled. */

type Shape = string | { d: string; fill: true }

const paths = {
  phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'],
  message: ['M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z'],
  whatsapp: [
    'M3.6 20.4l1.3-4.1a8.6 8.6 0 1 1 3.1 3z',
    {
      d: 'M9.1 7.6c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.1.7l-.6.7c-.1.1-.1.3 0 .5a6.4 6.4 0 0 0 3 2.7c.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.7-.1l1.8.9c.3.1.4.3.4.5v.4c0 .4-.2 1-.7 1.3-.6.4-1.6.6-3.4-.2a10.3 10.3 0 0 1-4.6-4.3c-.7-1.3-.7-2.4-.3-3z',
      fill: true,
    },
  ],
  mail: ['M3 6h18v12H3zM3 7l9 6 9-6'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  grass: ['M3 20h18M6 20c0-5-2-8-3-9 3 1 5 4 5 9M12 20c0-7-1-11-3-14 3 2 5 7 5 14M17 20c0-4 1-7 4-9-2 3-2 6-2 9'],
  leaf: ['M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19c3-4 6-7 10-9'],
  scissors: ['M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.1 7.9L20 20M8.1 16.1L20 4'],
  droplet: ['M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z'],
  waves: ['M3 8c3-2 6 2 9 0s6-2 9 0M3 13c3-2 6 2 9 0s6-2 9 0M3 18c3-2 6 2 9 0s6-2 9 0'],
  bulb: ['M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z'],
  sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  stone: ['M4 15l3-7 6-2 6 4 1 6-6 3-7-1z'],
  pin: ['M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2'],
  menu: ['M4 8h16M4 16h16'],
  close: ['M6 6l12 12M18 6L6 18'],
  chevron: ['M9 6l6 6-6 6'],
  arrow: ['M5 12h14M13 6l6 6-6 6'],
  plus: ['M12 5v14M5 12h14'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'],
  calendar: ['M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'],
  clipboard: ['M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4'],
  globe: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 9h17M3.5 15h17M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z'],
} satisfies Record<string, Shape[]>

export type IconName = keyof typeof paths

export function Icon({ name, size = 24, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {(paths[name] as Shape[]).map((p, i) =>
        typeof p === 'string' ? <path key={i} d={p} /> : <path key={i} d={p.d} fill="currentColor" stroke="none" />,
      )}
    </svg>
  )
}
