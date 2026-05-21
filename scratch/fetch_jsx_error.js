async function fetchError() {
  try {
    const response = await fetch('http://localhost:5173/src/components/CardPreview.jsx');
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}
fetchError();
