import { createSubscriber } from 'svelte/reactivity'

export class SearchParam {
  readonly #key: string
  #subscribe = createSubscriber((update) => {
    if (
      !('navigation' in window) ||
      !(window.navigation instanceof EventTarget)
    ) {
      throw new Error('SearchParam requires the Navigation API.')
    }
    const navigation = window.navigation
    navigation.addEventListener('currententrychange', update)
    return () => navigation.removeEventListener('currententrychange', update)
  })

  constructor(key: string) {
    this.#key = key
  }

  get current() {
    this.#subscribe()
    return new URL(window.location.href).searchParams.get(this.#key)
  }

  set current(value: string | null) {
    const url = new URL(window.location.href)
    if (value === null) {
      url.searchParams.delete(this.#key)
    } else {
      url.searchParams.set(this.#key, value)
    }
    if (url.href !== window.location.href) {
      window.history.pushState(window.history.state, '', url)
    }
  }
}
