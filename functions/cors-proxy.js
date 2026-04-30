const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Ambil URL dari path parameter /api/URL
  const url = event.path.replace('/.netlify/functions/cors-proxy/', '');
  
  // Atau dari query parameter ?url=
  const targetUrl = url || event.queryStringParameters.url;
  
  if (!targetUrl || targetUrl === 'cors-proxy') {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Usage: /api/ENCODE_URL_HERE or ?url=ENCODE_URL_HERE',
        example: '/api/https://api.github.com'
      }),
    };
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl);
    const response = await fetch(decodedUrl);
    const data = await response.text();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('content-type') || 'application/json'
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
