# Fotos reales

Pon aquí las fotos de los trabajos de Nino (JPG, PNG o WebP, idealmente 2000 px de ancho o más).

Luego, en `src/content/images.ts`, usa el nombre del archivo como `src`:

```ts
heroHouse: { src: 'frente-casa-fairfax.jpg', alt: { en: 'Front yard in Fairfax…', es: 'Jardín delantero en Fairfax…' } },
```

Al compilar, el sitio genera automáticamente versiones optimizadas (WebP) en varios tamaños para celular, tablet y computadora. No hace falta reducirlas a mano.
