<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const root = ref<HTMLElement | null>(null)
const heroSection = ref<HTMLElement | null>(null)
const heroImage = ref<HTMLDivElement | null>(null)
let ctx: gsap.Context | null = null
let hoverCleanups: Array<() => void> = []

onMounted(() => {
  if (!root.value || !heroImage.value || !heroSection.value) return

  ctx = gsap.context(() => {
    gsap.set(heroImage.value, { y: 0, opacity: 1 })
    gsap.to(heroImage.value, {
      y: -220,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection.value,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })

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
      })
    })
  }, root.value)
})

onBeforeUnmount(() => {
  hoverCleanups.forEach((cleanup) => cleanup())
  hoverCleanups = []
  ctx?.revert()
})
</script>
<template>
  <section ref="root" class="bg-black">
    <section ref="heroSection" class="h-screen relative flex flex-col items-center overflow-hidden">
      <div class="w-full z-1 gap-30 pt-30 px-8">
        <div class="py-30"><img src="@/assets/img/logo.png" alt="Logo" /></div>
        <div class="flex flex-col items-center justify-center gap-30 pt-10 text-[#DDD]">
          <div class="text-xl">BE PART OF OUR FUTURE</div>
          <div class="text-xl">HALŌ</div>
        </div>
      </div>
      <div ref="heroImage" class="absolute bottom-0 h-[680px] w-full will-change-transform">
        <img src="@/assets/img/main.png" alt="Main Image" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-transparent to-black/90"></div>
      </div>
    </section>
    <section class="h-screen flex flex-col justify-center">
      <ul class="flex flex-col gap-10">
        <li
          class="cursor-container w-full cursor-pointer border-y border-[#ddd] py-8 text-center text-white hover:bg-white hover:text-[#333]"
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
          class="cursor-container w-full cursor-pointer border-y border-[#ddd] py-8 text-center text-white hover:bg-white hover:text-[#333]"
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
          class="cursor-container w-full cursor-pointer border-y border-[#ddd] py-8 text-center text-white hover:bg-white hover:text-[#333]"
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
  </section>
</template>
<style></style>
