import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Black and white, under the floodlights. Made for night, so dark mode only.
const { theme, problems } = makeColors({
  label: 'Kara Kartal stadium',
  only: 'dark',
  roles: { accent: '#9fb4c8', danger: '#e0303c', success: '#3f9a5a', warning: '#d9a03a', pro: '#a98bd4' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0a0a0a',
        'surface-1': '#131313',
        'surface-2': '#1a1a1a',
        'surface-3': '#202020',
        'text-primary': '#f6f6f6',
        'text-secondary': '#d0d0d0',
        'text-muted': '#a6a6a6',
      },
    },
  },
})

// A small seeded random, so the crowd sits in the same seats every load.
let seed = 1903
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// Stadium bowl: three nested ellipses centred below the screen.
const CX = 800
const CY = 860
const RINGS = { outer: [1180, 680], middle: [1020, 540], inner: [840, 400] } as const

const inBand = (x: number, y: number, a: readonly [number, number], b: readonly [number, number]) => {
  const d = (r: readonly [number, number]) => ((x - CX) / r[0]) ** 2 + ((y - CY) / r[1]) ** 2
  return d(a) <= 1 && d(b) > 1
}

// Phone lights and scarves in the stands.
function crowd(count: number, a: readonly [number, number], b: readonly [number, number]) {
  const dots: string[] = []
  while (dots.length < count) {
    const x = rand() * 1600
    const y = 150 + rand() * 520
    if (!inBand(x, y, a, b)) continue
    const t = 1 + Math.floor(rand() * 4)
    const r = (0.8 + rand() * 1.6).toFixed(1)
    const o = (0.25 + rand() * 0.5).toFixed(2)
    dots.push(`<circle class="t${t}" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" opacity="${o}"/>`)
  }
  return dots.join('')
}

const flag = (x: number, y: number, d: number) => `
  <g transform="translate(${x} ${y})">
    <line x1="0" y1="0" x2="0" y2="70" stroke="#777" stroke-width="2"/>
    <g class="flag" style="animation-delay:-${d}s">
      <path d="M0 2 C 18 -4 36 8 56 2 L 56 38 C 36 44 18 32 0 38 Z" fill="url(#stripes)" stroke="#ddd" stroke-width="0.6"/>
    </g>
  </g>`

const tower = (x: number, flip: boolean) => {
  const s = flip ? -1 : 1
  const lamps: string[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      lamps.push(`<rect x="${-40 + c * 16}" y="${-18 + r * 12}" width="12" height="8" rx="1.5" fill="#fffef6"/>`)
    }
  }
  return `
  <g transform="translate(${x} 70) scale(${s} 1)">
    <path d="M-6 20 L 30 420 L 40 420 L 6 20 Z" fill="#161616"/>
    <circle cx="0" cy="0" r="120" fill="url(#glow)" class="halo"/>
    <rect x="-46" y="-24" width="92" height="46" rx="4" fill="#2a2a2a"/>
    ${lamps.join('')}
    <polygon class="beam" points="-40,20 40,20 ${780 * 1},820 ${380},900" fill="url(#beam)"/>
  </g>`
}

const eagle =
  'M0 0 C -14 -10 -40 -16 -78 -6 C -60 -4 -46 2 -36 6 C -28 4 -20 6 -14 9 L -6 8 L -4 18 L 0 22 L 4 18 L 6 8 L 14 9 C 20 6 28 4 36 6 C 46 2 60 -4 78 -6 C 40 -16 14 -10 0 0 Z'

const ring = (r: readonly [number, number]) => `M ${CX - r[0]} ${CY} a ${r[0]} ${r[1]} 0 1 0 ${2 * r[0]} 0 a ${r[0]} ${r[1]} 0 1 0 ${-2 * r[0]} 0 Z`

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
  .t1, .t2, .t3, .t4 { fill: #f2f2f2; }
  .t1 { animation: tw 5s ease-in-out infinite; }
  .t2 { animation: tw 7s ease-in-out infinite -2s; }
  .t3 { animation: tw 9s ease-in-out infinite -4s; }
  .t4 { animation: tw 11s ease-in-out infinite -6s; }
  @keyframes tw { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.85; } }
  .beam { opacity: 0.10; animation: beam 14s ease-in-out infinite; }
  @keyframes beam { 0%, 100% { opacity: 0.08; } 50% { opacity: 0.14; } }
  .halo { opacity: 0.8; animation: halo 10s ease-in-out infinite; }
  @keyframes halo { 0%, 100% { opacity: 0.7; } 50% { opacity: 0.95; } }
  .flag { transform-box: fill-box; transform-origin: 0% 50%; animation: wave 6s ease-in-out infinite; }
  @keyframes wave { 0%, 100% { transform: skewY(-3deg) scaleX(0.96); } 50% { transform: skewY(3deg) scaleX(1); } }
  .eagle { animation: glide 70s linear infinite; }
  @keyframes glide { 0% { transform: translate(-200px, 120px); } 50% { transform: translate(800px, 70px); } 100% { transform: translate(1800px, 130px); } }
  .wings { transform-box: fill-box; transform-origin: 50% 50%; animation: flap 8s ease-in-out infinite; }
  @keyframes flap { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.82); } }
  .tifo { animation: tifo 16s ease-in-out infinite; }
  @keyframes tifo { 0%, 100% { opacity: 0.30; } 50% { opacity: 0.42; } }
</style>
<defs>
  <radialGradient id="sky" cx="50%" cy="0%" r="90%">
    <stop offset="0" stop-color="#1c1c1c"/>
    <stop offset="1" stop-color="#050505"/>
  </radialGradient>
  <radialGradient id="glow">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
    <stop offset="0.35" stop-color="#ffffff" stop-opacity="0.12"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="pitch" cx="50%" cy="100%" r="80%">
    <stop offset="0" stop-color="#17351f"/>
    <stop offset="1" stop-color="#0b1a10"/>
  </radialGradient>
  <pattern id="stripes" width="28" height="28" patternUnits="userSpaceOnUse">
    <rect width="14" height="28" fill="#f4f4f4"/>
    <rect x="14" width="14" height="28" fill="#0c0c0c"/>
  </pattern>
  <pattern id="mow" width="1600" height="60" patternUnits="userSpaceOnUse">
    <rect width="1600" height="30" fill="#ffffff" opacity="0.025"/>
  </pattern>
  <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
    <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.75"/>
  </radialGradient>
</defs>

<rect width="1600" height="1000" fill="url(#sky)"/>
<circle cx="1180" cy="90" r="26" fill="#e9e9e4" opacity="0.35"/>

<!-- the bowl -->
<path d="${ring(RINGS.outer)}" fill="#0e0e0e"/>
<path class="tifo" d="${ring(RINGS.outer)} ${ring(RINGS.middle)}" fill="url(#stripes)" fill-rule="evenodd"/>
<path d="${ring(RINGS.middle)}" fill="#101010"/>
<path d="${ring(RINGS.middle)}" fill="none" stroke="#2c2c2c" stroke-width="3"/>
<g>${crowd(260, RINGS.outer, RINGS.middle)}</g>
<g>${crowd(420, RINGS.middle, RINGS.inner)}</g>

<!-- the pitch -->
<path d="${ring(RINGS.inner)}" fill="url(#pitch)"/>
<path d="${ring(RINGS.inner)}" fill="url(#mow)"/>
<g fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="2.5">
  <path d="${ring([700, 320])}"/>
  <line x1="${CX}" y1="${CY - 320}" x2="${CX}" y2="1000"/>
  <ellipse cx="${CX}" cy="${CY}" rx="150" ry="70"/>
</g>

<!-- flags along the rail -->
${flag(260, 360, 0)}${flag(560, 300, 1.5)}${flag(1000, 300, 3)}${flag(1300, 360, 4.5)}

<!-- floodlights -->
${tower(110, false)}${tower(1490, true)}

<!-- the black eagle, gliding -->
<g class="eagle" transform="translate(1180 110)">
  <g class="wings"><path d="${eagle}" fill="#f0f0f0" opacity="0.55" transform="scale(1.3)"/></g>
</g>

<rect width="1600" height="1000" fill="url(#vignette)"/>
</svg>`

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'stadium', glass: { blur: 14, tint: '#0a0a0a', opacity: 0.62 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)
    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }
    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SCENE} alt="A night stadium in black and white: floodlights, striped stands, a twinkling crowd and an eagle gliding overhead" />
  })
}
