import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/contactsCta.scss"
import { ContactsPageCtaConfig } from "./landing/types"

export default ((config: ContactsPageCtaConfig) => {
  const ContactsCta: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="contacts-cta" aria-labelledby="contacts-cta-title" data-contacts-block="cta">
        <h2 id="contacts-cta-title" data-contacts-text="cta.title">
          {config.title}
        </h2>
        <p data-contacts-text="cta.subtitle">{config.subtitle}</p>
        <div class="contacts-cta__actions">
          <a
            href={config.tgHref}
            class="contacts-button contacts-button--primary"
            data-contacts-link-tg
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              send
            </span>
            <span data-contacts-text="cta.tgText">{config.tgText}</span>
          </a>
          <a
            href={config.emailHref}
            class="contacts-button contacts-button--secondary"
            data-contacts-link-email
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              mail
            </span>
            <span data-contacts-text="cta.email">{config.email}</span>
          </a>
          <a
            href={config.telHref}
            class="contacts-button contacts-button--secondary"
            data-contacts-link-tel
          >
            <span class="material-symbols-outlined" aria-hidden="true">
              call
            </span>
            <span data-contacts-text="cta.tel">{config.tel}</span>
          </a>
        </div>
        {config.note && (
          <p class="contacts-cta__note" data-contacts-text="cta.note">
            {config.note}
          </p>
        )}
      </section>
    )
  }

  ContactsCta.css = style
  return ContactsCta
}) satisfies QuartzComponentConstructor<ContactsPageCtaConfig>
