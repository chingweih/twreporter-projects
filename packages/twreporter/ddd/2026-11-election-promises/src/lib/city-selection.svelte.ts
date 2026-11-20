import { SearchParam } from '@lab-reporter/ddd-shared/utils/search-param.svelte.ts'
import { citySchema } from './components/city-selector/types.ts'

class CitySelection {
  #city = new SearchParam('city')

  get current() {
    return citySchema.safeParse(this.#city.current).data ?? ''
  }

  set current(city: string) {
    this.#city.current = citySchema.parse(city)
  }
}

export const citySelection = new CitySelection()
