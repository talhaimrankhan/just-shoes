// ─────────────────────────────────────────────────────────────
//  get-products.js
//  Fetches Products + Images from Bubble in parallel,
//  joins them, and returns enriched product objects.
// ─────────────────────────────────────────────────────────────

var BASE    = 'https://justshoes.info/version-test/api/1.1/obj';
var API_KEY = 'ce8a8084f79908ae67413ab55f333c4c';
var LIMIT   = 100; // max per request

var HEADERS = {
  'Authorization': 'Bearer ' + API_KEY,
  'Content-Type':  'application/json'
};

// Fix Bubble CDN URLs (they come without protocol)
function fixUrl(url) {
  if (!url) return '';
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('http')) return url;
  return 'https://' + url;
}

// Fetch all pages of a Bubble table
async function fetchAll(table) {
  var results = [];
  var cursor  = 0;
  var remaining = 1; // enter loop

  while (remaining > 0) {
    var url = BASE + '/' + table + '?limit=' + LIMIT + '&cursor=' + cursor;
    var res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(table + ' API returned ' + res.status);
    var json = await res.json();
    var page = json.response;
    results   = results.concat(page.results);
    remaining = page.remaining;
    cursor   += page.count;
  }

  return results;
}

exports.handler = async function(event, context) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Fetch Products and Images in parallel
    var results  = await Promise.all([ fetchAll('Products'), fetchAll('Images') ]);
    var products = results[0];
    var images   = results[1];

    // Build a lookup map: imageId → image record
    var imageMap = {};
    images.forEach(function(img) {
      imageMap[img._id] = img;
    });

    // Enrich each product with its resolved image URLs
    var enriched = products.map(function(p) {
      // relaedImages is a list of Image record IDs
      var imageIds  = Array.isArray(p['relaedImages']) ? p['relaedImages'] : [];
      var imageUrls = imageIds
        .map(function(id) {
          var rec = imageMap[id];
          return rec ? fixUrl(rec['image']) : null;
        })
        .filter(Boolean);

      // Fallback: also check the raw 'images' field (List of images)
      if (imageUrls.length === 0 && Array.isArray(p['images'])) {
        imageUrls = p['images'].map(fixUrl).filter(Boolean);
      }

      return {
        id:              p._id,
        name:            p['Name']            || '',
        brand:           p['brandName']       || '',
        category:        p['categoryName']    || '',
        subCategory:     p['subCategoryName'] || '',
        city:            p['city']            || '',
        storeName:       p['storeName']       || '',
        event:           p['event']           || '',
        year:            p['Year']            || null,
        date:            p['date']            || p['Created Date'] || '',
        dateFormatted:   p['date-format']     || '',
        description:     p['image&description'] ? p['image&description'][0] : '',
        imageUrls:       imageUrls,
        // Extra fields for search indexing
        searchText: [
          p['Name'], p['brandName'], p['categoryName'],
          p['subCategoryName'], p['city'], p['storeName'],
          p['event'], p['seacrh']
        ].filter(Boolean).join(' ').toLowerCase()
      };
    });

    // Only return products that have at least one image
    var withImages = enriched.filter(function(p) { return p.imageUrls.length > 0; });

    return {
      statusCode: 200,
      headers: {
        'Content-Type':                'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        products: withImages,
        total:    withImages.length
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
