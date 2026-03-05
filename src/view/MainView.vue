<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import IntroView from '@/view/IntroView.vue'
import TeamVideo from '@/view/TeamVideo.vue'
import TourPage from '@/view/TourPage.vue'

gsap.registerPlugin(ScrollTrigger)

const root = ref<HTMLElement | null>(null)
const heroSection = ref<HTMLElement | null>(null)
const heroImage = ref<HTMLDivElement | null>(null)
let ctx: gsap.Context | null = null
let mediaQuery: MediaQueryList | null = null
let hoverCleanups: Array<() => void> = []
let hoverEnabled = false
let updateHover: (() => void) | null = null
let panelCleanups: Array<() => void> = []
let resizeHandler: (() => void) | null = null
let heroTween: gsap.core.Tween | null = null

onMounted(() => {
  if (!root.value || !heroImage.value || !heroSection.value) return

  ctx = gsap.context(() => {
    const setupHero = () => {
      heroTween?.scrollTrigger?.kill()
      heroTween?.kill()
      gsap.set(heroImage.value, { y: 0, opacity: 1 })
      heroTween = gsap.to(heroImage.value, {
        y: -220,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection.value,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    setupHero()

    const enableHover = () => {
      if (!root.value || hoverEnabled) return
      hoverEnabled = true

      const images = root.value?.querySelectorAll('img.swipeimage')
      if (images) {
        gsap.set(images, { yPercent: -50, xPercent: -50, autoAlpha: 0 })
      }

      hoverCleanups = []
      const containers = gsap.utils.toArray<HTMLElement>('.cursor-container', root.value)

      containers.forEach((el) => {
        const image = el.querySelector<HTMLImageElement>('img.swipeimage')
        if (!image) return

        const setX = gsap.quickTo(image, 'x', { duration: 0.4, ease: 'power3' })
        const setY = gsap.quickTo(image, 'y', { duration: 0.4, ease: 'power3' })
        let firstEnter = true

        const align = (e: MouseEvent) => {
          if (firstEnter) {
            setX(e.clientX, e.clientX)
            setY(e.clientY, e.clientY)
            firstEnter = false
          } else {
            setX(e.clientX)
            setY(e.clientY)
          }
        }

        const startFollow = () => document.addEventListener('mousemove', align)
        const stopFollow = () => document.removeEventListener('mousemove', align)

        const fade = gsap.to(image, {
          autoAlpha: 1,
          ease: 'none',
          paused: true,
          duration: 0.1,
          onReverseComplete: stopFollow,
        })

        const onEnter = (e: MouseEvent) => {
          firstEnter = true
          fade.play()
          startFollow()
          align(e)
        }

        const onLeave = () => fade.reverse()

        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)

        hoverCleanups.push(() => {
          el.removeEventListener('mouseenter', onEnter)
          el.removeEventListener('mouseleave', onLeave)
          stopFollow()
          gsap.set(image, { autoAlpha: 0 })
        })
      })
    }

    const disableHover = () => {
      if (!hoverEnabled) return
      hoverEnabled = false
      hoverCleanups.forEach((cleanup) => cleanup())
      hoverCleanups = []
    }

    updateHover = () => {
      if (!mediaQuery) return
      if (mediaQuery.matches) {
        enableHover()
      } else {
        disableHover()
      }
    }

    mediaQuery = window.matchMedia('(min-width: 1200px)')
    updateHover()
    mediaQuery.addEventListener('change', updateHover)

    const setupPanels = () => {
      panelCleanups.forEach((cleanup) => cleanup())
      panelCleanups = []

      const panels = gsap.utils.toArray<HTMLElement>('.video-panel', root.value)
      panels.forEach((panel) => {
        const innerpanel = panel.querySelector<HTMLElement>('.section-inner')
        if (!innerpanel) return

        const panelHeight = innerpanel.offsetHeight
        const windowHeight = window.innerHeight
        const difference = panelHeight - windowHeight
        const fakeScrollRatio = difference > 0 ? difference / (difference + windowHeight) : 0

        if (fakeScrollRatio) {
          gsap.set(panel, { marginBottom: panelHeight * fakeScrollRatio })
        } else {
          gsap.set(panel, { clearProps: 'marginBottom' })
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: 'bottom bottom',
            end: () => (fakeScrollRatio ? `+=${innerpanel.offsetHeight}` : 'bottom top'),
            pinSpacing: false,
            pin: true,
            scrub: true,
          },
        })

        if (fakeScrollRatio) {
          tl.to(innerpanel, {
            yPercent: -100,
            y: window.innerHeight,
            duration: 1 / (1 - fakeScrollRatio) - 1,
            ease: 'none',
          })
        }

        tl.fromTo(
          panel,
          { scale: 1, opacity: 1 },
          { scale: 0.7, opacity: 0.5, duration: 0.9 },
        ).to(panel, { opacity: 0, duration: 0.1 })

        panelCleanups.push(() => {
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(panel, { clearProps: 'marginBottom,transform,opacity' })
          gsap.set(innerpanel, { clearProps: 'transform' })
        })
      })
    }

    setupPanels()
    resizeHandler = () => {
      setupHero()
      setupPanels()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', resizeHandler)
  }, root.value)
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  panelCleanups.forEach((cleanup) => cleanup())
  panelCleanups = []
  if (mediaQuery && updateHover) {
    mediaQuery.removeEventListener('change', updateHover)
  }
  if (hoverEnabled) {
    hoverCleanups.forEach((cleanup) => cleanup())
    hoverCleanups = []
    hoverEnabled = false
  }
  heroTween?.scrollTrigger?.kill()
  heroTween?.kill()
  ctx?.revert()
})
</script>
<template>
  <section ref="root" class="min-h-screen mx-auto w-full">
    <section>
      <section
        ref="heroSection"
        class="h-screen relative flex flex-col items-center overflow-hidden"
      >
        <div class="w-full z-1 gap-30 pt-30 px-8 pc:flex pc:flex-col pc:items-center pc:pt-20">
          <div class="py-30 pc:py-4">
            <img src="@/assets/img/logo.png" alt="Logo" class="pc:h-[150px]" />
          </div>
          <div class="flex flex-col items-center justify-center gap-30 pt-10 text-[#DDD] pc:pt-20">
            <div class="text-xl">BE PART OF OUR FUTURE</div>
            <div class="text-xl">HALŌ</div>
          </div>
        </div>
        <div ref="heroImage" class="absolute bottom-0 h-[680px] w-full will-change-transform">
          <img
            src="@/assets/img/main.png"
            alt="Main Image"
            class="w-full h-full object-cover pc:hidden"
          />
          <img
            src="@/assets/img/mains.png"
            alt="Main Image"
            class="w-full h-full object-contain hidden pc:block"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-transparent to-black"></div>
        </div>
      </section>
      <section class="h-screen flex flex-col justify-center">
        <ul class="flex flex-col gap-10">
          <li
            class="cursor-container w-full cursor-pointer border-y border-[#ddd] py-8 text-center text-white pc:hover:bg-white pc:hover:text-[#333] active:bg-white active:text-[#333]"
          >
            <img
              class="swipeimage pointer-events-none invisible fixed left-0 top-0 z-[9] h-[335px] w-[280px] -translate-x-1/2 -translate-y-1/2 object-cover opacity-0"
              src="@/assets/img/db.png"
              alt="DUBVISION"
            />
            <div class="text text-2xl font-bold">
              <h1>DUBVISION</h1>
            </div>
          </li>
          <li
            class="cursor-container w-full cursor-pointer border-y border-[#ddd] py-8 text-center text-white pc:hover:bg-white pc:hover:text-[#333] active:bg-white active:text-[#333]"
          >
            <img
              class="swipeimage pointer-events-none invisible fixed left-0 top-0 z-[9] h-[335px] w-[280px] -translate-x-1/2 -translate-y-1/2 object-cover opacity-0"
              src="@/assets/img/ms.png"
              alt="MATISSE & SADKO"
            />
            <div class="text text-2xl font-bold">
              <h1>MATISSE & SADKO</h1>
            </div>
          </li>
          <li
            class="cursor-container w-full cursor-pointer border-y border-[#ddd] py-8 text-center text-white pc:hover:bg-white pc:hover:text-[#333] active:bg-white active:text-[#333]"
          >
            <img
              class="swipeimage pointer-events-none invisible fixed left-0 top-0 z-[9] h-[335px] w-[280px] -translate-x-1/2 -translate-y-1/2 object-cover opacity-0"
              src="@/assets/img/tp.png"
              alt="THIRD PARTY"
            />
            <div class="text text-2xl font-bold">
              <h1>THIRD PARTY</h1>
            </div>
          </li>
        </ul>
      </section>
      <section>
        <IntroView></IntroView>
      </section>
    </section>
    <section
      class="video-panel relative w-full min-h-[870px] h-screen my-[80px] px-10 flex flex-col justify-center items-center bgim"
    >
      <div class="section-inner w-full flex flex-col items-center justify-center h-full">
        <h2 class="text-4xl py-10 font-bold text-white pc:text-6xl">HALŌ VIDEO</h2>
      </div>
    </section>
    <section
      class="video-panel relative w-full min-h-[870px] h-screen my-[80px] px-10 flex flex-col justify-center items-center"
    >
      <div class="section-inner w-full flex flex-col items-center">
        <TeamVideo class="grid"></TeamVideo>
      </div>
    </section>
    <section
      class="video-panel relative w-full min-h-[880px] h-full my-[30px] px-10 flex flex-col justify-center items-center bgim2 pc:py-20"
    >
      <div class="section-inner w-full flex flex-col items-center justify-center py-20">
        <h2 class="text-4xl py-10 font-bold text-white pc:text-6xl">HALŌ TOUR</h2>
      </div>
      <TourPage></TourPage>
    </section>
  </section>
</template>
<style>
.bgim {
  background-image: url('@/src/assets/img/09.webp');
  background-size: cover;
  background-position: center;
}
.bgim2 {
  background-image: url('@/src/assets/img/11.webp');
  background-size: cover;
  background-position: center;
}
</style>
