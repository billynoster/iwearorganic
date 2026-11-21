const fs = require('fs');
let code = fs.readFileSync('src/components/layout/app-header.tsx', 'utf8');

code = code.replace(/href="\/"\s*className=\{cn\(\s*'text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary',\s*pathname === '\/' \? 'text-primary' : 'text-muted-foreground'\s*\)\}\s*>\s*Discover/g, 
`href="/discover"
            className={cn(
              'text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary',
              pathname === '/discover' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Discover`);

code = code.replace(/href="\/"\s*className=\{cn\(\s*'text-xl font-bold uppercase tracking-wider transition-colors',\s*pathname === '\/' \? 'text-primary' : 'text-muted-foreground'\s*\)\}\s*>\s*Discover/g,
`href="/discover"
                className={cn(
                  'text-xl font-bold uppercase tracking-wider transition-colors',
                  pathname === '/discover' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Discover`);
                
fs.writeFileSync('src/components/layout/app-header.tsx', code);
