const urlParams = new URLSearchParams(window.location.search);
let activeStoreId = urlParams.get('store') || localStorage.getItem('current_active_store') || 'default';
localStorage.setItem('current_active_store', activeStoreId);
const DB = {
  KEYS: { PRODUCTS: 'store_products_v1_' + activeStoreId, CATEGORIES: 'store_categories_v1_' + activeStoreId, SETTINGS: 'store_settings_v1_' + activeStoreId, CART: 'store_cart_v1_' + activeStoreId, USERS: 'store_users_v1_' + activeStoreId, ORDERS: 'store_orders_v1_' + activeStoreId },
  gen: (p='id') => p+'_'+Date.now()+'_'+Math.random().toString(36).substr(2,6),
  img: (n,c) => 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${c||'#333'}"/><text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="30" fill="white">${n}</text></svg>`),
  init() { if (!localStorage.getItem(this.KEYS.CATEGORIES)) this.saveCats(this.seedCats()); if (!localStorage.getItem(this.KEYS.PRODUCTS)) this.saveProds(this.seedProds()); if (!localStorage.getItem(this.KEYS.SETTINGS)) this.saveSettings(this.seedSettings()); },
  getProds: function() { try { return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS)) || []; } catch { return []; } },
  getProd: function(id) { return this.getProds().find(p => p.id === id) || null; },
  saveProds: function(p) { localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(p)); },
  addProd: function(p) { let pr = this.getProds(); p.id = p.id || this.gen('p'); pr.unshift(p); this.saveProds(pr); return p; },
  updProd: function(id, u) { let p = this.getProds(); let i = p.findIndex(x => x.id === id); if (i !== -1) { p[i] = { ...p[i], ...u }; this.saveProds(p); } },
  delProd: function(id) { this.saveProds(this.getProds().filter(p => p.id !== id)); },
  getCats: function() { try { return JSON.parse(localStorage.getItem(this.KEYS.CATEGORIES)) || []; } catch { return []; } },
  saveCats: function(c) { localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(c)); },
  getSettings: function() { try { return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || this.seedSettings(); } catch { return this.seedSettings(); } },
  saveSettings: function(s) { localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(s)); },
  getCart: function() { try { return JSON.parse(localStorage.getItem(this.KEYS.CART)) || []; } catch { return []; } },
  saveCart: function(cart) { localStorage.setItem(this.KEYS.CART, JSON.stringify(cart)); },
  addToCart: function(id, qty = 1) { let cart = this.getCart(); let item = cart.find(i => i.productId === id); if (item) item.qty += qty; else cart.push({ productId: id, qty }); this.saveCart(cart); },
  updCartQty: function(id, qty) { let cart = this.getCart(); let item = cart.find(i => i.productId === id); if (item) { if (qty <= 0) this.delCart(id); else { item.qty = qty; this.saveCart(cart); } } },
  delCart: function(id) { this.saveCart(this.getCart().filter(i => i.productId !== id)); },
  clearCart: function() { this.saveCart([]); },
  getUsers: function() { try { return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || []; } catch { return []; } },
  saveUsers: function(u) { localStorage.setItem(this.KEYS.USERS, JSON.stringify(u)); },
  addUser: function(user) { let u = this.getUsers(); user.id = this.gen('u'); u.push(user); this.saveUsers(u); return user; },
  updUser: function(id, updates) { let u = this.getUsers(); let i = u.findIndex(x => x.id === id); if (i !== -1) { u[i] = { ...u[i], ...updates }; this.saveUsers(u); } },
  findUser: function(email) { return this.getUsers().find(u => u.email === email); },
  getOrders: function() { try { return JSON.parse(localStorage.getItem(this.KEYS.ORDERS)) || []; } catch { return []; } },
  addOrder: function(order) { let o = this.getOrders(); order.id = this.gen('ord'); order.date = Date.now(); order.status = 'جديد'; o.unshift(order); localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(o)); },
  updOrder: function(id, status) { let o = this.getOrders(); let i = o.findIndex(x => x.id === id); if (i !== -1) { o[i].status = status; localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(o)); } },
  seedCats: function() { return [ { id: 'all', name: 'الكل', icon: '' }, { id: 'electronics', name: 'إلكترونيات', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="3"/></svg>' }, { id: 'fashion', name: 'أزياء', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3L4 6v5h3v10h10V11h3V6l-4-3-2 2h-4L8 3z"/></svg>' } ]; },
  seedProds: function() { return [ { id: 'p1', name: 'منتج تجريبي 1', category: 'electronics', price: 100, oldPrice: 150, rating: 4.8, stock: 10, status: 'offer', description: 'وصف المنتج الأول', images: [this.img('منتج 1', '#1e3a8a'), this.img('صورة 2', '#3b82f6')], video: 'https://www.w3schools.com/html/mov_bbb.mp4' } ]; },
  seedSettings: function() { return { storeName: 'متجر النخبة', currency: 'ر.س', design: { bgStart: '#0b0d1a', bgMid: '#151932', bgEnd: '#1a1035', cardStart: '#1f2141', cardEnd: '#16172d', primary: '#d4af37', secondary: '#f4d47c' } }; }
};
DB.init();
