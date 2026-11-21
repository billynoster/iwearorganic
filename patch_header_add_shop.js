const fs = require('fs');
let code = fs.readFileSync('src/components/layout/app-header.tsx', 'utf8');

code = code.replace(
  `          <Link
            href="/rescuing-pets"
            className={cn(
              'text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary',
              pathname === '/rescuing-pets' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Community
          </Link>`,
  `          <Link
            href="/shopping"
            className={cn(
              'text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary',
              pathname === '/shopping' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Shop
          </Link>
          <Link
            href="/rescuing-pets"
            className={cn(
              'text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary',
              pathname === '/rescuing-pets' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Community
          </Link>`
);

code = code.replace(
  `              <Link
                href="/rescuing-pets"
                className={cn(
                  'text-xl font-bold uppercase tracking-wider transition-colors',
                  pathname === '/rescuing-pets' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Community
              </Link>`,
  `              <Link
                href="/shopping"
                className={cn(
                  'text-xl font-bold uppercase tracking-wider transition-colors',
                  pathname === '/shopping' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Shop
              </Link>
              <Link
                href="/rescuing-pets"
                className={cn(
                  'text-xl font-bold uppercase tracking-wider transition-colors',
                  pathname === '/rescuing-pets' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Community
              </Link>`
);

fs.writeFileSync('src/components/layout/app-header.tsx', code);
