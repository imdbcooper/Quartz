import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import homeData from "./quartz/static/data/home.json"
import contactsData from "./quartz/static/data/contacts.json"

const HOME_BLOCK_ORDER = ["hero", "focus", "services", "works", "faq", "contact"] as const
const CONTACTS_BLOCK_ORDER = ["hero", "channels", "workflow", "formats", "faq", "cta"] as const

function resolveBlockOrder<T extends string>(order: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(order)) return [...allowed]
  const normalized = order.filter(
    (entry): entry is T => typeof entry === "string" && allowed.includes(entry as T),
  )
  return normalized.length > 0 ? normalized : [...allowed]
}

function buildHomeLandingComponents() {
  const factories = {
    hero: () =>
      Component.LandingHero({
        title: homeData.hero.title,
        subtitle: homeData.hero.subtitle,
        tags: homeData.hero.tags,
        primaryAction: { text: homeData.hero.primaryAction, type: "callback" },
        secondaryAction: { text: homeData.hero.secondaryAction, href: "/Кoнтакты" },
      }),
    focus: () =>
      Component.FocusGrid({
        index: homeData.focus.index,
        title: homeData.focus.title,
        cards: homeData.focus.cards,
      }),
    services: () =>
      Component.ServicesGrid({
        index: homeData.services.index,
        title: homeData.services.title,
        items: homeData.services.items,
      }),
    works: () =>
      Component.WorksSlider({
        index: homeData.works.index,
        title: homeData.works.title,
        items: homeData.works.items,
      }),
    faq: () =>
      Component.FaqSection({
        index: homeData.faq.index,
        title: homeData.faq.title,
        items: homeData.faq.items,
      }),
    contact: () =>
      Component.ContactCta({
        title: homeData.contact.title,
        subtitle: homeData.contact.subtitle,
        callbackTitle: homeData.contact.callbackTitle,
        callbackDesc: homeData.contact.callbackDesc,
        callbackButton: homeData.contact.callbackButton,
        modalTitle: homeData.contact.modalTitle,
        modalSubtitle: homeData.contact.modalSubtitle,
        legalPrefix: homeData.contact.legalPrefix,
        legalLinkText: homeData.contact.legalLinkText,
        note: homeData.contact.note,
      }),
  } satisfies Record<
    (typeof HOME_BLOCK_ORDER)[number],
    () => ReturnType<typeof Component.LandingHero>
  >

  return resolveBlockOrder(homeData.pageLayout, HOME_BLOCK_ORDER).map((block) => factories[block]())
}

function buildContactsLandingComponents() {
  const factories = {
    hero: () =>
      Component.ContactsHero({
        title: contactsData.hero.title,
        subtitle: contactsData.hero.subtitle,
        tags: contactsData.hero.tags,
        tgLink: contactsData.hero.tgLink,
      }),
    channels: () =>
      Component.ContactChannels({
        index: contactsData.fastContact.index,
        title: contactsData.fastContact.title,
        channels: contactsData.fastContact.channels,
      }),
    workflow: () =>
      Component.WorkflowSteps({
        index: contactsData.workflow.index,
        title: contactsData.workflow.title,
        steps: contactsData.workflow.steps,
      }),
    formats: () =>
      Component.StartFormats({
        index: contactsData.formats.index,
        title: contactsData.formats.title,
        fast: contactsData.formats.fast,
        full: contactsData.formats.full,
      }),
    faq: () =>
      Component.ContactsFaq({
        index: contactsData.faq.index,
        title: contactsData.faq.title,
        items: contactsData.faq.items,
      }),
    cta: () =>
      Component.ContactsCta({
        title: contactsData.cta.title,
        subtitle: contactsData.cta.subtitle,
        tgText: contactsData.cta.tgText,
        tgHref: contactsData.hero.tgLink,
        email: contactsData.cta.email,
        emailHref: contactsData.hero.emailLink,
        tel: contactsData.cta.tel,
        telHref: `tel:${contactsData.cta.tel.replace(/[^\d+]/g, "")}`,
        note: contactsData.cta.note,
      }),
  } satisfies Record<
    (typeof CONTACTS_BLOCK_ORDER)[number],
    () => ReturnType<typeof Component.ContactsHero>
  >

  return resolveBlockOrder(contactsData.pageLayout, CONTACTS_BLOCK_ORDER).map((block) =>
    factories[block](),
  )
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ServicesCarousel(),
    Component.FeedbackForm(),
    Component.HomeCallback(),
    Component.CookieConsent(),
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.LandingContainer({
        type: "home",
        components: buildHomeLandingComponents(),
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.LandingContainer({
        type: "contacts",
        components: buildContactsLandingComponents(),
      }),
      condition: (page) => page.fileData.slug === "Кoнтакты",
    }),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index" && page.fileData.slug !== "Кoнтакты",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index" && page.fileData.slug !== "Кoнтакты",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index" && page.fileData.slug !== "Кoнтакты",
    }),
  ],
  left: [
    Component.Avatar(),
    Component.MobileOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
          { Component: Component.ReaderMode() },
        ],
      }),
    ),
    Component.CardMenu(),
  ],
  right: [
    Component.DesktopOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
          { Component: Component.ReaderMode() },
        ],
      }),
    ),
    Component.Graph({
      localGraph: {
        showTags: false,
      },
      globalGraph: {
        showTags: false,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.Avatar(),
    Component.MobileOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
        ],
      }),
    ),
    Component.CardMenu(),
  ],
  right: [
    Component.DesktopOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
        ],
      }),
    ),
  ],
}

// components for pages that display lists of pages with preview cards (e.g. tags or folders)
export const previewListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.Avatar(),
    Component.MobileOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
        ],
      }),
    ),
    Component.CardMenu(),
  ],
  right: [
    Component.DesktopOnly(
      Component.Flex({
        components: [
          {
            Component: Component.Search(),
            grow: true,
          },
          { Component: Component.Darkmode() },
        ],
      }),
    ),
  ],
}
