<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-interactive-music" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import InteractiveMusic from "./InteractiveMusic.svelte";
    import { AudioPlayer } from "svelte-audio-player";

    const name = "棒球音樂使用反拍製造速度感";
    const footnotes = ["音樂來源：...", "註：..."];
</script>

<Shell {name} {footnotes}>
    <AudioPlayer
        src="https://storage.googleapis.com/data-reporter-infographics/dev/2026-03-baseball/audios/tsg-sample.mp3"
    >
        <InteractiveMusic />
    </AudioPlayer>
</Shell>
