// fetch is globally available in Node 18+

async function testPriceUpdate(baseUrl) {
  console.log(`Testing against: ${baseUrl}`);
  try {
    // 1. Get products list
    const res = await fetch(`${baseUrl}/api/admin/products`);
    if (!res.ok) {
      console.error(`Failed to fetch products: ${res.status}`);
      return false;
    }
    const products = await res.json();
    if (products.length === 0) {
      console.log('No products found to test.');
      return false;
    }

    const testProd = products[0];
    const originalPrice = testProd.price || 0;
    const newPrice = originalPrice === 1000 ? 2000 : 1000;

    console.log(`Product: ${testProd.name} (ID: ${testProd.id})`);
    console.log(`Original Price: ${originalPrice} -> Target New Price: ${newPrice}`);

    // 2. Perform update (PUT)
    const updateRes = await fetch(`${baseUrl}/api/admin/products/${testProd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testProd.name,
        description: testProd.description || '',
        price: newPrice,
        features: testProd.features
      })
    });

    if (!updateRes.ok) {
      console.error(`Failed to update product: ${updateRes.status}`);
      return false;
    }
    const updateResult = await updateRes.json();
    console.log('Update API Response:', updateResult);

    // 3. Get products list again and check if price was updated
    const checkRes = await fetch(`${baseUrl}/api/admin/products`);
    const checkProducts = await checkRes.json();
    const updatedProd = checkProducts.find(p => p.id === testProd.id);

    console.log(`Updated Price in DB: ${updatedProd.price}`);
    if (updatedProd.price === newPrice) {
      console.log('✅ Success: Price was successfully updated!');
      
      // Restore original price
      await fetch(`${baseUrl}/api/admin/products/${testProd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testProd.name,
          description: testProd.description || '',
          price: originalPrice,
          features: testProd.features
        })
      });
      console.log('Restored original price.');
      return true;
    } else {
      console.log('❌ Failure: Price was NOT updated.');
      return false;
    }
  } catch (error) {
    console.error('Error during test:', error);
    return false;
  }
}

async function run() {
  const arg = process.argv[2] || 'local';
  if (arg === 'local') {
    await testPriceUpdate('http://127.0.0.1:5000');
  } else {
    await testPriceUpdate('https://next-card-backend.onrender.com');
  }
}

run();
