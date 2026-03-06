<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const root = ref<HTMLElement | null>(null)
type VideoItem = {
  id: string
  title: string
  artist: string
}

const videos: VideoItem[] = [
  { id: 'lPLHOPVSw_Q', title: 'Tomorrowland Brasil 2025', artist: 'HALŌ' },
  { id: 'aWOm_wGei7Q', title: 'Tomorrowland 2025', artist: 'Dubvision B2B Third Party' },
  {
    id: '2F-cUyKOqv0',
    title: 'World DJ Festival 2025',
    artist: 'SICK INDIVIDUALS b3b Matisse & Sadko b3b Third Party',
  },
  { id: 'QlmIduFbr8g', title: 'Drop Times presents', artist: 'Third Party B2B Matisse & Sadko' },
  {
    id: 'ftaaOUiIuOQ',
    title: 'AFAS x STMPD LABEL NIGHT 2024',
    artist: 'DUBVISION B2B MATISSE & SADKO',
  },
]
let ctx: gsap.Context | null = null
let marginCleanups: Array<() => void> = []

onMounted(() => {
  if (!root.value) return

  ctx = gsap.context(() => {
    const panels = gsap.utils.toArray<HTMLElement>('.section', root.value)
    if (panels.length === 0) return
    panels.pop()

    panels.forEach((panel) => {
      const innerpanel = panel.querySelector<HTMLElement>('.section-inner')
      if (!innerpanel) return

      const panelHeight = innerpanel.offsetHeight
      const windowHeight = window.innerHeight
      const difference = panelHeight - windowHeight
      const fakeScrollRatio = difference > 0 ? difference / (difference + windowHeight) : 0

      if (fakeScrollRatio) {
        const previousMargin = panel.style.marginBottom
        panel.style.marginBottom = `${panelHeight * fakeScrollRatio}px`
        marginCleanups.push(() => {
          panel.style.marginBottom = previousMargin
        })
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

      tl.fromTo(panel, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 }).to(
        panel,
        {
          opacity: 0,
          duration: 0.1,
        },
      )
    })
  }, root.value)
})

onBeforeUnmount(() => {
  marginCleanups.forEach((cleanup) => cleanup())
  marginCleanups = []
  ctx?.revert()
})
</script>

<template>
  <section ref="root">
    <section
      class="section relative w-full h-screen my-[80px] px-10 flex flex-col justify-center items-center bgim"
    >
      <div class="section-inner w-full flex flex-col items-center justify-center">
        <h2 class="text-4xl py-10 font-bold text-white pc:text-6xl">HALŌ VIDEO</h2>
      </div>
    </section>
    <section
      class="section relative w-full h-screen my-[80px] px-10 flex flex-col justify-center items-center"
    >
      <div class="section-inner w-full flex flex-col items-center text-white">
        <div class="w-full max-w-6xl grid grid-cols-1 pc:grid-cols-2 gap-6">
          <div
            v-for="video in videos"
            :key="video.id"
            class="w-full overflow-hidden rounded-xl border border-white/20 bg-black/40"
          >
            <div class="relative aspect-video w-full">
              <iframe
                class="absolute inset-0 h-full w-full"
                :src="`https://www.youtube.com/embed/${video.id}`"
                :title="`${video.title} - ${video.artist}`"
                frameborder="0"
                allow="
                  accelerometer;
                  autoplay;
                  clipboard-write;
                  encrypted-media;
                  gyroscope;
                  picture-in-picture;
                "
                allowfullscreen
                loading="lazy"
              ></iframe>
              <div
                class="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black via-black/30 to-transparent"
              >
                <div class="p-4 text-white">
                  <div class="text-lg font-semibold leading-tight">{{ video.title }}</div>
                  <div class="text-sm opacity-80">{{ video.artist }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
