export function createWrapperController() {
  let scrollLock = $state(false)
  let buttonVisible = $state(true)

  return {
    get scrollLock() {
      return scrollLock
    },
    get buttonVisible() {
      return buttonVisible
    },
    lock() {
      scrollLock = true
    },
    release() {
      scrollLock = false
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      window.scrollTo({
        behavior: 'smooth',
        top: window.scrollY + window.innerHeight,
      })
    },
    setButtonVisible(visible: boolean) {
      buttonVisible = visible
    },
  }
}

export type WrapperController = ReturnType<typeof createWrapperController>
