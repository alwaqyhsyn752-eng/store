// إعداد الاتصال بـ Supabase
const SUPABASE_URL = 'https://lihjllkvejczarfsqxxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9fc0c5toY2CrschBTH2kug_-k5Qtp60';

const db = {
  supabase: null,
  
  init() {
    // تحميل مكتبة Supabase عبر CDN
    if (typeof supabase === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = () => {
        this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase Ready');
      };
      document.head.appendChild(script);
    }
  },

  // جلب المنتجات من قاعدة البيانات الحقيقية
  async getProducts() {
    if(!this.supabase) return [];
    const { data, error } = await this.supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching products:', error); return []; }
    return data;
  },

  // إضافة منتج
  async addProduct(product) {
    const { data, error } = await this.supabase.from('products').insert([product]).select();
    if (error) throw error;
    return data[0];
  },

  // تحديث منتج
  async updateProduct(id, updates) {
    const { data, error } = await this.supabase.from('products').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
  },

  // حذف منتج
  async deleteProduct(id) {
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // جلب الأقسام
  async getCategories() {
    if(!this.supabase) return [];
    const { data, error } = await this.supabase.from('categories').select('*');
    if (error) return [];
    return data;
  },

  // جلب الإعدادات
  async getSettings() {
    if(!this.supabase) return { storeName: 'NOIR', currency: 'ر.س' };
    const { data, error } = await this.supabase.from('settings').select('*').eq('id', 1).single();
    if (error || !data) return { storeName: 'NOIR', currency: 'ر.س' };
    return { storeName: data.store_name, currency: data.currency, adminPass: data.admin_pass };
  },

  // رفع الصور إلى Supabase Storage
  async uploadImage(file) {
    const fileName = `product_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data, error } = await this.supabase.storage.from('product-images').upload(fileName, file);
    if (error) throw error;
    
    // الحصول على الرابط العام للصورة
    const { data: urlData } = this.supabase.storage.from('product-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  },

  // إنشاء طلب جديد
  async createOrder(orderData, cartItems) {
    // 1. إنشاء الطلب
    const { data: order, error: orderError } = await this.supabase.from('orders').insert([orderData]).select();
    if (orderError) throw orderError;

    // 2. إضافة تفاصيل الطلب
    const items = cartItems.map(item => ({
      order_id: order[0].id,
      product_id: item.productId,
      product_name: item.name,
      price: item.price,
      quantity: item.qty
    }));
    await this.supabase.from('order_items').insert(items);
    
    return order[0];
  },

  // جلب الطلبات (للإدارة)
  async getOrders() {
    if(!this.supabase) return [];
    const { data, error } = await this.supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
};

db.init();
