import { MediaQuery } from 'svelte/reactivity'
import { breakpoints } from '@lab-reporter/ddd-shared/utils/media-query.ts'

export const mobile = new MediaQuery(`(width < ${breakpoints.tablet}px)`)
export const narrowComparison = new MediaQuery('(width < 1080px)')
export const compactComparison = new MediaQuery('(width < 1500px)')
