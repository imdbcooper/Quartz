import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ArticleTitle: QuartzComponent = () => {
  return null
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
  font-family: var(--bodyFont);
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--darkgray);
  text-align: right;
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
