<script setup lang="ts">
import imgTop from '~/assets/images/top_image.webp'
import imgDashboard from '~/assets/images/01_dashboard.png'
import imgVehicles from '~/assets/images/02_vehicles.png'
import imgLending from '~/assets/images/03_lending_flow.png'
import imgCustomers from '~/assets/images/04_customers.png'
import imgHistory from '~/assets/images/05_history.png'

definePageMeta({ layout: false })

const langOpen = ref(false)
const menuOpen = ref(false)
const currentLang = ref('EN')

const langs = [
  { code: 'EN', label: 'English' },
  { code: 'TH', label: 'ภาษาไทย' },
  { code: 'LA', label: 'ພາສາລາວ' },
  { code: 'VI', label: 'Tiếng Việt' },
  { code: 'MY', label: 'Bahasa Melayu' }
]

const currentLabel = computed(() => langs.find(l => l.code === currentLang.value)?.label ?? 'English')

const selectLang = (code: string) => {
  currentLang.value = code
  langOpen.value = false
}

const brands = [
  { name: 'MetroCycles', initials: 'MC' },
  { name: 'UrbanDrive', initials: 'UD' },
  { name: 'PedalPoint', initials: 'PP' },
  { name: 'GoScoot', initials: 'GS' },
  { name: 'HarborRentals', initials: 'HR' }
]

const splitFeatures = [
  {
    icon: 'i-lucide-package', img: imgVehicles, reverse: false,
    title: 'Vehicle fleet management',
    body: 'Every bike, car and bicycle in one searchable list. Filter by category and status, then act in a single click.',
    points: ['Filter by Bike, Car or Bicycle', 'Live Available / Lent / Reserved status', 'Quick-action menu on every vehicle']
  },
  {
    icon: 'i-lucide-arrow-right-left', img: imgLending, reverse: true,
    title: 'Step-by-step lending flow',
    body: 'A guided wizard takes staff from customer to vehicle to confirmation. Fast to learn, hard to get wrong.',
    points: ['Select customer, vehicle, then confirm', 'Only active customers surfaced', 'Clear progress at every step']
  }
]

const cardFeatures = [
  {
    icon: 'i-lucide-users', img: imgCustomers, tone: 'peach',
    title: 'Customer management',
    body: 'A clean database of everyone who rents from you, with contact details, document tracking and live rental status.',
    points: ['Active / Renting / Inactive tracking', 'Contact info and documents on file']
  },
  {
    icon: 'i-lucide-chart-line', img: imgHistory, tone: 'azure',
    title: 'Transaction history & export',
    body: 'Browse every transaction by month with duration and revenue per rental, then export the whole period to CSV in one click.',
    points: ['Month-by-month history view', 'One-click CSV export']
  }
]

const capabilities = [
  { icon: 'i-lucide-qr-code', title: 'QR code scanner', body: 'Scan a vehicle to pull up its record instantly. No typing, no lookup.' },
  { icon: 'i-lucide-building-2', title: 'Multi-store management', body: 'Run every branch from a single admin console with one source of truth.' },
  { icon: 'i-lucide-shield-check', title: 'Role-based access', body: 'Owner, Branch Admin and Staff each see exactly what they should.' },
  { icon: 'i-lucide-coins', title: 'Multi-currency support', body: 'Price and report in the currency each branch operates in.' }
]

const featuredQuote = {
  quote: 'We replaced three spreadsheets and a notebook with Rent Flow. Lending a scooter now takes under a minute and nothing falls through the cracks.',
  name: 'Maya Okonkwo', role: 'Owner · CityRide Scooters', initials: 'MO'
}

const sideQuotes = [
  { quote: "The fleet view alone paid for itself. I can see what's available across both branches without calling anyone.", name: 'Daniel Reyes', role: 'Branch Admin · Coastline Bikes', initials: 'DR' },
  { quote: "Month-end used to take a full afternoon. Now I export to CSV and I'm done before lunch.", name: 'Priya Anand', role: 'Owner · GreenWheel Rentals', initials: 'PA' }
]

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const EASE = 'cubic-bezier(.22,1,.36,1)'
  const heroEls = Array.from(document.querySelectorAll('[data-hero]')) as HTMLElement[]
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]')) as HTMLElement[]

  heroEls.forEach((el, i) => {
    const d = 0.08 + i * 0.09
    el.style.opacity = '0'
    el.style.transform = 'translateY(22px)'
    el.style.transition = `opacity .6s ${EASE} ${d}s, transform .7s ${EASE} ${d}s`
  })
  requestAnimationFrame(() => requestAnimationFrame(() => {
    heroEls.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none' })
  }))

  const groups = new Map<Element, HTMLElement[]>()
  revealEls.forEach(el => {
    const p = el.parentElement!
    const a = groups.get(p) ?? []
    a.push(el)
    groups.set(p, a)
  })
  groups.forEach(a => a.forEach((el, i) => { (el as any)._rfDelay = Math.min(i * 0.09, 0.45) }))
  revealEls.forEach(el => {
    const d = (el as any)._rfDelay ?? 0
    el.style.opacity = '0'
    el.style.transform = 'translateY(26px)'
    el.style.transition = `opacity .7s ${EASE} ${d}s, transform .7s ${EASE} ${d}s`
  })
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target as HTMLElement
        el.style.opacity = '1'
        el.style.transform = 'none'
        io.unobserve(el)
      }
    })
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
  revealEls.forEach(el => io.observe(el))
})
</script>

<template>
  <div class="font-body bg-sand-200 text-ink overflow-x-hidden [color-scheme:light]">

    <!-- NAV -->
    <header class="sticky top-0 z-50 bg-sand-200/85 backdrop-blur-md border-b border-sand-400/50">
      <nav class="max-w-6xl mx-auto h-16 lg:h-[72px] px-5 lg:px-8 flex items-center justify-between gap-4">
        <a href="#top" class="flex items-center gap-2.5 no-underline shrink-0">
          <span class="w-9 h-9 rounded-xl bg-tangerine-500 flex items-center justify-center">
            <UIcon name="i-lucide-package" class="w-5 h-5 text-ink" />
          </span>
          <span class="font-display font-bold text-lg tracking-tight text-ink whitespace-nowrap">Rent Flow</span>
        </a>

        <!-- Desktop nav -->
        <div class="hidden lg:flex items-center gap-2">
          <a href="#features" class="px-3 py-2 rounded-lg text-azure-700 font-medium text-[15px] no-underline hover:bg-sand-300/60 transition-colors">Features</a>
          <a href="#capabilities" class="px-3 py-2 rounded-lg text-azure-700 font-medium text-[15px] no-underline hover:bg-sand-300/60 transition-colors">Capabilities</a>
        </div>

        <div class="flex items-center gap-2 lg:gap-3">
          <!-- Language switcher -->
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 bg-sand-50 border border-sand-400/70 rounded-xl px-3 py-2 cursor-pointer text-sm font-semibold text-ink-soft hover:border-azure-500/50 transition-colors"
              @click="langOpen = !langOpen"
            >
              <UIcon name="i-lucide-globe" class="w-4 h-4 text-azure-700" />
              <span class="hidden sm:inline">{{ currentLabel }}</span>
              <UIcon name="i-lucide-chevron-down" class="w-3.5 h-3.5 text-ink-mute" />
            </button>
            <template v-if="langOpen">
              <div class="fixed inset-0 z-[55]" @click="langOpen = false" />
              <div class="absolute top-[calc(100%+8px)] right-0 min-w-46 bg-sand-50 border border-sand-400/70 rounded-xl shadow-xl shadow-ink/10 p-1.5 z-[60]">
                <button
                  v-for="lang in langs" :key="lang.code" type="button"
                  class="flex items-center gap-3 w-full text-left bg-transparent border-none rounded-lg px-3 py-2.5 cursor-pointer text-sm font-medium text-ink-soft hover:bg-sand-200 transition-colors"
                  @click="selectLang(lang.code)"
                >
                  <span class="text-xs font-semibold text-azure-500 w-6 shrink-0">{{ lang.code }}</span>{{ lang.label }}
                </button>
              </div>
            </template>
          </div>

          <NuxtLink to="/login" class="hidden lg:inline-flex items-center gap-1.5 no-underline text-azure-700 font-semibold text-[15px] px-3.5 py-2.5 rounded-xl hover:bg-sand-300/60 transition-colors">
            <UIcon name="i-lucide-log-in" class="w-4 h-4" />
            Log in
          </NuxtLink>
          <a href="#cta" class="hidden lg:inline-block no-underline whitespace-nowrap bg-tangerine-500 text-ink font-bold text-[15px] px-5 py-2.5 rounded-xl hover:bg-tangerine-600 hover:-translate-y-px active:translate-y-0 transition-all">Request Demo</a>

          <!-- Mobile menu button -->
          <button type="button" class="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-sand-400/70 bg-sand-50 cursor-pointer" aria-label="Menu" @click="menuOpen = !menuOpen">
            <UIcon :name="menuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="w-5 h-5 text-ink" />
          </button>
        </div>
      </nav>

      <!-- Mobile menu panel -->
      <div v-if="menuOpen" class="lg:hidden border-t border-sand-400/50 bg-sand-100 px-5 py-4 flex flex-col gap-1">
        <a href="#features" class="no-underline text-ink font-semibold text-base px-3 py-3 rounded-lg hover:bg-sand-200" @click="menuOpen = false">Features</a>
        <a href="#capabilities" class="no-underline text-ink font-semibold text-base px-3 py-3 rounded-lg hover:bg-sand-200" @click="menuOpen = false">Capabilities</a>
        <NuxtLink to="/login" class="no-underline text-azure-700 font-semibold text-base px-3 py-3 rounded-lg hover:bg-sand-200" @click="menuOpen = false">Log in</NuxtLink>
        <a href="#cta" class="no-underline text-center bg-tangerine-500 text-ink font-bold text-base px-5 py-3.5 rounded-xl mt-2" @click="menuOpen = false">Request Demo</a>
      </div>
    </header>

    <!-- HERO -->
    <section id="top" class="relative overflow-hidden bg-gradient-to-br from-azure-900 via-azure-800 to-azure-700">
      <div class="relative max-w-6xl mx-auto px-5 lg:px-8 pt-14 lg:pt-24 pb-16 lg:pb-24 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        <div class="lg:col-span-6">
          <h1 data-hero class="m-0 font-display font-extrabold text-[clamp(38px,5vw,62px)] leading-[1.05] tracking-tight text-sand-50 text-balance">
            The smarter way to run your <span class="text-peach-300">rental business</span>
          </h1>
          <p data-hero class="mt-6 mb-0 max-w-lg text-[clamp(16px,1.5vw,19px)] leading-relaxed text-azure-100/90 text-pretty">
            Fleet, lending, customers and revenue in one clean console, built for bike, scooter and car rental shops.
          </p>
          <div data-hero class="mt-9">
            <a href="#cta" class="inline-flex items-center gap-2.5 no-underline bg-tangerine-500 text-ink font-bold text-[17px] px-8 py-4 rounded-xl hover:bg-tangerine-600 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Request Demo
              <UIcon name="i-lucide-arrow-right" class="w-4.5 h-4.5" />
            </a>
          </div>
        </div>
        <div data-hero class="lg:col-span-6 relative">
          <div class="absolute -inset-3 lg:-inset-4 rounded-3xl bg-peach-300/20 rotate-2" aria-hidden="true" />
          <div class="relative rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl shadow-azure-900/60 bg-sand-50">
            <img :src="imgDashboard" alt="Rent Flow dashboard" class="block w-full h-auto" >
          </div>
          <div class="hidden lg:flex absolute -left-8 -bottom-6 items-center gap-3 bg-sand-50 border border-sand-400/60 rounded-2xl px-4.5 py-3.5 shadow-xl shadow-azure-900/30">
            <span class="w-9 h-9 rounded-xl bg-peach-200 flex items-center justify-center">
              <UIcon name="i-lucide-check" class="w-5 h-5 text-azure-700" />
            </span>
            <div>
              <div class="text-xl font-extrabold leading-none text-ink">19</div>
              <div class="text-xs text-ink-mute mt-1">Available now</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRUST BAR -->
    <section class="max-w-6xl mx-auto px-5 lg:px-8 pt-12 pb-2">
      <p class="text-center text-sm text-ink-mute m-0 mb-7">Trusted by rental businesses</p>
      <div class="flex flex-wrap justify-center items-center gap-x-10 gap-y-5">
        <span v-for="brand in brands" :key="brand.name" class="inline-flex items-center gap-2.5 text-azure-700/70">
          <span class="w-8 h-8 rounded-lg bg-azure-700/10 flex items-center justify-center text-[11px] font-extrabold tracking-wide text-azure-700">{{ brand.initials }}</span>
          <span class="font-bold text-lg tracking-tight">{{ brand.name }}</span>
        </span>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="max-w-6xl mx-auto px-5 lg:px-8 pt-20 lg:pt-28 pb-8">
      <div data-reveal class="max-w-2xl">
        <h2 class="m-0 font-display font-extrabold text-[clamp(30px,3.4vw,44px)] leading-[1.08] tracking-tight text-ink text-balance">Everything your shop runs on, in one place</h2>
        <p class="mt-4 mb-0 text-[17px] leading-relaxed text-ink-soft">From the first vehicle you add to the monthly revenue report, Rent Flow handles the whole operation.</p>
      </div>

      <!-- Split rows (x2) -->
      <div class="flex flex-col gap-16 lg:gap-24 mt-14 lg:mt-20">
        <div v-for="feat in splitFeatures" :key="feat.title" data-reveal class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div :class="feat.reverse ? 'lg:order-2' : ''">
            <div class="w-11 h-11 rounded-xl bg-azure-700/10 flex items-center justify-center mb-5">
              <UIcon :name="feat.icon" class="w-5.5 h-5.5 text-azure-700" />
            </div>
            <h3 class="m-0 font-display font-bold text-[clamp(22px,2.3vw,28px)] leading-tight tracking-tight text-ink">{{ feat.title }}</h3>
            <p class="mt-3.5 mb-0 text-base leading-relaxed text-ink-soft text-pretty">{{ feat.body }}</p>
            <ul class="list-none mt-5 mb-0 p-0 flex flex-col gap-2.5">
              <li v-for="pt in feat.points" :key="pt" class="flex items-start gap-2.5 text-[15px] font-medium text-ink-soft">
                <UIcon name="i-lucide-check" class="w-4.5 h-4.5 text-tangerine-600 shrink-0 mt-0.5" />{{ pt }}
              </li>
            </ul>
          </div>
          <div :class="feat.reverse ? 'lg:order-1' : ''">
            <div class="rounded-2xl overflow-hidden border border-sand-400/60 shadow-xl shadow-ink/10 bg-sand-50">
              <img :src="feat.img" :alt="feat.title" class="block w-full h-auto" >
            </div>
          </div>
        </div>
      </div>

      <!-- Card duo -->
      <div class="grid lg:grid-cols-2 gap-6 mt-16 lg:mt-24">
        <div
          v-for="feat in cardFeatures" :key="feat.title" data-reveal
          class="rounded-3xl overflow-hidden border border-sand-400/50 flex flex-col"
          :class="feat.tone === 'peach' ? 'bg-peach-200' : 'bg-azure-100'"
        >
          <div class="p-7 lg:p-9 pb-0 lg:pb-0">
            <div class="w-11 h-11 rounded-xl bg-sand-50/80 flex items-center justify-center mb-5">
              <UIcon :name="feat.icon" class="w-5.5 h-5.5 text-azure-700" />
            </div>
            <h3 class="m-0 font-display font-bold text-2xl leading-tight tracking-tight text-ink">{{ feat.title }}</h3>
            <p class="mt-3 mb-0 text-[15.5px] leading-relaxed text-ink-soft text-pretty">{{ feat.body }}</p>
            <ul class="list-none mt-4 mb-0 p-0 flex flex-wrap gap-x-6 gap-y-2">
              <li v-for="pt in feat.points" :key="pt" class="flex items-center gap-2 text-sm font-medium text-ink-soft">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-tangerine-600 shrink-0" />{{ pt }}
              </li>
            </ul>
          </div>
          <div class="px-7 lg:px-9 mt-7 flex-1 flex items-end">
            <div class="rounded-t-xl overflow-hidden border border-b-0 border-sand-400/60 shadow-lg shadow-ink/10 w-full">
              <img :src="feat.img" :alt="feat.title" class="block w-full h-auto" >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CAPABILITIES -->
    <section id="capabilities" class="mt-20 lg:mt-28 bg-peach-100 border-y border-sand-400/40">
      <div class="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-24">
        <div data-reveal class="max-w-2xl">
          <h2 class="m-0 font-display font-extrabold text-[clamp(28px,3.2vw,40px)] leading-[1.1] tracking-tight text-ink text-balance">More power as you grow</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10 mt-12">
          <div v-for="cap in capabilities" :key="cap.title" data-reveal class="border-l-2 border-tangerine-500/70 pl-5">
            <UIcon :name="cap.icon" class="w-6 h-6 text-azure-700" />
            <h3 class="mt-4 mb-0 text-[17px] font-bold tracking-tight text-ink">{{ cap.title }}</h3>
            <p class="mt-2 mb-0 text-sm leading-relaxed text-ink-soft text-pretty">{{ cap.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
      <div class="grid lg:grid-cols-5 gap-12 lg:gap-16">
        <figure data-reveal class="lg:col-span-3 m-0 flex flex-col justify-between gap-8">
          <blockquote class="m-0 font-display font-bold text-[clamp(22px,2.6vw,32px)] leading-snug tracking-tight text-ink text-pretty">
            &ldquo;{{ featuredQuote.quote }}&rdquo;
          </blockquote>
          <figcaption class="flex items-center gap-3.5">
            <span class="w-11 h-11 rounded-full bg-peach-300 text-ink flex items-center justify-center font-bold text-[15px]">{{ featuredQuote.initials }}</span>
            <div>
              <div class="font-bold text-[15px] text-ink">{{ featuredQuote.name }}</div>
              <div class="text-[13px] text-ink-mute">{{ featuredQuote.role }}</div>
            </div>
          </figcaption>
        </figure>
        <div class="lg:col-span-2 flex flex-col gap-8">
          <figure v-for="t in sideQuotes" :key="t.name" data-reveal class="m-0 border-t-2 border-sand-400/60 pt-6">
            <blockquote class="m-0 text-[15.5px] leading-relaxed text-ink-soft font-medium text-pretty">&ldquo;{{ t.quote }}&rdquo;</blockquote>
            <figcaption class="flex items-center gap-3 mt-5">
              <span class="w-9 h-9 rounded-full bg-azure-700/10 text-azure-700 flex items-center justify-center font-bold text-[13px]">{{ t.initials }}</span>
              <div>
                <div class="font-bold text-sm text-ink">{{ t.name }}</div>
                <div class="text-xs text-ink-mute">{{ t.role }}</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section id="cta" class="max-w-6xl mx-auto px-5 lg:px-8 pb-20 lg:pb-28">
      <div data-reveal class="relative overflow-hidden rounded-3xl">
        <img :src="imgTop" alt="" class="absolute inset-0 w-full h-full object-cover" >
        <div class="absolute inset-0 bg-azure-900/85" />
        <div class="relative px-6 py-16 lg:px-16 lg:py-20 text-center">
          <h2 class="m-0 mx-auto max-w-2xl font-display font-extrabold text-[clamp(28px,3.6vw,46px)] leading-[1.08] tracking-tight text-sand-50 text-balance">Ready to streamline your rental operations?</h2>
          <p class="mt-4 mb-0 mx-auto max-w-md text-[17px] leading-relaxed text-azure-100/90">See Rent Flow on your own fleet. We'll walk you through it.</p>
          <div class="flex flex-col items-center gap-3.5 mt-9">
            <a href="#top" class="inline-flex items-center gap-2.5 no-underline bg-tangerine-500 text-ink font-bold text-[17px] px-9 py-4 rounded-xl hover:bg-tangerine-600 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Request Demo
              <UIcon name="i-lucide-arrow-right" class="w-4.5 h-4.5" />
            </a>
            <span class="text-[13.5px] text-azure-100/70">No credit card required</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="border-t border-sand-400/50 bg-sand-100">
      <div class="max-w-6xl mx-auto px-5 lg:px-8 pt-14 pb-10 flex flex-wrap gap-10 justify-between">
        <div class="max-w-72">
          <div class="flex items-center gap-2.5 mb-3.5">
            <span class="w-8 h-8 rounded-lg bg-tangerine-500 flex items-center justify-center">
              <UIcon name="i-lucide-package" class="w-4.5 h-4.5 text-ink" />
            </span>
            <span class="font-display font-bold text-[17px] text-ink">Rent Flow</span>
          </div>
          <p class="m-0 text-sm leading-relaxed text-ink-mute">The smarter way to run your rental business.</p>
        </div>
        <div class="flex gap-16 flex-wrap">
          <div>
            <div class="text-sm font-bold text-ink mb-4">Product</div>
            <div class="flex flex-col gap-2.5">
              <a href="#features" class="no-underline text-ink-soft text-sm font-medium hover:text-azure-700 transition-colors">Features</a>
              <a href="#capabilities" class="no-underline text-ink-soft text-sm font-medium hover:text-azure-700 transition-colors">Capabilities</a>
              <span class="text-ink-mute text-sm font-medium">Pricing <span class="text-xs text-ink-mute/70">(coming soon)</span></span>
            </div>
          </div>
          <div>
            <div class="text-sm font-bold text-ink mb-4">Company</div>
            <div class="flex flex-col gap-2.5">
              <a href="#cta" class="no-underline text-ink-soft text-sm font-medium hover:text-azure-700 transition-colors">Contact</a>
              <a href="#cta" class="no-underline text-ink-soft text-sm font-medium hover:text-azure-700 transition-colors">Request Demo</a>
            </div>
          </div>
        </div>
      </div>
      <div class="border-t border-sand-300">
        <div class="max-w-6xl mx-auto px-5 lg:px-8 py-5 flex flex-wrap gap-3 justify-between items-center">
          <span class="text-[13px] text-ink-mute">© 2026 Rent Flow. All rights reserved.</span>
          <span class="text-[13px] text-ink-mute">Built for rental shops worldwide</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<style>
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
</style>
