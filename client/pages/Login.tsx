import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/context/AuthContext";
import { trimFormData, normalizePhoneNumber, normalizeText } from "@shared/utils";

export default function Login() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    generated_id: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.first_name || !formData.last_name || !formData.generated_id || !formData.password) {
      setError("الرجاء ملء جميع الحقول");
      setLoading(false);
      return;
    }

    try {
      // Clean form data before sending - normalize text fields
      const cleanedData = {
        first_name: normalizeText(formData.first_name),
        last_name: normalizeText(formData.last_name),
        generated_id: normalizeText(formData.generated_id),
        password: formData.password, // don't normalize password
      };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }

      const userData = await response.json();

      // Update auth context with user data
      setAuthUser(userData);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ في الاتصال. حاول مجددا");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50" dir="rtl">
      <Header />
      <div className="flex items-center justify-center px-4 py-8 md:py-16 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Login Section */}
          <div className="text-center mb-8">
            <h1 className="section-title text-shm-red">
              تسجيل الدخول
            </h1>
            <p className="text-gray-600">
              الوصول إلى بوابة الكشافة الحسنية
            </p>
          </div>

          {/* Login Form */}
          <div className="product-card shadow-lg p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-down">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الأول"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-scout-purple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    النسب / اللقب
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="أدخل لقبك"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-scout-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم العضو
                </label>
                <input
                  type="text"
                  name="generated_id"
                  value={formData.generated_id}
                  onChange={handleChange}
                  placeholder="مثال: E0001 (ذكر) أو F0001 (أنثى)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-scout-purple"
                />
              </div>

              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-50 font-bold"
              >
                {loading ? "جاري التحقق..." : "تسجيل الدخول"}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600 mb-4">
                هل نسيت كلمة المرور؟
              </p>
              <Link
                to="/forgot-password"
                className="block text-center text-shm-red font-bold hover:text-red-700 transition-colors mb-6"
              >
                إعادة تعيين كلمة المرور
              </Link>

              <p className="text-center text-gray-600 mb-2">
                ليس لديك حساب؟
              </p>
              <Link
                to="/register"
                className="block text-center btn-primary py-3 font-bold"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
