<!-- svelte-ignore custom_element_props_identifier -->
<svelte:options customElement={{ tag: "twreporter-scroll-diagram" }} />

<script lang="ts">
    import Shell from "../components/Shell.svelte";
    import ScrollDiagram from "./ScrollDiagram.svelte";

    const name = "scroll diagram";
    const footnotes = ["註：1234"];
</script>

<Shell {name} {footnotes}>
    <ScrollDiagram />
</Shell>
