<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)
let raf = 0

const update = () => {
  raf = 0
  visible.value = window.scrollY > 400
}

const onScroll = () => {
  if (raf) return
  raf = requestAnimationFrame(update)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <button
    type="button"
    aria-label="Back to top"
    class="fixed bottom-6 right-6 z-[50] flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/70 text-white backdrop-blur transition duration-300 hover:bg-white hover:text-black"
    :class="visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
    @click="scrollToTop"
  >
    <svg
      class="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  </button>
</template>
