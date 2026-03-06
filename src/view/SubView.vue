<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const root = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null
let panelCleanups: Array<() => void> = []
let resizeHandler: (() => void) | null = null
let resizeRaf = 0
let lastWidth = 0
let lastHeight = 0

onMounted(() => {
  if (!root.value) return

  lastWidth = window.innerWidth
  lastHeight = window.innerHeight

  ctx = gsap.context(() => {
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
            end: () =>
              fakeScrollRatio ? `+=${innerpanel.offsetHeight}` : `+=${window.innerHeight}`,
            pinSpacing: false,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
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

        tl.fromTo(panel, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 }).to(
          panel,
          { opacity: 0, duration: 0.1 },
        )

        panelCleanups.push(() => {
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(panel, { clearProps: 'marginBottom,transform,opacity' })
          gsap.set(innerpanel, { clearProps: 'transform' })
        })
      })
    }

    setupPanels()

    const shouldRebuild = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const widthChanged = width !== lastWidth
      const heightChanged = Math.abs(height - lastHeight) > 80
      if (widthChanged || heightChanged) {
        lastWidth = width
        lastHeight = height
        return true
      }
      return false
    }

    resizeHandler = () => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        if (!shouldRebuild()) return
        setupPanels()
        ScrollTrigger.refresh()
      })
    }

    window.addEventListener('resize', resizeHandler)
  }, root.value)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(resizeRaf)
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  panelCleanups.forEach((cleanup) => cleanup())
  panelCleanups = []
  ctx?.revert()
})
</script>

<template>
  <section ref="root">
    <section
      class="video-panel relative w-full min-h-[550px] h-screen my-[80px] px-10 flex flex-col justify-center items-center bgim"
    >
      <div class="section-inner w-full flex flex-col items-center justify-center h-full">
        <h2 class="text-4xl py-10 font-bold text-white pc:text-6xl">HALŌ VIDEO</h2>
      </div>
    </section>
    <section
      class="video-panel relative w-full min-h-[550px] h-screen my-[80px] px-10 flex flex-col justify-center items-center"
    >
      <div class="section-inner w-full flex flex-col items-center text-white">COMMING SOON</div>
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
