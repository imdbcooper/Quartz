// Shared types for all landing page components.
// Edit the JSON files in quartz/static/data/ to change content.

export interface HeroConfig {
  title: string
  subtitle: string
  tags: string[]
  primaryAction: {
    text: string
    type: "callback" | "link"
    href?: string
    icon?: string
  }
  secondaryAction?: {
    text: string
    href: string
  }
}

export interface ContactsHeroConfig {
  title: string
  subtitle: string
  tags: string[]
  tgLink: string
}

export interface FocusCard {
  icon: string
  iconVariant: string
  title: string
  desc: string
  resultIcon: string
  resultText: string
}

export interface FocusConfig {
  index: string
  title: string
  cards: FocusCard[]
}

export interface ServiceItem {
  icon: string
  iconVariant?: string
  title: string
  backText: string
}

export interface ServicesConfig {
  index: string
  title: string
  items: ServiceItem[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqConfig {
  index: string
  title: string
  items: FaqItem[]
}

export interface ContactCtaConfig {
  title: string
  subtitle: string
  callbackTitle?: string
  callbackDesc?: string
  callbackButton?: string
  note?: string
}

export interface ContactChannel {
  type: string
  icon: string
  label: string
  value: string
  href: string
}

export interface ContactChannelsConfig {
  index: string
  title: string
  channels: ContactChannel[]
}

export interface WorkflowStep {
  num: string
  icon: string
  title: string
  desc: string
}

export interface WorkflowConfig {
  index: string
  title: string
  steps: WorkflowStep[]
}

export interface StartFormatConfig {
  index: string
  title: string
  fast: {
    title: string
    desc: string
    href?: string
  }
  full: {
    title: string
    desc: string
    summary: string
  }
}

export interface ContactsPageCtaConfig {
  title: string
  subtitle: string
  tgText: string
  tgHref: string
  email: string
  emailHref: string
  tel: string
  telHref: string
  note?: string
}
