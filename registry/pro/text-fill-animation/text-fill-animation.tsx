'use client'

import { useEffect, useId, useRef } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { cn } from '@/lib/utils'
import styles from './text-fill-animation.module.css'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

export interface TextFillAnimationProps
  extends React.HTMLAttributes<HTMLElement> {
  text?: string
  showDetails?: boolean

  textColor?: string
  primaryColor?: string
  velocityPrimary?: boolean
  dimColor?: string
  backgroundColor?: string

  textSize?: string
  textWidth?: string
  tabletTextSize?: string
  tabletTextWidth?: string
  mobileTextSize?: string
  mobileTextWidth?: string

  start?: string
  end?: string
  scrub?: number | boolean
  height?: string | number
  viewportHeight?: string

  scroller?: HTMLElement | Window | RefObject<HTMLElement | null>
  trigger?: HTMLElement | RefObject<HTMLElement | null>
}

interface TextFillStyleVars extends React.CSSProperties {
  '--tfa-viewport-height'?: string
  '--tfa-text-color'?: string
  '--tfa-primary-color'?: string
  '--tfa-dim-color'?: string
  '--tfa-text-size'?: string
  '--tfa-text-width'?: string
  '--tfa-tablet-text-size'?: string
  '--tfa-tablet-text-width'?: string
  '--tfa-mobile-text-size'?: string
  '--tfa-mobile-text-width'?: string
}

export function TextFillAnimation({
  text = 'Dead simple animations for React. Scroll, watch the words fill, and notice how speed spreads the color.',
  showDetails = true,
  textColor = 'var(--color-foreground)',
  primaryColor = '#ff6b00',
  velocityPrimary = true,
  dimColor =
    'color-mix(in srgb, var(--color-foreground) 20%, var(--color-background))',
  backgroundColor = 'var(--color-background)',
  textSize = '5vw',
  textWidth = '80%',
  tabletTextSize = '6.5vw',
  tabletTextWidth = '88%',
  mobileTextSize = '8vw',
  mobileTextWidth = '95%',
  start = 'top top',
  end = 'bottom bottom',
  scrub = 0.25,
  height = '250vh',
  viewportHeight = '100vh',
  scroller,
  trigger,
  className,
  id,
  style,
  ...props
}: TextFillAnimationProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const generatedId = useId()

  useEffect(() => {
    const media = gsap.matchMedia()

    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        const textElement = textRef.current
        if (!textElement) return

        const split = SplitText.create(textElement, {
          type: 'words chars',
          aria: 'auto',
          tag: 'span',
          charsClass: 'split-chars',
        })

        gsap.set(textElement, {
          opacity: 1,
        })

        const characters = Array.from(
          textElement.querySelectorAll('.split-chars')
        )

        const triggerElement =
          trigger && 'current' in trigger ? trigger.current : trigger
        const scrollerElement =
          scroller && 'current' in scroller ? scroller.current : scroller

        gsap
          .timeline({
            scrollTrigger: {
              trigger: triggerElement ?? sectionRef.current,
              scroller: scrollerElement,
              start,
              end,
              scrub,
              invalidateOnRefresh: true,
            },
          })
          .to(
            characters,
            {
              className: 'split-chars show',
              duration: 0.4,
              stagger: 0.05,
              ease: 'power2.inOut',
            },
            0
          )

        return () => {
          split.revert()
        }
      },
      sectionRef
    )

    return () => {
      media.revert()
    }
  }, [text, trigger, scroller, start, end, scrub])

  const styleVars: TextFillStyleVars = {
    height,
    backgroundColor,
    '--tfa-viewport-height': viewportHeight,
    '--tfa-text-color': textColor,
    '--tfa-primary-color': velocityPrimary === false ? textColor : primaryColor,
    '--tfa-dim-color': dimColor,
    '--tfa-text-size': textSize,
    '--tfa-text-width': textWidth,
    '--tfa-tablet-text-size': tabletTextSize,
    '--tfa-tablet-text-width': tabletTextWidth,
    '--tfa-mobile-text-size': mobileTextSize,
    '--tfa-mobile-text-width': mobileTextWidth,
    ...style,
  }

  return (
    <section
      id={id ?? `text-fill-${generatedId}`}
      ref={sectionRef}
      className={cn(styles.root, className)}
      style={styleVars}
      {...props}
    >
      <div className={styles.viewport}>
        <div aria-hidden="true" className={styles.glow} />

        {showDetails && (
          <>
            <div className="absolute left-[5vw] top-[5vh]">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-dead-400">
                Text Fill Animation
              </p>
            </div>

            <div className="absolute right-[5vw] top-[5vh] text-right">
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-dead-400">
                Scroll ↓
              </p>
            </div>

            <div className="absolute bottom-[6vh] left-[5vw]">
              <p className="font-mono text-sm leading-relaxed text-dead-400">
                Dead simple.
                <br />
                Dead smooth.
              </p>
            </div>

            <div className="absolute bottom-[6vh] right-[5vw] text-right">
              <div className="space-y-1">
                <p className="font-mono text-sm text-dead-400">GSAP</p>
                <p className="font-mono text-sm text-dead-400">SplitText</p>
                <p className="font-mono text-sm text-dead-400">Velocity</p>
              </div>
            </div>
          </>
        )}

        <div className={styles.wrapper}>
          <h2 ref={textRef} className={styles.heading}>
            {text}
          </h2>
        </div>
      </div>
    </section>
  )
}