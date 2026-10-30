const StoreApp = {
  state: { activeCat: 'all', search: '' },
  init() { this.applyDesign(); this.renderCategories(); this.renderProducts(); this.bind(); this.updateCartCount(); },
  applyDesign() {
    const d = DB.getSettings().design; const r = document.documentElement.style;
    if (d.bgStart) { r.setProperty('--bg-start', d.bgStart); r.setProperty('--bg-mid', d.bgMid); r.setProperty('--bg-end', d.bgEnd); }
    if (d.cardStart) { r.setProperty('--card-start', d.cardStart); r.setProperty('--card-end', d.cardEnd); }
    if (d.primary) { r.setProperty('--gold', d.primary); r.setProperty('--gold-light', d.secondary); }
    document.getElementById('storeName').textContent = DB.getSettings().storeName;
  },
  renderCategories() { document.getElementById('categoriesNav').innerHTML = DB.getCategories().map(c => `<button class="category-chip ${c.id === this.state.activeCat ? 'active' : ''}" data-cat="${c.id}">${c.icon} <span>${c.name}</span></button>`).join(''); },
  renderProducts() {
    let prods = DB.getProducts();
    if (this.state.activeCat !== 'all') prods = prods.filter(p => p.category === this.state.activeCat);
    if (this.state.search) prods = prods.filter(p => p.name.includes(this.state.search));
    document.getElementById('productsGrid').innerHTML = prods.map(p => `
      <div class="product-card" onclick="StoreApp.openProduct('${p.id}')">
        <div class="product-image-wrap"><img src="${p.images[0]}">${p.status === 'new' ? '<span class="badge badge-new">جديد</span>' : ''}${p.status === 'offer' ? '<span class="badge badge-offer">عرض</span>' : ''}</div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-price"><span class="current-price">${p.price} ${DB.getSettings().currency}</span>${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''}</div>
          <button class="btn-add" onclick="event.stopPropagation(); StoreApp.add('${p.id}')">أضف للسلة</button>
        </div>
      </div>`).join('');
  },
  add(id) { DB.addToCart(id); this.updateCartCount(); this.toast('تمت الإضافة للسلة'); },
  updateCartCount() { document.getElementById('cartCount').textContent = DB.getCart().reduce((s, i) => s + i.qty, 0); },
  toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); },
  bind() {
    document.getElementById('categoriesNav').addEventListener('click', e => { const c = e.target.closest('.category-chip'); if (c) { this.state.activeCat = c.dataset.cat; this.renderCategories(); this.renderProducts(); } });
    document.getElementById('searchInput').addEventListener('input', e => { this.state.search = e.target.value; this.renderProducts(); });
    document.getElementById('accountBtn').onclick = () => AuthApp.openModal();
  },
  openProduct(id) {
    const p = DB.getProduct(id); const modal = document.getElementById('productModal'); const content = document.getElementById('productModalContent');
    let thumbsHtml = p.images.length > 1 ? `<div class="detail-thumbs">${p.images.map((img, i) => `<img src="${img}" class="detail-thumb ${i === 0 ? 'active' : ''}" onclick="StoreApp.switchImg(this, '${img}')">`).join('')}</div>` : '';
    let videoHtml = p.video ? `<video class="detail-video" controls><source src="${p.video}" type="video/mp4"></video>` : '';
    content.innerHTML = `
      <button class="modal-close" onclick="document.getElementById('productModal').classList.remove('open')">✕</button>
      <img src="${p.images[0]}" id="mainProductImg" class="detail-main-img">${thumbsHtml}${videoHtml}
      <h2 class="detail-title">${p.name}</h2>
      <div class="product-price"><span class="current-price" style="font-size:22px;">${p.price} ${DB.getSettings().currency}</span>${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''}</div>
      <div class="detail-meta"><span>⭐ ${p.rating}</span><span>📦 المتوفر: ${p.stock}</span></div>
      <p class="detail-desc">${p.description}</p>
      <button class="btn-primary" onclick="StoreApp.add('${p.id}'); document.getElementById('productModal').classList.remove('open');">أضف إلى السلة</button>`;
    modal.classList.add('open');
  },
  switchImg(el, src) { document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active')); el.classList.add('active'); document.getElementById('mainProductImg').src = src; }
};
document.addEventListener('DOMContentLoaded', () => StoreApp.init());
