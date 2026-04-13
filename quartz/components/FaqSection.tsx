import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/faqSection.scss"
// @ts-ignore
import script from "./scripts/faqSection.inline"
import { FaqConfig } from "./landing/types"

export default ((config: FaqConfig) => {
  const FaqSection: QuartzComponent = (_props: QuartzComponentProps) => {
    const firstItem = config.items[0]

    return (
      <section class="home-section" aria-labelledby="faq-title">
        <div class="home-section__head">
          <span class="home-section__index">{config.index}</span>
          <h2 id="faq-title">{config.title}</h2>
          <span class="home-section__line" aria-hidden="true" />
        </div>
        <div class="faq-list" data-home-faq-list>
          {firstItem && (
            <article
              class="faq-item faq-item--main"
              data-faq-main
              tabindex={0}
              data-faq-more
              style="cursor: pointer; position: relative; transition: border-color 0.2s;"
            >
              <div
                class="faq-more-btn"
                style="position: absolute; right: 28px; top: 28px; display: flex; align-items: center; gap: 4px; color: var(--secondary, #808080);"
              >
                <span style="font-size: 0.85em; white-space: nowrap; font-weight: 500;">
                  Еще вопросы
                </span>
                <span
                  class="faq-chevron material-symbols-outlined"
                  aria-hidden="true"
                  style="margin: 0; font-size: 1.2rem;"
                >
                  expand_more
                </span>
              </div>
              <h3 data-faq-title style="padding-right: 140px; margin-bottom: 8px;">
                {firstItem.question}
              </h3>
              <p data-faq-answer>{firstItem.answer}</p>
            </article>
          )}
        </div>

        {/* FAQ Modal (all questions) */}
        <div class="home-callback-modal" data-home-faq-modal aria-hidden="true" hidden>
          <div class="home-callback-modal__backdrop" data-home-faq-close />
          <div
            class="home-callback-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-faq-modal-title"
          >
            <button
              class="home-callback-modal__close"
              type="button"
              aria-label="Закрыть окно"
              data-home-faq-close
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
            <div class="home-section__head" style="margin-bottom: 20px; padding-right: 32px;">
              <h2
                id="home-faq-modal-title"
                style="margin: 0 !important; font-size: 24px !important;"
              >
                Частые вопросы
              </h2>
              <div class="home-section__line" aria-hidden="true" />
            </div>
            <div
              class="faq-list"
              data-faq-modal-list
              style="display: flex; flex-direction: column; gap: 0; max-height: 50vh; overflow-y: auto; margin: -8px;"
            >
              {config.items.map((item) => (
                <article
                  class="faq-modal-item"
                  data-faq-question={item.question}
                  data-faq-answer-text={item.answer}
                >
                  <h3>{item.question}</h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  FaqSection.css = style
  FaqSection.afterDOMLoaded = script
  return FaqSection
}) satisfies QuartzComponentConstructor<FaqConfig>
