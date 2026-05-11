import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/contactsFaq.scss"
import { FaqConfig } from "./landing/types"

export default ((config: FaqConfig) => {
  const ContactsFaq: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="contacts-section" aria-labelledby="contacts-faq-title">
        <div class="contacts-section__head">
          <span class="contacts-section__index">{config.index}</span>
          <h2 id="contacts-faq-title">{config.title}</h2>
          <span class="contacts-section__line" aria-hidden="true" />
        </div>
        <div class="contacts-faq-list">
          {config.items.map((item) => (
            <details class="contacts-faq-item" key={item.question}>
              <summary>
                {item.question}
                <span class="material-symbols-outlined" aria-hidden="true">
                  expand_more
                </span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    )
  }

  ContactsFaq.css = style
  return ContactsFaq
}) satisfies QuartzComponentConstructor<FaqConfig>
