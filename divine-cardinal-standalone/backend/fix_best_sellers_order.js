// Fix order of best_sellers section and verify its data in live layout
const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';

async function main() {
  const res = await fetch(`${API_URL}/cms/layout/homepage_layout`);
  const data = await res.json();
  let layout = Array.isArray(data) ? data : Object.values(data);
  
  // Find the best_sellers section
  const bsIdx = layout.findIndex(s => s.id && s.id.startsWith('best_sellers'));
  if (bsIdx < 0) { console.log('best_sellers not found!'); return; }
  
  const bs = layout[bsIdx];
  console.log('Current best_sellers section:');
  console.log(JSON.stringify(bs, null, 2));
  
  // Fix: Set order to 8.5 (after quiz_banner=7, before latest_reads=8)
  // Re-order: move best_sellers to after quiz_banner
  const quizSection = layout.find(s => s.id === 'quiz_banner');
  const quizOrder = quizSection ? quizSection.order : 7;
  
  // Bump everything that has order > quizOrder to make room
  layout = layout.map(s => {
    if (s.id.startsWith('best_sellers')) return s; // we'll set this manually
    if (s.order > quizOrder) return { ...s, order: s.order + 1 };
    return s;
  });
  
  // Set best_sellers to quizOrder + 1
  layout[bsIdx] = {
    ...bs,
    order: quizOrder + 1,
    data: {
      title: 'BEST SELLERS',
      subtitle: 'Most Loved',
      description: 'Explore our highly rated, time-tested health & body care remedies.',
      productIds: bs.data?.productIds || []
    }
  };
  
  console.log('\nNew order:');
  [...layout].sort((a, b) => a.order - b.order).forEach(s => console.log(`  order=${s.order} id=${s.id}`));
  
  // Push
  const asObject = {};
  layout.forEach(s => { asObject[s.id] = s; });
  
  const pushRes = await fetch(`${API_URL}/cms/layout/homepage_layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asObject)
  });
  
  if (pushRes.ok) {
    console.log('\n✅ Layout fixed! best_sellers is now after quiz_banner.');
  } else {
    console.error('❌ Failed:', await pushRes.text());
  }
}

main().catch(console.error);
