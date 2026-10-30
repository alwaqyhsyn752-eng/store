function fileToBase64(file) { return new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(file); }); }
const AdminApp = {
  state: { tab: 'products', tempImages: [], editingId: null },
  init() { this.renderShell(); },
  renderShell() {
    document.getElementById('adminApp').innerHTML = `<div class="admin-shell"><header class="admin-header"><h1 style="color:var(--gold);">إدارة المتجر (${activeStoreId})</h1><a href="index.html?store=${activeStoreId}" class="btn-primary" style="width:auto;padding:0 15px;line-height:36px;text-decoration:none;">المتجر</a></header>
    <nav class="admin-tabs">
      <button class="admin-tab active" onclick="AdminApp.switchTab('products', this)">المنتجات</button>
      <button class="admin-tab" onclick="AdminApp.switchTab('users', this)">العملاء</button>
      <button class="admin-tab" onclick="AdminApp.switchTab('orders', this)">الطلبات</button>
      <button class="admin-tab" onclick="AdminApp.switchTab('design', this)">التصميم</button>
    </nav><main class="admin-content" id="adminContent"></main></div>`;
    this.renderTab();
  },
  switchTab(tab, btn) { this.state.tab = tab; this.state.editingId = null; document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); this.renderTab(); },
  renderTab() {
    const c = document.getElementById('adminContent');
    if (this.state.tab === 'products') this.renderProducts(c);
    if (this.state.tab === 'users') this.renderUsers(c);
    if (this.state.tab === 'orders') this.renderOrders(c);
    if (this.state.tab === 'design') this.renderDesign(c);
  },
  renderProducts(c) {
    if (this.state.editingId !== null) return this.renderForm(c);
    c.innerHTML = `<button class="btn-primary" style="margin-bottom:15px;" onclick="AdminApp.openForm()">+ إضافة منتج</button>` + DB.getProducts().map(p => `<div class="user-card" style="display:flex;gap:10px;align-items:center;"><img src="${p.images[0]}" style="width:50px;height:50px;border-radius:8px;"><div style="flex:1;"><div style="font-weight:bold;">${p.name}</div><div style="color:var(--gold);">${p.price} ر.س</div></div><button class="btn-secondary" onclick="AdminApp.openForm('${p.id}')">تعديل</button><button class="btn-danger" onclick="AdminApp.del('${p.id}')">حذف</button></div>`).join('');
  },
  openForm(id) { this.state.editingId = id || null; this.state.tempImages = id ? [...DB.getProduct(id).images] : []; this.renderTab(); },
  renderForm(c) {
    const p = this.state.editingId ? DB.getProduct(this.state.editingId) : { name: '', price: '', oldPrice: '', stock: 10, desc: '', status: 'normal', video: '', category: 'electronics' };
    c.innerHTML = `<div class="admin-panel">
      <div class="form-group"><label class="form-label">اسم المنتج</label><input type="text" id="f_name" class="form-input" value="${p.name}"></div>
      <div style="display:flex;gap:10px;"><div class="form-group" style="flex:1;"><label class="form-label">السعر</label><input type="number" id="f_price" class="form-input" value="${p.price}"></div><div class="form-group" style="flex:1;"><label class="form-label">السعر القديم</label><input type="number" id="f_old" class="form-input" value="${p.oldPrice || ''}"></div></div>
      <div style="display:flex;gap:10px;"><div class="form-group" style="flex:1;"><label class="form-label">المخزون</label><input type="number" id="f_stock" class="form-input" value="${p.stock}"></div><div class="form-group" style="flex:1;"><label class="form-label">الحالة</label><select id="f_status" class="form-select"><option value="normal" ${p.status==='normal'?'selected':''}>عادي</option><option value="new" ${p.status==='new'?'selected':''}>جديد</option><option value="offer" ${p.status==='offer'?'selected':''}>عرض</option></select></div></div>
      <div class="form-group"><label class="form-label">الوصف</label><textarea id="f_desc" class="form-textarea">${p.desc || p.description || ''}</textarea></div>
      <div class="form-group"><label class="form-label">الصور (اختر أكثر من صورة)</label><input type="file" id="f_imgs" multiple accept="image/*" style="color:white;"><div class="upload-preview" id="prev"></div></div>
      <div class="form-group"><label class="form-label">رابط فيديو (اختياري)</label><input type="url" id="f_video" class="form-input" value="${p.video || ''}"></div>
      <button class="btn-primary" onclick="AdminApp.save()">حفظ</button><button class="btn-secondary" style="width:100%;margin-top:10px;" onclick="AdminApp.state.editingId=null;AdminApp.renderTab()">إلغاء</button>
    </div>`;
    this.showImgs();
    document.getElementById('f_imgs').onchange = async (e) => { for(const f of e.target.files) { this.state.tempImages.push(await fileToBase64(f)); } this.showImgs(); };
  },
  showImgs() { document.getElementById('prev').innerHTML = this.state.tempImages.map(src => `<img src="${src}" class="upload-thumb">`).join(''); },
  save() {
    const name = document.getElementById('f_name').value; const price = Number(document.getElementById('f_price').value);
    if(!name || !price) return alert('الاسم والسعر مطلوبان');
    const data = { name, price, oldPrice: Number(document.getElementById('f_old').value)||null, stock: Number(document.getElementById('f_stock').value), status: document.getElementById('f_status').value, description: document.getElementById('f_desc').value, video: document.getElementById('f_video').value, images: this.state.tempImages.length?this.state.tempImages:[DB.makeProductImage(name,'#333','#666')], category: 'electronics', rating: 4.5 };
    if(this.state.editingId) DB.updateProduct(this.state.editingId, data); else DB.addProduct(data);
    alert('تم الحفظ'); this.state.editingId = null; this.renderTab();
  },
  del(id) { if(confirm('حذف؟')) { DB.deleteProduct(id); this.renderTab(); } },
  renderUsers(c) { c.innerHTML = DB.getUsers().map(u => `<div class="user-card"><div style="color:var(--gold);font-weight:bold;">${u.name}</div><div>${u.email} - ${u.phone}</div>${u.location?`<a href="https://maps.google.com/?q=${u.location.lat},${u.location.lng}" target="_blank" style="color:var(--success);font-size:12px;display:block;margin-top:5px;">📍 موقع العميل</a>`:''}<button class="btn-danger" style="margin-top:10px;" onclick="AdminApp.block('${u.id}', ${!!u.blocked})">${u.blocked?'إلغاء الحظر':'حظر'}</button></div>`).join('') || 'لا يوجد عملاء'; },
  block(id, curr) { DB.updateUser(id, { blocked: !curr }); this.renderTab(); },
  renderOrders(c) { c.innerHTML = DB.getOrders().map(o => `<div class="user-card"><div style="color:var(--gold);">طلب #${o.id.slice(-4)}</div><div>العميل: ${o.user}</div><div>الإجمالي: ${o.total}</div><div>الحالة: ${o.status}</div></div>`).join('') || 'لا توجد طلبات'; },
  renderDesign(c) {
    const d = DB.getSettings().design;
    const f = (k,l) => `<div class="color-field"><label style="color:white;font-size:10px;">${l}</label><input type="color" id="c_${k}" value="${d[k]}" oninput="AdminApp.prev()"></div>`;
    c.innerHTML = `<div class="design-preview" id="pv" style="background:linear-gradient(135deg,${d.bgStart},${d.bgEnd});"><h2 style="color:${d.primary}">معاينة</h2><div style="background:${d.cardStart};color:white;padding:10px;border-radius:8px;margin-top:10px;">بطاقة منتج</div></div>
    <div class="color-grid">${f('bgStart','الخلفية 1')}${f('bgEnd','الخلفية 2')}${f('cardStart','البطاقة 1')}${f('cardEnd','البطاقة 2')}${f('primary','الأساسي')}${f('secondary','الثانوي')}</div>
    <button class="btn-primary" style="margin-top:20px;" onclick="AdminApp.saveDesign()">حفظ التصميم</button>`;
  },
  prev() { document.getElementById('pv').style.background = `linear-gradient(135deg,${document.getElementById('c_bgStart').value},${document.getElementById('c_bgEnd').value})`; document.getElementById('pv').querySelector('h2').style.color = document.getElementById('c_primary').value; document.getElementById('pv').querySelector('div').style.background = document.getElementById('c_cardStart').value; },
  saveDesign() { const s = DB.getSettings(); s.design = { bgStart: document.getElementById('c_bgStart').value, bgEnd: document.getElementById('c_bgEnd').value, cardStart: document.getElementById('c_cardStart').value, cardEnd: document.getElementById('c_cardEnd').value, primary: document.getElementById('c_primary').value, secondary: document.getElementById('c_secondary').value }; DB.saveSettings(s); alert('تم الحفظ!'); }
};
document.addEventListener('DOMContentLoaded', () => AdminApp.init());
