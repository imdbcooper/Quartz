import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/contactCta.scss"
import { ContactCtaConfig } from "./landing/types"

export default ((config: ContactCtaConfig) => {
  const ContactCta: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="home-contact-cta" aria-labelledby="contact-cta-title">
        <h2 id="contact-cta-title">{config.title}</h2>
        <p>{config.subtitle}</p>
        <div class="home-contact-cta__callback" aria-label="Заказ обратного звонка">
          <span class="home-contact-cta__callback-icon-wrap" aria-hidden="true">
            <span class="home-contact-cta__callback-icon material-symbols-outlined">call</span>
          </span>
          <div class="home-contact-cta__callback-copy">
            <h3>{config.callbackTitle ?? "Обратный звонок за 15 минут"}</h3>
            <p>{config.callbackDesc ?? "Оставьте номер, и я перезвоню в ближайшее окно."}</p>
          </div>
          <button class="home-contact-cta__callback-button" type="button" data-home-callback-open>
            <span>{config.callbackButton ?? "Заказать звонок"}</span>
            <span class="material-symbols-outlined" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </div>
        {/* Callback modal is provided by HomeCallback component */}
        {config.note && <p class="home-contact-cta__note">{config.note}</p>}
      </section>
    )
  }

  ContactCta.css = style
  return ContactCta
}) satisfies QuartzComponentConstructor<ContactCtaConfig>
