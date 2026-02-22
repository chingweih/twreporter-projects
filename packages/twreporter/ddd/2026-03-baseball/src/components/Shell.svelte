<script lang="ts">
    import { domToPng } from "modern-screenshot";
    import type { Snippet } from "svelte";

    let container: HTMLDivElement | null = null;

    // 使用 `?download` 檢查是否要開啟下載選項
    const urlParams = new URLSearchParams(window.location.search);
    const showDownload = urlParams.has("download");

    const {
        name,
        footnotes,
        children,
    }: { name: string; footnotes: string[]; children: Snippet } = $props();
</script>

<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/tailwindcss-preflight@1.0.1/preflight.min.css"
    crossorigin="anonymous"
/>

<div class="outer">
    <div class="container" bind:this={container}>
        <div class="header"><h1>{name}</h1></div>

        {@render children()}

        <div class="footer">
            <div class="footnotes">
                {#each footnotes as footnote}
                    <p>{footnote}</p>
                {/each}
            </div>
            <img
                src="https://projects.twreporter.org/twreporter/ddd/2025-12-roundabouts/assets/logo-black.png"
                class="logo"
                alt="報導者 The Reporter"
            />
        </div>
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
        color: var(--tr-text);
        font-family: "Roboto Slab", "Noto Sans TC", sans-serif;
        text-align: left !important;
    }

    .outer {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .container {
        max-width: 600px;
        position: relative;
        padding: 8px 10px;
        background: #f1f1f1;
        --btn-size: 9px;
        border-top: #e2e2e2 1px solid;
        border-bottom: #e2e2e2 1px solid;
    }

    @media (min-width: 500px) {
        .container {
            padding: 10px 10px;
        }
    }

    .header {
        padding: 5px 0 0;
    }

    @media (min-width: 500px) {
        .header h1 {
            padding: 5px 0 15px;
        }
    }

    .header h1 {
        font-size: 24px;
        font-weight: bold;
        padding: 5px 0 10px;
    }

    @media (min-width: 500px) {
        .header h1 {
            font-size: 28px;
        }
    }

    @media (min-width: 500px) {
        .container {
            --btn-size: 14px;
        }
    }

    @media (min-width: 670px) {
        .container {
            --btn-size: 16px;
        }
    }

    .footer {
        padding: 10px 0 10px 0;
        display: flex;
        align-items: end;
        justify-content: space-between;
        --footer-scale: 1;
        --footer-logo-scale: 1.25;
    }

    @media (min-width: 500px) {
        .footer {
            padding: 15px 0 10px 0;
            --footer-scale: 1.6;
            --footer-logo-scale: 2;
        }
    }

    .footnotes {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    @media (min-width: 500px) {
        .footnotes {
            gap: 5px;
        }
    }

    .footer p {
        color: #acacac;
        font-size: calc(10px * var(--footer-scale));
    }

    .footer .logo {
        width: calc(14.5px * var(--footer-logo-scale));
        height: calc(15.5px * var(--footer-logo-scale));
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
