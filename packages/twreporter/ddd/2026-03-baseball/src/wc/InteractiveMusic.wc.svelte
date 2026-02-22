<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-interactive-music" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import InteractiveMusic from "./InteractiveMusic.svelte";
    import { AudioPlayer } from "svelte-audio-player";

    const name = "interactive music";
    const footnotes = ["註：1234"];
</script>

<Shell {name} {footnotes}>
    <AudioPlayer
        src="https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/audios/tsg-sample.mp3"
    >
        <InteractiveMusic />
    </AudioPlayer>
</Shell>
