<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-interactive-music" }} />

<script lang="ts">
    import { AudioPlayer } from "svelte-audio-player";
    import Shell from "../components/Shell.svelte";
    import { keys, type TrackConfig } from "../lib/interactive-music/constants";
    import InteractiveMusic from "./InteractiveMusic.svelte";

    const { key }: { key: string } = $props();

    const config = keys[key];

    const footnotes = [
        ...(config.footnotes ?? []),
        "資料整理：黃靖緯、許詩愷｜設計：江世民",
    ];

    let activeMusic: TrackConfig = $state(config.states.default);
</script>

<Shell name={config.title} {footnotes} description={config.subtitle}>
    <AudioPlayer src={activeMusic.src}>
        <InteractiveMusic
            states={config.states}
            bind:active={activeMusic}
            songTitle={config.songTitle}
        />
    </AudioPlayer>
</Shell>
