<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-interactive-piano" }} />

<script lang="ts">
    import Shell from "../lib/components/layout/Shell.svelte";
    import { keys } from "../lib/constants/interactive-piano";
    import InteractivePiano from "./InteractivePiano.svelte";

    const { key }: { key: string } = $props();
    const config = keys[key];

    const footnotes = [
        ...(config.footnotes ?? []),
        "資料整理：黃靖緯、許詩愷｜設計：江世民",
    ];
</script>

<Shell name={config.title} {footnotes} description={config.subtitle}>
    <InteractivePiano scores={config.scores} />
</Shell>
