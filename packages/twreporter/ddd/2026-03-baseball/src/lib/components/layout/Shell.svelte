<script lang="ts">
    import { domToPng } from "modern-screenshot";
    import type { Snippet } from "svelte";
    import Background from "../icons/Background.svelte";

    let container: HTMLDivElement | null = null;

    // 使用 `?download` 檢查是否要開啟下載選項
    const urlParams = new URLSearchParams(window.location.search);
    const showDownload = urlParams.has("download");

    const {
        name,
        children,
        headerChildren,
    }: {
        name: string;
        description?: string;
        footnotes: string[];
        children: Snippet;
        headerChildren?: Snippet;
    } = $props();
</script>

<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/tailwindcss-preflight@1.0.1/preflight.min.css"
    crossorigin="anonymous"
/>

<div class="outer">
    <div class="container" bind:this={container}>
        <Background />

        <div class="header">
            <h1>{name}</h1>
            {@render headerChildren?.()}
        </div>

        {@render children()}
    </div>

    {#if showDownload}
        <div class="download-control">
            <p>
                視窗寬度：{innerWidth}px（下載前請拉寬到超過730px）
            </p>
            <button
                class="dl-button"
                onclick={() =>
                    container &&
                    domToPng(container, {
                        quality: 1,
                        scale: 3,
                    }).then((dataUrl) => {
                        const a = document.createElement("a");
                        a.href = dataUrl;
                        a.download = `${name ?? "圖表"}／報導者.png`;
                        a.click();
                    })}>下載 PNG</button
            >
        </div>
    {/if}
</div>

<style>
    * {
        --tr-text: #404040;

        --background: transparent;
        --background-muted: rgba(255, 255, 255, 0.7);
        --track-background: #fff;
        --blue-primary: #006bff;
        --pink-primary: #ff0088;
        --red-primary: #ff4713;
        --box-background: #ffffff;
        --box-background-20: #ffffff14; /* 20% */
        --box-background-50: #ffffff32; /* 50% */
        --black-900: #262626;
        --black-800: #42464c;
        --black-700: white;

        --rounded-full: 100vw;
        --inner-shadow: -2px -2px 4px 0 rgba(0, 0, 0, 0.25) inset;
        --inner-shadow-heavy: -2px -2px 4px 0 rgba(0, 0, 0, 0.5) inset;

        color: var(--black-700);
        font-family: "GenJyuuGothicL", sans-serif;
        text-align: left !important;
    }

    .outer {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 60px 0;
    }

    .container {
        max-width: 730px;
        width: 100%;
        position: relative;
        padding: 5px 20px 50px 20px;
        background: var(--background);
        border-radius: 3px;
        --btn-size: 9px;
    }

    @media (max-width: 550px) {
        .container {
            padding-bottom: 10px;
        }
    }

    .header {
        padding: 5px 0 0;
        margin-bottom: 30px;
        display: flex;
        align-items: end;
        justify-content: space-between;
    }

    .header h1 {
        white-space: pre-wrap;
        font-size: 36px;
        font-weight: 900;
    }

    @media (max-width: 550px) {
        .header {
            flex-direction: column;
            gap: 15px;
            align-items: start;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 24px;
        }
    }

    .download-control {
        margin-top: 12px;
    }

    .dl-button {
        font-family: "Roboto Slab", "Noto Sans TC", sans-serif;
        padding: 5px 15px;
        background-color: #404040;
        color: white;
        border: none;
        border-radius: 40px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 5px;
    }
</style>
