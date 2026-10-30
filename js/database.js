const urlParams = new URLSearchParams(window.location.search);
let activeStoreId = urlParams.get('store') || localStorage.getItem('current_active_store') || 'default';
localStorage.setItem('current_active_store', activeStoreId);

const DB = {
  KEYS: { PRODUCTS: 'store_products_v1_' + activeStoreId, CATEGORIES: 'store_categories_v1_' + activeStoreId, SETTINGS: 'store_settings_v1_' + activeStoreId, CART: 'store_cart_v1_' + activeStoreId, ORDERS: 'store_orders_v1_' + activeStoreId, USERS: 'store_users_v1_' + activeStoreId, OTP: 'store_otp_v1_' + activeStoreId },
  generateId(prefix = 'id') { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6); },
  makeProductImage(name, c1, c2) {
    const shortName = name.length > 16 ? name.substring(0, 16) + '…' : name;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="30" fill="white">${shortName}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  },
  init() {
    if (!localStorage.getItem(this.KEYS.CATEGORIES)) this.saveCategories(this.seedCategories());
    if (!localStorage.getItem(this.KEYS.PRODUCTS)) this.saveProducts(this.seedProducts());
    if (!localStorage.getItem(this.KEYS.SETTINGS)) this.saveSettings(this.seedSettings());
  },
  getProducts() { try { return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS)) || []; } catch { return []; } },
  getProduct(id) { return this.getProducts().find(p => p.id === id) || null; },
  saveProducts(p) { localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(p)); },
  addProduct(p) { const pr = this.getProducts(); p.id = p.id || this.generateId('p'); pr.unshift(p); this.saveProducts(pr); return p; },
  updateProduct(id, updates) { const p = this.getProducts(); const i = p.findIndex(x => x.id === id); if (i !== -1) { p[i] = { ...p[i], ...updates }; this.saveProducts(p); } },
  deleteProduct(id) { this.saveProducts(this.getProducts().filter(p => p.id !== id)); },
  getCategories() { try { return JSON.parse(localStorage.getItem(this.KEYS.CATEGORIES)) || []; } catch { return []; } },
  saveCategories(c) { localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(c)); },
  getSettings() { try { return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || this.seedSettings(); } catch { return this.seedSettings(); } },
  saveSettings(s) { localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(s)); },
  getCart() { try { return JSON.parse(localStorage.getItem(this.KEYS.CART)) || []; } catch { return []; } },
  saveCart(cart) { localStorage.setItem(this.KEYS.CART, JSON.stringify(cart)); },
  addToCart(id, qty = 1) { const cart = this.getCart(); const item = cart.find(i => i.productId === id); if (item) item.qty += qty; else cart.push({ productId: id, qty }); this.saveCart(cart); },
  updateCartQty(id, qty) { const cart = this.getCart(); const item = cart.find(i => i.productId === id); if (item) { if (qty <= 0) this.removeFromCart(id); else { item.qty = qty; this.saveCart(cart); } } },
  removeFromCart(id) { this.saveCart(this.getCart().filter(i => i.productId !== id)); },
  clearCart() { this.saveCart([]); },
  getOrders() { try { return JSON.parse(localStorage.getItem(this.KEYS.ORDERS)) || []; } catch { return []; } },
  addOrder(order) { const o = this.getOrders(); order.id = this.generateId('ord'); order.date = Date.now(); order.status = 'جديد'; o.unshift(order); localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(o)); },
  getUsers() { try { return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || []; } catch { return []; } },
  saveUsers(u) { localStorage.setItem(this.KEYS.USERS, JSON.stringify(u)); },
  addUser(user) { const u = this.getUsers(); user.id = this.generateId('u'); u.push(user); this.saveUsers(u); return user; },
  updateUser(id, updates) { const u = this.getUsers(); const i = u.findIndex(x => x.id === id); if (i !== -1) { u[i] = { ...u[i], ...updates }; this.saveUsers(u); } },
  findUserByEmail(email) { return this.getUsers().find(u => u.email === email); },
  seedCategories() {
    const icons = { electronics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="2" width="12" height="20" rx="3"/><line x1="11" y1="18" x2="13" y2="18"/></svg>', fashion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3L4 6v5h3v10h10V11h3V6l-4-3-2 2h-4L8 3z"/></svg>', home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>', beauty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="9" width="12" height="12" rx="2"/><path d="M9 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/></svg>' };
    return [ { id: 'all', name: 'الكل', icon: '', order: 0 }, { id: 'electronics', name: 'إلكترونيات', icon: icons.electronics, order: 1 }, { id: 'fashion', name: 'أزياء', icon: icons.fashion, order: 2 }, { id: 'home', name: 'منزل', icon: icons.home, order: 3 }, { id: 'beauty', name: 'عطور', icon: icons.beauty, order: 4 } ];
  },
  seedProducts() {
    const make = this.makeProductImage.bind(this);
    return [
      { id: 'p1', name: 'سماعات لاسلكية فاخرة', category: 'electronics', price: 349, oldPrice: 499, rating: 4.8, stock: 25, status: 'offer', description: 'سماعات بلوتوث 5.3 بجودة استوديو، عزل ضوضاء نشط.', images: [make('سماعات 1', '#1e3a8a', '#3b82f6'), make('سماعات 2', '#0f172a', '#475569')], video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 'p2', name: 'ساعة ذكية برو', category: 'electronics', price: 899, oldPrice: null, rating: 4.6, stock: 12, status: 'new', description: 'شاشة AMOLED، مقاومة للماء.', images: [make('ساعة', '#0f172a', '#475569')], video: '' }
    ];
  },
  seedSettings() {
    return { storeName: 'متجر النخبة', storeTag: 'تسوق فاخر', currency: 'ر.س', design: { bgStart: '#0b0d1a', bgMid: '#151932', bgEnd: '#1a1035', cardStart: '#1f2141', cardEnd: '#16172d', primary: '#d4af37', secondary: '#f4d47c' } };
  }
};
DB.init();
