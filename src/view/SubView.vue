<script setup lang="ts">
type VideoItem = {
  id: string
  title: string
  artist: string
}

const videos: VideoItem[] = [
  { id: '4uHPAUR9bfk?si=fL8_W5ffnpYU9iCC', title: 'Tomorrowland 2026', artist: 'HALŌ' },
  {
    id: 'RRqBlBRrVi4?si=c5GuxS4Wlj_46JmU',
    title: 'SSK AFTER PARTY 2026',
    artist: 'THIRDPARTY B2B DUBVISION',
  },
  {
    id: 'Hwdz8PNVj04?si=W-cdNtZHCJ4NS48w',
    title: 'Tomorrowland Winter 2026',
    artist: 'Matisse & Sadko B2B Third Party ',
  },
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
</script>

<template>
  <section class="video-section">
    <section
      class="video-hero relative flex w-full flex-col items-center justify-center bgim px-5 pc:px-10"
    >
      <div class="w-full flex flex-col items-center justify-center">
        <h2 class="text-4xl py-10 font-bold text-white pc:text-6xl">HALŌ VIDEO</h2>
      </div>
    </section>
    <section class="relative flex w-full flex-col items-center px-5 py-16 pc:px-10 pc:py-24">
      <div class="w-full flex flex-col items-center text-white">
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
              <div class="pointer-events-none absolute inset-0 flex items-end">
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
.video-section {
  overflow: clip;
}

.video-hero {
  min-height: 100vh;
  min-height: 100svh;
}

.bgim {
  background-image: url('@/src/assets/img/09.webp');
  background-size: cover;
  background-position: center;
}

@supports not (overflow: clip) {
  .video-section {
    overflow: hidden;
  }
}
.bgim2 {
  background-image: url('@/src/assets/img/11.webp');
  background-size: cover;
  background-position: center;
}
</style>
