import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";
import { trimString, normalizePhoneNumber, normalizeText } from "../../shared/utils";

export const handleVerifyIdentity: RequestHandler = async (req, res) => {
  try {
    // Clean input data
    let { firstName, lastName, userPhone, birthDate, memberId } = req.body;

    firstName = normalizeText(firstName);
    lastName = normalizeText(lastName);
    memberId = normalizeText(memberId);

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(userPhone);

    // Validate input
    if (!firstName || !lastName || !normalizedPhone || !birthDate || !memberId) {
      return res.status(400).json({
        error: "جميع الحقول مطلوبة أو رقم الهاتف غير صحيح",
      });
    }

    // Query Supabase for matching user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, user_phone, birth_date, generated_id, password")
      .eq("first_name", firstName)
      .eq("last_name", lastName)
      .eq("user_phone", normalizedPhone)
      .eq("birth_date", birthDate)
      .eq("generated_id", memberId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: "المعلومات المدخلة غير صحيحة أو لا تتطابق مع سجلاتنا",
      });
    }

    // Return user info and password
    res.json({
      success: true,
      firstName: user.first_name,
      lastName: user.last_name,
      memberId: user.generated_id,
      password: user.password,
    });
  } catch (error) {
    console.error("Error verifying identity:", error);
    res.status(500).json({
      error: "خطأ في الخادم",
      details: String(error),
    });
  }
};

export const handleResetPassword: RequestHandler = async (req, res) => {
  try {
    // Clean input data
    let { memberId, newPassword } = req.body;

    memberId = normalizeText(memberId);
    newPassword = trimString(newPassword); // passwords: don't change internal spaces

    // Validate input
    if (!memberId || !newPassword) {
      return res.status(400).json({
        error: "جميع الحقول مطلوبة",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
      });
    }

    // Update password in users table
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("generated_id", memberId);

    if (updateError) {
      return res.status(500).json({
        error: "فشل تحديث كلمة المرور",
        details: updateError.message,
      });
    }

    res.json({
      success: true,
      message: "تم تحديث كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      error: "خطأ في الخادم",
      details: String(error),
    });
  }
};
