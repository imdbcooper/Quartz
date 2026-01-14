import { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/servicesCarousel.scss"
// @ts-ignore
import script from "./scripts/servicesCarousel.inline"

const ServicesCarousel: QuartzComponent = () => {
  return <div class="services-carousel-resources" aria-hidden="true"></div>
}

ServicesCarousel.css = style
ServicesCarousel.afterDOMLoaded = script

export default (() => ServicesCarousel) satisfies QuartzComponentConstructor
