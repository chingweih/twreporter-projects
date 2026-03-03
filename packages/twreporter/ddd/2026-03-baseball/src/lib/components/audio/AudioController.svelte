<script lang="ts">
    import type { Snippet } from "svelte";
    import { getAudioContext } from "svelte-audio-player";
    const { children }: { children: Snippet } = $props();

    const { paused } = getAudioContext();
</script>

<div
    {@attach (el) => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        paused.set(true);
                    }
                });
            },
            {
                root: null,
            },
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }}
>
    {@render children()}
</div>
