<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-interactive-piano" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import InteractivePiano from "./InteractivePiano.svelte";

    const name = "棒球音樂具有短樂句的特徵";
    const description = "測試測試";
    const footnotes = ["音樂來源：...", "註：..."];
</script>

<Shell {name} {footnotes} {description}>
    <InteractivePiano />
</Shell>
