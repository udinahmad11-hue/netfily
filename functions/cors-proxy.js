const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Ambil URL dari query string atau body
  const targetUrl = event.queryStringParameters.url || 
                    (event.body ? JSON.parse(event.body).url : null);
  
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parameter "url" is required' }),
    };
  }

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: new URL(targetUrl).host,
        origin: targetUrl,
        referer: targetUrl,
      },
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': response.headers.get('content-type'),
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
