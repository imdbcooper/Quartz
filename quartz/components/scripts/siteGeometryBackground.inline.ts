const SITE_GEOMETRY_REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)"
const SITE_GEOMETRY_MOBILE_MEDIA_QUERY = "(max-width: 800px)"
const SITE_GEOMETRY_TOUCH_MEDIA_QUERY = "(hover: none), (pointer: coarse)"

type SiteGeometryConfig = {
  enabled: boolean
  speed: number
  density: number
  connectionDistance: number
  lineOpacity: number
  nodeOpacity: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

type Palette = {
  line: [number, number, number, number]
  node: [number, number, number, number]
}

const DEFAULT_SITE_GEOMETRY_CONFIG: SiteGeometryConfig = {
  enabled: true,
  speed: 1.35,
  density: 1.12,
  connectionDistance: 176,
  lineOpacity: 1.08,
  nodeOpacity: 1.14,
}

function clampSiteGeometryValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseSiteGeometryNumber(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return clampSiteGeometryValue(parsed, min, max)
}

function parseSiteGeometryBoolean(value: string | undefined, fallback: boolean) {
  if (value === "true") return true
  if (value === "false") return false
  return fallback
}

function rgbaSiteGeometry([r, g, b, a]: [number, number, number, number], alphaMultiplier = 1) {
  const alpha = clampSiteGeometryValue(a * alphaMultiplier, 0, 1)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function getSiteGeometryPalette(): Palette {
  const isDark = document.documentElement.getAttribute("saved-theme") === "dark"
  return isDark
    ? {
        line: [191, 219, 254, 0.09],
        node: [191, 219, 254, 0.18],
      }
    : {
        line: [96, 165, 250, 0.11],
        node: [96, 165, 250, 0.2],
      }
}

function getSiteGeometryConfig(): SiteGeometryConfig {
  const root = document.body.querySelector<HTMLElement>("[data-site-geometry-config]")
  if (!root) return { ...DEFAULT_SITE_GEOMETRY_CONFIG }
  return {
    enabled: parseSiteGeometryBoolean(
      root.dataset.siteGeometryEnabled,
      DEFAULT_SITE_GEOMETRY_CONFIG.enabled,
    ),
    speed: parseSiteGeometryNumber(
      root.dataset.siteGeometrySpeed,
      DEFAULT_SITE_GEOMETRY_CONFIG.speed,
      0.2,
      3,
    ),
    density: parseSiteGeometryNumber(
      root.dataset.siteGeometryDensity,
      DEFAULT_SITE_GEOMETRY_CONFIG.density,
      0.25,
      2,
    ),
    connectionDistance: parseSiteGeometryNumber(
      root.dataset.siteGeometryConnectionDistance,
      DEFAULT_SITE_GEOMETRY_CONFIG.connectionDistance,
      80,
      260,
    ),
    lineOpacity: parseSiteGeometryNumber(
      root.dataset.siteGeometryLineOpacity,
      DEFAULT_SITE_GEOMETRY_CONFIG.lineOpacity,
      0,
      2,
    ),
    nodeOpacity: parseSiteGeometryNumber(
      root.dataset.siteGeometryNodeOpacity,
      DEFAULT_SITE_GEOMETRY_CONFIG.nodeOpacity,
      0,
      2,
    ),
  }
}

function getParticleCount(width: number, height: number, isMobile: boolean, density: number) {
  const baseCount = Math.round((width * height) / (isMobile ? 14000 : 6500))
  const scaledCount = Math.round(baseCount * density)
  return clampSiteGeometryValue(scaledCount, isMobile ? 24 : 48, isMobile ? 160 : 280)
}

function createParticle(width: number, height: number, speedMultiplier: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = (Math.random() * 0.032 + 0.012) * speedMultiplier
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: Math.random() * 1.05 + 0.35,
  }
}

function ensureSiteGeometryHost() {
  let host = document.body.querySelector<HTMLElement>("[data-site-geometry-bg-host]")
  if (!host) {
    host = document.createElement("div")
    host.setAttribute("data-site-geometry-bg-host", "true")
    host.setAttribute("aria-hidden", "true")
    const canvas = document.createElement("canvas")
    canvas.setAttribute("data-site-geometry-bg-canvas", "true")
    host.appendChild(canvas)
    document.body.prepend(host)
  }

  let canvas = host.querySelector<HTMLCanvasElement>("[data-site-geometry-bg-canvas]")
  if (!canvas) {
    canvas = document.createElement("canvas")
    canvas.setAttribute("data-site-geometry-bg-canvas", "true")
    host.appendChild(canvas)
  }

  document.body.classList.add("has-site-geometry-bg")
  return { host, canvas }
}

function removeSiteGeometryHost() {
  document.body.classList.remove("has-site-geometry-bg")
  document.body.querySelector<HTMLElement>("[data-site-geometry-bg-host]")?.remove()
}

function mountSiteGeometryBackground() {
  const config = getSiteGeometryConfig()
  if (!config.enabled) {
    removeSiteGeometryHost()
    return
  }

  const mobileMedia = window.matchMedia(SITE_GEOMETRY_MOBILE_MEDIA_QUERY)
  const touchMedia = window.matchMedia(SITE_GEOMETRY_TOUCH_MEDIA_QUERY)
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
  if (mobileMedia.matches || touchMedia.matches || saveData) {
    removeSiteGeometryHost()
    return
  }

  const { host, canvas } = ensureSiteGeometryHost()
  if (host.dataset.siteGeometryBackgroundMounted === "true") return

  const context = canvas.getContext("2d")
  if (!context) return

  host.dataset.siteGeometryBackgroundMounted = "true"

  const reducedMotionMedia = window.matchMedia(SITE_GEOMETRY_REDUCED_MOTION_MEDIA_QUERY)

  let destroyed = false
  let animationFrame = 0
  let lastTimestamp = 0
  let width = 0
  let height = 0
  let palette = getSiteGeometryPalette()
  let particles: Particle[] = []

  const syncCanvasSize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const nextWidth = Math.max(1, Math.round(window.innerWidth))
    const nextHeight = Math.max(1, Math.round(window.innerHeight))
    const changed = nextWidth !== width || nextHeight !== height || canvas.width === 0

    width = nextWidth
    height = nextHeight

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(dpr, 0, 0, dpr, 0, 0)

    return changed
  }

  const rebuildParticles = () => {
    const isMobile = mobileMedia.matches
    const speedMultiplier = config.speed * (isMobile ? 0.72 : 1)
    const count = getParticleCount(width, height, isMobile, config.density)
    particles = Array.from({ length: count }, () => createParticle(width, height, speedMultiplier))
  }

  const update = (deltaScale: number) => {
    const overflow = 26
    for (const particle of particles) {
      particle.x += particle.vx * deltaScale
      particle.y += particle.vy * deltaScale

      if (particle.x < -overflow) particle.x = width + overflow
      else if (particle.x > width + overflow) particle.x = -overflow

      if (particle.y < -overflow) particle.y = height + overflow
      else if (particle.y > height + overflow) particle.y = -overflow
    }
  }

  const draw = () => {
    if (destroyed || width === 0 || height === 0) return

    const maxDistance = config.connectionDistance * (mobileMedia.matches ? 0.85 : 1)
    const maxDistanceSquared = maxDistance * maxDistance

    context.clearRect(0, 0, width, height)
    context.lineWidth = 1.05

    for (let i = 0; i < particles.length; i++) {
      const current = particles[i]

      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j]
        const dx = other.x - current.x
        const dy = other.y - current.y
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared > maxDistanceSquared) continue

        const alpha = Math.pow(1 - distanceSquared / maxDistanceSquared, 1.8)
        context.strokeStyle = rgbaSiteGeometry(palette.line, alpha * config.lineOpacity)
        context.beginPath()
        context.moveTo(current.x, current.y)
        context.lineTo(other.x, other.y)
        context.stroke()
      }
    }

    for (const particle of particles) {
      context.fillStyle = rgbaSiteGeometry(palette.node, config.nodeOpacity)
      context.beginPath()
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  const cancelFrame = () => {
    if (!animationFrame) return
    window.cancelAnimationFrame(animationFrame)
    animationFrame = 0
  }

  const renderFrame = (timestamp: number) => {
    if (destroyed) return

    if (!lastTimestamp) lastTimestamp = timestamp
    const deltaScale = clampSiteGeometryValue((timestamp - lastTimestamp) / 16.667, 0.4, 1.2)
    lastTimestamp = timestamp
    if (!reducedMotionMedia.matches) {
      update(deltaScale)
    }

    draw()

    if (!reducedMotionMedia.matches && !document.hidden) {
      animationFrame = window.requestAnimationFrame(renderFrame)
    } else {
      animationFrame = 0
    }
  }

  const restart = (rebuild = false) => {
    cancelFrame()
    palette = getSiteGeometryPalette()
    const resized = syncCanvasSize()
    if (rebuild || resized || particles.length === 0) {
      rebuildParticles()
    }
    lastTimestamp = 0
    draw()
    if (!reducedMotionMedia.matches && !document.hidden) {
      animationFrame = window.requestAnimationFrame(renderFrame)
    }
  }

  const onResize = () => restart(true)
  const onVisibilityChange = () => restart(false)
  const onThemeChange = () => restart(false)
  const onReducedMotionChange = () => restart(false)
  const onViewportModeChange = () => restart(true)

  window.addEventListener("resize", onResize)
  document.addEventListener("visibilitychange", onVisibilityChange)
  document.addEventListener("themechange", onThemeChange)
  reducedMotionMedia.addEventListener("change", onReducedMotionChange)
  mobileMedia.addEventListener("change", onViewportModeChange)

  restart(true)

  window.addCleanup(() => {
    destroyed = true
    host.dataset.siteGeometryBackgroundMounted = "false"
    cancelFrame()
    window.removeEventListener("resize", onResize)
    document.removeEventListener("visibilitychange", onVisibilityChange)
    document.removeEventListener("themechange", onThemeChange)
    reducedMotionMedia.removeEventListener("change", onReducedMotionChange)
    mobileMedia.removeEventListener("change", onViewportModeChange)
  })
}

document.addEventListener("nav", mountSiteGeometryBackground)
mountSiteGeometryBackground()
