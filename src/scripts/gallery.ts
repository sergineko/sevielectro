const gallery = document.querySelector<HTMLElement>('.gallery-section');
const viewer = document.querySelector<HTMLDialogElement>('.gallery-viewer');

if (gallery && viewer) {
  const image = viewer.querySelector<HTMLImageElement>('.viewer-image')!;
  const frame = viewer.querySelector<HTMLElement>('.viewer-frame')!;
  const ambient = viewer.querySelector<HTMLElement>('.viewer-ambient')!;
  const title = viewer.querySelector<HTMLElement>('.viewer-title')!;
  const category = viewer.querySelector<HTMLElement>('.viewer-category')!;
  const counter = viewer.querySelector<HTMLElement>('.viewer-counter')!;
  const progress = viewer.querySelector<HTMLElement>('.viewer-progress-fill')!;
  const status = viewer.querySelector<HTMLElement>('.viewer-status')!;
  const statusText = viewer.querySelector<HTMLElement>('.viewer-status-text')!;
  const retry = viewer.querySelector<HTMLButtonElement>('.viewer-retry')!;
  const modeButton = viewer.querySelector<HTMLButtonElement>('.viewer-mode')!;
  const modeLabel = modeButton.querySelector<HTMLElement>('span')!;
  const collectionElement = viewer.querySelector<HTMLElement>('.viewer-collection')!;
  const thumbnails = Array.from(viewer.querySelectorAll<HTMLButtonElement>('.viewer-thumbnail'));
  const buttons = Array.from(gallery.querySelectorAll<HTMLButtonElement>('.project-open'));
  const photos = buttons.map((button, index) => ({
    button,
    index,
    category: button.dataset.category!,
    title: button.querySelector('strong')!.textContent!,
    thumbnail: button.querySelector('img')!,
    full: button.dataset.full!,
  }));

  const collection = photos;
  let active = 0;
  let overview = false;
  let loadVersion = 0;
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function centerThumbnail() {
    const thumbnail = thumbnails[collection[active].index];
    // Only scroll the filmstrip, so changing photos never moves the page.
    const left = thumbnail.offsetLeft - collectionElement.clientWidth / 2 + thumbnail.offsetWidth / 2;
    collectionElement.scrollTo({left, behavior: reducedMotion() ? 'instant' : 'smooth'});
  }

  function setOverview(value: boolean) {
    overview = value;
    viewer!.classList.toggle('is-overview', value);
    modeButton.setAttribute('aria-pressed', String(value));
    modeButton.setAttribute('aria-label', value ? 'Ver fotografía seleccionada' : 'Ver mosaico con todas las fotografías');
    modeLabel.textContent = value ? 'Ver fotografía' : 'Ver mosaico';
    thumbnails.forEach(thumbnail => thumbnail.querySelector('img')!.sizes = value ? '(max-width:640px) 45vw, 230px' : '88px');
    if (!value) requestAnimationFrame(centerThumbnail);
    else collectionElement.scrollTo({top: 0, left: 0, behavior: 'instant'});
  }

  async function show(index: number) {
    if (!collection.length) return;
    active = (index + collection.length) % collection.length;
    const photo = collection[active];
    const version = ++loadVersion;

    title.textContent = photo.title;
    category.textContent = photo.category;
    viewer!.querySelector('.viewer-total')!.textContent = `${collection.length} fotografías`;
    counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(collection.length).padStart(2, '0')}`;
    progress.style.width = `${((active + 1) / collection.length) * 100}%`;
    thumbnails.forEach((thumbnail, i) => {
      const ordinal = collection.findIndex(item => item.index === i);
      thumbnail.hidden = ordinal < 0;
      thumbnail.setAttribute('aria-pressed', String(i === photo.index));
      if (ordinal >= 0) {
        thumbnail.querySelector('.viewer-thumbnail-number')!.textContent = String(ordinal + 1).padStart(2, '0');
        thumbnail.setAttribute('aria-label', `Ver fotografía ${ordinal + 1}: ${photos[i].title}`);
      }
    });
    if (!overview) requestAnimationFrame(centerThumbnail);
    // While browsing the mosaic, load a full-size photograph only when the
    // visitor selects one or switches to the photo view.
    if (overview) return;
    ambient.style.backgroundImage = `url("${photo.thumbnail.src}")`;

    frame.setAttribute('aria-busy', 'true');
    frame.classList.remove('is-ready', 'has-error');
    status.hidden = false;
    statusText.textContent = 'Cargando fotografía…';
    retry.hidden = true;

    const pending = new Image();
    pending.src = photo.full;
    try {
      await pending.decode();
      if (version !== loadVersion || !viewer!.open) return;
      image.src = photo.full;
      image.alt = photo.thumbnail.alt;
      frame.setAttribute('aria-busy', 'false');
      status.hidden = true;
      requestAnimationFrame(() => {
        if (version === loadVersion) frame.classList.add('is-ready');
      });
    } catch {
      if (version !== loadVersion || !viewer!.open) return;
      frame.setAttribute('aria-busy', 'false');
      frame.classList.add('has-error');
      statusText.textContent = 'No se ha podido cargar esta fotografía.';
      retry.hidden = false;
    }
  }

  function open(index: number) {
    viewer!.showModal();
    setOverview(false);
    collectionElement.scrollTo({left: 0, top: 0, behavior: 'instant'});
    void show(index);
  }

  photos.forEach(photo => photo.button.addEventListener('click', () => open(collection.indexOf(photo))));
  const explore = gallery.querySelector<HTMLButtonElement>('.gallery-explore');
  explore?.addEventListener('click', () => open(Number(explore.dataset.startIndex || 0)));
  viewer.querySelector('.viewer-close')?.addEventListener('click', () => viewer.close());
  viewer.querySelector('.viewer-prev')?.addEventListener('click', () => void show(active - 1));
  viewer.querySelector('.viewer-next')?.addEventListener('click', () => void show(active + 1));
  retry.addEventListener('click', () => void show(active));
  modeButton.addEventListener('click', () => {
    setOverview(!overview);
    if (!overview) void show(active);
  });
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => { loadVersion++; });
  viewer.addEventListener('keydown', event => {
    if (event.target instanceof Element && event.target.closest('.viewer-thumbnail')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); void show(active - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); void show(active + 1); }
    if (event.key === 'Home') { event.preventDefault(); void show(0); }
    if (event.key === 'End') { event.preventDefault(); void show(collection.length - 1); }
  });

  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
      const selected = collection.findIndex(photo => photo.index === index);
      if (selected < 0) return;
      setOverview(false);
      void show(selected);
    });
    thumbnail.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = collection.findIndex(photo => photo.index === index);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? collection.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + collection.length) % collection.length;
      thumbnails[collection[next].index].focus();
      if (!overview) void show(next);
    });
  });

  let touchStart: {x: number; y: number} | null = null;
  frame.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && !(event.target instanceof Element && event.target.closest('button'))) touchStart = {x: event.clientX, y: event.clientY};
  });
  frame.addEventListener('pointerup', event => {
    if (!touchStart) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) void show(active + (dx < 0 ? 1 : -1));
  });
  frame.addEventListener('pointercancel', () => { touchStart = null; });

}
