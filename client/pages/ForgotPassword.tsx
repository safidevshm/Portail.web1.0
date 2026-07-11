import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";
import { trimFormData, normalizePhoneNumber, trimString, normalizeText } from "@shared/utils";

interface RecoveryStep {
  step: "verify" | "choose-action" | "show-password" | "reset-password";
}

interface VerificationData {
  firstName: string;
  lastName: string;
  userPhone: string;
  birthDate: string;
  memberId: string;
}

interface RecoveredAccount {
  firstName: string;
  lastName: string;
  password: string;
  memberId: string;
}

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState<RecoveryStep["step"]>("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Verification form
  const [verifyData, setVerifyData] = useState<VerificationData>({
    firstName: "",
    lastName: "",
    userPhone: "",
    birthDate: "",
    memberId: "",
  });

  // Recovery results
  const [recoveredAccount, setRecoveredAccount] = useState<RecoveredAccount | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVerifyData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Normalize phone number to standard format
      const normalizedPhone = normalizePhoneNumber(verifyData.userPhone);
      if (!normalizedPhone) {
        setError("رقم الهاتف غير صحيح. الرجاء التحقق من الصيغة.");
        setLoading(false);
        return;
      }

      // Clean and normalize data before sending
      const cleanedData = {
        firstName: normalizeText(verifyData.firstName),
        lastName: normalizeText(verifyData.lastName),
        userPhone: normalizedPhone,
        birthDate: verifyData.birthDate,
        memberId: normalizeText(verifyData.memberId),
      };

      const response = await fetch("/api/auth/verify-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "فشل التحقق من الهوية");
        return;
      }

      setRecoveredAccount({
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        memberId: data.memberId,
      });

      setCurrentStep("choose-action");
    } catch (err) {
      setError("خطأ في الاتصال بالخادم");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    if (newPassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setLoading(true);

    try {
      // Clean password before sending
      const cleanedPassword = trimString(newPassword);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: recoveredAccount?.memberId,
          newPassword: cleanedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "فشل تعديل كلمة المرور");
        return;
      }

      setMessage("تم تعديل كلمة المرور بنجاح!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError("خطأ في الاتصال بالخادم");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50" dir="rtl">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Step 1: Verify Identity */}
        {currentStep === "verify" && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-r-4 border-blue-600">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              استعادة كلمة المرور
            </h1>
            <p className="text-gray-600 text-center mb-8">
              للتحقق من هويتك، يرجى إدخال المعلومات التي استخدمتها عند التسجيل
            </p>

            <form onSubmit={handleVerifyIdentity} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الاسم الأول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={verifyData.firstName}
                    onChange={handleVerifyChange}
                    placeholder="أدخل اسمك الأول"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الاسم الأخير <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={verifyData.lastName}
                    onChange={handleVerifyChange}
                    placeholder="أدخل اسمك الأخير"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="userPhone"
                  value={verifyData.userPhone}
                  onChange={handleVerifyChange}
                  placeholder="مثال: +212661234567"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تاريخ الميلاد <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={verifyData.birthDate}
                  onChange={handleVerifyChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم العضو <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="memberId"
                  value={verifyData.memberId}
                  onChange={handleVerifyChange}
                  placeholder="مثال: E0001 أو F0001"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "جاري التحقق..." : "التحقق من الهوية"}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Choose Action */}
        {currentStep === "choose-action" && recoveredAccount && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-r-4 border-green-600">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              تم التحقق من الهوية
            </h1>
            <p className="text-gray-600 text-center mb-8">
              مرحبا {recoveredAccount.firstName} {recoveredAccount.lastName}
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setCurrentStep("show-password")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                عرض كلمة المرور الحالية
              </button>

              <button
                onClick={() => setCurrentStep("reset-password")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                إنشاء كلمة مرور جديدة
              </button>

              <button
                onClick={() => {
                  setCurrentStep("verify");
                  setRecoveredAccount(null);
                  setVerifyData({
                    firstName: "",
                    lastName: "",
                    userPhone: "",
                    birthDate: "",
                    memberId: "",
                  });
                }}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Show Password */}
        {currentStep === "show-password" && recoveredAccount && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-r-4 border-green-600">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              كلمة المرور الحالية
            </h1>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center space-y-4">
              <p className="text-gray-600">كلمة مرورك الحالية:</p>
              <div className="text-4xl font-bold text-green-600 font-mono bg-white p-6 rounded border-2 border-green-300">
                {recoveredAccount.password}
              </div>
              <p className="text-sm text-gray-500">
                احفظ كلمة المرور في مكان آمن
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(recoveredAccount.password);
                setMessage("تم نسخ كلمة المرور!");
                setTimeout(() => setMessage(""), 3000);
              }}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              📋 نسخ كلمة المرور
            </button>

            {message && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
                {message}
              </div>
            )}

            <Link
              to="/login"
              className="block text-center mt-6 text-blue-600 font-bold hover:underline"
            >
              الذهاب إلى تسجيل الدخول
            </Link>
          </div>
        )}

        {/* Step 4: Reset Password */}
        {currentStep === "reset-password" && recoveredAccount && (
          <div className="bg-white rounded-lg shadow-lg p-8 border-r-4 border-blue-600">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              إنشاء كلمة مرور جديدة
            </h1>
            <p className="text-gray-600 text-center mb-8">
              أدخل كلمة مرور جديدة قوية
            </p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <PasswordInput
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                label="كلمة المرور الجديدة"
                placeholder="أدخل كلمة مرور قوية"
                required
              />

              <PasswordInput
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label="تأكيد كلمة المرور"
                placeholder="أعد كتابة كلمة المرور"
                required
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep("choose-action")}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg transition-colors"
              >
                الرجوع
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
