const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const mobileNav = document.getElementById('mobileNav');
let currentSort = 'asc';

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    filterAndSort();
  });
});
const grid = document.getElementById('productsGrid');
const countNum = document.getElementById('countNum');
const emptyState = document.getElementById('emptyState');

const track = document.getElementById('navTrack');
const wrap = document.getElementById('trackWrap');
const arrowL = document.getElementById('arrowLeft');
const arrowR = document.getElementById('arrowRight');

const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const searchInputMobile = document.getElementById('searchInputMobile');
const searchInputMain = document.getElementById('searchInputMain');

function updateArrows() {
  if (!track) return;
  const atStart = track.scrollLeft <= 4;
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  wrap.classList.toggle('at-start', atStart);
  wrap.classList.toggle('at-end', atEnd);
  const hasOverflow = track.scrollWidth > track.clientWidth + 8;
  arrowL.classList.toggle('visible', hasOverflow && !atStart);
  arrowR.classList.toggle('visible', hasOverflow && !atEnd);
}

track.addEventListener('scroll', updateArrows);
window.addEventListener('resize', updateArrows);
setTimeout(updateArrows, 400);

arrowL.addEventListener('click', () => { track.scrollLeft -= 220; });
arrowR.addEventListener('click', () => { track.scrollLeft += 220; });

searchToggle.addEventListener('click', () => {
  const open = searchBar.classList.toggle('open');
  searchToggle.classList.toggle('active', open);
  if (open) setTimeout(() => searchInput.focus(), 50);
});

searchClose.addEventListener('click', () => {
  searchBar.classList.remove('open');
  searchToggle.classList.remove('active');
  searchInput.value = '';
  filterAndSort();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && searchBar.classList.contains('open')) {
    searchBar.classList.remove('open');
    searchToggle.classList.remove('active');
  }
});

menuToggle.addEventListener('click', () => mobileNav.classList.add('open'));
menuClose.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav.addEventListener('click', e => { if (e.target === mobileNav) mobileNav.classList.remove('open'); });

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.querySelectorAll('.mob-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mob-cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mobileNav.classList.remove('open');
  });
});

document.querySelectorAll('.btn-consultar').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.prod-card');
    const name = card.dataset.name;
    const price = card.dataset.price;
    const msg = encodeURIComponent(`Hola, me interesa consultar sobre: ${name.toUpperCase()} - USD $${price}`);
    window.open(`https://wa.me/TUNUMERO?text=${msg}`, '_blank');
  });
});

function getQuery() {
  if (searchBar.classList.contains('open') && searchInput.value.trim()) return searchInput.value.toLowerCase().trim();
  if (searchInputMobile.value.trim()) return searchInputMobile.value.toLowerCase().trim();
  return searchInputMain.value.toLowerCase().trim();
}

function filterAndSort() {
  const q = getQuery();
  const cards = Array.from(grid.querySelectorAll('.prod-card'));

  let visible = cards.filter(c => c.dataset.name.toLowerCase().includes(q));

  visible.sort((a, b) => {
    if (currentSort === 'asc') return Number(a.dataset.price) - Number(b.dataset.price);
    if (currentSort === 'desc') return Number(b.dataset.price) - Number(a.dataset.price);
    if (currentSort === 'az') return a.dataset.name.localeCompare(b.dataset.name);
    return 0;
  });

  cards.forEach(c => c.style.display = 'none');
  visible.forEach(c => { c.style.display = ''; grid.appendChild(c); });

  countNum.textContent = visible.length;
  emptyState.style.display = visible.length === 0 ? 'block' : 'none';
}

searchInput.addEventListener('input', filterAndSort);
searchInputMobile.addEventListener('input', filterAndSort);
sortSelect.addEventListener('change', filterAndSort);