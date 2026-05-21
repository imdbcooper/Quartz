const MOBILE_MEDIA_QUERY = "(max-width: 800px)"
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)"

type SequenceConfig = {
  basePath: string
  frameCount: number
  startIndex: number
  padLength: number
  filePrefix: string
  fileExtension: string
}

type ReadyFrame = {
  index: number
  image: HTMLImageElement
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getConfig(root: HTMLElement): SequenceConfig {
  return {
    basePath: root.dataset.basePath || "/static/processed_images",
    frameCount: Math.max(1, parseNumber(root.dataset.frameCount, 100)),
    startIndex: parseNumber(root.dataset.startIndex, 1),
    padLength: parseNumber(root.dataset.padLength, 3),
    filePrefix: root.dataset.filePrefix || "frame_",
    fileExtension: (root.dataset.fileExtension || "webp").replace(/^\./, ""),
  }
}

function buildFrameUrl(config: SequenceConfig, index: number) {
  const frameNumber = String(config.startIndex + index).padStart(config.padLength, "0")
  return `${config.basePath}/${config.filePrefix}${frameNumber}.${config.fileExtension}`
}

function getDocumentProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  if (maxScroll <= 0) return 0
  return clamp(window.scrollY / maxScroll, 0, 1)
}

function isImageReady(image: HTMLImageElement | undefined): image is HTMLImageElement {
  return Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0)
}

function findNearestReadyFrame(
  images: Array<HTMLImageElement | undefined>,
  targetIndex: number,
): ReadyFrame | null {
  if (isImageReady(images[targetIndex])) {
    return {
      index: targetIndex,
      image: images[targetIndex],
    }
  }

  for (let offset = 1; offset < images.length; offset++) {
    const lowerIndex = targetIndex - offset
    if (lowerIndex >= 0 && isImageReady(images[lowerIndex])) {
      return {
        index: lowerIndex,
        image: images[lowerIndex],
      }
    }

    const upperIndex = targetIndex + offset
    if (upperIndex < images.length && isImageReady(images[upperIndex])) {
      return {
        index: upperIndex,
        image: images[upperIndex],
      }
    }
  }

  return null
}

function syncCanvasSize(canvas: HTMLCanvasElement, viewport: HTMLElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = Math.max(1, Math.round(viewport.clientWidth))
  const height = Math.max(1, Math.round(viewport.clientHeight))
  const nextWidth = Math.round(width * dpr)
  const nextHeight = Math.round(height * dpr)
  const sizeChanged = canvas.width !== nextWidth || canvas.height !== nextHeight

  if (sizeChanged) {
    canvas.width = nextWidth
    canvas.height = nextHeight
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }

  return sizeChanged
}

function drawFrame(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
) {
  const width = canvas.width
  const height = canvas.height
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  const dx = (width - drawWidth) / 2
  const dy = height - drawHeight

  context.clearRect(0, 0, width, height)
  context.drawImage(image, dx, dy, drawWidth, drawHeight)
}

function mountScrollSequence(root: HTMLElement) {
  if (root.dataset.scrollSequenceMounted === "true") return
  if (window.matchMedia(MOBILE_MEDIA_QUERY).matches) return

  const viewport = root.querySelector<HTMLElement>(".scroll-sequence__viewport")
  const canvas = root.querySelector<HTMLCanvasElement>(".scroll-sequence__canvas")
  if (!viewport || !canvas) return

  const context = canvas.getContext("2d")
  if (!context) return
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = "high"

  const config = getConfig(root)
  const frameUrls = Array.from({ length: config.frameCount }, (_value, index) =>
    buildFrameUrl(config, index),
  )
  if (!frameUrls.length) return

  const reducedMotion = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches
  const images: Array<HTMLImageElement | undefined> = new Array(frameUrls.length)
  let renderRaf = 0
  let activeIndex = -1
  let desiredIndex = 0
  let destroyed = false
  let resizeObserver: ResizeObserver | null = null

  root.dataset.scrollSequenceMounted = "true"

  const render = () => {
    if (destroyed || viewport.clientWidth === 0 || viewport.clientHeight === 0) return

    const sizeChanged = syncCanvasSize(canvas, viewport)
    const readyFrame = findNearestReadyFrame(images, desiredIndex)
    if (!readyFrame) return
    if (!sizeChanged && readyFrame.index === activeIndex) return

    activeIndex = readyFrame.index
    drawFrame(canvas, context, readyFrame.image)
    root.classList.add("is-ready")
    root.dataset.activeFrame = String(config.startIndex + readyFrame.index)
  }

  const scheduleRender = () => {
    if (destroyed || renderRaf) return

    renderRaf = window.requestAnimationFrame(() => {
      renderRaf = 0
      desiredIndex = reducedMotion ? 0 : Math.round(getDocumentProgress() * (frameUrls.length - 1))
      render()
    })
  }

  const loadFrame = (index: number) => {
    if (destroyed || images[index]) return

    const image = new Image()
    image.decoding = "async"
    image.addEventListener("load", scheduleRender, { once: true })
    image.src = frameUrls[index]
    images[index] = image
  }

  const onScroll = () => scheduleRender()
  const onResize = () => scheduleRender()

  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onResize)

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => scheduleRender())
    resizeObserver.observe(viewport)
  }

  loadFrame(0)
  if (!reducedMotion) {
    window.requestAnimationFrame(() => {
      for (let index = 1; index < frameUrls.length; index++) {
        loadFrame(index)
      }
    })
  }
  scheduleRender()

  window.addCleanup(() => {
    destroyed = true
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onResize)
    resizeObserver?.disconnect()
    if (renderRaf) {
      window.cancelAnimationFrame(renderRaf)
    }
  })
}

function mountScrollSequences() {
  document.querySelectorAll<HTMLElement>("[data-scroll-sequence-root]").forEach((root) => {
    mountScrollSequence(root)
  })
}

document.addEventListener("nav", mountScrollSequences)
window.matchMedia(MOBILE_MEDIA_QUERY).addEventListener("change", (event) => {
  if (!event.matches) {
    mountScrollSequences()
  }
})
mountScrollSequences()
