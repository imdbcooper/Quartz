import { FullSlug, joinSegments, pathToRoot, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import style from "./styles/avatar.scss"

type AvatarOptions = {
  imagePath?: string
  altText?: string
}

const DEFAULT_IMAGE_PATH = "images/avatar.png"

const defaultOptions: AvatarOptions = {
  imagePath: DEFAULT_IMAGE_PATH,
  altText: "Profile photo",
}

export default ((userOpts?: Partial<AvatarOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const AvatarComponent: QuartzComponent = ({
    cfg,
    fileData,
    displayClass,
  }: QuartzComponentProps) => {
    const baseDir = pathToRoot(fileData.slug!)
    const homeHref = resolveRelative(fileData.slug!, "index" as FullSlug)
    const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
    const src = joinSegments(baseDir, opts.imagePath ?? DEFAULT_IMAGE_PATH)

    return (
      <a
        class={classNames(displayClass, "site-avatar")}
        href={homeHref}
        aria-label={i18n(cfg.locale).pages.error.home}
      >
        <img class="site-avatar-image" src={src} alt={opts.altText} loading="lazy" />
        <div class="site-avatar-title">{title}</div>
      </a>
    )
  }

  AvatarComponent.css = style
  return AvatarComponent
}) satisfies QuartzComponentConstructor
