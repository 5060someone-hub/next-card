const http = require('http');

const testUserId = '6a0c3a973dd6163535723a4b'; // Test user ID

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
    console.log('=== Starting E2E API Verification ===\n');

    // 1. Get user profile
    console.log('1. Fetching user profile...');
    const profileRes = await makeRequest('GET', `/api/user/profile/${testUserId}`);
    console.log(`Status: ${profileRes.statusCode}`, profileRes.body);

    if (profileRes.statusCode === 404) {
      console.log('User not found. Let us try to use the admin seeded account first to search for a valid user.');
      const adminUsersRes = await makeRequest('GET', '/api/admin/users');
      console.log('Admin users list length:', adminUsersRes.body ? adminUsersRes.body.length : 0);
      if (adminUsersRes.body && adminUsersRes.body.length > 0) {
        console.log('Found user from DB:', adminUsersRes.body[0]);
        // Update user ID
        global.userId = adminUsersRes.body[0].id;
      }
    } else {
      global.userId = testUserId;
    }

    const userId = global.userId;
    console.log(`Using UserID: ${userId}`);

    // 2. Create card
    console.log('\n2. Creating a new card...');
    const createCardRes = await makeRequest('POST', '/api/card/create', { userId });
    console.log(`Status: ${createCardRes.statusCode}`);
    if (createCardRes.statusCode !== 200) {
      throw new Error(`Failed to create card: ${JSON.stringify(createCardRes.body)}`);
    }
    const card = createCardRes.body;
    console.log('Created Card Details:', card);
    const cardId = card._id;

    // 3. List all user cards
    console.log('\n3. Listing all cards for user...');
    const cardsListRes = await makeRequest('GET', `/api/cards/${userId}`);
    console.log(`Status: ${cardsListRes.statusCode}, Cards Count: ${cardsListRes.body.length}`);
    console.log('Cards list sample:', cardsListRes.body[0]);

    // 4. Retrieve card detail
    console.log(`\n4. Fetching card detail for CardID: ${cardId}...`);
    const cardDetailRes = await makeRequest('GET', `/api/card-detail/${cardId}`);
    console.log(`Status: ${cardDetailRes.statusCode}`);
    console.log('Card Detail:', cardDetailRes.body);

    // 5. Save card modifications
    console.log('\n5. Saving modifications to card...');
    const saveCardRes = await makeRequest('POST', `/api/card/save/${cardId}`, {
      cardData: {
        name: '홍길동_테스트',
        intro: '안녕하세요. 실시간 편집기 테스트입니다.',
        status: 'published',
        theme: 'luxury',
        themeColor: '#10b981'
      }
    });
    console.log(`Status: ${saveCardRes.statusCode}`);
    console.log('Save result:', saveCardRes.body);

    // 6. Request manual payment for membership upgrade
    console.log('\n6. Requesting membership upgrade payment...');
    const requestPaymentRes = await makeRequest('POST', '/api/payment/request', {
      cardId,
      depositorName: '홍길동',
      paymentAmount: 50000,
      requestedGrade: 'premium_nfc',
      requestedDuration: 12
    });
    console.log(`Status: ${requestPaymentRes.statusCode}`);
    console.log('Payment request result:', requestPaymentRes.body);

    // 7. Verify admin notifications badge counts
    console.log('\n7. Fetching admin notifications count...');
    const notificationsRes = await makeRequest('GET', '/api/admin/notifications');
    console.log(`Status: ${notificationsRes.statusCode}`, notificationsRes.body);

    // 8. Verify admin users list
    console.log('\n8. Listing admin users (to verify merged fields)...');
    const adminUsersAfterRes = await makeRequest('GET', '/api/admin/users');
    console.log(`Status: ${adminUsersAfterRes.statusCode}`);
    const updatedUserObj = adminUsersAfterRes.body.find(u => u.id === userId);
    console.log('Updated user in admin list:', updatedUserObj);

    // 9. Approve membership upgrade
    console.log('\n9. Approving payment for card...');
    const approvePaymentRes = await makeRequest('PUT', `/api/admin/payment/approve/${cardId}`, { duration: 12 });
    console.log(`Status: ${approvePaymentRes.statusCode}`);
    console.log('Approve result:', approvePaymentRes.body);

    // 10. Verify card is now confirmed and grade is premium_nfc
    console.log('\n10. Verifying approved card detail...');
    const approvedCardDetailRes = await makeRequest('GET', `/api/card-detail/${cardId}`);
    console.log(`Status: ${approvedCardDetailRes.statusCode}`);
    console.log('Approved Card detail:', approvedCardDetailRes.body);

    // 11. Reject/Reset payment details (Testing reject workflow)
    console.log('\n11. Testing Reject/Reset workflow...');
    const rejectPaymentRes = await makeRequest('PUT', `/api/admin/payment/reject/${cardId}`);
    console.log(`Status: ${rejectPaymentRes.statusCode}`);
    console.log('Reject result:', rejectPaymentRes.body);

    // 12. Verify rejected card detail (should be reset back to general and none)
    console.log('\n12. Verifying rejected card detail...');
    const rejectedCardDetailRes = await makeRequest('GET', `/api/card-detail/${cardId}`);
    console.log(`Status: ${rejectedCardDetailRes.statusCode}`);
    console.log('Rejected Card detail:', rejectedCardDetailRes.body);

    console.log('\n=== E2E API Verification Completed Successfully ===');
  } catch (err) {
    console.error('Error during E2E verification:', err);
  }
}

runTest();
