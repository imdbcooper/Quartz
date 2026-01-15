import { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/feedbackForm.scss"
// @ts-ignore
import script from "./scripts/feedbackForm.inline"

const FeedbackForm: QuartzComponent = () => {
  return <div class="feedback-form-resources" aria-hidden="true"></div>
}

FeedbackForm.css = style
FeedbackForm.afterDOMLoaded = script

export default (() => FeedbackForm) satisfies QuartzComponentConstructor
