exports.handler = async (event) => {
    // Ambil URL dari path parameter (contoh: /https://example.com/file.mpd)
    let url = event.path.replace('/.netlify/functions/proxy/', '');
    
    // Jika tidak ditemukan, cek query parameter
    if (!url || url === 'proxy') {
        url = event.queryStringParameters?.url;
    }
    
    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Usage: /https://YOUR_URL or ?url=YOUR_URL' })
        };
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Origin': new URL(url).origin,
                'Referer': new URL(url).origin
            }
        });
        
        const data = await response.text();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Content-Type': response.headers.get('content-type') || 'application/vnd.apple.mpegurl',
                'Cache-Control': 'no-cache'
            },
            body: data
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
