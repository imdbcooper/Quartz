import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/focusGrid.scss"
import { FocusConfig } from "./landing/types"

function isHexColor(value?: string) {
  return typeof value === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}

function focusIconClass(iconVariant: string, iconColor?: string) {
  if (iconVariant === "custom" && isHexColor(iconColor))
    return "focus-card__icon focus-card__icon--custom"
  return `focus-card__icon focus-card__icon--${iconVariant}`
}

function focusIconStyle(iconVariant: string, iconColor?: string) {
  if (iconVariant === "custom" && isHexColor(iconColor)) return `--focus-accent:${iconColor};`
  return undefined
}

export default ((config: FocusConfig) => {
  const FocusGrid: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="home-section" aria-labelledby="focus-title">
        <div class="home-section__head">
          <span class="home-section__index" data-home-text="focus.index">
            {config.index}
          </span>
          <h2 id="focus-title" data-home-text="focus.title">
            {config.title}
          </h2>
          <div class="home-section__line" aria-hidden="true" />
        </div>
        <div class="home-grid home-grid--focus" data-home-focus-list>
          {config.cards.map((card) => (
            <article class="focus-card">
              <div class="focus-card__header">
                <div
                  class={focusIconClass(card.iconVariant, card.iconColor)}
                  style={focusIconStyle(card.iconVariant, card.iconColor)}
                >
                  <span class="material-symbols-outlined">{card.icon}</span>
                </div>
                <h3>{card.title}</h3>
              </div>
              <p>{card.desc}</p>
              <div class="focus-card__result">
                <span class="material-symbols-outlined">{card.resultIcon}</span>
                {card.resultText}
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  FocusGrid.css = style
  return FocusGrid
}) satisfies QuartzComponentConstructor<FocusConfig>
