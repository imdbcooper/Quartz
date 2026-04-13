import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/startFormats.scss"
import { StartFormatConfig } from "./landing/types"

export default ((config: StartFormatConfig) => {
  const StartFormats: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="contacts-section" aria-labelledby="contacts-start-title">
        <div class="contacts-section__head">
          <span class="contacts-section__index">{config.index}</span>
          <h2 id="contacts-start-title">{config.title}</h2>
          <span class="contacts-section__line" aria-hidden="true" />
        </div>
        <div class="contacts-start-stack">
          <article class="contacts-start-card">
            <div class="contacts-start-card__content">
              <h3>
                <span class="material-symbols-outlined" aria-hidden="true">
                  flash_on
                </span>
                {config.fast.title}
              </h3>
              <p>{config.fast.desc}</p>
            </div>
            <a
              href={config.fast.href ?? "https://t.me/slavxRu"}
              class="contacts-button contacts-button--primary"
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                send
              </span>
              Написать в Telegram
            </a>
          </article>

          <article class="contacts-start-card contacts-start-card--full">
            <div class="contacts-start-card__content">
              <h3>
                <span class="material-symbols-outlined" aria-hidden="true">
                  description
                </span>
                {config.full.title}
              </h3>
              <p>{config.full.desc}</p>
            </div>
            <details class="contacts-brief" id="brief-form">
              <summary>
                <span class="material-symbols-outlined" aria-hidden="true">
                  assignment
                </span>
                <span>{config.full.summary}</span>
              </summary>
              <div class="feedback-form" data-source="/static/data/feedback-form.json" />
              <p class="contacts-brief__legal">
                Для отправки брифа отметьте согласие и ознакомьтесь с{" "}
                <a href="/docs/privacy-policy">Политикой обработки персональных данных</a> и{" "}
                <a href="/docs/personal-data-consent">согласием на обработку персональных данных</a>
                .
              </p>
            </details>
          </article>
        </div>
      </section>
    )
  }

  StartFormats.css = style
  return StartFormats
}) satisfies QuartzComponentConstructor<StartFormatConfig>
