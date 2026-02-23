<script lang="ts" module>
    export type ViewState = {
        nodeIds?: string[]
        zoom?: number
        padding?: number
    }
</script>

<script lang="ts">
    import { untrack } from 'svelte'
    import { useSvelteFlow } from '@xyflow/svelte'

    let { viewStates, index }: { viewStates: ViewState[]; index: number } =
        $props()

    const { fitView } = useSvelteFlow()

    $effect(() => {
        // Only track `index` -- untrack fitView to avoid subscribing
        // to xyflow's internal reactive store mutations
        const i = index
        untrack(() => {
            const state = viewStates[i]
            if (!state) return

            const nodes = state.nodeIds?.map((id) => ({ id }))
            fitView({
                nodes,
                duration: 500,
                padding: state.padding ?? 0.2,
                maxZoom: state.zoom ?? 1,
                minZoom: state.zoom ?? 0.1,
            })
        })
    })
</script>
