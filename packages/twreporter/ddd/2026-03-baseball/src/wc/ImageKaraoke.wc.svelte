<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-image-karaoke" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import ImageKaraoke from "./ImageKaraoke.svelte";

    const name = "棒球音樂具有短樂句的特徵";
    const footnotes = ["音樂來源：...", "註：..."];
</script>

<Shell {name} {footnotes}>
    <ImageKaraoke />
</Shell>
