import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/landingHero.scss"
import { HeroConfig, HeroVisualMetric } from "./landing/types"

const ICON_ALIASES: Record<string, string> = {
  add_circle: "plus",
  ads_click: "target",
  arrow_forward: "arrow",
  auto_awesome: "spark",
  check_circle: "check",
  dashboard_customize: "dashboard",
  data_object: "code",
  database: "database",
  hub: "nodes",
  integration_instructions: "code",
  monitoring: "chart",
  notifications: "bell",
  payments: "card",
  psychology: "spark",
  receipt_long: "receipt",
  rocket_launch: "rocket",
  rule: "check",
  schedule: "clock",
  schema: "nodes",
  send: "send",
  shield: "shield",
  shopping_bag: "bag",
  terminal: "terminal",
  trending_up: "chart",
  verified: "check",
}

function iconKind(name?: string) {
  if (!name) return "check"
  return ICON_ALIASES[name] ?? "spark"
}

function IconMark({ name, className }: { name?: string; className?: string }) {
  const kind = iconKind(name)
  const cls = ["hero-icon", `hero-icon--${kind}`, className].filter(Boolean).join(" ")

  return (
    <span class={cls} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {kind === "arrow" && <path d="M5 12h12m-5-5 5 5-5 5" />}
        {kind === "bag" && <path d="M7 9h10l-.8 9H7.8L7 9Zm3 0V7a2 2 0 0 1 4 0v2" />}
        {kind === "bell" && (
          <path d="M7 17h10l-1.2-2.2V11a3.8 3.8 0 0 0-7.6 0v3.8L7 17Zm3.4 1.7a2 2 0 0 0 3.2 0" />
        )}
        {kind === "card" && <path d="M4 8.5h16v8H4v-8Zm0 2.6h16M7 14.5h3.2" />}
        {kind === "chart" && <path d="M4.5 17.5 9 13l3 2.4 6.5-8.1m-4.6.2h4.6v4.6" />}
        {kind === "check" && <path d="m5 12.5 4.2 4.1L19 7" />}
        {kind === "clock" && (
          <path d="M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 3.4v4.4l3 1.8" />
        )}
        {kind === "code" && <path d="m9 8-4 4 4 4m6-8 4 4-4 4m-2-9-2 10" />}
        {kind === "dashboard" && (
          <path d="M5 6h6v5H5V6Zm8 0h6v3h-6V6ZM5 13h6v5H5v-5Zm8-2h6v7h-6v-7Z" />
        )}
        {kind === "database" && (
          <path d="M5 7c0-1.4 3.1-2.5 7-2.5S19 5.6 19 7s-3.1 2.5-7 2.5S5 8.4 5 7Zm0 0v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V7M5 12v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
        )}
        {kind === "nodes" && (
          <path d="M7 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm10 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm2.1-4.1 5.8-9.8M9.3 7.2l5.4 9.6" />
        )}
        {kind === "plus" && <path d="M12 5v14M5 12h14" />}
        {kind === "receipt" && (
          <path d="M7 4.5h10v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2v-15Zm3 5h4m-4 4h5" />
        )}
        {kind === "rocket" && (
          <path d="M8.4 15.6 5 19l4.8-1.4m4.8-2 1.4-4.8L19 5l-5.8 3-4.8 1.4-3 3 4.1 2.1 2.1 4.1 3-3Zm-1.1-5.1 2 2" />
        )}
        {kind === "send" && <path d="m4.5 5.5 15 6.5-15 6.5 2-5.1L13 12 6.5 10.6l-2-5.1Z" />}
        {kind === "shield" && (
          <path d="M12 4.5 18 7v4.7c0 3.5-2.4 6.3-6 7.8-3.6-1.5-6-4.3-6-7.8V7l6-2.5Zm-3 7.4 2.1 2.1 4-4" />
        )}
        {kind === "spark" && (
          <path d="M12 3.8 13.8 9l5.4 1.8-5.4 1.8L12 18l-1.8-5.4-5.4-1.8L10.2 9 12 3.8Zm5 10.6.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
        )}
        {kind === "target" && (
          <path d="M12 4.5a7.5 7.5 0 1 0 7.5 7.5M12 8a4 4 0 1 0 4 4m-4 0 7-7m-3.5 0H19v3.5" />
        )}
        {kind === "terminal" && <path d="M5 6.5h14v11H5v-11Zm3 3 2.5 2.5L8 14.5m4.2 0H16" />}
      </svg>
    </span>
  )
}

const DEFAULT_VISUAL = {
  title: "Панель управления бизнесом",
  tabs: ["Overview", "Sales", "Automations"],
  metrics: [
    {
      label: "Выручка",
      value: "+34%",
      delta: "за 30 дней",
      tone: "blue" as const,
      points: [10, 16, 13, 22, 19, 30, 36],
    },
    {
      label: "Заказы",
      value: "1 248",
      delta: "+18%",
      tone: "green" as const,
      points: [12, 10, 18, 16, 25, 23, 31],
    },
    {
      label: "Конверсия",
      value: "8.7%",
      delta: "+2.1 п.п.",
      tone: "orange" as const,
      points: [8, 12, 11, 17, 20, 18, 26],
    },
  ],
  integrations: [
    { label: "Medusa", icon: "shopping_bag" },
    { label: "React", icon: "data_object" },
    { label: "Node.js", icon: "terminal" },
    { label: "PostgreSQL", icon: "database" },
    { label: "Stripe", icon: "payments" },
    { label: "Telegram", icon: "send" },
    { label: "Ещё", icon: "add_circle" },
  ],
  automations: [
    { label: "Новая заявка → CRM", value: "2 сек", status: "Активно", icon: "hub" },
    { label: "Оплата → чек и уведомление", value: "Live", status: "Активно", icon: "receipt_long" },
    { label: "Менеджер → Telegram", value: "24/7", status: "Активно", icon: "notifications" },
  ],
  sideCards: [
    {
      icon: "rocket_launch",
      title: "Быстрый запуск",
      text: "MVP и первые заявки без лишних этапов",
    },
    { icon: "shield", title: "Надёжность", text: "Понятная архитектура, роли и контроль данных" },
    {
      icon: "trending_up",
      title: "Рост конверсии",
      text: "Структура, аналитика и CTA под решение",
    },
  ],
}

function sparklinePoints(metric: HeroVisualMetric) {
  const points =
    Array.isArray(metric.points) && metric.points.length > 1
      ? metric.points
      : [8, 14, 12, 20, 18, 28]
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = Math.max(max - min, 1)
  const step = 120 / Math.max(points.length - 1, 1)

  return points
    .map((point, index) => {
      const x = Math.round(index * step)
      const y = Math.round(42 - ((point - min) / range) * 34)
      return `${x},${y}`
    })
    .join(" ")
}

export default ((config: HeroConfig) => {
  const LandingHero: QuartzComponent = (_props: QuartzComponentProps) => {
    const isCallback = config.primaryAction.type === "callback"
    const icon = config.primaryAction.icon ?? "arrow_forward"
    const titleParts = config.titleParts?.length ? config.titleParts : [{ text: config.title }]
    const benefits = config.benefits ?? []
    const visual = {
      ...DEFAULT_VISUAL,
      ...config.visual,
      metrics: config.visual?.metrics?.length ? config.visual.metrics : DEFAULT_VISUAL.metrics,
      integrations: config.visual?.integrations?.length
        ? config.visual.integrations
        : DEFAULT_VISUAL.integrations,
      automations: config.visual?.automations?.length
        ? config.visual.automations
        : DEFAULT_VISUAL.automations,
      sideCards: config.visual?.sideCards?.length
        ? config.visual.sideCards
        : DEFAULT_VISUAL.sideCards,
      tabs: config.visual?.tabs?.length ? config.visual.tabs : DEFAULT_VISUAL.tabs,
    }

    return (
      <section class="central-hero" aria-labelledby="central-hero-title">
        <div class="central-hero__grid" aria-hidden="true" />
        <div class="central-hero__particles" aria-hidden="true" />
        <div class="central-hero__glow central-hero__glow--right" aria-hidden="true" />
        <div class="central-hero__glow central-hero__glow--left" aria-hidden="true" />
        <div class="central-hero__glow central-hero__glow--center" aria-hidden="true" />

        <div class="central-hero__content">
          <div class="central-hero__copy">
            {(config.badge || config.tags[0]) && (
              <div class="central-hero__badge" data-home-text="hero.badge">
                <IconMark name="auto_awesome" className="central-hero__badge-icon" />
                <span>{config.badge ?? config.tags[0]}</span>
              </div>
            )}

            <h2 id="central-hero-title" data-home-hero-title>
              {titleParts.map((part) => (
                <span class={part.accent ? "central-hero__title-accent" : undefined}>
                  {part.text}
                </span>
              ))}
            </h2>

            <p class="central-hero__subtitle" data-home-text="hero.subtitle">
              {config.subtitle}
            </p>

            <div class="central-hero__tags" aria-label="Ключевые направления" data-home-hero-tags>
              {config.tags.map((tag) => (
                <span class="tag-capsule">{tag}</span>
              ))}
            </div>

            {benefits.length > 0 && (
              <div class="central-hero__benefits" data-home-hero-benefits>
                {benefits.map((benefit) => (
                  <div class="central-hero__benefit">
                    <IconMark
                      name={benefit.icon ?? "check_circle"}
                      className="central-hero__benefit-icon"
                    />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div class="central-hero__actions">
              {isCallback ? (
                <button class="central-hero__cta" type="button" data-home-callback-open>
                  <span data-home-text="hero.primaryAction">{config.primaryAction.text}</span>
                  <IconMark name={icon} className="central-hero__cta-icon" />
                </button>
              ) : (
                <a class="central-hero__cta" href={config.primaryAction.href}>
                  <span data-home-text="hero.primaryAction">{config.primaryAction.text}</span>
                  <IconMark name={icon} className="central-hero__cta-icon" />
                </a>
              )}

              {config.secondaryAction && (
                <a
                  class="central-hero__secondary"
                  href={config.secondaryAction.href}
                  data-home-text="hero.secondaryAction"
                >
                  {config.secondaryAction.text}
                </a>
              )}
            </div>

            {config.sla && (
              <div class="central-hero__sla" data-home-text="hero.sla">
                <IconMark name="schedule" className="central-hero__sla-icon" />
                <span>{config.sla}</span>
              </div>
            )}
          </div>

          <div class="central-hero__visual" aria-label="Пример панели управления">
            <div class="hero-dashboard" data-home-hero-visual>
              <div class="hero-dashboard__chrome">
                <div class="hero-dashboard__dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div class="hero-dashboard__tabs" data-home-hero-visual-tabs>
                  {visual.tabs.map((tab, index) => (
                    <span class={index === 0 ? "is-active" : undefined}>{tab}</span>
                  ))}
                </div>
              </div>

              <div class="hero-dashboard__body">
                <div class="hero-dashboard__head">
                  <div>
                    <p class="hero-dashboard__eyebrow">Live dashboard</p>
                    <h3 data-home-text="hero.visual.title">{visual.title}</h3>
                  </div>
                  <div class="hero-dashboard__status">
                    <span />
                    Online
                  </div>
                </div>

                <div class="hero-dashboard__metrics" data-home-hero-visual-metrics>
                  {visual.metrics.map((metric) => (
                    <article class={`hero-metric hero-metric--${metric.tone ?? "blue"}`}>
                      <div>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                        {metric.delta && <em>{metric.delta}</em>}
                      </div>
                      <svg viewBox="0 0 120 48" role="img" aria-label={`График: ${metric.label}`}>
                        <polyline points={sparklinePoints(metric)} />
                      </svg>
                    </article>
                  ))}
                </div>

                <div class="hero-dashboard__split">
                  <section class="hero-dashboard__panel">
                    <div class="hero-dashboard__panel-head">
                      <IconMark
                        name="integration_instructions"
                        className="hero-dashboard__panel-icon"
                      />
                      <h4>Интеграции</h4>
                    </div>
                    <div class="hero-integrations" data-home-hero-visual-integrations>
                      {visual.integrations.map((integration) => (
                        <span>
                          <IconMark
                            name={integration.icon ?? "extension"}
                            className="hero-integrations__icon"
                          />
                          {integration.label}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section class="hero-dashboard__panel">
                    <div class="hero-dashboard__panel-head">
                      <IconMark name="auto_awesome" className="hero-dashboard__panel-icon" />
                      <h4>Автоматизации</h4>
                    </div>
                    <div class="hero-automations" data-home-hero-visual-automations>
                      {visual.automations.map((automation) => (
                        <div class="hero-automation">
                          <IconMark
                            name={automation.icon ?? "rule"}
                            className="hero-automation__icon"
                          />
                          <div>
                            <strong>{automation.label}</strong>
                            {automation.value && <small>{automation.value}</small>}
                          </div>
                          <em>{automation.status ?? "Активно"}</em>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div class="central-hero__side-cards" data-home-hero-side-cards>
              {visual.sideCards.map((card) => (
                <article class="hero-side-card">
                  <IconMark name={card.icon ?? "verified"} className="hero-side-card__icon" />
                  <div>
                    <strong>{card.title}</strong>
                    <p>{card.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  LandingHero.css = style
  return LandingHero
}) satisfies QuartzComponentConstructor<HeroConfig>
