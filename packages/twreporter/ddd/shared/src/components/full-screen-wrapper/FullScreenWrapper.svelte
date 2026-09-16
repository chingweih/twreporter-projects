<script lang="ts">
  import { disablePageScroll, enablePageScroll } from '@fluejs/noscroll'
  import type { Action } from 'svelte/action'
  import type { ComponentPropsWithChildren } from '../types'
  import { fullScreenWrapperConfigSchema } from './types'

  const props: ComponentPropsWithChildren = $props()

  const config = $derived(
    fullScreenWrapperConfigSchema.parse(JSON.parse(props.config)),
  )

  let scrollLock = $state(false)

  const scrollLocker: Action = (node) => {
    $effect(() => {
      if (scrollLock) {
        node.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        disablePageScroll()
      } else {
        enablePageScroll()
      }

      return enablePageScroll
    })
  }
</script>

<div class="wrapper" use:scrollLocker>
  {#if !scrollLock}
    <div class="splash-screen">
      {config.splashScreenText}
      <button onclick={() => (scrollLock = true)}>開始體驗</button>
    </div>
  {:else}
    <div class="footer">
      <button
        onclick={() => {
          scrollLock = false
          window.scrollTo({
            behavior: 'smooth',
            top: window.scrollY + window.innerHeight,
          })
        }}>繼續閱讀</button
      >
    </div>
  {/if}
  {@render props.children()}
</div>

<style>
  button {
    width: fit-content;
    padding: 8px 16px;
    border-radius: 40px;
    font-size: 16px;
    line-height: 24px;
    color: #fff;
    background-color: #333;
  }

  .wrapper {
    width: 100vw;
    height: 100vh;
    position: relative;
  }

  .footer {
    bottom: 0;
    right: 0;
    width: 100%;
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: end;
    background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
    position: absolute;

    button {
      background-color: transparent;
      border: 1px solid #fff;
    }
  }

  .splash-screen {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.8);
  }
</style>
