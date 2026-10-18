import mojs from '@mojs/core'

export type ClickEffectVariant =
  | 'virethos'
  | 'zynthor'
  | 'elarisca'
  | 'gravonix'
  | 'xypheris'
  | 'vorlana'
  | 'klyntar'
  | 'zerionis'
  | 'marnixus'
  | 'taviros'
  | 'lothira'
  | 'xandura'
  | 'dravonix'
  | 'voltrisca'
  | 'elvantis'
  | 'none'

export interface EffectAnimationWrapper {
  /**
   * Re-run `generate()` before `replay()`: the configuration contains
   * `rand(...)` values that must be re-sampled on every click.
   */
  requiresGenerate?: boolean
  /**
   * Tune the animation to the click point plus a random ±30px offset, so
   * repeated clicks never land on exactly the same spot.
   */
  useRandomCoords?: boolean
  animation: InstanceType<typeof mojs.Burst> | InstanceType<typeof mojs.Shape>
}

export interface EffectConfig {
  name: ClickEffectVariant
  animations: EffectAnimationWrapper[]
}

export const effects: EffectConfig[] = [
  {
    name: 'virethos',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 30 },
          rotate: 45,
          children: {
            shape: 'line',
            radius: 3,
            scale: 1,
            stroke: '#FD7932',
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            duration: 700,
            easing: 'quad.out',
            delay: 150,
          },
        }),
      },
      {
        animation: new mojs.Shape({
          left: 0,
          top: 0,
          stroke: { '#E5214A': '#FD7932' },
          strokeWidth: { 40: 0 },
          fill: 'none',
          scale: { 0: 1 },
          radius: 20,
          duration: 400,
          easing: 'cubic.out',
        }),
      },
    ],
  },
  {
    name: 'zynthor',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 5: 30 },
          count: 10,
          children: { radius: 3 },
        }),
      },
    ],
  },
  {
    name: 'elarisca',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 25 },
          count: 6,
          rotate: 45,
          children: { radius: 3, easing: 'quad.out' },
        }),
      },
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 25: 10 },
          count: 6,
          children: { radius: 3, fill: 'orange', easing: 'quad.out' },
        }),
      },
    ],
  },
  {
    name: 'gravonix',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 25 },
          rotate: 45,
          children: {
            shape: 'line',
            radius: 3,
            scale: 1,
            stroke: '#FD7932',
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            duration: 700,
            easing: 'quad.out',
          },
        }),
      },
    ],
  },
  {
    name: 'xypheris',
    animations: [
      {
        requiresGenerate: true,
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: 10,
          count: 3,
          timeline: { delay: 20 },
          children: {
            stroke: 'black',
            fill: 'none',
            scale: 1,
            strokeWidth: { 0: 4 },
            radius: { 'rand(10, 15)': 0 },
            degreeShift: 'rand(-50, 50)',
            duration: 450,
            delay: 'rand(0, 250)',
          },
        }),
      },
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 25 },
          rotate: 0,
          count: 9,
          children: {
            shape: 'line',
            radius: 3,
            scale: 1,
            stroke: 'green',
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            duration: 300,
            easing: 'quad.out',
          },
        }),
      },
    ],
  },
  {
    name: 'vorlana',
    animations: [
      {
        animation: new mojs.Shape({
          left: 0,
          top: 0,
          stroke: { '#E5214A': '#CC8EF5' },
          strokeWidth: { 40: 0 },
          fill: 'none',
          scale: { 0: 1 },
          radius: 20,
          duration: 400,
          easing: 'cubic.out',
        }),
      },
    ],
  },
  {
    name: 'klyntar',
    animations: [
      {
        animation: new mojs.Shape({
          left: 0,
          top: 0,
          stroke: { '#E5214A': '#CC8EF5' },
          strokeWidth: { 40: 0 },
          fill: 'none',
          scale: { 0: 1 },
          radius: 20,
          duration: 400,
          easing: 'cubic.out',
        }),
      },
      {
        animation: new mojs.Shape({
          left: 0,
          top: 0,
          stroke: { '#E5214A': '#CC8EF5' },
          strokeWidth: { 40: 0 },
          fill: 'none',
          scale: { 0: 1 },
          radius: 20,
          duration: 400,
          easing: 'cubic.out',
          delay: 300,
        }),
      },
    ],
  },
  {
    name: 'zerionis',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 25 },
          rotate: 45,
          count: 4,
          children: {
            shape: 'line',
            radius: 3,
            scale: 1,
            stroke: '#FD7932',
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            duration: 700,
            easing: 'quad.out',
            delay: 150,
          },
        }),
      },
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 25 },
          rotate: 0,
          count: 4,
          children: {
            shape: 'line',
            radius: 3,
            scale: 1,
            stroke: 'green',
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            duration: 300,
            easing: 'quad.out',
          },
        }),
      },
      {
        animation: new mojs.Shape({
          left: 0,
          top: 0,
          stroke: { '#E5214A': '#FD7932' },
          strokeWidth: { 20: 0 },
          fill: 'none',
          scale: { 1: 0 },
          radius: 20,
          duration: 400,
          easing: 'cubic.out',
        }),
      },
    ],
  },
  {
    name: 'marnixus',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          degree: 180,
          rotate: -90,
          radius: { 10: 25 },
          count: 5,
          children: {
            shape: 'line',
            radius: 3,
            radiusY: 0,
            scale: 1,
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            stroke: '#555555',
            easing: 'cubic.out',
            duration: 600,
          },
        }),
      },
    ],
  },
  {
    name: 'taviros',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 25 },
          count: 10,
          children: {
            shape: 'line',
            radius: 2,
            radiusY: 0,
            scale: 1,
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            stroke: '#555555',
            easing: 'cubic.out',
            duration: 600,
          },
        }),
      },
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 10: 25 },
          count: 10,
          children: {
            shape: 'line',
            radius: 2,
            radiusY: 0,
            scale: 1,
            strokeDasharray: '100%',
            strokeDashoffset: { '-100%': '100%' },
            stroke: '#ff1111',
            easing: 'cubic.out',
            delay: 300,
            duration: 600,
          },
        }),
      },
    ],
  },
  {
    name: 'lothira',
    animations: [
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 0: 20 },
          count: 7,
          rotate: { 0: 90 },
          children: { fill: 'orange' },
        }),
      },
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 0: 20 },
          count: 7,
          rotate: { 0: 80 },
          children: { fill: 'red', delay: 300 },
        }),
      },
    ],
  },
  {
    name: 'xandura',
    animations: [
      {
        requiresGenerate: true,
        useRandomCoords: true,
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 0: 50 },
          count: 7,
          opacity: { 1: 0 },
          children: { fill: 'red', radius: 2.5, delay: 100 },
        }),
      },
      {
        requiresGenerate: true,
        useRandomCoords: true,
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 0: 40 },
          count: 7,
          opacity: { 1: 0 },
          children: { fill: 'orange', radius: 2.5, delay: 50 },
        }),
      },
      {
        requiresGenerate: true,
        useRandomCoords: true,
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 0: 30 },
          count: 7,
          opacity: { 1: 0 },
          children: { fill: 'green', radius: 2.5 },
        }),
      },
    ],
  },
  {
    name: 'dravonix',
    animations: [
      {
        requiresGenerate: true,
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: 25,
          count: 3,
          children: {
            stroke: 'black',
            fill: 'none',
            scale: 1,
            strokeWidth: { 8: 0 },
            radius: { 0: 'rand(8, 12)' },
            degreeShift: 'rand(-50, 50)',
            duration: 400,
            delay: 'rand(0, 250)',
          },
        }),
      },
    ],
  },
  {
    name: 'voltrisca',
    animations: [
      {
        requiresGenerate: true,
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 0: 30 },
          rotate: 'rand(0, 360)',
          timeline: { delay: 50 },
          children: {
            shape: 'line',
            stroke: 'black',
            fill: 'none',
            scale: 1,
            scaleX: { 1: 0 },
            duration: 650,
          },
        }),
      },
      {
        requiresGenerate: true,
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: 28,
          count: 3,
          timeline: { delay: 200 },
          children: {
            stroke: 'black',
            fill: 'none',
            scale: 1,
            strokeWidth: { 8: 0 },
            radius: { 0: 'rand(6, 10)' },
            degreeShift: 'rand(-50, 50)',
            duration: 450,
            delay: 'rand(0, 250)',
          },
        }),
      },
      {
        animation: new mojs.Shape({
          left: 0,
          top: 0,
          radius: { 0: 16, easing: 'sin.out' },
          fill: 'none',
          stroke: 'black',
          strokeWidth: { 10: 0 },
          duration: 450,
          easing: 'cubic.out',
        }),
      },
    ],
  },
  {
    name: 'elvantis',
    animations: [
      {
        animation: new mojs.Shape({
          left: 0,
          top: 0,
          stroke: { '#E5214A': '#CC8EF5' },
          strokeWidth: { 40: 0 },
          fill: 'none',
          scale: { 0: 1 },
          radius: 20,
          duration: 400,
          easing: 'cubic.out',
        }),
      },
      {
        animation: new mojs.Burst({
          left: 0,
          top: 0,
          radius: { 4: 32 },
          rotate: 45,
          count: 14,
          children: {
            radius: 2.5,
            fill: [
              '#9EC9F5',
              '#91D3F7',
              '#DC93CF',
              '#CF8EEF',
              '#87E9C6',
              '#A7ECD0',
              '#87E9C6',
              '#D58EB3',
              '#F48BA2',
              '#91D3F7',
              '#CF8EEF',
              '#87E9C6',
            ],
            scale: { 1: 0, easing: 'quad.in' },
            pathScale: [0.8, null],
            degreeShift: [13, null],
            duration: [500, 700],
            easing: 'quint.out',
          },
        }),
      },
    ],
  },
]
