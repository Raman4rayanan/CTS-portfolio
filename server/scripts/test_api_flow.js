async function run() {
  try {
    console.log('1. Logging in as Admin...');
    const loginRes = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: '12345678' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginData));
    }
    const token = loginData.token;
    console.log('✓ Login successful! Token acquired.');

    console.log('\n2. Fetching current config...');
    const configRes = await fetch('http://localhost:5000/api/portfolio/config');
    const configData = await configRes.json();
    if (!configData.success) {
      throw new Error('Fetch config failed');
    }
    const config = configData.data;
    console.log('Current Eibenstock scale in DB:', config.partners.find(p => p.name.includes('Eibenstock'))?.scale);

    console.log('\n3. Sending PUT request to update Eibenstock scale to 1.15...');
    // Modify Eibenstock scale in partners array
    const updatedPartners = config.partners.map(p => {
      if (p.name.includes('Eibenstock')) {
        return { ...p, scale: 1.15 };
      }
      return p;
    });

    const updateRes = await fetch('http://localhost:5000/api/portfolio/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...config,
        partners: updatedPartners
      })
    });
    const updateData = await updateRes.json();
    if (!updateData.success) {
      throw new Error('Update config failed: ' + JSON.stringify(updateData));
    }
    console.log('✓ PUT request successful!');

    console.log('\n4. Fetching config again to verify update...');
    const verifyRes = await fetch('http://localhost:5000/api/portfolio/config');
    const verifyData = await verifyRes.json();
    const newConfig = verifyData.data;
    console.log('New Eibenstock scale in DB:', newConfig.partners.find(p => p.name.includes('Eibenstock'))?.scale);

  } catch (err) {
    console.error('✗ Test failed:', err.message);
  }
}
run();
