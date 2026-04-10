import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/workflowSteps.scss"
import { WorkflowConfig } from "./landing/types"

export default ((config: WorkflowConfig) => {
  const WorkflowSteps: QuartzComponent = (_props: QuartzComponentProps) => {
    return (
      <section class="contacts-section" aria-labelledby="contacts-workflow-title">
        <div class="contacts-section__head">
          <span class="contacts-section__index">{config.index}</span>
          <h2 id="contacts-workflow-title">{config.title}</h2>
          <span class="contacts-section__line" aria-hidden="true" />
        </div>
        <div class="contacts-steps-grid">
          {config.steps.map((step) => (
            <article class="contacts-step-card">
              <div class="contacts-step-card__top">
                <span class="contacts-step-card__number">{step.num}</span>
                <span class="material-symbols-outlined" aria-hidden="true">
                  {step.icon}
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  WorkflowSteps.css = style
  return WorkflowSteps
}) satisfies QuartzComponentConstructor<WorkflowConfig>
