const products = [
  { id: '1', title: 'Solid Terracotta Color Pencil Skirt', tags: ['skirt'], variants: [] },
  { id: '2', title: 'Solid Red Pencil Skirt', tags: ['skirt'], variants: [] },
  { id: '3', title: 'Chic Polka Dot Racerback Dress for Women - Perfect for Summer Outings and Casual Gatherings', tags: ['dress'], variants: [] }
];
const item = {
  title: 'Solid Terracotta Color Pencil Skirt',
  category: 'Skirts',
  vibeTags: ['fashion', 'skirt', 'terracotta', 'chic', 'style'],
  productIds: []
};

const relatedProducts = products.filter(p => { 
   if (item.productIds && item.productIds.length > 0) { 
     return item.productIds.includes(p.id); 
   } 
   return (p.title === item.title) || (p.tags || []).some(tag => (item.vibeTags || []).includes(tag.toLowerCase())) || (p.title || "").toLowerCase().includes(item.category.toLowerCase());
});
console.log(relatedProducts.map(p => p.title));
