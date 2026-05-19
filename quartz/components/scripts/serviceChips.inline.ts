// Service chips flip interaction for touch devices.
// On hover-capable devices, CSS :hover handles the flip.
// On touch devices, this script adds tap-to-flip.

function bindServiceChipFlip() {
  const isTouchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches
  const chips = document.querySelectorAll<HTMLElement>(".service-chip--flippable")

  chips.forEach((card) => {
    if (card.dataset.flipBound === "true") return
    card.dataset.flipBound = "true"

    if (!isTouchLike) return

    const onClick = () => {
      const next = !card.classList.contains("is-open")
      chips.forEach((other) => {
        if (other !== card) other.classList.remove("is-open")
      })
      card.classList.toggle("is-open", next)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return
      event.preventDefault()
      card.click()
    }

    card.addEventListener("click", onClick)
    card.addEventListener("keydown", onKeyDown)

    window.addCleanup(() => {
      card.removeEventListener("click", onClick)
      card.removeEventListener("keydown", onKeyDown)
    })
  })
}

document.addEventListener("nav", bindServiceChipFlip)
document.addEventListener("home:services-rendered", bindServiceChipFlip)
bindServiceChipFlip()
