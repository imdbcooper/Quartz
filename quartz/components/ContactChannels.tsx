import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/contactChannels.scss"
import { ContactChannelsConfig } from "./landing/types"

export default ((config: ContactChannelsConfig) => {
  const ContactChannels: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="contacts-section" aria-labelledby="contacts-fast-title">
        <div class="contacts-section__head">
          <span class="contacts-section__index">{config.index}</span>
          <h2 id="contacts-fast-title">{config.title}</h2>
          <span class="contacts-section__line" aria-hidden="true" />
        </div>
        <div class="contacts-channels-grid">
          {config.channels.map((ch) => (
            <a
              href={ch.href}
              class={`contacts-channel${ch.type === "telegram" ? " contacts-channel--primary" : ""}`}
              aria-label={`Связаться в ${ch.label}`}
            >
              <span class="contacts-channel__icon" aria-hidden="true">
                <svg class="contacts-channel__icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {ch.icon === "send" && (
                    <>
                      <path d="M21 4L3 11.53L10.2 13.93L12.6 21L21 4Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M10.2 13.93L21 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </>
                  )}
                  {ch.icon === "mail" && (
                    <>
                      <path d="M4 6H20V18H4Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M4 8L12 13L20 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </>
                  )}
                  {ch.icon === "call" && (
                    <path d="M15.8 14.8C14.7 15.9 13.5 17.1 11.9 16.8C10.3 16.4 8.8 15.1 7.5 13.8C6.2 12.5 4.9 11 4.5 9.4C4.2 7.8 5.4 6.6 6.5 5.5L7.2 4.8C7.6 4.4 8.3 4.4 8.7 4.8L11.1 7.2C11.5 7.6 11.5 8.3 11.1 8.7L9.9 9.9C10.3 10.8 11 11.7 11.9 12.6C12.8 13.5 13.7 14.2 14.6 14.6L15.8 13.4C16.2 13 16.9 13 17.3 13.4L19.7 15.8C20.1 16.2 20.1 16.9 19.7 17.3L19 18C17.9 19.1 16.7 20.3 15.1 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  )}
                </svg>
              </span>
              <div class="contacts-channel__copy">
                <span class="contacts-channel__label">{ch.label}</span>
                <strong class="contacts-channel__value">{ch.value}</strong>
              </div>
              <span class="contacts-channel__arrow" aria-hidden="true">
                <svg class="contacts-channel__arrow-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </section>
    )
  }

  ContactChannels.css = style
  return ContactChannels
}) satisfies QuartzComponentConstructor<ContactChannelsConfig>
