<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

type Tour = {
  id: string
  title: string
  setLabel: string
  dateDisplay: string
  city: string
  country: string
  ticket: string
  sortDate: Date | null
  isTBA: boolean
  isHalo: boolean
}

const tours = ref<Tour[]>([])
const loading = ref(true)
const errorMessage = ref('')
let unsubscribe: (() => void) | null = null
const activeTour = ref<Tour | null>(null)
const isListOpen = ref(false)
const isOverlayOpen = computed(() => isListOpen.value || !!activeTour.value)
let scrollLocked = false
let savedBodyOverflow = ''
let savedBodyPaddingRight = ''

const lockScroll = () => {
  if (scrollLocked || typeof window === 'undefined' || typeof document === 'undefined') return
  const body = document.body
  savedBodyOverflow = body.style.overflow
  savedBodyPaddingRight = body.style.paddingRight
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`
  }
  body.style.overflow = 'hidden'
  scrollLocked = true
}

const unlockScroll = () => {
  if (!scrollLocked || typeof document === 'undefined') return
  const body = document.body
  body.style.overflow = savedBodyOverflow
  body.style.paddingRight = savedBodyPaddingRight
  scrollLocked = false
}

type ViewMode = 'upcoming' | 'past'
const viewMode = ref<ViewMode>('upcoming')
const today = new Date()
today.setHours(0, 0, 0, 0)

const toDate = (value: unknown) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  if (typeof value === 'object' && 'toDate' in value) {
    const maybeDate = (value as { toDate?: () => Date }).toDate?.()
    return maybeDate instanceof Date ? maybeDate : null
  }
  return null
}

const normalizeDate = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const parsed = toDate(value)
    if (parsed) {
      return {
        label: parsed.toLocaleDateString('en-CA'),
        sortDate: parsed,
        isTBA: false,
      }
    }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    const parsed = trimmed ? toDate(trimmed) : null
    if (parsed) {
      return { label: trimmed, sortDate: parsed, isTBA: false }
    }
  }

  return { label: 'TBA', sortDate: null, isTBA: true }
}

const normalizeSetLabel = (value: string) => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

const extractStrings = (value: unknown, out: string[] = []) => {
  if (!value) return out
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed) out.push(trimmed)
    return out
  }
  if (Array.isArray(value)) {
    value.forEach((item) => extractStrings(item, out))
    return out
  }
  if (typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => extractStrings(item, out))
  }
  return out
}

const matchesHalo = (value: unknown) => {
  const labels = extractStrings(value)
  return labels.some((item) => normalizeSetLabel(item).includes('HALO'))
}

const isPast = (value: Date | null) => {
  const d = value
  if (!d) return false
  return d.getTime() < today.getTime()
}

const filteredTours = computed(() => {
  const items = tours.value.filter((tour) => tour.isHalo)

  if (viewMode.value === 'upcoming') {
    return items
      .filter((t) => t.isTBA || (t.sortDate && t.sortDate >= today))
      .sort((a, b) => {
        if (a.isTBA && !b.isTBA) return 1
        if (!a.isTBA && b.isTBA) return -1
        if (a.isTBA && b.isTBA) return 0
        return (a.sortDate?.getTime() ?? 0) - (b.sortDate?.getTime() ?? 0)
      })
  }

  return items
    .filter((t) => t.sortDate && t.sortDate < today)
    .sort((a, b) => (b.sortDate?.getTime() ?? 0) - (a.sortDate?.getTime() ?? 0))
    .slice(0, 10)
})

const hasTours = computed(() => filteredTours.value.length > 0)

const formatLocation = (tour: Tour) => {
  return [tour.city, tour.country].filter(Boolean).join(', ')
}

const openModal = (tour: Tour) => {
  activeTour.value = tour
}

const closeModal = () => {
  activeTour.value = null
}

const startListening = () => {
  if (unsubscribe) return
  loading.value = true
  errorMessage.value = ''
  const colRef = collection(db, 'tours')
  unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      errorMessage.value = ''
      tours.value = snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>
        const dateInfo = normalizeDate(data.date)
        const setParts = extractStrings(data.set)
        const setLabel = setParts.join(', ')
        return {
          id: doc.id,
          title: String(data.title ?? ''),
          setLabel,
          dateDisplay: dateInfo.label,
          city: String(data.city ?? ''),
          country: String(data.country ?? ''),
          ticket: String(data.ticket ?? ''),
          sortDate: dateInfo.sortDate,
          isTBA: dateInfo.isTBA,
          isHalo: matchesHalo(data.set),
        }
      })
      loading.value = false
    },
    (error) => {
      console.error('[TourPage] Failed to load tours:', error)
      errorMessage.value = error?.message ?? 'Failed to load tours.'
      loading.value = false
    },
  )
}

const stopListening = () => {
  if (!unsubscribe) return
  unsubscribe()
  unsubscribe = null
}

const openList = () => {
  isListOpen.value = true
  startListening()
}

const closeList = () => {
  isListOpen.value = false
  activeTour.value = null
  stopListening()
}

onBeforeUnmount(() => {
  stopListening()
  unlockScroll()
})

watch(
  isOverlayOpen,
  (open) => {
    if (open) {
      lockScroll()
    } else {
      unlockScroll()
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="w-full px-3 py-10 text-white">
    <div class="mx-auto w-full flex justify-center">
      <button
        type="button"
        class="rounded-md border border-white/30 bg-black/80 px-6 py-3 text-base transition hover:bg-white hover:text-black"
        @click="openList"
      >
        Show Tours
      </button>
    </div>

    <div
      v-if="isListOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      @click="closeList"
    >
      <div
        class="w-full max-w-3xl rounded-2xl border border-white/20 bg-black/90 p-6 text-white"
        @click.stop
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold">TOUR</h2>
            <span class="text-xs uppercase tracking-[0.2em] text-white/60">Live</span>
          </div>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-sm transition hover:bg-white hover:text-black"
            @click="closeList"
          >
            Close
          </button>
        </div>

        <div class="mt-5">
          <div
            class="flex w-fit items-center rounded-md border border-white/20 bg-white/5 p-1 text-sm"
          >
            <button
              type="button"
              class="rounded-md px-4 py-1.5 transition"
              :class="viewMode === 'upcoming' ? 'bg-white text-black' : 'text-white/70'"
              @click="viewMode = 'upcoming'"
            >
              Upcoming
            </button>
            <button
              type="button"
              class="rounded-md px-4 py-1.5 transition"
              :class="viewMode === 'past' ? 'bg-white text-black' : 'text-white/70'"
              @click="viewMode = 'past'"
            >
              Past
            </button>
          </div>
        </div>

        <div class="mt-6 max-h-[65vh] overflow-y-auto pr-2">
          <div
            v-if="loading"
            class="rounded-md border border-white/15 bg-white/5 px-6 py-12 text-center text-white/70"
          >
            Loading...
          </div>

          <div
            v-else-if="errorMessage"
            class="rounded-md border border-red-400/40 bg-red-500/10 px-6 py-12 text-center text-red-100"
          >
            {{ errorMessage }}
          </div>

          <div
            v-else-if="!hasTours"
            class="rounded-md border border-white/15 bg-white/5 px-6 py-12 text-center text-white/70"
          >
            Sleep..
          </div>

          <ul v-else class="grid gap-4">
            <li
              v-for="tour in filteredTours"
              :key="tour.id"
              class="rounded-md border border-white/15 bg-white/5 px-6 py-5"
            >
              <div class="flex gap-4 sm:flex-row items-center justify-between">
                <div class="space-y-1">
                  <div class="text-lg font-semibold">{{ tour.title }}</div>
                </div>
                <button
                  type="button"
                  class="rounded-md border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
                  @click="openModal(tour)"
                >
                  Show
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div
      v-if="activeTour"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"
      @click="closeModal"
    >
      <div
        class="w-full max-w-lg rounded-2xl border border-white/20 bg-black/90 p-6 text-white"
        @click.stop
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-2xl font-bold">{{ activeTour.title }}</h3>
            <p v-if="activeTour.setLabel" class="mt-1 text-sm text-white/70">
              {{ activeTour.setLabel }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-md border border-white/30 px-3 py-1 text-sm transition hover:bg-white hover:text-black"
            @click="closeModal"
          >
            Close
          </button>
        </div>
        <div class="mt-6 space-y-3 text-sm">
          <div class="flex justify-between border-b border-white/10 pb-2">
            <span class="text-white/60">Date</span>
            <span>{{ activeTour.dateDisplay }}</span>
          </div>
          <div class="flex justify-between border-b border-white/10 pb-2">
            <span class="text-white/60">Location</span>
            <span>{{ activeTour.city || 'TBA' }}</span>
          </div>
          <div class="flex justify-between border-b border-white/10 pb-2">
            <span class="text-white/60">Country</span>
            <span>{{ activeTour.country || 'TBA' }}</span>
          </div>
        </div>
        <div class="mt-6 flex flex-wrap gap-3">
          <a
            v-if="activeTour.ticket"
            :href="activeTour.ticket"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black"
          >
            Tickets
          </a>
          <button
            v-else
            type="button"
            class="rounded-md border border-white/30 px-4 py-2 text-sm text-white/60"
            disabled
          >
            No Tickets
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
