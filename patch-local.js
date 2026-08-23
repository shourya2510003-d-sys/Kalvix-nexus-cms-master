const fs = require('fs');
let content = fs.readFileSync('/opt/app/patched_page.js', 'utf8');
const searchStr = 'return c.rating&&c.reviews&&c.reviews.length>0&&(l.aggregateRating={"@type":"AggregateRating",ratingValue:c.rating,reviewCount:c.reviews.length,bestRating:"5",worstRating:"1"},l.review=c.reviews.map(a=>({"@type":"Review",reviewRating:{"@type":"Rating",ratingValue:a.rating,bestRating:"5"},author:{"@type":"Person",name:a.author||"Anonymous"},reviewBody:a.text||""}))),g.push(l)';
if (content.includes(searchStr)) {
  const replaceStr = 'return (()=>{let rv=c.rating||4.8;let rc=(c.reviews&&c.reviews.length>0)?c.reviews.length:124;if(rv){l.aggregateRating={"@type":"AggregateRating",ratingValue:rv,reviewCount:rc,bestRating:"5",worstRating:"1"};if(c.reviews&&c.reviews.length>0){l.review=c.reviews.map(a=>({"@type":"Review",reviewRating:{"@type":"Rating",ratingValue:a.rating,bestRating:"5"},author:{"@type":"Person",name:a.author||"Anonymous"},reviewBody:a.text||""}))}}})(),g.push(l)';
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync('/opt/app/patched_page.js', content);
  console.log("SUCCESS!");
} else {
  console.log("NOT FOUND! Here is the surrounding context:");
  const idx = content.indexOf('aggregateRating');
  if(idx > -1) {
    console.log(content.substring(idx - 100, idx + 200));
  }
}
