const SUPABASE_URL = 'https://lihjllkvejczarfsqxxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9fc0c5toY2CrschBTH2kug_-k5Qtp60';
const urlParams = new URLSearchParams(window.location.search);
const STORE_ID = urlParams.get('store') || localStorage.getItem('active_store') || 'default';
localStorage.setItem('active_store', STORE_ID);
const db = {
  supabase: null,
  init() {
    if (typeof supabase === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = () => { this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); };
      document.head.appendChild(s);
    }
  },
  async getProducts() { if(!this.supabase)return[]; const{data}=await this.supabase.from('products').select('*').eq('store_id',STORE_ID).order('created_at',{ascending:false}); return data||[]; },
  async addProduct(p) { const{data,error}=await this.supabase.from('products').insert([{...p,store_id:STORE_ID}]).select(); if(error)throw error; return data[0]; },
  async updateProduct(id,u) { const{error}=await this.supabase.from('products').update(u).eq('id',id); if(error)throw error; },
  async deleteProduct(id) { const{error}=await this.supabase.from('products').delete().eq('id',id); if(error)throw error; },
  async getCategories() { if(!this.supabase)return[]; const{data}=await this.supabase.from('categories').select('*').eq('store_id',STORE_ID); return data||[]; },
  async getSettings() {
    if(!this.supabase) return {storeName: STORE_ID==='default'?'NOIR':STORE_ID,currency:'ر.س',adminPass:'1234'};
    const{data,error}=await this.supabase.from('settings').select('*').eq('store_id',STORE_ID).limit(1);
    if(error||!data||!data[0]) return {storeName: STORE_ID==='default'?'NOIR':STORE_ID,currency:'ر.س',adminPass:'1234'};
    return {storeName: data[0].store_name,currency: data[0].currency,adminPass: data[0].admin_pass};
  },
  async saveSettings(s) {
    const{error}=await this.supabase.from('settings').upsert({store_id:STORE_ID,store_name:s.storeName,currency:s.currency,admin_pass:s.adminPass,updated_at:new Date().toISOString()},{onConflict:'store_id'});
    if(error)throw error;
  },
  async uploadImage(file) {
    const fileName=`product_${STORE_ID}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g,'')}`;
    const{error}=await this.supabase.storage.from('product-images').upload(fileName,file);
    if(error)throw error;
    const{data}=this.supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  },
  async getOrders() { if(!this.supabase)return[]; const{data}=await this.supabase.from('orders').select('*, order_items(*)').eq('store_id',STORE_ID).order('created_at',{ascending:false}); return data||[]; }
};

const DB = {
  get: (k, def) => { try { const v = localStorage.getItem('noir_' + k); return v ? JSON.parse(v) : def; } catch(e) { return def; } },
  set: (k, v) => { localStorage.setItem('noir_' + k, JSON.stringify(v)); }
};

db.init();
