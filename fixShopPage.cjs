const fs = require('fs');

let content = fs.readFileSync('src/components/ShopPage.jsx', 'utf8');

content = content.replace(/src=\{optimizeCloudinaryUrl\(\.images\?\.\[0\]\)\} /g, "src={optimizeCloudinaryUrl(product.images?.[0])} ");
content = content.replace(/src=\{optimizeCloudinaryUrl\(\.images\?\.\[0\]\)\}/g, (match, offset) => {
  // We can look at the surrounding code to determine the variable
  const context = content.substring(Math.max(0, offset - 100), offset + 100);
  if (context.includes('alt={rel.product_name}')) return 'src={optimizeCloudinaryUrl(rel.images?.[0])}';
  if (context.includes('alt={item.product_name}')) return 'src={optimizeCloudinaryUrl(item.images?.[0])}';
  if (context.includes('alt={p.product_name}') || context.includes('p.product_name')) return 'src={optimizeCloudinaryUrl(p.images?.[0])}';
  if (context.includes('selectedProduct.product_name') || context.includes('selectedProduct')) return 'src={optimizeCloudinaryUrl(selectedProduct.images?.[0])}';
  if (context.includes('product.product_name')) return 'src={optimizeCloudinaryUrl(product.images?.[0])}';
  
  // Default to p if we're not sure, mostly it's p in those other places
  return 'src={optimizeCloudinaryUrl(p.images?.[0])}';
});

fs.writeFileSync('src/components/ShopPage.jsx', content);
console.log('Fixed ShopPage!');
