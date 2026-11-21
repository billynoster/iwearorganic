const fs = require('fs');
let code = fs.readFileSync('src/components/layout/app-header.tsx', 'utf8');

if (!code.includes('Video')) {
  code = code.replace(
    `import { Menu } from 'lucide-react';`,
    `import { Menu, Video } from 'lucide-react';`
  );

  code = code.replace(
    `        <div className="flex items-center gap-2">
          <UserNav />`,
    `        <div className="flex items-center gap-2">
          <Link href="/creator/upload" className="hidden sm:flex text-muted-foreground hover:text-primary mr-2" aria-label="Upload Video">
            <Video className="h-5 w-5" />
          </Link>
          <UserNav />`
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
                href="/rescuing-pets"
                className={cn(
                  'text-xl font-bold uppercase tracking-wider transition-colors',
                  pathname === '/rescuing-pets' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Community
              </Link>
              <Link
                href="/creator/upload"
                className={cn(
                  'text-xl font-bold uppercase tracking-wider transition-colors',
                  pathname === '/creator/upload' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Upload Video
              </Link>`
  );

  fs.writeFileSync('src/components/layout/app-header.tsx', code);
}
