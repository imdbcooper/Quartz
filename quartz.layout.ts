import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import homeData from "./quartz/static/data/home.json"
import contactsData from "./quartz/static/data/contacts.json"

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
        components: [
          Component.LandingHero({
            title: homeData.hero.title,
            subtitle: homeData.hero.subtitle,
            tags: homeData.hero.tags,
            primaryAction: { text: homeData.hero.primaryAction, type: "callback" },
            secondaryAction: { text: homeData.hero.secondaryAction, href: "/Кoнтакты" },
          }),
          Component.FocusGrid({
            index: homeData.focus.index,
            title: homeData.focus.title,
            cards: homeData.focus.cards,
          }),
          Component.ServicesGrid({
            index: homeData.services.index,
            title: homeData.services.title,
            items: homeData.services.items,
          }),
          Component.WorksSlider(),
          Component.FaqSection({
            index: homeData.faq.index,
            title: homeData.faq.title,
            items: homeData.faq.items,
          }),
          Component.ContactCta({
            title: homeData.contact.title,
            subtitle: homeData.contact.subtitle,
            callbackTitle: homeData.contact.callbackTitle,
            callbackDesc: homeData.contact.callbackDesc,
            callbackButton: homeData.contact.callbackButton,
            note: homeData.contact.note,
          }),
        ],
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.LandingContainer({
        type: "contacts",
        components: [
          Component.ContactsHero({
            title: contactsData.hero.title,
            subtitle: contactsData.hero.subtitle,
            tags: contactsData.hero.tags,
            tgLink: contactsData.hero.tgLink,
          }),
          Component.ContactChannels({
            index: contactsData.fastContact.index,
            title: contactsData.fastContact.title,
            channels: contactsData.fastContact.channels,
          }),
          Component.WorkflowSteps({
            index: contactsData.workflow.index,
            title: contactsData.workflow.title,
            steps: contactsData.workflow.steps,
          }),
          Component.StartFormats({
            index: contactsData.formats.index,
            title: contactsData.formats.title,
            fast: contactsData.formats.fast,
            full: contactsData.formats.full,
          }),
          Component.ContactsFaq({
            index: contactsData.faq.index,
            title: contactsData.faq.title,
            items: contactsData.faq.items,
          }),
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
        ],
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
