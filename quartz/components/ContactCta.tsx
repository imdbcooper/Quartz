import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/contactCta.scss"
import { ContactCtaConfig } from "./landing/types"

export default ((config: ContactCtaConfig) => {
  const ContactCta: QuartzComponent = (_props: QuartzComponentProps) => {
    const modalTitle = config.modalTitle ?? "Заказать обратный звонок"
    const modalSubtitle = config.modalSubtitle ?? "Оставьте номер, и я перезвоню в ближайшее окно."
    const legalPrefix = config.legalPrefix ?? "Для отправки заявки отметьте согласие."
    const legalLinkText = config.legalLinkText ?? "Политикой обработки персональных данных"

    return (
      <section class="home-contact-cta" aria-labelledby="contact-cta-title">
        <h2 id="contact-cta-title" data-home-text="contact.title">
          {config.title}
        </h2>
        <p data-home-text="contact.subtitle">{config.subtitle}</p>
        <div
          class="home-contact-cta__callback"
          aria-label="Заказ обратного звонка"
          data-home-contact-callback-aria
        >
          <span class="home-contact-cta__callback-icon-wrap" aria-hidden="true">
            <span class="home-contact-cta__callback-icon material-symbols-outlined">call</span>
          </span>
          <div class="home-contact-cta__callback-copy">
            <h3 data-home-text="contact.callbackTitle">
              {config.callbackTitle ?? "Обратный звонок за 15 минут"}
            </h3>
            <p data-home-text="contact.callbackDesc">
              {config.callbackDesc ?? "Оставьте номер, и я перезвоню в ближайшее окно."}
            </p>
          </div>
          <button class="home-contact-cta__callback-button" type="button" data-home-callback-open>
            <span data-home-text="contact.callbackButton">
              {config.callbackButton ?? "Заказать звонок"}
            </span>
            <span class="material-symbols-outlined" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </div>
        <div class="home-callback-modal" data-home-callback-modal aria-hidden="true" hidden>
          <div class="home-callback-modal__backdrop" data-home-callback-close />
          <div
            class="home-callback-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-callback-modal-title"
            data-home-callback-dialog
          >
            <button
              class="home-callback-modal__close"
              type="button"
              aria-label="Закрыть окно"
              data-home-callback-close
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
            <h3 id="home-callback-modal-title" data-home-text="contact.modalTitle">
              {modalTitle}
            </h3>
            <p class="home-callback-modal__subtitle" data-home-text="contact.modalSubtitle">
              {modalSubtitle}
            </p>
            <div
              class="feedback-form home-callback-modal__form"
              data-source="/static/data/home-callback-form.json"
            />
            <p class="home-callback-modal__legal">
              <span data-home-text="contact.legalPrefix">{legalPrefix}</span>{" "}
              <a href="/privacy-policy" data-home-text="contact.legalLinkText">
                {legalLinkText}
              </a>
              .
            </p>
          </div>
        </div>
        {config.note && (
          <p class="home-contact-cta__note" data-home-text="contact.note">
            {config.note}
          </p>
        )}
      </section>
    )
  }

  ContactCta.css = style
  return ContactCta
}) satisfies QuartzComponentConstructor<ContactCtaConfig>
