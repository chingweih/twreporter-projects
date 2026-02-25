<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-interactive-music" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import { tracks } from "../lib/interactive-music/constants";
    import { interactiveMusicState } from "../lib/interactive-music/state.svelte";
    import InteractiveMusic from "./InteractiveMusic.svelte";
    import { AudioPlayer } from "svelte-audio-player";

    const name = "棒球音樂使用反拍製造速度感";
    const description = "來聽聽看你有沒有發現吧！";
    const footnotes = ["音樂來源：...", "註：..."];
</script>

<Shell {name} {footnotes} {description}>
    <AudioPlayer src={interactiveMusicState.active.src}>
        <InteractiveMusic />
    </AudioPlayer>
</Shell>
