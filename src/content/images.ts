import type { L } from '../i18n'

/**
 * PLACEHOLDER PHOTOS from Unsplash (free for commercial use, https://unsplash.com/license).
 * Replace with Nino's real project photos: put the file in src/photos/ and set `src` to its file name
 * (e.g. 'front-yard.jpg'). The build makes optimized WebP sizes automatically.
 * Every image's source is also listed in CREDITS.md.
 */

export type Photo = {
  /** Unsplash photo id ('photo-xxxx') OR a file name in src/photos/ (e.g. 'front-yard.jpg') */
  src: string
  /** description for screen readers and Google, in both languages */
  alt: L
  credit?: string
  /** intrinsic aspect ratio (w/h) so the page doesn't jump while loading */
  ratio?: number
}

const u = (id: string, en: string, es: string, credit: string, ratio = 1.5): Photo => ({ src: id, alt: { en, es }, credit, ratio })

export const photos = {
  lawnRows: u('photo-1641317430847-243b44c07125', 'Long green lawn lined with trimmed shrubs and trees', 'Césped largo y verde entre arbustos recortados y árboles', 'David Griffiths'),
  grass: u('photo-1558904541-efa843a96f01', 'Close view of thick green grass', 'Césped verde y tupido de cerca', 'Petar Tonchev'),
  mower: u('photo-1590820292118-e256c3ac2676', 'Push mower on a green lawn', 'Cortadora sobre césped verde', 'Andres Siimon'),
  mulchEdge: u('photo-1786842168301-c29d5693b7c4', 'Clean edge between dark wood mulch and landscape stones', 'Borde limpio entre mulch de madera y piedras decorativas', 'Hitaishi Ramani'),
  flowerBed: u('photo-1759577085348-7b7d9fb537a4', 'Colorful flower bed with red, pink and green foliage', 'Jardinera con flores y hojas rojas, rosadas y verdes', 'Anna Kharkivska'),
  hedgeHouse: u('photo-1562562219-0847beb70341', 'House with a large, neatly trimmed hedge in front', 'Casa con un seto grande y bien recortado al frente', 'Chandra Oh'),
  hedgeClose: u('photo-1706920925080-be07c32398e1', 'Close view of a trimmed hedge', 'Seto recortado visto de cerca', 'Haberdoedas II'),
  sprinklerSunset: u('photo-1770664945615-52203ab54c88', 'Sprinklers watering a green lawn at sunset', 'Aspersores regando el césped al atardecer', 'Alef Morais'),
  sprinklerLight: u('photo-1780772415259-bda4359205a8', 'Sunlit sprinkler watering a lush lawn', 'Aspersor regando un césped verde con luz de sol', 'Nadin Nandin'),
  pathLight: u('photo-1785162434673-835bb98ad923', 'Garden light illuminating a path at night', 'Luz de jardín iluminando un camino de noche', 'Stefan Hiienurm'),
  bushLights: u('photo-1658692051708-519fbdac7e8f', 'Shrubs with landscape lights at night', 'Arbustos con luces de jardín de noche', 'Stefan Hiienurm'),
  trench: u('photo-1759967495843-3edc416114a9', 'Drainage trench dug in a grassy yard with stone', 'Zanja de drenaje con piedra en un jardín', 'Roger Starnes Sr'),
  grate: u('photo-1770827693899-59f5170870d0', 'Drain grate surrounded by rocks and grass', 'Rejilla de desagüe entre piedras y césped', 'Osmany M Leyva Aldana'),
  leaves: u('photo-1636750121381-9245cd137f32', 'Fallen autumn leaves on the ground', 'Hojas de otoño caídas en el suelo', 'Bruno Guerrero'),
  autumnHouse: u('photo-1607966700826-a91c2cec172c', 'House surrounded by trees in autumn', 'Casa rodeada de árboles en otoño', 'Clint McKoy'),
  patio: u('photo-1780838446281-9394772d07a8', 'Circular paved patio with a low stone wall and shrubs', 'Patio circular de adoquín con muro bajo de piedra', 'Sergej'),
  steps: u('photo-1761637823276-7d714eb45cb1', 'Curved stone steps leading to a paved patio', 'Escalones curvos de piedra hacia un patio', 'Sergej'),
  backyard: u('photo-1681853108586-f29b4ef5c0fb', 'Backyard lawn with a fence and house', 'Patio trasero con césped, cerca y casa', 'Giorgio Trovato'),
  yardTree: u('photo-1729058015948-592a8e4a1772', 'Grassy yard with a tree and a fence', 'Jardín con césped, un árbol y una cerca', 'Alexandra Gold'),
} satisfies Record<string, Photo>

export type PhotoKey = keyof typeof photos
