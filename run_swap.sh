mkdir -p src/app/discover
mv src/app/page.tsx src/app/discover/page.tsx
mv src/app/home-page.tsx src/app/discover/home-page.tsx
cp src/app/shopping/page.tsx src/app/page.tsx
# Do not remove shopping/page.tsx because it might be needed if users type /shopping, but we can remove it. Let's keep it just in case or remove it. Let's remove it to avoid duplicate canonical URLs, but wait, the sitemap might have /shopping. It's safer to leave it and just copy it to root, OR we can remove it and let next.config.js handle redirects. Let's remove it and add a redirect in next.config.ts?
# The user wants the landing page to be the Collections page. We'll move it.
rm -f src/app/shopping/page.tsx

# Update imports in src/app/page.tsx
# There are no relative imports that break because we just moved from src/app/shopping to src/app

# Update links
sed -i 's/href="\/shopping"/href="\/"/g' src/components/layout/app-header.tsx
sed -i "s/pathname === '\/shopping'/pathname === '\/'/g" src/components/layout/app-header.tsx

# The Discover link is currently href="/" and pathname === '/'
# We need to change that one to /discover, but ONLY the one for Discover
