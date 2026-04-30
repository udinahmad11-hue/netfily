exports.handler = async (event) => {
    const url = event.queryStringParameters.url;
    
    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Parameter "url" is required' })
        };
    }

    try {
        const response = await fetch(url);
        const data = await response.text();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': response.headers.get('content-type') || 'text/plain'
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
