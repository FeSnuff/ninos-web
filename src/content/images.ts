import type { L } from '../i18n'

/**
 * REAL PROJECT PHOTOS from Nino's crew. Files live in src/photos/; the build makes optimized WebP sizes
 * automatically. House numbers, license plates and personal signs are blurred before adding a photo here.
 * To add one: put the file in src/photos/ and add a key with its file name and alt text.
 */

export type Photo = {
  /** file name in src/photos/ (e.g. 'front-yard.jpg') */
  src: string
  /** description for screen readers and Google, in both languages */
  alt: L
  /** intrinsic aspect ratio (w/h) so the page doesn't jump while loading */
  ratio?: number
}

const p = (src: string, en: string, es: string): Photo => ({ src, alt: { en, es } })

export const photos = {
  // Fall bed refresh (gray house)
  fallFront: p('jardineras-otono-01-frente.jpg', 'Front beds with fresh black mulch, rounded shrubs and a river rock border', 'Jardineras con mulch negro nuevo, arbustos redondeados y borde de piedra de río'),
  fallWalk: p('jardineras-otono-02-camino-lateral.jpg', 'Mulched bed with trimmed boxwoods along a side walkway', 'Jardinera con mulch y bojes recortados junto a un camino lateral'),
  fallPorch: p('jardineras-otono-03-porche.jpg', 'Fresh mulch bed with shrubs and fall mums beside a front porch', 'Jardinera con mulch nuevo, arbustos y crisantemos de otoño junto al porche'),
  fallEntry: p('jardineras-otono-04-entrada.jpg', 'Front walkway lined with mulched beds and ornamental grasses in fall', 'Camino de entrada con jardineras de mulch y pastos ornamentales en otoño'),
  fallSteps: p('jardineras-otono-05-escalones.jpg', 'New plantings in a mulched bed next to the front steps', 'Plantas nuevas en una jardinera con mulch junto a los escalones'),
  // Townhouse river rock beds (before → during → after)
  rockBefore: p('piedra-townhouse-01-antes.jpg', 'Before: weedy strip along a townhouse driveway', 'Antes: franja con maleza junto a la entrada de una townhouse'),
  rockFabric: p('piedra-townhouse-02-malla-escalera.jpg', 'During: landscape fabric laid beside the front steps', 'Durante: malla antimaleza colocada junto a los escalones'),
  rockFabricBoth: p('piedra-townhouse-03-malla-ambos-lados.jpg', 'During: landscape fabric and cobblestone edging on both sides of the steps', 'Durante: malla antimaleza y borde de adoquín a ambos lados de los escalones'),
  rockCorner: p('piedra-townhouse-04-despues-esquina.jpg', 'After: river rock bed with cobblestone edging in the corner by the steps', 'Después: jardinera de piedra de río con borde de adoquín junto a los escalones'),
  rockAfterBoth: p('piedra-townhouse-05-despues-ambos-lados.jpg', 'After: river rock beds on both sides of the front steps', 'Después: jardineras de piedra de río a ambos lados de los escalones'),
  rockAfterStreet: p('piedra-townhouse-06-despues-calle.jpg', 'After: finished river rock beds seen from the driveway', 'Después: jardineras de piedra de río terminadas, vistas desde la entrada'),
  rockAfterFront: p('piedra-townhouse-07-despues-frente.jpg', 'After: townhouse front with the new river rock bed', 'Después: frente de la townhouse con la jardinera de piedra nueva'),
  rockAfterGarage: p('piedra-townhouse-08-despues-garaje.jpg', 'After: river rock bed between the garage and the front steps', 'Después: jardinera de piedra entre el garaje y los escalones'),
  rockAfterTree: p('piedra-townhouse-09-despues-arbol.jpg', 'After: narrow river rock strips along both sides of the driveway', 'Después: franjas de piedra de río a ambos lados de la entrada'),
  rockEdge: p('piedra-townhouse-10-detalle-borde.jpg', 'Close view of river rock held in place by cobblestone edging', 'Detalle de la piedra de río con borde de adoquín'),
  // Other beds and maintenance
  redMulch: p('mulch-rojo-entrada.jpg', 'Red mulch beds and a stone path under a shade tree by the driveway', 'Jardineras con mulch rojo y camino de piedra bajo un árbol junto a la entrada'),
  beigeBeds: p('mantenimiento-casa-beige-01.jpg', 'Side yard with trimmed shrubs, a mulched bed and a mowed lawn', 'Jardín lateral con arbustos recortados, jardinera con mulch y césped cortado'),
  beigeLawn: p('mantenimiento-casa-beige-02.jpg', 'Freshly mowed lawn curving around a mulched shrub bed', 'Césped recién cortado alrededor de una jardinera con arbustos'),
  brickWalk: p('mantenimiento-casa-ladrillo-01.jpg', 'Walkway with mulched beds and shaped shrubs on a corner lot', 'Camino con jardineras de mulch y arbustos con forma en una casa de esquina'),
  brickBeds: p('mantenimiento-casa-ladrillo-02.jpg', 'Mulched front bed with shrubs and grasses next to the porch', 'Jardinera frontal con mulch, arbustos y pastos junto al porche'),
  lampBed: p('mantenimiento-jardinera-farol.jpg', 'Curved black mulch bed around a lamp post in front of a brick house', 'Jardinera curva con mulch negro alrededor de un farol frente a una casa de ladrillo'),
  // Lawn
  newLawn1: p('cesped-nuevo-01.jpg', 'Newly established front lawn in a new neighborhood', 'Césped nuevo en el frente de una casa en un vecindario nuevo'),
  newLawn2: p('cesped-nuevo-02-acera.jpg', 'New grass along the sidewalk and front yards of a new street', 'Césped nuevo junto a la acera y los jardines de una calle nueva'),
  newLawn3: p('cesped-nuevo-03.jpg', 'New grass filling in across a front yard', 'Césped nuevo cubriendo el jardín delantero'),
  aerating: p('aireacion-01-trabajando.jpg', 'Crew member running a core aerator across a front lawn', 'Trabajador pasando la aireadora por el césped de enfrente'),
  aerationCrew: p('aireacion-02-equipo-trailer.jpg', "Nino's crew unloading lawn equipment from the trailer", "El equipo de Nino's bajando las máquinas del tráiler"),
  // Drainage
  drainDig: p('drenaje-01-excavacion.jpg', 'Digging the pit for a buried drain line in a backyard', 'Excavando el pozo para una tubería de drenaje enterrada'),
  drainTrench: p('drenaje-02-zanja-grava.jpg', 'Trench with corrugated drain pipe and a gravel-filled pit', 'Zanja con tubo corrugado y pozo con grava'),
  drainDownspout: p('drenaje-03-bajante-conectada.jpg', 'Downspout connected to a buried drain line running away from the house', 'Bajante conectada a una tubería enterrada que aleja el agua de la casa'),
  // Irrigation
  valveRepair: p('riego-valvulas-01-reparacion.jpg', 'Sprinkler valves and wiring exposed during a repair', 'Válvulas y cables del riego al descubierto durante una reparación'),
  valveBox: p('riego-valvulas-02-caja-nueva.jpg', 'New valve box installed over repaired sprinkler valves', 'Caja de válvulas nueva instalada sobre las válvulas reparadas'),
  irrigationRepair: p('riego-reparacion-lineas.jpg', 'Crew member repairing sprinkler lines in a garden bed', 'Trabajador reparando líneas de riego en una jardinera'),
  // Lighting
  nightLighting: p('iluminacion-casa-noche.jpg', 'House front lit at night with warm landscape uplighting', 'Frente de una casa iluminado de noche con luces cálidas hacia arriba'),
} satisfies Record<string, Photo>

export type PhotoKey = keyof typeof photos

/** Project groups for the gallery (and the home-page spotlight). `service` = English slug; hidden if that service is off. */
export type Stage = 'before' | 'during' | 'after'
export type Project = {
  id: string
  title: L
  text: L
  service: string
  photos: { key: PhotoKey; stage?: Stage }[]
}

export const projects: Project[] = [
  {
    id: 'townhouse-rock',
    title: { en: 'Townhouse front beds', es: 'Jardineras de una townhouse' },
    text: {
      en: 'A weedy strip along the driveway, turned into river rock beds on both sides of the front steps. Fabric underneath holds back weeds; cobblestone edging keeps the rock in place.',
      es: 'Una franja con maleza junto a la entrada se convirtió en jardineras de piedra de río a ambos lados de los escalones. La malla debajo frena la maleza y el borde de adoquín mantiene la piedra en su lugar.',
    },
    service: 'mulching-garden-beds',
    photos: [
      { key: 'rockBefore', stage: 'before' },
      { key: 'rockFabric', stage: 'during' },
      { key: 'rockFabricBoth', stage: 'during' },
      { key: 'rockCorner', stage: 'after' },
      { key: 'rockAfterBoth', stage: 'after' },
      { key: 'rockAfterTree', stage: 'after' },
      { key: 'rockAfterFront', stage: 'after' },
      { key: 'rockAfterGarage', stage: 'after' },
      { key: 'rockAfterStreet', stage: 'after' },
      { key: 'rockEdge', stage: 'after' },
    ],
  },
  {
    id: 'fall-beds',
    title: { en: 'Fall bed refresh', es: 'Retoque de otoño' },
    text: {
      en: 'Fresh black mulch, trimmed shrubs, new plantings and a river rock border, ready for the season.',
      es: 'Mulch negro nuevo, arbustos recortados, plantas nuevas y un borde de piedra de río, listo para la temporada.',
    },
    service: 'mulching-garden-beds',
    photos: [{ key: 'fallFront' }, { key: 'fallPorch' }, { key: 'fallEntry' }, { key: 'fallWalk' }, { key: 'fallSteps' }],
  },
  {
    id: 'drainage',
    title: { en: 'Downspout drainage', es: 'Drenaje de bajante' },
    text: {
      en: 'Roof water piped underground and carried away from the foundation.',
      es: 'El agua del techo va por una tubería enterrada, lejos de los cimientos.',
    },
    service: 'drainage',
    photos: [
      { key: 'drainDig', stage: 'during' },
      { key: 'drainTrench', stage: 'during' },
      { key: 'drainDownspout', stage: 'during' },
    ],
  },
  {
    id: 'irrigation',
    title: { en: 'Irrigation repair', es: 'Reparación de riego' },
    text: {
      en: 'Valves and wiring repaired, a new valve box installed, and broken sprinkler lines fixed.',
      es: 'Válvulas y cables reparados, una caja de válvulas nueva y líneas de riego rotas arregladas.',
    },
    service: 'irrigation',
    photos: [
      { key: 'valveRepair', stage: 'during' },
      { key: 'valveBox', stage: 'after' },
      { key: 'irrigationRepair' },
    ],
  },
  {
    id: 'maintenance',
    title: { en: 'Summer maintenance', es: 'Mantenimiento de verano' },
    text: {
      en: 'Crisp beds, shaped shrubs and fresh-cut lawns, visit after visit.',
      es: 'Jardineras limpias, arbustos con forma y césped recién cortado, visita tras visita.',
    },
    service: 'trimming-pruning',
    photos: [{ key: 'lampBed' }, { key: 'brickWalk' }, { key: 'brickBeds' }, { key: 'beigeBeds' }, { key: 'beigeLawn' }, { key: 'redMulch' }],
  },
  {
    id: 'lawn',
    title: { en: 'Lawns and aeration', es: 'Césped y aireación' },
    text: {
      en: 'Core aeration to loosen compacted soil, and new lawns filling in on a new street.',
      es: 'Aireación para aflojar la tierra compactada y césped nuevo creciendo en una calle nueva.',
    },
    service: 'lawn-care-mowing',
    photos: [{ key: 'aerating' }, { key: 'aerationCrew' }, { key: 'newLawn1' }, { key: 'newLawn2' }, { key: 'newLawn3' }],
  },
  {
    id: 'lighting',
    title: { en: 'Landscape lighting', es: 'Iluminación exterior' },
    text: {
      en: 'Warm uplighting that shows off the house front at night.',
      es: 'Luz cálida hacia arriba que resalta el frente de la casa de noche.',
    },
    service: 'landscape-lighting',
    photos: [{ key: 'nightLighting' }],
  },
]
