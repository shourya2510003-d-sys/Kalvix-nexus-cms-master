// Script to inject best_sellers section into live Firebase layout
// Run: node inject_best_sellers_layout.js

const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';

async function main() {
  console.log('Fetching current live layout...');
  
  // Fetch current layout
  const res = await fetch(`${API_URL}/cms/layout/homepage_layout`);
  if (!res.ok) {
    console.error('Failed to fetch layout:', res.status);
    process.exit(1);
  }
  
  const data = await res.json();
  
  // Convert to array (Firebase stores as object or array)
  let layout = Array.isArray(data) ? data : Object.values(data);
  console.log(`Current layout has ${layout.length} sections:`);
  layout.forEach(s => console.log(`  order=${s.order} id=${s.id} visible=${s.visible}`));
  
  // Check if best_sellers already exists
  const hasBestSellers = layout.some(s => s.id && s.id.startsWith('best_sellers'));
  if (hasBestSellers) {
    console.log('\n✅ best_sellers section already exists in layout. No changes needed.');
    return;
  }
  
  // Find quiz_banner position
  const quizIdx = layout.findIndex(s => s.id && s.id.startsWith('quiz_banner'));
  const quizOrder = quizIdx >= 0 ? layout[quizIdx].order : 5;
  
  console.log(`\nquiz_banner found at index ${quizIdx} with order ${quizOrder}`);
  
  // Bump all sections after quiz_banner by 1
  const newBestSellersOrder = quizOrder + 1;
  layout = layout.map(s => {
    if (s.order >= newBestSellersOrder) {
      return { ...s, order: s.order + 1 };
    }
    return s;
  });
  
  // New best_sellers section
  const bestSellersSection = {
    id: 'best_sellers',
    order: newBestSellersOrder,
    visible: true,
    data: {
      title: 'BEST SELLERS',
      subtitle: 'Most Loved',
      description: 'Explore our highly rated, time-tested health & body care remedies.',
      productIds: []
    },
    styles: {
      backgroundColor: 'transparent',
      textColor: 'inherit',
      fontFamily: 'inherit',
      textAlignment: 'left'
    }
  };
  
  // Insert after quiz_banner
  layout.splice(quizIdx + 1, 0, bestSellersSection);
  
  console.log('\nNew layout order:');
  layout.sort((a, b) => a.order - b.order).forEach(s => console.log(`  order=${s.order} id=${s.id}`));
  
  // Convert to Firebase object format (keyed by id)
  const asObject = {};
  layout.forEach(s => { asObject[s.id] = s; });
  
  // Push to live layout
  console.log('\nPushing updated layout to live site...');
  const pushRes = await fetch(`${API_URL}/cms/layout/homepage_layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asObject)
  });
  
  if (pushRes.ok) {
    console.log('✅ Successfully injected best_sellers section into the live layout!');
    console.log('Refresh the website to see Best Sellers section live.');
  } else {
    const err = await pushRes.text();
    console.error('❌ Failed to push layout:', pushRes.status, err);
  }
}

main().catch(console.error);
