import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/homeCallback.inline"

const HomeCallback: QuartzComponent = () => {
  return <div class="home-callback-resources" aria-hidden="true"></div>
}

HomeCallback.afterDOMLoaded = script

export default (() => HomeCallback) satisfies QuartzComponentConstructor
