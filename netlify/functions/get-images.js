exports.handler = async function(event, context) {

  var BUBBLE_URL = 'https://justshoes.info/version-test/api/1.1/obj/featured_image?limit=25&descending=true';
  var BUBBLE_KEY = 'ce8a8084f79908ae67413ab55f333c4c';

  try {
    var response = await fetch(BUBBLE_URL, {
      headers: {
        'Authorization': 'Bearer ' + BUBBLE_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Bubble returned ' + response.status })
      };
    }

    var data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }

};
