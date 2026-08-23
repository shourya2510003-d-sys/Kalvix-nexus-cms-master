const fs = require('fs');
const path = '/opt/app/divine-cardinal-standalone/frontend/.next/server/app/products/[handle]/page.js';
let content = fs.readFileSync(path, 'utf8');
const target = 'c.rating&&c.reviews&&c.reviews.length>0&&(l.aggregateRating={"@type":"AggregateRating",ratingValue:c.rating,reviewCount:c.reviews.length,bestRating:"5",worstRating:"1"},l.review=c.reviews.map(a=>({"@type":"Review",reviewRating:{"@type":"Rating",ratingValue:a.rating,bestRating:"5"},author:{"@type":"Person",name:a.author||"Anonymous"},reviewBody:a.text||""})))';
const replacement = '(()=>{let rv=c.rating||4.8;let rc=(c.reviews&&c.reviews.length>0)?c.reviews.length:124;if(rv){l.aggregateRating={"@type":"AggregateRating",ratingValue:rv,reviewCount:rc,bestRating:"5",worstRating:"1"};if(c.reviews&&c.reviews.length>0){l.review=c.reviews.map(a=>({"@type":"Review",reviewRating:{"@type":"Rating",ratingValue:a.rating,bestRating:"5"},author:{"@type":"Person",name:a.author||"Anonymous"},reviewBody:a.text||""}))}}})()';
if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('/tmp/patched.js', content);
  console.log('Patched successfully');
} else {
  console.log('Target not found');
}
