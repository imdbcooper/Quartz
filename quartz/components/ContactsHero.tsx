import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/contactsHero.scss"
import { ContactsHeroConfig } from "./landing/types"

export default ((config: ContactsHeroConfig) => {
  const ContactsHero: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="contacts-hero" aria-labelledby="contacts-hero-title">
        <div class="contacts-hero__glow contacts-hero__glow--right" aria-hidden="true" />
        <div class="contacts-hero__glow contacts-hero__glow--left" aria-hidden="true" />
        <div class="contacts-hero__glow contacts-hero__glow--center" aria-hidden="true" />
        <div class="contacts-hero__content">
          <h1 id="contacts-hero-title">{config.title}</h1>
          <p class="contacts-hero__subtitle">{config.subtitle}</p>
          <div class="contacts-hero__tags" aria-label="Форматы сотрудничества">
            {config.tags.map((tag) => (
              <span class="contacts-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div class="contacts-hero__actions">
            <a class="contacts-button contacts-button--primary" href={config.tgLink}>
              <span class="material-symbols-outlined" aria-hidden="true">
                send
              </span>
              Написать в Telegram
            </a>
            <button
              class="contacts-button contacts-button--secondary"
              type="button"
              data-home-callback-open
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                call
              </span>
              Обратный звонок
            </button>
          </div>
        </div>
      </section>
    )
  }

  ContactsHero.css = style
  return ContactsHero
}) satisfies QuartzComponentConstructor<ContactsHeroConfig>
