export default async (request, context) => {
  // Mengambil URL tujuan dari path
  // Contoh: https://cors-anda.netlify.app/https://example.com/video.mpd
  const urlPath = new URL(request.url).pathname.slice(1);
  const urlSearch = new URL(request.url).search;
  const targetUrl = urlPath + urlSearch;

  if (!targetUrl || !targetUrl.startsWith("http")) {
    return new Response("Masukkan URL tujuan yang valid setelah slash (/).", { status: 400 });
  }

  try {
    // Copy header dari request asli (seperti User-Agent)
    const headers = new Headers(request.headers);
    headers.delete("host"); // Biarkan fetch menentukan host baru

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      redirect: "follow"
    });

    // Buat header response baru untuk mengizinkan CORS
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    newHeaders.set("Access-Control-Allow-Headers", "*");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (error) {
    return new Response("Error fetching the URL: " + error.message, { status: 500 });
  }
};
