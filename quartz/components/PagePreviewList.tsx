import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"

export interface PagePreview {
  title: string
  description?: string
 date?: Date
  tags: string[]
  slug: FullSlug
  previewImage?: string
}

export function extractPreviewData(page: QuartzPluginData, cfg: GlobalConfiguration): PagePreview {
  // Извлекаем данные для превью из QuartzPluginData
  const title = page.frontmatter?.title ?? "Без названия"
  const description = page.frontmatter?.description
  const tags = page.frontmatter?.tags ?? []
  const slug = page.slug!
  const date = page.dates ? getDate(cfg, page) : undefined
  
  // Извлекаем изображение для превью - сначала ищем в frontmatter
  let previewImage = page.frontmatter?.preview_image as string
  
  // Если в frontmatter нет изображения, можно реализовать логику поиска в контенте
  // Пока оставим как есть, позже можно будет расширить
  
  return {
    title,
    description,
    date,
    tags,
    slug,
    previewImage
 }
}

type Props = {
  limit?: number
  sort?: (f1: QuartzPluginData, f2: QuartzPluginData) => number
} & QuartzComponentProps

export const PagePreviewList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  const sorter = sort || ((f1, f2) => {
    // Сортировка по дате (новые первыми) и алфавиту
    if (f1.dates && f2.dates) {
      return getDate(cfg, f2)!.getTime() - getDate(cfg, f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  })

  let list = allFiles.sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

 const previewData = list.map(page => extractPreviewData(page, cfg))

  return (
    <div class="page-preview-list">
      {previewData.map((preview) => (
        <a href={resolveRelative(fileData.slug!, preview.slug)} class="preview-card internal">
          <div class="preview-image-container">
            {preview.previewImage ? (
              <img src={resolveRelative(fileData.slug!, preview.previewImage as FullSlug)} alt={preview.title} class="preview-image" />
            ) : (
              <div class="placeholder-image">
                <span>{i18n(cfg.locale).components.previewList.noImage}</span>
              </div>
            )}
          </div>
          <div class="preview-content">
            <h3 class="preview-title">{preview.title}</h3>
            {preview.description && (
              <p class="preview-description">{preview.description}</p>
            )}
            <div class="preview-meta">
              {preview.date && (
                <span class="preview-date">
                  <Date date={preview.date} locale={cfg.locale} />
                </span>
              )}
              {preview.tags.length > 0 && (
                <ul class="preview-tags">
                  {preview.tags.map((tag) => (
                    <li>
                      <a
                        class="internal tag-link"
                        href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                      >
                        {tag}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

PagePreviewList.css = `
.page-preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
 margin-top: 1rem;
}

.preview-card {
  display: block;
  text-decoration: none;
  border: 1px solid var(--lightgray);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: var(--light);
  color: var(--dark);
}

.preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.preview-image-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.preview-image {
 width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
 align-items: center;
  justify-content: center;
  background-color: var(--lightgray);
  color: var(--gray);
}

.preview-content {
  padding: 1rem;
}

.preview-title {
 margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: var(--dark);
}

.preview-description {
  margin: 0.5rem 0;
  color: var(--gray);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-meta {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preview-date {
  font-size: 0.85rem;
  color: var(--gray);
}

.preview-tags {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
 flex-wrap: wrap;
  justify-content: flex-end;
}

.preview-tags li {
  margin: 0;
}

@media (max-width: 768px) {
  .page-preview-list {
    grid-template-columns: 1fr;
  }
  
  .preview-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
`