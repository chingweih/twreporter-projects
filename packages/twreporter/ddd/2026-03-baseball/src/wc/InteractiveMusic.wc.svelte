<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-interactive-music" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import InteractiveMusic from "./InteractiveMusic.svelte";

    const name = "interactive music";
    const footnotes = ["註：1234"];
</script>

<Shell {name} {footnotes}>
    <InteractiveMusic />
</Shell>
