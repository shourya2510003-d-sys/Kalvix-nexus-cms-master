export function getProductStats(id: string) {
  if (!id) return { rating: 4.5, reviewCount: 124, totalBuyers: 1432 };
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  
  const isHighDemand = hash % 5 === 0;
  
  const rating = isHighDemand ? 4.6 + (hash % 4) / 10 : 4.0 + (hash % 6) / 10;
  const reviewCount = isHighDemand ? 150 + (hash % 200) : 15 + (hash % 60);
  const totalBuyers = isHighDemand 
    ? reviewCount * 3.5 + 1000 + (hash % 500)
    : reviewCount * 2.5 + 200 + (hash % 300);
    
  return { 
    rating: Number(rating.toFixed(1)), 
    reviewCount: Math.floor(reviewCount), 
    totalBuyers: Math.floor(totalBuyers) 
  };
}

const REVIEW_TEXTS = [
  "Absolutely love this product! The texture is amazing and it absorbs so quickly.",
  "I have been using this for 2 weeks and can already see a huge difference. Highly recommend!",
  "A bit on the pricier side, but completely worth the money. Very premium feel.",
  "Smells divine! It has become a staple in my daily routine now.",
  "My skin feels so much softer and hydrated. Will definitely repurchase.",
  "This is exactly what I was looking for. Pure, authentic, and very effective.",
  "I gifted this to my mother and she loves it. Really high-quality packaging too.",
  "The results are visible within just a few days of use. Incredible formulation.",
  "It is very soothing and calming. I use it every night before sleeping.",
  "Noticed a beautiful glow after using this consistently. A must-have!",
  "Very lightweight, non-greasy, and works perfectly for my sensitive skin.",
  "One of the best natural products I've tried. You can tell the ingredients are pure.",
  "Works like magic. It completely cleared up my dry patches.",
  "A luxurious experience from start to finish. I'm completely obsessed.",
  "I've thrown away my other products. This is the only one I need now.",
  "The fragrance is natural and not overpowering. Very relaxing.",
  "A little goes a long way. The bottle will easily last me for months.",
  "My husband started stealing this from me, so I had to order another one!",
  "Fast delivery and exceptional product quality. Kalvix Nexus is my new favorite.",
  "It truly lives up to the hype. I couldn't be happier with the results."
];

const NAMES = [
  "Priya S.", "Anjali K.", "Rahul M.", "Neha G.", "Siddharth V.",
  "Riya T.", "Vikram S.", "Pooja P.", "Karan R.", "Sneha B.",
  "Rohan D.", "Megha C.", "Amit J.", "Shikha A.", "Aditya N.",
  "Nandini R.", "Sanjay M.", "Tanvi K.", "Arjun P.", "Simran S."
];

export function getWrittenReviews(id: string) {
  if (!id) return [];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  
  // Decide how many written reviews to show (between 20 and 30)
  const numReviews = 20 + (hash % 11);
  
  const reviews = [];
  
  for (let i = 0; i < numReviews; i++) {
    // Use addition salting with prime numbers to prevent modulo factor collisions (avoiding duplicates)
    const reviewHash = Math.abs(hash + i * 997 + 101);
    
    const text = REVIEW_TEXTS[reviewHash % REVIEW_TEXTS.length];
    // Use a different prime multiplier to ensure name and text indexes are decoupled
    const name = NAMES[(reviewHash * 31 + 7) % NAMES.length];
    const ratingHash = (reviewHash * 17) % 100;
    let rating = 5;
    if (ratingHash > 85) rating = 4; // 15% chance
    else if (ratingHash > 75) rating = 3; // 10% chance
    
    // Generate a recent date within the last 6 months
    const daysAgo = ((reviewHash + i) % 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    reviews.push({
      id: `${id}-rev-${i}`,
      name,
      rating,
      date: formattedDate,
      text,
      verified: true
    });
  }
  
  // Sort reviews by newest first
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getHomepageReviews() {
  return getWrittenReviews("homepage-showcase-reviews").slice(0, 6);
}
