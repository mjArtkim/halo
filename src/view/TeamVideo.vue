<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import Flip from 'gsap/Flip'

gsap.registerPlugin(Flip)
const videoIds: string[] = [
  'lPLHOPVSw_Q?si=V43CKVqe1MmJiyD3',
  'aWOm_wGei7Q?si=KMDgDZdl-n2zxtpx',
  '2F-cUyKOqv0?si=-mqvXfOn4hKfJWEA',
  'QlmIduFbr8g?si=_fBY45aawNazGhjI',
  'ftaaOUiIuOQ?si=IbcyhUoPtp-frTfH',
]
const currentIndex = ref<number>(0)
let elementNodes: HTMLElement[] = []

onMounted(() => {
  elementNodes = gsap.utils.toArray<HTMLElement>('.element')
  if (elementNodes.length > 0) {
    elementNodes[0]?.classList.add('grow')
  }
})

const handleClick = () => {
  if (elementNodes.length === 0) return
  const state = Flip.getState(elementNodes)
  const currentEl = elementNodes[currentIndex.value]
  if (!currentEl) return
  currentEl.classList.remove('grow')

  const nextIndex = (currentIndex.value + 1) % elementNodes.length
  const nextEl = elementNodes[nextIndex]
  if (!nextEl) return
  currentIndex.value = nextIndex
  nextEl.classList.add('grow')

  Flip.from(state, {
    duration: 1,
    ease: 'power1.inOut',
    absolute: true,
  })
}
</script>

<template>
  <div class="ytc-box">
    <div class="ytc-inbtn">
      <button @click="handleClick" class="ytc-move">
        <div class="ytc-btn material-symbols-rounded">keyboard_arrow_down</div>
      </button>
    </div>
    <div class="ytc">
      <div class="element" v-for="(videoId, index) in videoIds" :key="index">
        <iframe
          :src="`https://www.youtube.com/embed/${videoId}`"
          title="YouTube video player"
          loading="lazy"
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
        ></iframe>
      </div>
    </div>
  </div>
</template>

<style>
.ytc-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
}

.ytc {
  width: 100%;
  height: 80vh;
  min-height: 80vh;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
iframe {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 1px solid #797979;
}
.ytc .element {
  width: 100%;
  height: 10%;
  border-radius: 10px;
}
.ytc .element.grow {
  height: 100%;
}
.ytc-inbtn {
  position: absolute;
  top: -90px;
  right: 0;
  z-index: 10;
}
.ytc-move {
  position: absolute;
  top: 0px;
  right: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgb(20, 20, 20);
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 0px 4px rgba(255, 255, 255, 0.253);
  cursor: pointer;
  transition-duration: 0.3s;
  overflow: hidden;
}

.ytc-btn {
  width: 20px;
  height: 22px;
  transition-duration: 0.3s;
  color: #fff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 600px) {
  .ytc-inbtn {
    position: absolute;
    top: -90px;
    right: 0px;
  }
}
@media (min-width: 601px) and (max-width: 1024px) {
  .ytc-inbtn {
    position: absolute;
    top: -90px;
    right: 80px;
  }
}
@media (min-width: 1025px) {
  .ytc-move:hover {
    width: 140px;
    border-radius: 50px;
    transition-duration: 0.3s;
    background-color: rgb(255, 255, 255);
    align-items: center;
  }

  .ytc-move:hover .ytc-btn {
    transition-duration: 0.3s;
    transform: translateY(210%);
  }

  .ytc-move::before {
    position: absolute;
    bottom: -20px;
    content: 'Move to Video';
    color: #000;
    font-size: 0px;
  }

  .ytc-move:hover::before {
    font-size: 13px;
    opacity: 1;
    bottom: unset;
    transition-duration: 0.3s;
  }
}
</style>
