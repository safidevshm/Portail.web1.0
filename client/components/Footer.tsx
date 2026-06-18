export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-12 mt-16" dir="rtl">
      <div className="container-shm">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8 pb-8 border-b border-gray-800">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              🏢 عن الكشافة
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              الكشافة الحسنية، منظمة شبابية موثوقة مكرسة لتطوير الشباب والمجتمع
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">الروابط السريعة</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ الرئيسية
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ لوحة التحكم
                </a>
              </li>
              <li>
                <a href="/program" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ البرنامج
                </a>
              </li>
              <li>
                <a href="/reports" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ التقارير
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">الخدمات</h3>
            <ul className="space-y-2">
              <li>
                <a href="/ideas" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ صندوق الأفكار
                </a>
              </li>
              <li>
                <a href="/sessions" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ الجلسات
                </a>
              </li>
              <li>
                <a href="/account" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ حسابي
                </a>
              </li>
              <li>
                <a href="/my-profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ❋ ملفي الشخصي
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">اتصل بنا</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">
                <span className="block font-semibold text-white">الهاتف</span>
                +212 612 989 463
              </li>
              <li className="text-gray-400 text-sm">
                <span className="block font-semibold text-white">البريد</span>
                contact@scouting.ma
              </li>
            </ul>
          </div>

          {/* Social & Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4">متابعة</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm mb-3">تابعنا على وسائل التواصل</p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-shm-red hover:bg-red-700 flex items-center justify-center transition-colors text-white font-bold text-sm"
                >
                  f
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-shm-red hover:bg-red-700 flex items-center justify-center transition-colors text-white font-bold text-sm"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-shm-red hover:bg-red-700 flex items-center justify-center transition-colors text-white font-bold text-sm"
                >
                  in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm pt-4">
          <p>
            &copy; {currentYear} الكشافة الحسنية. جميع الحقوق محفوظة. |{" "}
            <a href="#" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-white transition-colors">
              شروط الخدمة
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
