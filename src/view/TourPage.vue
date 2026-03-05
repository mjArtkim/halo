<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const visibleCount = ref(5)

const visibleTours = computed(() => {
  return filteredTours.value.slice(0, visibleCount.value)
})

const canLoadMore = computed(() => {
  return filteredTours.value.length > visibleCount.value
})

watch(viewMode, () => {
  visibleCount.value = 5
})

watch(filteredTours, () => {
  visibleCount.value = 5
})

const formatLocation = (tour: Tour) => {
  return [tour.city, tour.country].filter(Boolean).join(', ')
}

onMounted(() => {
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
})

onBeforeUnmount(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <section class="w-full px-3 py-10 text-white">
    <div class="mx-auto w-full">
      <div class="mb-5">
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
      <div
        v-if="loading"
        class="rounded-xl border border-white/15 bg-white/5 px-6 py-12 text-center text-white/70"
      >
        Loading...
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-xl border border-red-400/40 bg-red-500/10 px-6 py-12 text-center text-red-100"
      >
        {{ errorMessage }}
      </div>

      <div
        v-else-if="!hasTours"
        class="rounded-xl border border-white/15 bg-white/5 px-6 py-12 text-center text-white/70"
      >
        Sleep..
      </div>

      <ul v-else class="grid gap-4">
        <li
          v-for="tour in visibleTours"
          :key="tour.id"
          class="rounded-xl border border-white/15 bg-white/5 px-6 py-5"
        >
          <div class="flex gap-4 sm:flex-row items-center justify-between">
            <div class="space-y-1">
              <div class="text-lg font-semibold">{{ tour.title }}</div>
              <div v-if="tour.setLabel" class="text-sm text-white/70">{{ tour.setLabel }}</div>
              <div class="text-sm text-white/70">{{ tour.dateDisplay }}</div>
              <div class="text-sm">{{ formatLocation(tour) || 'TBA' }}</div>
            </div>
            <a
              v-if="tour.ticket"
              :href="tour.ticket"
              target="_blank"
              rel="noopener noreferrer"
              class="material-symbols-rounded text-center rounded-md border py-2 px-3 text-3xl border-white/30 transition hover:bg-white hover:text-black"
            >
              confirmation_number
            </a>
          </div>
        </li>
      </ul>

      <div v-if="!loading && hasTours" class="mt-8 flex justify-center">
        <button
          v-if="canLoadMore"
          type="button"
          class="rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
          @click="visibleCount += 5"
        >
          More
        </button>
      </div>
    </div>
  </section>
</template>
