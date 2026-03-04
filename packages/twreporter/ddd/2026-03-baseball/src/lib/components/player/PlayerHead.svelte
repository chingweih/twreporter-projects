<div class="player-head"></div>

<style>
    .player-head {
        left: var(--progress);
        position: absolute;
        top: 0;
        bottom: 0;
        width: 8px;
        height: calc(100% + 30px);
        margin-top: -15px;
        background: white;
        border-radius: 3px;
        will-change: left;
        box-shadow: var(--inner-shadow);
    }
</style>
