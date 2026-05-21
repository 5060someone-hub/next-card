const http = require('http');

const userId = '6a0c3a973dd6163535723a4b'; // 썸원 user ID from DB query

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTest() {
  try {
    console.log('--- GETting user profile ---');
    const getRes1 = await makeRequest('GET', `/api/user/profile/${userId}`);
    console.log('GET result:', JSON.stringify(getRes1, null, 2));

    console.log('\n--- PUTting updated profile ---');
    const putRes = await makeRequest('PUT', `/api/user/${userId}`, {
      name: '썸원_수정됨',
      phone: '010-9999-8888'
    });
    console.log('PUT result:', JSON.stringify(putRes, null, 2));

    console.log('\n--- GETting updated user profile to verify persistence ---');
    const getRes2 = await makeRequest('GET', `/api/user/profile/${userId}`);
    console.log('GET updated result:', JSON.stringify(getRes2, null, 2));
  } catch (err) {
    console.error('Connection/Request error. Is the server running?');
    console.error(err);
  }
}

runTest();
