import type { Snippet } from 'svelte'

export type ComponentProps = {
  src: string
  config: string
}

export type ComponentExtraProps = Record<string, string | number | boolean>

export type ComponentAttributes = Pick<ComponentProps, 'config'> &
  ComponentExtraProps

export type ComponentPropsWithChildren = ComponentProps & {
  children: Snippet
}
