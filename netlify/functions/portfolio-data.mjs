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

    // حفظ البيانات (POST)
    if (req.method === "POST") {
      const body = await req.json();
      
      // (اختياري) يمكنك إضافة تحقق من الـ Secret هنا إذا أردت
      // const secret = req.headers.get("x-admin-secret");
      // if (secret !== "YOUR_SECRET") return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });

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