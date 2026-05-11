import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/contactsCta.scss"
import { ContactsPageCtaConfig } from "./landing/types"

export default ((config: ContactsPageCtaConfig) => {
  const ContactsCta: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="contacts-cta" aria-labelledby="contacts-cta-title">
        <h2 id="contacts-cta-title">{config.title}</h2>
        <p>{config.subtitle}</p>
        <div class="contacts-cta__actions">
          <a href={config.tgHref} class="contacts-button contacts-button--primary">
            <span class="material-symbols-outlined" aria-hidden="true">
              send
            </span>
            <span>{config.tgText}</span>
          </a>
          <a href={config.emailHref} class="contacts-button contacts-button--secondary">
            <span class="material-symbols-outlined" aria-hidden="true">
              mail
            </span>
            <span>{config.email}</span>
          </a>
          <a href={config.telHref} class="contacts-button contacts-button--secondary">
            <span class="material-symbols-outlined" aria-hidden="true">
              call
            </span>
            <span>{config.tel}</span>
          </a>
        </div>
        {config.note && <p class="contacts-cta__note">{config.note}</p>}
      </section>
    )
  }

  ContactsCta.css = style
  return ContactsCta
}) satisfies QuartzComponentConstructor<ContactsPageCtaConfig>
