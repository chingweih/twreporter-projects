import { createSubscriber } from 'svelte/reactivity'

const searchParamChangeEvent = 'twreporter:search-param-change'

export class SearchParam {
  readonly #key: string
  #subscribe = createSubscriber((update) => {
    const navigation = 'navigation' in window ? window.navigation : undefined
    if (navigation instanceof EventTarget) {
      navigation.addEventListener('currententrychange', update)
      return () => navigation.removeEventListener('currententrychange', update)
    }

    window.addEventListener('popstate', update)
    window.addEventListener(searchParamChangeEvent, update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener(searchParamChangeEvent, update)
    }
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
      window.dispatchEvent(new Event(searchParamChangeEvent))
    }
  }
}
