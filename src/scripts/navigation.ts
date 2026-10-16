// Keep real fragment links as the no-JavaScript fallback and for old bookmarks.
// In the enhanced page, scrolling never adds a fragment to the address bar.
function cleanAddress() {
  if (window.location.hash) {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  }
}

function findSection(hash: string) {
  try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
  catch { return null; }
}

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const destination = new URL(link.href, window.location.href);
  const sectionHash = destination.hash || (link.hasAttribute('data-scroll-home') ? '#inicio' : '');
  if (destination.origin !== window.location.origin || destination.pathname !== window.location.pathname || (destination.search && destination.search !== window.location.search) || !sectionHash) return;
  const section = findSection(sectionHash);
  if (!section) return;
  event.preventDefault();
  cleanAddress();
  section.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
  if (!section.hasAttribute('tabindex')) {
    section.setAttribute('tabindex', '-1');
    section.addEventListener('blur', () => section.removeAttribute('tabindex'), {once: true});
  }
  section.focus({preventScroll: true});
});

// An old bookmark or a link from a legal page still lands on its section.
if (window.location.hash) {
  const section = findSection(window.location.hash);
  if (section) section.scrollIntoView({behavior: 'instant', block: 'start'});
  cleanAddress();
}

// Keep both menus in sync while retaining a clean address.
const sectionLinks = [...document.querySelectorAll<HTMLAnchorElement>('.header a[data-section]')];
if (sectionLinks.length && document.getElementById('inicio')) {
  const sections = [...document.querySelectorAll<HTMLElement>('main > section')].map(element => ({
    element,
    id: element.id || (element.classList.contains('hero') ? 'inicio' : element.classList.contains('sectors') ? 'galeria' : 'equipos'),
  }));
  const visible = new Set<Element>();
  let currentSection = '';
  function updateCurrentSection(current: string) {
    if (current !== currentSection) {
      sectionLinks.forEach(link => {
        if (link.dataset.section === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      currentSection = current;
    }
  }
  let observer: IntersectionObserver;
  function watchSections() {
    observer?.disconnect();
    visible.clear();
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      const current = sections.findLast(section => visible.has(section.element))?.id;
      if (current) updateCurrentSection(current);
    }, {rootMargin: `-${Math.min(window.innerHeight * .15, 100)}px 0px -${window.innerHeight * .6}px 0px`});
    sections.forEach(section => observer.observe(section.element));
  }
  watchSections();
  window.addEventListener('resize', watchSections, {passive: true});
  updateCurrentSection('inicio');
}
