const urlParams = new URLSearchParams(window.location.search);
let activeStoreId = urlParams.get('store') || localStorage.getItem('current_active_store') || 'default';
localStorage.setItem('current_active_store', activeStoreId);
const DB = {
  KEYS: { PRODUCTS: 'store_products_v1_' + activeStoreId, CATEGORIES: 'store_categories_v1_' + activeStoreId, SETTINGS: 'store_settings_v1_' + activeStoreId, CART: 'store_cart_v1_' + activeStoreId, USERS: 'store_users_v1_' + activeStoreId, ORDERS: 'store_orders_v1_' + activeStoreId },
  generateId(prefix = 'id') { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6); },
  makeProductImage(name, c1, c2) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${c1}"/><text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="30" fill="white">${name}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  },
  init() { if (!localStorage.getItem(this.KEYS.CATEGORIES)) this.saveCategories(this.seedCategories()); if (!localStorage.getItem(this.KEYS.PRODUCTS)) this.saveProducts(this.seedProducts()); if (!localStorage.getItem(this.KEYS.SETTINGS)) this.saveSettings(this.seedSettings()); },
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
  getUsers() { try { return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || []; } catch { return []; } },
  saveUsers(u) { localStorage.setItem(this.KEYS.USERS, JSON.stringify(u)); },
  addUser(user) { const u = this.getUsers(); user.id = this.generateId('u'); u.push(user); this.saveUsers(u); return user; },
  updateUser(id, updates) { const u = this.getUsers(); const i = u.findIndex(x => x.id === id); if (i !== -1) { u[i] = { ...u[i], ...updates }; this.saveUsers(u); } },
  findUserByEmail(email) { return this.getUsers().find(u => u.email === email); },
  getOrders() { try { return JSON.parse(localStorage.getItem(this.KEYS.ORDERS)) || []; } catch { return []; } },
  addOrder(order) { const o = this.getOrders(); order.id = this.generateId('ord'); order.date = Date.now(); order.status = 'جديد'; o.unshift(order); localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(o)); },
  seedCategories() { return [ { id: 'all', name: 'الكل', icon: '' }, { id: 'electronics', name: 'إلكترونيات', icon: '' }, { id: 'fashion', name: 'أزياء', icon: '' } ]; },
  seedProducts() { return [ { id: 'p1', name: 'منتج تجريبي 1', category: 'electronics', price: 100, oldPrice: 150, rating: 4.8, stock: 10, status: 'offer', description: 'وصف المنتج', images: [this.makeProductImage('منتج 1', '#1e3a8a', '#3b82f6'), this.makeProductImage('صورة 2', '#0f172a', '#475569')], video: 'https://www.w3schools.com/html/mov_bbb.mp4' } ]; },
  seedSettings() { return { storeName: 'متجر النخبة', currency: 'ر.س', design: { bgStart: '#0b0d1a', bgMid: '#151932', bgEnd: '#1a1035', cardStart: '#1f2141', cardEnd: '#16172d', primary: '#d4af37', secondary: '#f4d47c' } }; }
};
DB.init();
