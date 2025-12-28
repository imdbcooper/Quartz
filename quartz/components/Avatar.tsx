import { joinSegments, pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import style from "./styles/avatar.scss"

type AvatarOptions = {
  imagePath?: string
  altText?: string
}

const defaultOptions: AvatarOptions = {
  imagePath: "images/avatar.jpg",
  altText: "Profile photo",
}

export default ((userOpts?: Partial<AvatarOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const AvatarComponent: QuartzComponent = ({ cfg, fileData, displayClass }: QuartzComponentProps) => {
    const baseDir = pathToRoot(fileData.slug!)
    const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
    const src = joinSegments(baseDir, opts.imagePath)

    return (
      <div class={classNames(displayClass, "site-avatar")}>
        <img class="site-avatar-image" src={src} alt={opts.altText} loading="lazy" />
        <div class="site-avatar-title">{title}</div>
      </div>
    )
  }

  AvatarComponent.css = style
  return AvatarComponent
}) satisfies QuartzComponentConstructor
