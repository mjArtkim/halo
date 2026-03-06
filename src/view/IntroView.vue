<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, Flip)

const root = ref<HTMLElement | null>(null)
let flipCtx: gsap.Context | null = null
let resizeHandler: (() => void) | null = null

const createTween = () => {
  const scope = root.value
  if (!scope) return
  const galleryElement = scope.querySelector<HTMLElement>('#gallery-8')
  if (!galleryElement) return
  const galleryItems = galleryElement.querySelectorAll<HTMLElement>('.gallery__item')

  flipCtx?.revert()
  galleryElement.classList.remove('gallery--final')

  flipCtx = gsap.context(() => {
    galleryElement.classList.add('gallery--final')
    const flipState = Flip.getState(galleryItems)
    galleryElement.classList.remove('gallery--final')

    const flip = Flip.to(flipState, {
      simple: true,
      ease: 'expoScale(1, 5)',
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: galleryElement,
        start: 'center center',
        end: '+=100%',
        scrub: true,
        pin: galleryElement.parentNode as Element,
      },
    })

    tl.add(flip)
    return () => gsap.set(galleryItems, { clearProps: 'all' })
  }, scope)
}

onMounted(() => {
  createTween()
  resizeHandler = () => createTween()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  flipCtx?.revert()
})
</script>
<template>
  <div ref="root">
    <div
      class="gallery-wrap relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      <div
        class="gallery gallery--bento gallery--switch relative h-full w-full flex-none grid gap-[1vh] grid-cols-[repeat(3,32.5vw)] grid-rows-[repeat(4,23vh)] justify-center content-center [&.gallery--final]:grid-cols-[repeat(3,100vw)] [&.gallery--final]:grid-rows-[repeat(4,49.5vh)]"
        id="gallery-8"
      >
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:1/1/3/2]">
          <img class="h-full w-full object-cover" src="@/assets/img/01.jpg" alt="haloimg1" />
        </div>
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:1/2/2/3]">
          <img class="h-full w-full object-cover" src="@/assets/img/02.jpg" alt="haloimg2" />
        </div>
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:2/2/4/3]">
          <img class="h-full w-full object-cover" src="@/assets/img/03.jpg" alt="haloimg3" />
        </div>
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:1/3/3/3]">
          <img class="h-full w-full object-cover" src="@/assets/img/04.jpg" alt="haloimg4" />
        </div>
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:3/1/3/2]">
          <img class="h-full w-full object-cover" src="@/assets/img/05.jpg" alt="haloimg5" />
        </div>
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:3/3/5/4]">
          <img class="h-full w-full object-cover" src="@/assets/img/06.jpg" alt="haloimg6" />
        </div>
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:4/1/5/2]">
          <img class="h-full w-full object-cover" src="@/assets/img/07.jpg" alt="haloimg7" />
        </div>
        <div class="gallery__item relative flex-none bg-center bg-cover [grid-area:4/2/5/3]">
          <img class="h-full w-full object-cover" src="@/assets/img/08.jpg" alt="haloimg8" />
        </div>
      </div>
    </div>
    <div class="section h-full px-10 py-10 text-white flex flex-col justify-center">
      <h1 class="py-4">HALŌ</h1>
      <div class="py-4">
        Formed by DubVision, Matisse & Sadko, and Third Party, HALŌ is a powerhouse collaboration
        that unites decades of experience shaping the global festival sound. Each act is known for
        anthemic melodies, soaring drops, and commanding mainstage performances, and together they
        fuse their signature styles into one electrifying project.
      </div>
      <div class="py-4">
        Blending emotional progressive house with modern production and stadium-sized energy, HALŌ
        delivers a sound built for the world’s biggest stages. Their music captures the spirit of
        progressive house’s golden era while pushing the genre forward with fresh creativity and
        massive festival impact.
      </div>
      <div class="py-4">
        With a shared legacy of acclaimed releases and performances across the world’s biggest
        festivals, HALŌ represents the next evolution of melodic festival dance music.
      </div>
      <div class="py-4 font-bold">A new era of progressive house. HALŌ has arrived.</div>
    </div>
  </div>
</template>
