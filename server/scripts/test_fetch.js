async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/portfolio/config');
    const data = await res.json();
    console.log('API Response Success:', data.success);
    if (data.success) {
      console.log('API Partners:', data.data.partners.map(p => ({ name: p.name, scale: p.scale })));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
run();
