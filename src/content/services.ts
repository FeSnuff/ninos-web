import type { PhotoKey } from './images'
import type { IconName } from '../components/Icon'
import type { L } from '../i18n'

/**
 * SERVICES — placeholder list based on the business card + what competitors in Virginia
 * offer. Confirm every item with Nino before going public. Every text has English (en)
 * and Spanish (es).
 *
 * `license` marks items that legally need a license in Virginia. Preview builds warn;
 * a build for the real domain FAILS until `confirmed: true` is set (or the item is removed).
 * See PLAN-SITIO-WEB.md §11.
 */

export type License = 'DPOR' | 'DPOR-ISC' | 'DPOR-LSC' | 'VDACS-fertilizer' | 'VDACS-pesticide'

export type ServiceItem = {
  name: L
  text: L
  license?: License
  /** set to true once Nino confirms he holds the license (or remove the item) */
  confirmed?: boolean
}

/** A span of months, 1 = January. `peak` marks the best window. */
export type SeasonSpan = { label: L; from: number; to: number; peak?: boolean }

export type Service = {
  /** URL part in each language */
  slug: L
  name: L
  /** short name used in menus */
  menu: L
  icon: IconName
  /** one line for cards */
  summary: L
  /** H1 on the service page */
  headline: L
  intro: L
  photo: PhotoKey
  photoAlt?: PhotoKey
  items: ServiceItem[]
  season: SeasonSpan[]
  faqs: { q: L; a: L }[]
  seoTitle: L
  seoDescription: L
  /** whole page needs a license (e.g. irrigation → ISC) */
  license?: License
  confirmed?: boolean
  /** set false to hide the page completely */
  enabled: boolean
}

export const services: Service[] = [
  {
    slug: { en: 'lawn-care-mowing', es: 'cesped-y-corte' },
    name: { en: 'Lawn Care & Mowing', es: 'Césped y corte' },
    menu: { en: 'Lawn care', es: 'Césped' },
    icon: 'grass',
    summary: {
      en: 'Weekly mowing, edging and the fall aeration that keeps Virginia fescue thick.',
      es: 'Corte semanal, bordes y la aireación de otoño que mantiene tupido el césped de Virginia.',
    },
    headline: { en: 'Lawn care and mowing', es: 'Cuidado y corte de césped' },
    intro: {
      en: 'Most lawns in Virginia are tall fescue, a cool-season grass that looks great in spring and fall and struggles in July heat. We mow at the right height for the season, keep edges sharp, and schedule aeration and overseeding in early fall, when new seed has the best chance.',
      es: 'La mayoría del césped en Virginia es tall fescue, un césped de clima frío que se ve muy bien en primavera y otoño y sufre con el calor de julio. Cortamos a la altura correcta para cada temporada, dejamos los bordes bien definidos y hacemos la aireación y resiembra a principios del otoño, cuando la semilla nueva tiene más éxito.',
    },
    photo: 'aerating',
    photoAlt: 'beigeLawn',
    items: [
      {
        name: { en: 'Mowing, edging & blowing', es: 'Corte, bordes y soplado' },
        text: { en: 'Weekly or every two weeks, with clippings blown off walks and driveways.', es: 'Cada semana o cada dos semanas, soplando el césped cortado de aceras y entradas.' },
      },
      {
        name: { en: 'Core aeration & overseeding', es: 'Aireación y resiembra' },
        text: { en: 'Loosens compacted soil and fills thin spots with new seed, done late August to October.', es: 'Afloja la tierra compactada y rellena las partes ralas con semilla nueva, de fines de agosto a octubre.' },
      },
      {
        name: { en: 'Sod installation', es: 'Instalación de césped en rollo' },
        text: { en: 'New lawn in a day for bare yards, new construction or badly damaged areas.', es: 'Césped nuevo en un día para jardines pelados, casas nuevas o zonas muy dañadas.' },
      },
      {
        name: { en: 'Lawn renovation', es: 'Renovación de césped' },
        text: { en: 'Clear the old turf, regrade low spots, and start over with seed or sod.', es: 'Retiramos el césped viejo, nivelamos las partes bajas y empezamos de nuevo con semilla o rollo.' },
      },
      {
        name: { en: 'Fertilization', es: 'Fertilización' },
        text: { en: 'Seasonal feeding matched to cool-season grass.', es: 'Abono por temporada para césped de clima frío.' },
        license: 'VDACS-fertilizer',
      },
      {
        name: { en: 'Weed control', es: 'Control de maleza' },
        text: { en: 'Pre-emergent in spring and spot treatment for broadleaf weeds.', es: 'Preemergente en primavera y tratamiento puntual de maleza de hoja ancha.' },
        license: 'VDACS-pesticide',
      },
    ],
    season: [
      { label: { en: 'Mowing', es: 'Corte' }, from: 4, to: 11 },
      { label: { en: 'Aeration & overseeding', es: 'Aireación y resiembra' }, from: 8, to: 10, peak: true },
      { label: { en: 'Sod', es: 'Césped en rollo' }, from: 3, to: 11 },
    ],
    faqs: [
      {
        q: { en: 'How often should my lawn be mowed?', es: '¿Cada cuánto se debe cortar el césped?' },
        a: {
          en: 'Weekly from mid-April to June and again in September and October, when fescue grows fastest. In the July and August heat, every 10 to 14 days is usually enough.',
          es: 'Cada semana de mediados de abril a junio, y otra vez en septiembre y octubre, cuando el fescue crece más rápido. Con el calor de julio y agosto, cada 10 a 14 días suele ser suficiente.',
        },
      },
      {
        q: { en: 'When is the best time to aerate in Virginia?', es: '¿Cuándo es el mejor momento para airear en Virginia?' },
        a: {
          en: 'Late August through October. The soil is still warm, nights are cooler, and new grass seed has months to establish before summer.',
          es: 'De fines de agosto a octubre. La tierra sigue tibia, las noches son más frescas y la semilla nueva tiene meses para establecerse antes del verano.',
        },
      },
      {
        q: { en: 'Do I need to be home during the service?', es: '¿Tengo que estar en casa durante el servicio?' },
        a: { en: 'No. We just need access to the yard and gates unlocked, and pets inside.', es: 'No. Solo necesitamos acceso al jardín, los portones abiertos y las mascotas adentro.' },
      },
    ],
    seoTitle: { en: 'Lawn Care & Mowing in Virginia', es: 'Corte y cuidado de césped en Virginia' },
    seoDescription: {
      en: 'Weekly mowing, edging, core aeration, overseeding and sod installation for homes in Fairfax, Loudoun and Prince William, Virginia. Free estimates.',
      es: 'Corte semanal, bordes, aireación, resiembra e instalación de césped para casas en Fairfax, Loudoun y Prince William, Virginia. Estimados gratis.',
    },
    enabled: true,
  },
  {
    slug: { en: 'mulching-garden-beds', es: 'mulch-y-jardineras' },
    name: { en: 'Mulching & Garden Beds', es: 'Mulch y jardineras' },
    menu: { en: 'Mulch & beds', es: 'Mulch y jardineras' },
    icon: 'leaf',
    summary: {
      en: 'Fresh mulch, river rock, crisp edges and new plantings that make the front yard look finished.',
      es: 'Mulch nuevo, piedra de río, bordes bien cortados y plantas nuevas que dejan el frente de la casa impecable.',
    },
    headline: { en: 'Mulching and garden beds', es: 'Mulch y jardineras' },
    intro: {
      en: 'A fresh layer of mulch holds moisture through Virginia summers, keeps weeds down and makes the whole yard look cared for. We cut a clean edge first, clear weeds, and spread mulch at the right depth, never piled against tree trunks.',
      es: 'Una capa nueva de mulch (mantillo) guarda la humedad en los veranos de Virginia, frena la maleza y hace que todo el jardín se vea cuidado. Primero cortamos un borde limpio, quitamos la maleza y ponemos el mulch a la profundidad correcta, nunca amontonado contra los troncos.',
    },
    photo: 'fallPorch',
    photoAlt: 'rockAfterBoth',
    items: [
      {
        name: { en: 'Mulch installation', es: 'Instalación de mulch' },
        text: { en: 'Double-shredded hardwood, dyed black or brown, or pine straw.', es: 'Madera triturada, teñida negra o café, o agujas de pino (pine straw).' },
      },
      {
        name: { en: 'River rock beds', es: 'Jardineras de piedra de río' },
        text: { en: 'Weed fabric underneath and a clean stone edge, for beds that stay neat with little upkeep.', es: 'Malla antimaleza debajo y un borde de piedra limpio, para jardineras ordenadas con poco mantenimiento.' },
        // installs over $1,000 may count as LSC work (PLAN §11): confirm with Nino
        license: 'DPOR-LSC',
      },
      {
        name: { en: 'Bed edging', es: 'Bordes de jardineras' },
        text: { en: 'A crisp spade-cut edge between lawn and bed that keeps grass out.', es: 'Un borde limpio entre el césped y la jardinera que evita que el césped se meta.' },
      },
      {
        name: { en: 'Bed weeding & cleanup', es: 'Deshierbe y limpieza' },
        text: { en: 'Weeds, leaves and dead growth removed before anything new goes down.', es: 'Quitamos maleza, hojas y plantas secas antes de poner algo nuevo.' },
      },
      {
        name: { en: 'Planting', es: 'Siembra de plantas' },
        text: { en: 'Shrubs, perennials and seasonal flowers suited to Virginia sun and clay soil.', es: 'Arbustos, plantas perennes y flores de temporada que aguantan el sol y la tierra arcillosa de Virginia.' },
      },
      {
        name: { en: 'Bed design & refresh', es: 'Diseño y renovación de jardineras' },
        text: { en: 'Reshape tired beds and replace overgrown shrubs with a simple plan.', es: 'Damos nueva forma a jardineras cansadas y cambiamos arbustos demasiado grandes con un plan sencillo.' },
        license: 'DPOR-LSC',
      },
    ],
    season: [
      { label: { en: 'Spring mulch', es: 'Mulch de primavera' }, from: 3, to: 5, peak: true },
      { label: { en: 'Fall refresh', es: 'Retoque de otoño' }, from: 10, to: 11 },
      { label: { en: 'Planting', es: 'Siembra' }, from: 4, to: 5 },
      { label: { en: 'Planting', es: 'Siembra' }, from: 9, to: 11 },
    ],
    faqs: [
      {
        q: { en: 'How deep should mulch be?', es: '¿Qué tan gruesa debe ser la capa de mulch?' },
        a: {
          en: 'About 2 to 3 inches. Deeper than that can suffocate roots, and mulch should never be piled against tree trunks.',
          es: 'Unas 2 a 3 pulgadas. Más que eso puede ahogar las raíces, y nunca debe amontonarse contra los troncos.',
        },
      },
      {
        q: { en: 'How often should mulch be replaced?', es: '¿Cada cuánto se cambia el mulch?' },
        a: {
          en: 'Most homes in Virginia refresh it once a year in spring. A light top-up in fall keeps beds looking sharp through winter.',
          es: 'La mayoría de las casas en Virginia lo renuevan una vez al año en primavera. Un retoque ligero en otoño mantiene las jardineras bonitas todo el invierno.',
        },
      },
    ],
    seoTitle: { en: 'Mulching & Garden Beds in Virginia', es: 'Mulch y jardineras en Virginia' },
    seoDescription: {
      en: 'Mulch installation, river rock beds, bed edging, weeding and planting for homes in Northern Virginia. Free estimates.',
      es: 'Instalación de mulch, jardineras de piedra de río, bordes, deshierbe y siembra para casas en el norte de Virginia. Estimados gratis.',
    },
    enabled: true,
  },
  {
    slug: { en: 'trimming-pruning', es: 'poda-y-recorte' },
    name: { en: 'Trimming & Pruning', es: 'Poda y recorte' },
    menu: { en: 'Trimming', es: 'Poda' },
    icon: 'scissors',
    summary: {
      en: 'Shaped hedges and shrubs that stay healthy, plus cleanup of overgrown corners.',
      es: 'Setos y arbustos con buena forma y sanos, y limpieza de rincones con monte.',
    },
    headline: { en: 'Trimming and pruning', es: 'Poda y recorte' },
    intro: {
      en: 'Good trimming keeps shrubs dense and healthy, not just short. We shape hedges, thin out crowded shrubs and small ornamental trees, and cut back overgrowth from walkways, windows and fences.',
      es: 'Una buena poda mantiene los arbustos tupidos y sanos, no solo bajos. Damos forma a los setos, aclaramos arbustos y árboles ornamentales pequeños, y cortamos lo que invade caminos, ventanas y cercas.',
    },
    photo: 'beigeBeds',
    photoAlt: 'brickWalk',
    items: [
      {
        name: { en: 'Hedge & shrub trimming', es: 'Recorte de setos y arbustos' },
        text: { en: 'Clean, even shapes for boxwood, holly, privet and other hedges.', es: 'Formas limpias y parejas para boj, acebo, ligustro y otros setos.' },
      },
      {
        name: { en: 'Ornamental tree pruning', es: 'Poda de árboles ornamentales' },
        text: { en: 'Small trees like crape myrtle, Japanese maple and dogwood, pruned from the ground.', es: 'Árboles pequeños como crespón, arce japonés y cornejo, podados desde el suelo.' },
      },
      {
        name: { en: 'Ornamental grass cutback', es: 'Corte de pastos ornamentales' },
        text: { en: 'Cut to the ground in late winter so new growth comes in clean.', es: 'Cortados al ras a fines del invierno para que salgan limpios.' },
      },
      {
        name: { en: 'Overgrowth & brush removal', es: 'Limpieza de monte y maleza' },
        text: { en: 'Clear vines, saplings and brush taking over fences and corners.', es: 'Quitamos enredaderas, arbolitos y monte que invaden cercas y rincones.' },
      },
    ],
    season: [
      { label: { en: 'Structural pruning', es: 'Poda de formación' }, from: 2, to: 3, peak: true },
      { label: { en: 'Hedge trimming', es: 'Recorte de setos' }, from: 6, to: 6 },
      { label: { en: 'Hedge trimming', es: 'Recorte de setos' }, from: 9, to: 9 },
    ],
    faqs: [
      {
        q: { en: 'When should shrubs be trimmed?', es: '¿Cuándo se deben podar los arbustos?' },
        a: {
          en: 'Most shrubs are best pruned in late winter before new growth. Hedges usually get a shaping in early summer and a lighter one in early fall. Spring-flowering shrubs like azaleas are trimmed right after they bloom.',
          es: 'La mayoría se poda mejor a fines del invierno, antes de que broten. Los setos se recortan a principios del verano y un poco a principios del otoño. Los arbustos que florecen en primavera, como las azaleas, se podan justo después de florecer.',
        },
      },
      {
        q: { en: 'Do you haul away the clippings?', es: '¿Se llevan las ramas cortadas?' },
        a: { en: 'Yes. All clippings and debris are removed from the property.', es: 'Sí. Nos llevamos todas las ramas y restos de la propiedad.' },
      },
    ],
    seoTitle: { en: 'Hedge Trimming & Pruning in Virginia', es: 'Poda de setos y arbustos en Virginia' },
    seoDescription: {
      en: 'Hedge trimming, shrub and ornamental tree pruning, and overgrowth removal for homes in Virginia. Free estimates.',
      es: 'Recorte de setos, poda de arbustos y árboles ornamentales, y limpieza de monte para casas en Virginia. Estimados gratis.',
    },
    enabled: true,
  },
  {
    slug: { en: 'irrigation', es: 'riego-y-aspersores' },
    name: { en: 'Irrigation & Sprinklers', es: 'Riego y aspersores' },
    menu: { en: 'Irrigation', es: 'Riego' },
    icon: 'droplet',
    summary: {
      en: 'Sprinkler installs, repairs, spring start-up and fall winterization before the first freeze.',
      es: 'Instalación y reparación de aspersores, arranque en primavera y cierre de invierno antes de la primera helada.',
    },
    headline: { en: 'Irrigation and sprinkler systems', es: 'Sistemas de riego y aspersores' },
    intro: {
      en: 'Irrigation is the heart of what we do. It is even in our logo. We install new systems, fix broken heads and leaks, turn systems on in spring and blow them out in fall so pipes do not crack in a Virginia freeze.',
      es: 'El riego es el corazón de lo que hacemos. Hasta está en nuestro logo. Instalamos sistemas nuevos, arreglamos aspersores rotos y fugas, encendemos el sistema en primavera y lo vaciamos con aire en otoño para que las tuberías no se rompan con las heladas de Virginia.',
    },
    photo: 'irrigationRepair',
    photoAlt: 'valveBox',
    license: 'DPOR-ISC',
    items: [
      {
        name: { en: 'Sprinkler system installation', es: 'Instalación de sistema de riego' },
        text: { en: 'Zones designed around sun, shade and slope so every area gets the right water.', es: 'Zonas pensadas según sol, sombra y pendiente para que cada área reciba el agua justa.' },
      },
      {
        name: { en: 'Repairs', es: 'Reparaciones' },
        text: { en: 'Broken heads, leaks, valves, wiring and controller problems found and fixed.', es: 'Encontramos y arreglamos aspersores rotos, fugas, válvulas, cables y fallas del controlador.' },
      },
      {
        name: { en: 'Spring start-up', es: 'Arranque de primavera' },
        text: { en: 'System turned on, every zone checked and heads adjusted.', es: 'Encendemos el sistema, revisamos cada zona y ajustamos los aspersores.' },
      },
      {
        name: { en: 'Fall winterization', es: 'Cierre de invierno' },
        text: { en: 'Lines blown out with compressed air before the first hard freeze.', es: 'Vaciamos las líneas con aire comprimido antes de la primera helada fuerte.' },
      },
      {
        name: { en: 'Drip irrigation', es: 'Riego por goteo' },
        text: { en: 'Water straight to the roots in beds and planters, with less waste.', es: 'Agua directo a la raíz en jardineras y macetas, con menos desperdicio.' },
      },
      {
        name: { en: 'Smart controllers', es: 'Controladores inteligentes' },
        text: { en: 'Wi-Fi controllers that skip watering when it rains.', es: 'Controladores Wi-Fi que no riegan cuando llueve.' },
      },
      {
        name: { en: 'Backflow devices', es: 'Dispositivos antirretorno (backflow)' },
        text: { en: 'Installation and replacement.', es: 'Instalación y reemplazo.' },
        license: 'DPOR-ISC',
      },
    ],
    season: [
      { label: { en: 'Spring start-up', es: 'Arranque de primavera' }, from: 3, to: 4, peak: true },
      { label: { en: 'Repairs & installs', es: 'Reparaciones e instalaciones' }, from: 4, to: 10 },
      { label: { en: 'Winterization', es: 'Cierre de invierno' }, from: 10, to: 11, peak: true },
    ],
    faqs: [
      {
        q: { en: 'When should my sprinkler system be winterized?', es: '¿Cuándo se debe cerrar el sistema de riego para el invierno?' },
        a: {
          en: 'Before the first hard freeze, usually late October to mid November in Virginia. Water left in the lines can freeze, expand and crack pipes and backflow devices.',
          es: 'Antes de la primera helada fuerte, normalmente de fines de octubre a mediados de noviembre en Virginia. El agua que queda en las líneas se congela, se expande y puede romper tuberías y válvulas.',
        },
      },
      {
        q: { en: 'Why is one zone not watering?', es: '¿Por qué una zona no está regando?' },
        a: {
          en: 'Usually a stuck valve, a broken wire or a damaged head. We test each zone and tell you what we found before fixing it.',
          es: 'Casi siempre es una válvula trabada, un cable roto o un aspersor dañado. Probamos cada zona y le decimos qué encontramos antes de arreglarlo.',
        },
      },
      {
        q: { en: 'Can you work on a system someone else installed?', es: '¿Pueden trabajar en un sistema que instaló otra empresa?' },
        a: { en: 'Yes. We service most common brands of heads, valves and controllers.', es: 'Sí. Trabajamos con las marcas más comunes de aspersores, válvulas y controladores.' },
      },
    ],
    seoTitle: { en: 'Sprinkler Repair & Installation in Virginia', es: 'Instalación y reparación de riego en Virginia' },
    seoDescription: {
      en: 'Irrigation system installation, sprinkler repair, spring start-up, fall winterization and smart controllers in Virginia. Free estimates.',
      es: 'Instalación y reparación de riego, arranque de primavera, cierre de invierno y controladores inteligentes en Virginia. Estimados gratis.',
    },
    enabled: true,
  },
  {
    slug: { en: 'drainage', es: 'drenaje' },
    name: { en: 'Drainage Solutions', es: 'Soluciones de drenaje' },
    menu: { en: 'Drainage', es: 'Drenaje' },
    icon: 'waves',
    summary: {
      en: 'French drains, downspout lines and grading that move water away from the house.',
      es: 'Drenajes franceses, tuberías para bajantes y nivelación que alejan el agua de la casa.',
    },
    headline: { en: 'Yard drainage solutions', es: 'Soluciones de drenaje para su jardín' },
    intro: {
      en: 'Heavy clay soil and summer storms leave many Virginia yards soggy, with puddles that stay for days and water heading toward the foundation. We find where the water comes from and give it a better path, underground or on the surface.',
      es: 'La tierra arcillosa y las tormentas de verano dejan muchos jardines de Virginia encharcados, con charcos que duran días y agua que va hacia los cimientos. Encontramos de dónde viene el agua y le damos un mejor camino, bajo tierra o por la superficie.',
    },
    photo: 'drainDownspout',
    photoAlt: 'drainTrench',
    license: 'DPOR-LSC',
    items: [
      {
        name: { en: 'French drains', es: 'Drenajes franceses' },
        text: { en: 'Gravel-and-pipe trenches that collect water and carry it away.', es: 'Zanjas con grava y tubería que recogen el agua y la llevan lejos.' },
      },
      {
        name: { en: 'Downspout extensions & buried lines', es: 'Extensiones de bajantes y tubería enterrada' },
        text: { en: 'Roof water piped underground and released through a pop-up emitter, away from the foundation.', es: 'El agua del techo va por tubería enterrada y sale por un emisor (pop-up) lejos de los cimientos.' },
      },
      {
        name: { en: 'Catch basins', es: 'Rejillas de desagüe' },
        text: { en: 'Surface drains in low spots, connected to buried pipe.', es: 'Desagües en las partes bajas, conectados a tubería enterrada.' },
      },
      {
        name: { en: 'Dry creek beds', es: 'Cauces secos de piedra' },
        text: { en: 'A stone channel that handles runoff and looks good when dry.', es: 'Un canal de piedra que guía el agua de lluvia y se ve bonito cuando está seco.' },
      },
      {
        name: { en: 'Grading & regrading', es: 'Nivelación del terreno' },
        text: { en: 'Reshape the soil so water flows away from the house.', es: 'Damos pendiente a la tierra para que el agua se aleje de la casa.' },
      },
    ],
    season: [{ label: { en: 'Year-round (ground not frozen)', es: 'Todo el año (sin tierra congelada)' }, from: 1, to: 12 }],
    faqs: [
      {
        q: { en: 'How do I know if I need a French drain?', es: '¿Cómo sé si necesito un drenaje francés?' },
        a: {
          en: 'Standing water a day or more after rain, a wet basement, or soggy ground that never dries are common signs. We look at slope, soil and downspouts before recommending anything.',
          es: 'Agua estancada un día o más después de llover, un sótano húmedo o tierra que nunca se seca son señales comunes. Revisamos la pendiente, la tierra y las bajantes antes de recomendar algo.',
        },
      },
      {
        q: { en: 'Will drainage work tear up my lawn?', es: '¿El trabajo de drenaje va a destruir mi césped?' },
        a: {
          en: 'Some digging is needed. We keep trenches as narrow as possible and restore the surface with soil and seed or sod.',
          es: 'Hay que excavar un poco. Hacemos las zanjas lo más angostas posible y dejamos la superficie con tierra y semilla o césped en rollo.',
        },
      },
    ],
    seoTitle: { en: 'French Drains & Yard Drainage in Virginia', es: 'Drenaje francés y jardines encharcados en Virginia' },
    seoDescription: {
      en: 'French drains, downspout extensions, catch basins, dry creek beds and grading to fix wet yards in Virginia. Free estimates.',
      es: 'Drenajes franceses, extensiones de bajantes, rejillas, cauces de piedra y nivelación para jardines encharcados en Virginia. Estimados gratis.',
    },
    enabled: true,
  },
  {
    slug: { en: 'landscape-lighting', es: 'iluminacion-exterior' },
    name: { en: 'Landscape Lighting', es: 'Iluminación exterior' },
    menu: { en: 'Lighting', es: 'Iluminación' },
    icon: 'bulb',
    summary: {
      en: 'Low-voltage LED lights for paths, trees and patios, on a timer or your phone.',
      es: 'Luces LED de bajo voltaje para caminos, árboles y patios, con temporizador o desde su celular.',
    },
    headline: { en: 'Landscape lighting', es: 'Iluminación exterior' },
    intro: {
      en: 'The right lights make a home safer to walk around at night and show off the work you put into the yard. We install low-voltage LED fixtures that use little power and last for years.',
      es: 'Una buena iluminación hace más seguro caminar de noche alrededor de la casa y luce el trabajo que puso en su jardín. Instalamos lámparas LED de bajo voltaje que gastan poca energía y duran años.',
    },
    photo: 'nightLighting',
    items: [
      {
        name: { en: 'Path & walkway lights', es: 'Luces de caminos y senderos' },
        text: { en: 'Safe footing from the driveway to the front door.', es: 'Paso seguro desde la entrada hasta la puerta.' },
      },
      {
        name: { en: 'Uplighting', es: 'Iluminación hacia arriba' },
        text: { en: 'Light trees, columns and the front of the house from below.', es: 'Iluminamos árboles, columnas y el frente de la casa desde abajo.' },
      },
      {
        name: { en: 'Patio & deck lighting', es: 'Luces de patio y terraza' },
        text: { en: 'Soft light for evenings outside.', es: 'Luz suave para las noches afuera.' },
      },
      {
        name: { en: 'Timers & smart control', es: 'Temporizador y control inteligente' },
        text: { en: 'Lights that turn on at dusk or from an app.', es: 'Luces que se encienden al anochecer o desde una app.' },
      },
      {
        name: { en: 'Repairs & upgrades', es: 'Reparaciones y mejoras' },
        text: { en: 'Fix dead fixtures and switch old halogen systems to LED.', es: 'Arreglamos lámparas que no prenden y cambiamos sistemas halógenos viejos a LED.' },
      },
    ],
    season: [{ label: { en: 'Year-round', es: 'Todo el año' }, from: 1, to: 12 }],
    faqs: [
      {
        q: { en: 'Is low-voltage lighting expensive to run?', es: '¿La iluminación de bajo voltaje gasta mucha luz?' },
        a: {
          en: 'No. LED landscape fixtures use a few watts each, so a typical system costs very little to run each month.',
          es: 'No. Cada lámpara LED usa pocos vatios, así que un sistema normal cuesta muy poco al mes.',
        },
      },
      {
        q: { en: 'Can you add lights to my existing system?', es: '¿Pueden agregar luces a mi sistema actual?' },
        a: {
          en: 'Usually yes, as long as the transformer has capacity. We check it before adding fixtures.',
          es: 'Normalmente sí, si el transformador tiene capacidad. Lo revisamos antes de agregar lámparas.',
        },
      },
    ],
    seoTitle: { en: 'Landscape Lighting in Virginia', es: 'Iluminación exterior de jardines en Virginia' },
    seoDescription: {
      en: 'Low-voltage LED path lights, uplighting, patio lighting and smart timers for homes in Virginia. Free estimates.',
      es: 'Luces LED de bajo voltaje para caminos, iluminación de árboles y patios, y temporizadores inteligentes en Virginia. Estimados gratis.',
    },
    enabled: true,
  },
  {
    slug: { en: 'cleanups-seasonal', es: 'limpiezas-de-temporada' },
    name: { en: 'Seasonal Cleanups', es: 'Limpiezas de temporada' },
    menu: { en: 'Cleanups', es: 'Limpiezas' },
    icon: 'sun',
    summary: {
      en: 'Spring and fall cleanups and leaf removal, so the yard starts each season clean.',
      es: 'Limpiezas de primavera y otoño y recogida de hojas, para empezar cada temporada con el jardín limpio.',
    },
    headline: { en: 'Spring and fall cleanups', es: 'Limpiezas de primavera y otoño' },
    intro: {
      en: 'Virginia yards collect a lot over winter and fall: leaves, fallen branches and matted beds. A cleanup clears it all and gets the lawn and beds ready for the next season.',
      es: 'Los jardines de Virginia acumulan mucho en otoño e invierno: hojas, ramas caídas y jardineras apelmazadas. Una limpieza lo saca todo y deja el césped y las jardineras listos para la próxima temporada.',
    },
    photo: 'fallEntry',
    photoAlt: 'fallSteps',
    items: [
      {
        name: { en: 'Spring cleanup', es: 'Limpieza de primavera' },
        text: { en: 'Beds cleared, perennials cut back, debris hauled away.', es: 'Jardineras limpias, perennes cortadas y restos retirados.' },
      },
      {
        name: { en: 'Fall cleanup', es: 'Limpieza de otoño' },
        text: { en: 'Beds tidied and the yard prepared for winter.', es: 'Jardineras ordenadas y el jardín listo para el invierno.' },
      },
      {
        name: { en: 'Leaf removal', es: 'Recogida de hojas' },
        text: { en: 'Leaves blown, collected and hauled away, one visit or several through the fall.', es: 'Soplamos, juntamos y nos llevamos las hojas, en una visita o varias durante el otoño.' },
      },
      {
        name: { en: 'Storm debris', es: 'Restos de tormenta' },
        text: { en: 'Branches and debris removed after storms.', es: 'Retiramos ramas y escombros después de las tormentas.' },
      },
    ],
    season: [
      { label: { en: 'Spring cleanup', es: 'Limpieza de primavera' }, from: 3, to: 4, peak: true },
      { label: { en: 'Leaf removal', es: 'Recogida de hojas' }, from: 10, to: 12, peak: true },
    ],
    faqs: [
      {
        q: { en: 'How many leaf visits do I need?', es: '¿Cuántas visitas necesito para recoger las hojas?' },
        a: {
          en: 'Homes with many trees often need two or three visits between late October and mid December. One final visit after the trees are bare works for lighter yards.',
          es: 'Las casas con muchos árboles suelen necesitar dos o tres visitas entre fines de octubre y mediados de diciembre. Para jardines con pocas hojas, basta una visita cuando los árboles ya están pelados.',
        },
      },
    ],
    seoTitle: { en: 'Leaf Removal & Yard Cleanups in Virginia', es: 'Recogida de hojas y limpieza de jardines en Virginia' },
    seoDescription: {
      en: 'Spring cleanups, fall cleanups, leaf removal and storm debris removal across Virginia. Free estimates.',
      es: 'Limpiezas de primavera y otoño, recogida de hojas y retiro de restos de tormenta en Virginia. Estimados gratis.',
    },
    enabled: true,
  },
  {
    slug: { en: 'hardscaping', es: 'patios-y-muros' },
    name: { en: 'Hardscaping', es: 'Patios y muros' },
    menu: { en: 'Hardscaping', es: 'Patios' },
    icon: 'stone',
    summary: { en: 'Paver patios, walkways and retaining walls.', es: 'Patios de adoquín, caminos y muros de contención.' },
    headline: { en: 'Patios, walkways and retaining walls', es: 'Patios, caminos y muros de contención' },
    intro: {
      en: 'Paver patios, walkways and retaining walls built on a properly compacted base so they stay level.',
      es: 'Patios de adoquín, caminos y muros de contención sobre una base bien compactada para que no se hundan.',
    },
    photo: 'rockEdge',
    photoAlt: 'rockCorner',
    license: 'DPOR-LSC',
    items: [
      { name: { en: 'Paver patios', es: 'Patios de adoquín' }, text: { en: 'Built on a compacted gravel base.', es: 'Sobre una base de grava compactada.' } },
      { name: { en: 'Walkways', es: 'Caminos' }, text: { en: 'Pavers or natural stone.', es: 'De adoquín o piedra natural.' } },
      { name: { en: 'Retaining walls', es: 'Muros de contención' }, text: { en: 'Segmental block walls for slopes and raised beds.', es: 'Muros de bloque para pendientes y jardineras elevadas.' } },
    ],
    season: [{ label: { en: 'Spring to fall', es: 'Primavera a otoño' }, from: 3, to: 11 }],
    faqs: [],
    seoTitle: { en: 'Patios, Walkways & Retaining Walls in Virginia', es: 'Patios, caminos y muros en Virginia' },
    seoDescription: { en: 'Paver patios, walkways and retaining walls in Virginia.', es: 'Patios de adoquín, caminos y muros de contención en Virginia.' },
    /** Hidden until Nino confirms he offers hardscaping and holds the license. */
    enabled: false,
  },
]

export const activeServices = services.filter((s) => s.enabled)

export const licenseLabel: Record<License, string> = {
  DPOR: 'Virginia contractor license (DPOR) for jobs over $1,000',
  'DPOR-ISC': 'DPOR Landscape Irrigation Contracting (ISC) specialty',
  'DPOR-LSC': 'DPOR Landscape Service Contracting (LSC) specialty',
  'VDACS-fertilizer': 'VDACS fertilizer contractor-applicator certification',
  'VDACS-pesticide': 'VDACS commercial pesticide applicator certification + pesticide business license',
}
