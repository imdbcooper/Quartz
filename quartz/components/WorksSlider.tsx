import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { WorkCard, WorkItem, WorkSlide, WorksConfig } from "./landing/types"
// @ts-ignore
import script from "./scripts/worksSlider.inline"

const DEFAULT_WORK_ITEMS: WorkItem[] = [
  {
    id: "okb-case",
    badge: "Infrastructure",
    title: "Obsidian Knowledge Base",
    active: true,
    slides: [
      {
        dark: "/images/Prodject/Audio-Scribe/1d.webp",
        light: "/images/Prodject/Audio-Scribe/1l.webp",
        alt: "Интерфейс проекта 1",
        width: 800,
        height: 450,
      },
      {
        dark: "/images/Prodject/Audio-Scribe/2d.webp",
        light: "/images/Prodject/Audio-Scribe/2l.webp",
        alt: "Интерфейс проекта 2",
        width: 800,
        height: 450,
      },
      {
        dark: "/images/Prodject/Audio-Scribe/3d.webp",
        light: "/images/Prodject/Audio-Scribe/3l.webp",
        alt: "Интерфейс проекта 3",
        width: 800,
        height: 450,
      },
    ],
    nav: [
      { icon: "hub", label: "Audio-Scribe" },
      { icon: "folder_open", label: "folder" },
      { icon: "edit_note", label: "edit" },
      { icon: "swap_horiz", label: "swap" },
    ],
    cards: [
      {
        variant: "was",
        cornerIcon: "unfold_more",
        labelIcon: "remove_circle_outline",
        label: "Web панель",
        title: "Полноценная web-панель с AI функциями обработки транскрибации",
        description: "Возможность настройки популярных AI провайдеров",
      },
      {
        variant: "did",
        cornerIcon: "unfold_more",
        labelIcon: "add_circle_outline",
        label: "Сделали",
        title: "Связанная база знаний Obsidian",
        description:
          "Внедрение графовой структуры, шаблонов заметок и автоматизации для быстрого создания гайдов.",
      },
      {
        variant: "result",
        cornerIcon: "arrow_forward",
        labelIcon: "verified",
        label: "Результат",
        title: "Онбординг 3 дня",
        description: "Сокращение времени адаптации сотрудников в 4.5 раза.",
      },
    ],
  },
]

function normalizeWorksItems(items?: WorkItem[]): WorkItem[] {
  return Array.isArray(items) && items.length > 0 ? items : DEFAULT_WORK_ITEMS
}

function slideAlt(slide: WorkSlide, mode: "Dark" | "Light", index: number) {
  return slide.alt ? `${slide.alt} (${mode})` : `Интерфейс проекта ${index + 1} (${mode})`
}

function renderSlides(slides: WorkSlide[]) {
  return slides.map((slide, index) => (
    <div class={`okb-slider__slide${index === 0 ? " okb-slider__slide--active" : ""}`}>
      <picture>
        <img
          class="okb-slide-img okb-slide-img--dark"
          src={slide.dark}
          alt={slideAlt(slide, "Dark", index)}
          loading="lazy"
          width={slide.width || 800}
          height={slide.height || 450}
        />
        <img
          class="okb-slide-img okb-slide-img--light"
          src={slide.light}
          alt={slideAlt(slide, "Light", index)}
          loading="lazy"
          width={slide.width || 800}
          height={slide.height || 450}
        />
      </picture>
    </div>
  ))
}

function renderNav(item: WorkItem) {
  return item.nav.map((navItem, index) => (
    <button
      class={`okb-icon-btn${index === 0 ? " okb-icon-btn--active" : ""}`}
      type="button"
      data-project={navItem.label}
      aria-label={navItem.label}
    >
      <span class="material-symbols-outlined">{navItem.icon}</span>
    </button>
  ))
}

function renderCard(card: WorkCard) {
  return (
    <div class={`okb-card okb-card--${card.variant || "was"}`}>
      <div class="okb-card__corner" aria-hidden="true">
        <span class="material-symbols-outlined">{card.cornerIcon || "unfold_more"}</span>
      </div>
      <div class="okb-card__top">
        <div class="okb-card__label">
          <span class="material-symbols-outlined">{card.labelIcon || "verified"}</span>
          <p>{card.label}</p>
        </div>
        <h4>{card.title}</h4>
      </div>
      <p class="okb-card__sub">{card.description}</p>
    </div>
  )
}

function renderWorkItem(item: WorkItem, index: number) {
  const slides = Array.isArray(item.slides) && item.slides.length > 0 ? item.slides : []
  const nav = Array.isArray(item.nav) && item.nav.length > 0 ? item.nav : []
  const cards = Array.isArray(item.cards) && item.cards.length > 0 ? item.cards : []

  return (
    <article class="work-card okb-case" id={item.id || `work-case-${index + 1}`}>
      <div class="okb-head">
        <span class="okb-badge">{item.badge}</span>
        <h3>{item.title}</h3>
      </div>
      <div class="okb-body">
        <div class="okb-graph okb-slider" data-okb-slider>
          <div class="okb-slider__track" data-okb-track>
            {renderSlides(slides)}
          </div>
          <div class="okb-slider__dots" data-okb-dots>
            {slides.map((_slide, slideIndex) => (
              <span
                class={`okb-slider__dot${slideIndex === 0 ? " okb-slider__dot--active" : ""}`}
                data-dot={String(slideIndex)}
              ></span>
            ))}
          </div>
        </div>
        <div class="okb-sidebar">{renderNav({ ...item, nav })}</div>
      </div>
      <div class="okb-cards">{cards.map((card) => renderCard(card))}</div>
    </article>
  )
}

export default ((config?: WorksConfig) => {
  const indexText = config?.index || "03 / Works"
  const titleText = config?.title || "Кейсы"
  const items = normalizeWorksItems(config?.items)

  const WorksSlider: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="home-section" aria-labelledby="works-title">
        <div class="home-section__head">
          <span class="home-section__index" data-home-text="works.index">
            {indexText}
          </span>
          <h2 id="works-title" data-home-text="works.title">
            {titleText}
          </h2>
          <span class="home-section__line" aria-hidden="true"></span>
        </div>
        <div class="works-list" data-home-works-list>
          {items.map((item, index) => renderWorkItem(item, index))}
        </div>
      </section>
    )
  }

  WorksSlider.afterDOMLoaded = script
  return WorksSlider
}) satisfies QuartzComponentConstructor<WorksConfig | undefined>
