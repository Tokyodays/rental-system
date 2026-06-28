<script setup lang="ts">
import imgTop from '~/assets/images/top_image.webp'
import imgDashboard from '~/assets/images/01_dashboard.png'
import imgVehicles from '~/assets/images/02_vehicles.png'
import imgLending from '~/assets/images/03_lending_flow.png'
import imgCustomers from '~/assets/images/04_customers.png'
import imgHistory from '~/assets/images/05_history.png'

definePageMeta({ layout: false })

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap' }
  ]
})

const accent = '#2563EB'
const langOpen = ref(false)
const currentLang = ref('EN')
const showFloatingStats = true

const toggleLang = () => { langOpen.value = !langOpen.value }

const mkIcon = (paths: string[]) =>
  'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths.map(d => `<path d="${d}"/>`).join('')}</svg>`
  )

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

const brands = ['MetroCycles', 'UrbanDrive', 'PedalPoint', 'GoScoot', 'HarborRentals']

const features = [
  {
    no: '01 · FLEET', dir: 'row', url: 'rentflow.com/vehicles', img: imgVehicles,
    iconSvg: mkIcon(['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'm3.3 7 8.7 5 8.7-5', 'M12 22V12']),
    title: 'Vehicle fleet management',
    body: 'Every bike, car and bicycle in one searchable list. Filter by category and status, then act in a single click.',
    points: ['Filter by Bike, Car or Bicycle', 'Live Available / Lent / Reserved status', 'Quick-action menu on every vehicle']
  },
  {
    no: '02 · LENDING', dir: 'row-reverse', url: 'rentflow.com/lending', img: imgLending,
    iconSvg: mkIcon(['M17 8 21 12 17 16', 'M3 12h18', 'M7 16 3 12 7 8']),
    title: 'Step-by-step lending flow',
    body: 'A guided wizard takes staff from customer to vehicle to confirmation — fast to learn, hard to get wrong.',
    points: ['Select customer → vehicle → confirm', 'Only active customers surfaced', 'Clear progress at every step']
  },
  {
    no: '03 · CUSTOMERS', dir: 'row', url: 'rentflow.com/customers', img: imgCustomers,
    iconSvg: mkIcon(['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']),
    title: 'Customer management',
    body: 'A clean database of everyone who rents from you, with contact details, document tracking and live rental status.',
    points: ['Active / Renting / Inactive tracking', 'Contact info and documents on file', 'Add and edit customers inline']
  },
  {
    no: '04 · REVENUE', dir: 'row-reverse', url: 'rentflow.com/history', img: imgHistory,
    iconSvg: mkIcon(['M3 3v16a2 2 0 0 0 2 2h16', 'm19 9-5 5-4-4-3 3']),
    title: 'Transaction history & export',
    body: 'Browse every transaction by month with duration and revenue per rental, then export the whole period to CSV in one click.',
    points: ['Month-by-month history view', 'Duration and revenue per transaction', 'One-click CSV export']
  }
]

const capabilities = [
  { title: 'QR code scanner', body: 'Scan a vehicle to pull up its record instantly — no typing, no lookup.', iconSvg: mkIcon(['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', 'M3 12h18']) },
  { title: 'Multi-store management', body: 'Run every branch from a single admin console with one source of truth.', iconSvg: mkIcon(['M3 21h18', 'M5 21V7l8-4v18', 'M19 21V11l-6-4', 'M9 9v.01', 'M9 13v.01', 'M9 17v.01']) },
  { title: 'Role-based access', body: 'Owner, Branch Admin and Staff each see exactly what they should.', iconSvg: mkIcon(['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4']) },
  { title: 'Multi-currency support', body: 'Price and report in the currency each branch operates in.', iconSvg: mkIcon(['M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8', 'M12 6v2', 'M12 16v2']) }
]

const testimonials = [
  { quote: 'We replaced three spreadsheets and a notebook with Rent Flow. Lending a scooter now takes under a minute and nothing falls through the cracks.', name: 'Maya Okonkwo', role: 'Owner · CityRide Scooters', initials: 'MO' },
  { quote: "The fleet view alone paid for itself. I can see what's available across both branches without calling anyone.", name: 'Daniel Reyes', role: 'Branch Admin · Coastline Bikes', initials: 'DR' },
  { quote: "Month-end used to take a full afternoon. Now I export to CSV and I'm done before lunch.", name: 'Priya Anand', role: 'Owner · GreenWheel Rentals', initials: 'PA' }
]

onMounted(() => {
  const EASE = 'cubic-bezier(.22,1,.36,1)'
  const heroEls = Array.from(document.querySelectorAll('[data-hero]')) as HTMLElement[]
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]')) as HTMLElement[]

  heroEls.forEach((el, i) => {
    const d = 0.10 + i * 0.10
    el.style.opacity = '0'
    el.style.transform = 'translateX(-36px)'
    el.style.transition = `opacity .6s ${EASE} ${d}s, transform .7s ${EASE} ${d}s`
    el.style.willChange = 'opacity, transform'
  })
  const showHero = () => heroEls.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none' })
  requestAnimationFrame(() => requestAnimationFrame(showHero))
  setTimeout(() => {
    heroEls.forEach(el => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.99) {
        el.style.transition = 'none'
        el.style.opacity = '1'
        el.style.transform = 'none'
      }
    })
  }, 1300)

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
    el.style.transform = 'translateY(28px)'
    el.style.transition = `opacity .7s ${EASE} ${d}s, transform .7s ${EASE} ${d}s`
    el.style.willChange = 'opacity, transform'
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
  <div style="--accent:#2563EB;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#0F172A;overflow-x:hidden;background:#fff;color-scheme:light;">

    <!-- NAV -->
    <header style="position:sticky;top:0;z-index:50;background:rgba(255,255,255,.82);backdrop-filter:blur(12px);border-bottom:1px solid #EEF1F6;">
      <nav style="max-width:1200px;margin:0 auto;height:72px;padding:0 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;">
        <a href="#top" style="display:flex;align-items:center;gap:11px;text-decoration:none;">
          <span style="width:34px;height:34px;border-radius:9px;background:var(--accent,#2563EB);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px -4px color-mix(in srgb,var(--accent,#2563EB) 55%,transparent);">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </span>
          <span style="font-weight:800;font-size:18px;letter-spacing:-.02em;color:#0F172A;white-space:nowrap;">Rent Flow</span>
        </a>
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="display:flex;align-items:center;gap:30px;margin-right:8px;">
            <a href="#features" style="text-decoration:none;color:#475569;font-weight:500;font-size:15px;">Features</a>
            <a href="#capabilities" style="text-decoration:none;color:#475569;font-weight:500;font-size:15px;">Capabilities</a>
            <span style="color:#94A3B8;font-weight:500;font-size:15px;display:inline-flex;align-items:center;gap:7px;">Pricing<span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.04em;color:#64748B;background:#F1F5F9;border:1px solid #E2E8F0;padding:2px 6px;border-radius:5px;">SOON</span></span>
          </div>
          <div style="position:relative;">
            <button type="button" class="rf-lang-btn" style="display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:9px 12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;color:#334155;line-height:1;" @click="toggleLang">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>{{ currentLabel }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <template v-if="langOpen">
              <div style="position:fixed;inset:0;z-index:55;" @click="langOpen = false" />
              <div style="position:absolute;top:calc(100% + 8px);right:0;min-width:184px;background:#fff;border:1px solid #EAEEF4;border-radius:12px;box-shadow:0 18px 40px -12px rgba(15,23,42,.22);padding:6px;z-index:60;">
                <button v-for="lang in langs" :key="lang.code" type="button" class="rf-lang-item" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:transparent;border:none;border-radius:8px;padding:10px 12px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:500;color:#334155;" @click="selectLang(lang.code)">
                  <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#94A3B8;width:22px;flex-shrink:0;">{{ lang.code }}</span>{{ lang.label }}
                </button>
              </div>
            </template>
          </div>
          <span style="width:1px;height:24px;background:#E2E8F0;margin:0 2px;" />
          <NuxtLink to="/login" class="rf-nav-login" style="text-decoration:none;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;color:var(--accent,#2563EB);font-weight:600;font-size:15px;padding:10px 14px;border-radius:10px;transition:background .15s ease;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#2563EB)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/></svg>
            Log in
          </NuxtLink>
          <a href="#cta" class="rf-nav-demo" style="text-decoration:none;white-space:nowrap;background:var(--accent,#2563EB);color:#fff;font-weight:600;font-size:15px;padding:11px 20px;border-radius:10px;box-shadow:0 8px 18px -6px color-mix(in srgb,var(--accent,#2563EB) 60%,transparent);transition:transform .15s ease,box-shadow .15s ease;">Request Demo</a>
        </div>
      </nav>
    </header>

    <!-- HERO -->
    <section id="top" style="position:relative;">
      <div class="rf-hero-bg" style="position:relative;overflow:hidden;" :style="{ backgroundImage: `url(${imgTop})` }">
        <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(8,12,22,.98) 0%, rgba(8,12,22,.97) 25%, rgba(8,12,22,.92) 45%, rgba(8,12,22,.60) 65%, rgba(8,12,22,.20) 85%, rgba(8,12,22,.08) 100%);" />
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(8,12,22,.2) 0%, transparent 25%, transparent 72%, rgba(8,12,22,.6) 100%);" />
        <div style="position:relative;max-width:1200px;margin:0 auto;padding:clamp(76px,11vw,132px) 32px;text-align:left;">
          <div data-hero data-hd="0" style="display:inline-flex;align-items:center;gap:9px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);margin-bottom:26px;">
            <span style="width:7px;height:7px;border-radius:50%;background:var(--accent,#2563EB);" />
            <span style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.02em;color:rgba(255,255,255,.82);">Rental operations, simplified</span>
          </div>
          <h1 data-hero data-hd="1" style="margin:0;max-width:760px;font-size:clamp(38px,5.4vw,68px);line-height:1.04;letter-spacing:-.035em;font-weight:800;color:#fff;text-wrap:balance;">The smarter way to run your <span style="color:var(--accent,#2563EB);">rental business</span></h1>
          <p data-hero data-hd="2" style="margin:24px 0 0;max-width:560px;font-size:clamp(17px,1.6vw,20px);line-height:1.55;color:#CBD5E1;text-wrap:pretty;">Manage your fleet, lending, customers and revenue from one clean console — built for bike, car, bicycle and scooter rental shops.</p>
          <div data-hero data-hd="3" style="display:flex;flex-direction:column;align-items:flex-start;gap:14px;margin-top:34px;">
            <a href="#cta" class="rf-hero-cta" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;background:var(--accent,#2563EB);color:#fff;font-weight:600;font-size:17px;padding:15px 30px;border-radius:12px;box-shadow:0 14px 30px -10px color-mix(in srgb,var(--accent,#2563EB) 70%,transparent);transition:transform .15s ease,box-shadow .15s ease;">Request Demo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <span style="font-size:13.5px;color:rgba(255,255,255,.6);">No credit card required · Live walkthrough in 20 minutes</span>
          </div>
        </div>
      </div>

      <!-- HERO MOCKUP -->
      <div style="position:relative;margin:64px auto 0;max-width:1080px;">
        <div style="border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;box-shadow:0 50px 90px -30px rgba(15,23,42,.32),0 12px 28px -12px rgba(15,23,42,.14);background:#fff;">
          <div style="height:42px;display:flex;align-items:center;gap:8px;padding:0 16px;background:#F8FAFC;border-bottom:1px solid #EEF2F7;">
            <span style="width:11px;height:11px;border-radius:50%;background:#F87171;" />
            <span style="width:11px;height:11px;border-radius:50%;background:#FBBF24;" />
            <span style="width:11px;height:11px;border-radius:50%;background:#34D399;" />
            <div style="margin:0 auto;font-family:'JetBrains Mono',monospace;font-size:12px;color:#94A3B8;background:#fff;border:1px solid #E9EEF4;padding:5px 16px;border-radius:7px;">app.rentflow.com/dashboard</div>
          </div>
          <img :src="imgDashboard" alt="Rent Flow dashboard" style="display:block;width:100%;height:auto;" />
        </div>
        <template v-if="showFloatingStats">
          <div style="position:absolute;left:-26px;top:30%;background:#fff;border:1px solid #EEF1F6;border-radius:14px;padding:14px 18px;box-shadow:0 22px 40px -16px rgba(15,23,42,.28);display:flex;align-items:center;gap:13px;animation:rf-float 6s ease-in-out infinite;">
            <span style="width:38px;height:38px;border-radius:10px;background:#ECFDF5;display:flex;align-items:center;justify-content:center;"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
            <div style="text-align:left;"><div style="font-size:22px;font-weight:800;line-height:1;color:#0F172A;">19</div><div style="font-size:12px;color:#64748B;margin-top:3px;">Available now</div></div>
          </div>
          <div style="position:absolute;right:-22px;bottom:18%;background:#fff;border:1px solid #EEF1F6;border-radius:14px;padding:14px 18px;box-shadow:0 22px 40px -16px rgba(15,23,42,.28);display:flex;align-items:center;gap:13px;animation:rf-float 6s ease-in-out infinite;animation-delay:1.5s;">
            <span style="width:38px;height:38px;border-radius:10px;background:color-mix(in srgb,var(--accent,#2563EB) 12%,#fff);display:flex;align-items:center;justify-content:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#2563EB)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg></span>
            <div style="text-align:left;"><div style="font-size:13px;color:#64748B;">Today's transactions</div><div style="font-size:13px;font-weight:600;color:#0F172A;margin-top:3px;">Synced live</div></div>
          </div>
        </template>
      </div>
    </section>

    <!-- TRUST BAR -->
    <section style="max-width:1200px;margin:0 auto;padding:46px 32px 8px;">
      <p style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#94A3B8;margin:0 0 26px;">Trusted by rental businesses</p>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:44px 60px;opacity:.62;">
        <span v-for="brand in brands" :key="brand" style="font-weight:700;font-size:21px;letter-spacing:-.02em;color:#64748B;display:inline-flex;align-items:center;gap:9px;">
          <span style="width:18px;height:18px;border-radius:5px;background:#CBD5E1;display:inline-block;" />{{ brand }}
        </span>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" style="max-width:1200px;margin:0 auto;padding:96px 32px 40px;">
      <div data-reveal style="text-align:center;max-width:680px;margin:0 auto 14px;">
        <p style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent,#2563EB);margin:0 0 16px;font-weight:500;">Core platform</p>
        <h2 style="margin:0;font-size:clamp(30px,3.6vw,46px);line-height:1.08;letter-spacing:-.03em;font-weight:800;color:#0F172A;text-wrap:balance;">Everything your shop runs on, in one place</h2>
        <p style="margin:18px auto 0;max-width:560px;font-size:17px;line-height:1.55;color:#475569;">From the first vehicle you add to the monthly revenue report — Rent Flow handles the whole operation.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:30px;margin-top:64px;">
        <div v-for="feat in features" :key="feat.no" data-reveal style="display:flex;flex-wrap:wrap;align-items:center;gap:clamp(28px,4vw,68px);background:#fff;border:1px solid #EDF1F6;border-radius:22px;padding:clamp(26px,3vw,48px);box-shadow:0 1px 2px rgba(15,23,42,.03);" :style="{ flexDirection: feat.dir as any }">
          <div style="flex:1 1 320px;min-width:300px;">
            <span style="display:inline-flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;color:#94A3B8;margin-bottom:16px;">{{ feat.no }}</span>
            <div style="width:46px;height:46px;border-radius:12px;background:color-mix(in srgb,var(--accent,#2563EB) 11%,#fff);display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
              <img :src="feat.iconSvg" width="23" height="23" alt="" style="display:block;" />
            </div>
            <h3 style="margin:0;font-size:clamp(22px,2.4vw,29px);line-height:1.12;letter-spacing:-.02em;font-weight:800;color:#0F172A;">{{ feat.title }}</h3>
            <p style="margin:14px 0 0;font-size:16.5px;line-height:1.6;color:#475569;text-wrap:pretty;">{{ feat.body }}</p>
            <ul style="list-style:none;margin:22px 0 0;padding:0;display:flex;flex-direction:column;gap:11px;">
              <li v-for="pt in feat.points" :key="pt" style="display:flex;align-items:flex-start;gap:11px;font-size:15px;color:#334155;font-weight:500;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent,#2563EB)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><path d="M20 6 9 17l-5-5"/></svg>{{ pt }}
              </li>
            </ul>
          </div>
          <div style="flex:1 1 420px;min-width:320px;">
            <div style="border-radius:14px;overflow:hidden;border:1px solid #E5EAF1;box-shadow:0 30px 60px -28px rgba(15,23,42,.32);background:#fff;">
              <div style="height:34px;display:flex;align-items:center;gap:7px;padding:0 14px;background:#F8FAFC;border-bottom:1px solid #EEF2F7;">
                <span style="width:9px;height:9px;border-radius:50%;background:#F87171;" />
                <span style="width:9px;height:9px;border-radius:50%;background:#FBBF24;" />
                <span style="width:9px;height:9px;border-radius:50%;background:#34D399;" />
                <div style="margin-left:8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#94A3B8;">{{ feat.url }}</div>
              </div>
              <img :src="feat.img" :alt="feat.title" style="display:block;width:100%;height:auto;" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CAPABILITIES -->
    <section id="capabilities" style="background:#F8FAFC;border-top:1px solid #EEF1F6;border-bottom:1px solid #EEF1F6;margin-top:64px;">
      <div style="max-width:1200px;margin:0 auto;padding:90px 32px;">
        <div data-reveal style="text-align:center;max-width:640px;margin:0 auto 52px;">
          <p style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent,#2563EB);margin:0 0 16px;font-weight:500;">Built for scale</p>
          <h2 style="margin:0;font-size:clamp(28px,3.4vw,42px);line-height:1.1;letter-spacing:-.03em;font-weight:800;color:#0F172A;text-wrap:balance;">More power as you grow</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
          <div v-for="cap in capabilities" :key="cap.title" data-reveal class="rf-cap-card" style="background:#fff;border:1px solid #EAEEF4;border-radius:16px;padding:28px;transition:transform .18s ease,box-shadow .18s ease;">
            <div style="width:44px;height:44px;border-radius:11px;background:color-mix(in srgb,var(--accent,#2563EB) 11%,#fff);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
              <img :src="cap.iconSvg" width="22" height="22" alt="" style="display:block;" />
            </div>
            <h3 style="margin:0;font-size:18px;font-weight:700;letter-spacing:-.01em;color:#0F172A;">{{ cap.title }}</h3>
            <p style="margin:9px 0 0;font-size:14.5px;line-height:1.55;color:#64748B;text-wrap:pretty;">{{ cap.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section style="max-width:1200px;margin:0 auto;padding:96px 32px;">
      <div data-reveal style="text-align:center;max-width:640px;margin:0 auto 54px;">
        <p style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent,#2563EB);margin:0 0 16px;font-weight:500;">From the field</p>
        <h2 style="margin:0;font-size:clamp(28px,3.4vw,42px);line-height:1.1;letter-spacing:-.03em;font-weight:800;color:#0F172A;text-wrap:balance;">Rental owners who switched to flow</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:22px;">
        <figure v-for="t in testimonials" :key="t.name" data-reveal style="margin:0;background:#fff;border:1px solid #EAEEF4;border-radius:18px;padding:30px;display:flex;flex-direction:column;gap:22px;">
          <div style="display:flex;gap:3px;">
            <svg v-for="i in 5" :key="i" width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
          <blockquote style="margin:0;font-size:16.5px;line-height:1.6;color:#1E293B;font-weight:500;text-wrap:pretty;">{{ t.quote }}</blockquote>
          <figcaption style="display:flex;align-items:center;gap:13px;margin-top:auto;">
            <span style="width:42px;height:42px;border-radius:50%;background:color-mix(in srgb,var(--accent,#2563EB) 14%,#fff);color:var(--accent,#2563EB);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;">{{ t.initials }}</span>
            <div>
              <div style="font-weight:700;font-size:15px;color:#0F172A;">{{ t.name }}</div>
              <div style="font-size:13px;color:#94A3B8;">{{ t.role }}</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- CTA -->
    <section id="cta" style="max-width:1200px;margin:0 auto;padding:0 32px 96px;">
      <div data-reveal style="position:relative;overflow:hidden;border-radius:28px;background:#0B1220;padding:clamp(48px,6vw,84px) clamp(32px,5vw,72px);text-align:center;">
        <div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(70% 120% at 50% -10%,color-mix(in srgb,var(--accent,#2563EB) 45%,transparent),transparent 60%);" />
        <div style="position:relative;">
          <h2 style="margin:0 auto;max-width:680px;font-size:clamp(28px,3.8vw,48px);line-height:1.08;letter-spacing:-.03em;font-weight:800;color:#fff;text-wrap:balance;">Ready to streamline your rental operations?</h2>
          <p style="margin:18px auto 0;max-width:480px;font-size:17px;line-height:1.55;color:#94A3B8;">See Rent Flow on your own fleet. We'll walk you through it.</p>
          <div style="display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:34px;">
            <a href="#top" class="rf-cta-btn" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;background:var(--accent,#2563EB);color:#fff;font-weight:600;font-size:17px;padding:16px 32px;border-radius:12px;box-shadow:0 16px 34px -10px color-mix(in srgb,var(--accent,#2563EB) 80%,transparent);transition:transform .15s ease;">Request Demo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <span style="font-size:13.5px;color:#64748B;">No credit card required</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="border-top:1px solid #EEF1F6;background:#fff;">
      <div style="max-width:1200px;margin:0 auto;padding:54px 32px 40px;display:flex;flex-wrap:wrap;gap:40px;justify-content:space-between;">
        <div style="max-width:300px;">
          <div style="display:flex;align-items:center;gap:11px;margin-bottom:14px;">
            <span style="width:32px;height:32px;border-radius:9px;background:var(--accent,#2563EB);display:flex;align-items:center;justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </span>
            <span style="font-weight:800;font-size:17px;color:#0F172A;">Rent Flow</span>
          </div>
          <p style="margin:0;font-size:14.5px;line-height:1.55;color:#94A3B8;">The smarter way to run your rental business.</p>
        </div>
        <div style="display:flex;gap:64px;flex-wrap:wrap;">
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:16px;">Product</div>
            <div style="display:flex;flex-direction:column;gap:11px;">
              <a href="#features" style="text-decoration:none;color:#475569;font-size:14.5px;font-weight:500;">Features</a>
              <span style="color:#94A3B8;font-size:14.5px;font-weight:500;">Pricing <span style="font-size:11px;color:#CBD5E1;">(coming soon)</span></span>
              <a href="#capabilities" style="text-decoration:none;color:#475569;font-size:14.5px;font-weight:500;">Capabilities</a>
            </div>
          </div>
          <div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#94A3B8;margin-bottom:16px;">Company</div>
            <div style="display:flex;flex-direction:column;gap:11px;">
              <a href="#cta" style="text-decoration:none;color:#475569;font-size:14.5px;font-weight:500;">Contact</a>
              <a href="#cta" style="text-decoration:none;color:#475569;font-size:14.5px;font-weight:500;">Request Demo</a>
            </div>
          </div>
        </div>
      </div>
      <div style="border-top:1px solid #F1F5F9;">
        <div style="max-width:1200px;margin:0 auto;padding:22px 32px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;">
          <span style="font-size:13px;color:#94A3B8;">© 2026 Rent Flow. All rights reserved.</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#CBD5E1;">Built for rental shops worldwide</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<style>
html { scroll-behavior: smooth; }
@keyframes rf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.rf-hero-bg {
  background-color: #0B1220;
  background-size: cover;
  background-position: calc(50% + 200px) calc(50% - 50px);
}
@media (max-width: 1024px) {
  .rf-hero-bg {
    background-position: center 30%;
  }
}

.rf-nav-login:hover { background: color-mix(in srgb, var(--accent, #2563EB) 8%, #fff); }
.rf-nav-demo:hover { transform: translateY(-1px); box-shadow: 0 12px 24px -6px color-mix(in srgb, var(--accent, #2563EB) 65%, transparent); }
.rf-hero-cta:hover { transform: translateY(-2px); box-shadow: 0 20px 38px -10px color-mix(in srgb, var(--accent, #2563EB) 75%, transparent); }
.rf-lang-btn:hover { border-color: #CBD5E1; }
.rf-lang-item:hover { background: #F1F5F9; }
.rf-cap-card:hover { transform: translateY(-3px); box-shadow: 0 18px 36px -20px rgba(15, 23, 42, .22); }
.rf-cta-btn:hover { transform: translateY(-2px); }
</style>
