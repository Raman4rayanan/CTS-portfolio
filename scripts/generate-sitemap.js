import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// In a real Vercel environment, this would ideally fetch from the production backend URL
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = process.env.VITE_FRONTEND_URL || 'https://www.concept-tools.com'; // Change to actual production URL

async function fetchProducts() {
  return new Promise((resolve, reject) => {
    const client = API_URL.startsWith('https') ? https : http;
    client.get(`${API_URL}/api/ecomm/products`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.data || []);
        } catch (e) {
          resolve([]); // Silently fail and return empty array if API is down
        }
      });
    }).on('error', (err) => {
      console.error('Failed to fetch products for sitemap:', err);
      resolve([]);
    });
  });
}

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function generateSitemap() {
  const products = await fetchProducts();

  const staticRoutes = [
    '',
    '/shop',
  ];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${products.map(p => `  <url>
    <loc>${BASE_URL}/shop/product/${p.product_id || generateSlug(p.product_name)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>
`;

  const publicPath = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemapContent);
  console.log('✅ sitemap.xml generated successfully!');
}

generateSitemap();
