const fs = require('fs');

const files = [
  'app/product/[slug]/ProductClient.tsx',
  'app/cart/CartClient.tsx',
  'app/checkout/CheckoutClient.tsx',
  'app/profile/ProfileClient.tsx',
  'app/auth/signin/SignInClient.tsx',
  'app/auth/signup/SignUpClient.tsx',
  'src/components/auth/AuthModal.tsx',
  'src/components/modals/SearchModal.tsx',
  'src/components/modals/AddressModal.tsx',
  'app/offers/[id]/OfferClient.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
      console.log('Skipping', file);
      return;
  }
  console.log('Processing', file);
  let content = fs.readFileSync(file, 'utf8');

  // Regex to remove tailwind classes like rounded, rounded-sm, rounded-lg, rounded-full, rounded-t-2xl
  content = content.replace(/\b(md:|lg:|xl:|sm:)?rounded(-[a-zA-Z0-9]+)?\b/g, '');
  
  // Remove shadows that give depth
  content = content.replace(/\b(md:|lg:|xl:|sm:)?shadow(-[a-zA-Z0-9]+)?\b/g, '');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Done!');
