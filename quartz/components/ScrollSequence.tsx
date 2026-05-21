import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/scrollSequence.inline"
import style from "./styles/scrollSequence.scss"
import { classNames } from "../util/lang"

export interface ScrollSequenceOptions {
  basePath: string
  frameCount: number
  startIndex: number
  padLength: number
  filePrefix: string
  fileExtension: string
  frameWidth: number
  frameHeight: number
  alt: string
}

const defaultOptions: ScrollSequenceOptions = {
  basePath: "/static/processed_images",
  frameCount: 100,
  startIndex: 1,
  padLength: 3,
  filePrefix: "frame_",
  fileExtension: "webp",
  frameWidth: 540,
  frameHeight: 960,
  alt: "Прокручиваемая image-sequence анимация девушки",
}

export default ((userOpts?: Partial<ScrollSequenceOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const posterFrame = String(opts.startIndex).padStart(opts.padLength, "0")
  const posterSrc = `${opts.basePath}/${opts.filePrefix}${posterFrame}.${opts.fileExtension}`

  const ScrollSequence: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div
        class={classNames(displayClass, "scroll-sequence")}
        data-scroll-sequence-root="true"
        data-base-path={opts.basePath}
        data-frame-count={String(opts.frameCount)}
        data-start-index={String(opts.startIndex)}
        data-pad-length={String(opts.padLength)}
        data-file-prefix={opts.filePrefix}
        data-file-extension={opts.fileExtension}
        data-frame-width={String(opts.frameWidth)}
        data-frame-height={String(opts.frameHeight)}
        role="img"
        aria-label={opts.alt}
      >
        <div class="scroll-sequence__shell">
          <div class="scroll-sequence__viewport">
            <canvas class="scroll-sequence__canvas" aria-hidden="true"></canvas>
            <div class="scroll-sequence__loading" aria-hidden="true"></div>
            <noscript>
              <img
                class="scroll-sequence__fallback"
                src={posterSrc}
                alt={opts.alt}
                width={opts.frameWidth}
                height={opts.frameHeight}
                loading="lazy"
              />
            </noscript>
          </div>
        </div>
      </div>
    )
  }

  ScrollSequence.css = style
  ScrollSequence.afterDOMLoaded = script

  return ScrollSequence
}) satisfies QuartzComponentConstructor<Partial<ScrollSequenceOptions> | undefined>
