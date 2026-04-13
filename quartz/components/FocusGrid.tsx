import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/focusGrid.scss"
import { FocusConfig } from "./landing/types"

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
                <div class={`focus-card__icon focus-card__icon--${card.iconVariant}`}>
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
