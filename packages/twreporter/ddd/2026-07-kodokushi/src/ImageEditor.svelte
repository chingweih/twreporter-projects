<script>
  let { images, width, baseWidth, update, save, showSave = false } = $props()
  let selected = $state(null)
  let saving = $state(false)

  function startEdit(event, image, resize = null) {
    event.preventDefault()
    event.stopPropagation()
    selected = image.key
    const scale = width / baseWidth
    const start = { x: event.clientX, y: event.clientY, xValue: image.x, top: image.top, width: image.width }
    const move = (next) => {
      const dx = (next.clientX - start.x) / scale
      const dy = (next.clientY - start.y) / scale
      if (!resize) return update(image.key, { x: Math.round(start.xValue + dx), top: Math.round(start.top + dy) })

      const nextWidth = Math.max(50, Math.round(start.width + (resize === 'top-left' ? -dx : dx)))
      const shift = start.width - nextWidth
      update(
        image.key,
        resize === 'top-left'
          ? { x: Math.round(start.xValue + shift), top: Math.round(start.top + shift * (image.sampleHeight / image.sampleWidth)), width: nextWidth }
          : { width: nextWidth },
      )
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop, { once: true })
  }

  async function saveLayout() {
    saving = true
    try {
      await save()
    } finally {
      saving = false
    }
  }
</script>

{#each images as image}
  <button
    class:active={selected === image.key}
    class="image-editor"
    aria-label={`Move ${image.alt}`}
    style={`left: ${image.x}px; top: ${image.y}px; width: ${image.width}px; height: ${image.width * (image.sampleHeight / image.sampleWidth)}px`}
    onpointerdown={(event) => startEdit(event, image)}
  ></button>
  <button
    class="image-resize"
    aria-label={`Resize ${image.alt} from top left`}
    style={`left: ${image.x - 7}px; top: ${image.y - 7}px`}
    onpointerdown={(event) => startEdit(event, image, 'top-left')}
  ></button>
  <button
    class="image-resize"
    aria-label={`Resize ${image.alt}`}
    style={`left: ${image.x + image.width - 7}px; top: ${image.y + image.width * (image.sampleHeight / image.sampleWidth) - 7}px`}
    onpointerdown={(event) => startEdit(event, image, true)}
  ></button>
{/each}

{#if showSave}
  <button class="save-layout" onclick={saveLayout} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
{/if}
