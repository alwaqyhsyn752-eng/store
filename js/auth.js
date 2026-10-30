const AuthApp = {
  openModal() { document.getElementById('authModal').classList.add('open'); this.render(); },
  render() {
    const c = document.getElementById('authModalContent');
    c.innerHTML = `
      <button class="modal-close" onclick="document.getElementById('authModal').classList.remove('open')">✕</button>
      <h2 style="color:var(--gold);text-align:center;margin-bottom:20px;">حسابي</h2>
      <div class="form-group"><label class="form-label">البريد الإلكتروني</label><input type="email" id="a_email" class="form-input"></div>
      <div class="form-group"><label class="form-label">كلمة المرور</label><input type="password" id="a_pass" class="form-input"></div>
      <button class="btn-primary" onclick="AuthApp.login()">دخول</button>
      <button class="btn-primary" style="margin-top:10px;background:transparent;border:1px solid var(--gold);color:var(--gold);" onclick="AuthApp.register()">إنشاء حساب (يتطلب الموقع)</button>`;
  },
  login() {
    const email = document.getElementById('a_email').value; const pass = document.getElementById('a_pass').value;
    const user = DB.findUserByEmail(email);
    if (user && user.password === pass && !user.blocked) { localStorage.setItem('current_user', JSON.stringify(user)); alert('تم الدخول بنجاح'); document.getElementById('authModal').classList.remove('open'); }
    else { alert('بيانات خاطئة أو حساب محظور'); }
  },
  register() {
    navigator.geolocation.getCurrentPosition(pos => {
      const name = prompt('الاسم:'); const email = prompt('البريد:'); const phone = prompt('رقم الهاتف:'); const password = prompt('كلمة المرور:');
      if (name && email && password) { DB.addUser({ name, email, phone, password, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }); alert('تم التسجيل!'); }
    }, () => alert('يجب السماح بالوصول للموقع للتسجيل'));
  }
};
