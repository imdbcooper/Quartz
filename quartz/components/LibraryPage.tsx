import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/libraryPage.scss"
// @ts-ignore
import script from "./scripts/libraryPage.inline"

export interface LibraryPageConfig {
  backendBaseUrl: string
  catalogPath: string
  previewDescriptionLength: number
}

const defaultConfig: LibraryPageConfig = {
  backendBaseUrl: "",
  catalogPath: "",
  previewDescriptionLength: 260,
}

export default ((userConfig?: Partial<LibraryPageConfig>) => {
  const config = { ...defaultConfig, ...userConfig }

  const LibraryPage: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const title =
      typeof fileData.frontmatter?.title === "string" && fileData.frontmatter.title.trim()
        ? fileData.frontmatter.title.trim()
        : "Библиотека"
    const subtitle =
      typeof fileData.frontmatter?.description === "string" &&
      fileData.frontmatter.description.trim()
        ? fileData.frontmatter.description.trim()
        : "Категории и книги из BOOK-LIBRARY."

    return (
      <section
        class="library-page"
        data-library-page-root
        data-library-backend-base-url={config.backendBaseUrl}
        data-library-catalog-path={config.catalogPath}
        data-library-preview-description-length={String(config.previewDescriptionLength)}
      >
        <div class="library-page__hero">
          <span class="library-page__eyebrow">BOOK-LIBRARY</span>
          <h2>{title}</h2>
          <p class="library-page__subtitle">{subtitle}</p>
        </div>

        <div class="library-page__status" data-library-status role="status" aria-live="polite">
          Загружаем категории...
        </div>

        <div class="library-page__categories" data-library-categories />

        <div class="library-page__preview" data-library-preview hidden aria-hidden="true">
          <div class="library-page__preview-card">
            <div class="library-page__preview-copy">
              <div class="library-page__preview-meta" data-library-preview-meta />
              <h3 class="library-page__preview-title" data-library-preview-title />
              <p class="library-page__preview-author" data-library-preview-author />
              <div class="library-page__preview-description-block">
                <div class="library-page__preview-description-label">Описание</div>
                <p class="library-page__preview-description" data-library-preview-description />
              </div>
            </div>
          </div>
        </div>

        <div class="library-page__modal" data-library-modal hidden aria-hidden="true">
          <div class="library-page__modal-backdrop" data-library-modal-close />
          <div
            class="library-page__modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-modal-title"
            data-library-modal-dialog
          >
            <button
              class="library-page__modal-close"
              type="button"
              aria-label="Закрыть окно"
              data-library-modal-close
            >
              <span class="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
            <div class="library-page__modal-layout">
              <div class="library-page__modal-cover-shell">
                <img
                  class="library-page__modal-cover"
                  data-library-modal-cover
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <div
                  class="library-page__modal-cover-fallback"
                  data-library-modal-cover-fallback
                  aria-hidden="true"
                />
              </div>
              <div class="library-page__modal-copy">
                <div class="library-page__modal-meta" data-library-modal-meta />
                <h3
                  id="library-modal-title"
                  class="library-page__modal-title"
                  data-library-modal-title
                />
                <p class="library-page__modal-author" data-library-modal-author />
                <p class="library-page__modal-description" data-library-modal-description />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  LibraryPage.css = style
  LibraryPage.afterDOMLoaded = script

  return LibraryPage
}) satisfies QuartzComponentConstructor<Partial<LibraryPageConfig> | undefined>
