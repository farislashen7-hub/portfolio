import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-secret",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // معالجة طلبات الـ Preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const store = getStore("portfolio");

    // جلب البيانات (GET)
    if (req.method === "GET") {
      const data = await store.get("data", { type: "json" }) || {};
      return new Response(JSON.stringify(data), {
        status: 200,
        headers
      });
    }

    // حفظ البيانات (POST) - تمت إضافة الحماية هنا
    if (req.method === "POST") {
      const secret = req.headers.get("x-admin-secret");
      const expectedSecret = Netlify.env.get("ADMIN_SECRET"); // بيجيب الباسورد من إعدادات Netlify

      if (!expectedSecret || secret !== expectedSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing secret" }), { 
          status: 401, 
          headers 
        });
      }

      const body = await req.json();
      await store.setJSON("data", body);

      return new Response(JSON.stringify({ success: true, message: "Saved successfully" }), {
        status: 200,
        headers
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers
    });
  }
};

// توحيد مسار الـ API ليكون سهل الاستخدام
export const config = {
  path: "/api/portfolio"
};