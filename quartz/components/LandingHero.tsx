import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/landingHero.scss"
import { HeroConfig } from "./landing/types"

export default ((config: HeroConfig) => {
  const LandingHero: QuartzComponent = (_props: QuartzComponentProps) => {
    const isCallback = config.primaryAction.type === "callback"
    const icon = config.primaryAction.icon ?? "arrow_forward"

    return (
      <section class="central-hero" aria-labelledby="central-hero-title">
        <div class="central-hero__glow central-hero__glow--right" aria-hidden="true" />
        <div class="central-hero__glow central-hero__glow--left" aria-hidden="true" />
        <div class="central-hero__glow central-hero__glow--center" aria-hidden="true" />
        <div class="central-hero__content">
          <h2 id="central-hero-title" data-home-text="hero.title">
            {config.title}
          </h2>
          <p class="central-hero__subtitle" data-home-text="hero.subtitle">
            {config.subtitle}
          </p>
          <div class="central-hero__tags" aria-label="Ключевые направления" data-home-hero-tags>
            {config.tags.map((tag) => (
              <span class="tag-capsule">{tag}</span>
            ))}
          </div>
          <div class="central-hero__actions">
            {isCallback ? (
              <button class="central-hero__cta" type="button" data-home-callback-open>
                <span data-home-text="hero.primaryAction">{config.primaryAction.text}</span>
                <span class="material-symbols-outlined">{icon}</span>
              </button>
            ) : (
              <a class="central-hero__cta" href={config.primaryAction.href}>
                <span class="material-symbols-outlined">{icon}</span>
                <span data-home-text="hero.primaryAction">{config.primaryAction.text}</span>
              </a>
            )}
          </div>
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
      </section>
    )
  }

  LandingHero.css = style
  return LandingHero
}) satisfies QuartzComponentConstructor<HeroConfig>
