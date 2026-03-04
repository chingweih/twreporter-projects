<script lang="ts">
    const { text }: { text?: string } = $props();
</script>

<p data-text={text}>{text}</p>

<style>
    p {
        position: var(--position, absolute);
        color: #f2f1ed;
        top: var(--top, -30px);
        font-weight: 900;
        font-size: 20px;
        text-align: center;
        z-index: 0;
        filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));
        -webkit-text-stroke: 6px var(--blue-primary);
    }

    p::before {
        position: absolute;
        top: 0;
        left: 0;
        content: attr(data-text);
        color: #f2f1ed;
        -webkit-text-stroke: 0;
    }
</style>
