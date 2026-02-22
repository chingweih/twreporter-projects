<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-image-karaoke" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import ImageKaraoke from "./ImageKaraoke.svelte";

    const name = "image karaoke";
    const footnotes = ["註：1234"];
</script>

<Shell {name} {footnotes}>
    <ImageKaraoke />
</Shell>
