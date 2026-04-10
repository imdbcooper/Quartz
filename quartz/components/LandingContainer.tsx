import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface LandingContainerOptions {
  type: "home" | "contacts"
  components: QuartzComponent[]
}

export default ((opts?: LandingContainerOptions) => {
  if (!opts) {
    throw new Error("LandingContainer requires options")
  }
  const containerClass = opts.type === "contacts" ? "contacts-central" : "home-central"

  const LandingContainer: QuartzComponent = (props: QuartzComponentProps) => {
    return (
      <div class={containerClass} data-home-callback-root>
        {opts.components.map((Comp, index) => (
          <Comp key={index} {...props} />
        ))}
      </div>
    )
  }

  LandingContainer.css = opts.components.map(c => c.css).filter(Boolean).join("\n")
  LandingContainer.beforeDOMLoaded = opts.components.map(c => c.beforeDOMLoaded).filter(Boolean).join("\n")
  LandingContainer.afterDOMLoaded = opts.components.map(c => c.afterDOMLoaded).filter(Boolean).join("\n")

  return LandingContainer
}) satisfies QuartzComponentConstructor
