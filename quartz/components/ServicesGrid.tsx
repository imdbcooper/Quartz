import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/servicesGrid.scss"
// @ts-ignore
import script from "./scripts/serviceChips.inline"
import { ServicesConfig } from "./landing/types"

const SERVICE_VARIANTS = ["blue", "purple", "orange", "green"] as const

export default ((config: ServicesConfig) => {
  const ServicesGrid: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="home-section" aria-labelledby="services-title">
        <div class="home-section__head">
          <span class="home-section__index">{config.index}</span>
          <h2 id="services-title">{config.title}</h2>
          <span class="home-section__line" aria-hidden="true" />
        </div>
        <div class="home-grid home-grid--services" data-home-services-list>
          {config.items.map((item, i) => {
            const variant = item.iconVariant ?? SERVICE_VARIANTS[i % SERVICE_VARIANTS.length]
            return (
              <article
                class={`service-chip service-chip--flippable service-chip--${variant}`}
                tabindex={0}
                role="button"
                aria-label={`Показать описание сервиса ${item.title}`}
              >
                <div class="service-chip__inner">
                  <div class="service-chip__face service-chip__face--front">
                    <span>
                      <span class="material-symbols-outlined">{item.icon}</span>
                    </span>
                    <h3>{item.title}</h3>
                  </div>
                  <div class="service-chip__face service-chip__face--back">
                    <p>{item.backText}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  ServicesGrid.css = style
  ServicesGrid.afterDOMLoaded = script
  return ServicesGrid
}) satisfies QuartzComponentConstructor<ServicesConfig>
