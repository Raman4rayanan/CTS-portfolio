async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/portfolio/services');
    const data = await res.json();
    console.log('API Services Response Order:');
    data.data.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.title}] (ID: ${s._id}) - CreatedAt: ${s.createdAt}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
