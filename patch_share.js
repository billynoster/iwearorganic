const fs = require('fs');
let code = fs.readFileSync('src/components/shopping/media-section.tsx', 'utf8');

// We need to implement the Share button logic
code = code.replace(
  `        <button className="flex flex-col items-center gap-1 animate-in zoom-in duration-500 delay-300" onClick={(e) => e.stopPropagation()}>
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md active:scale-90 transition-transform">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
        </button>`,
  `        <button 
          className="flex flex-col items-center gap-1 animate-in zoom-in duration-500 delay-300" 
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.share) {
              navigator.share({
                title: item.title,
                text: item.caption,
                url: window.location.href,
              }).catch(console.error);
            } else {
              // Fallback
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }
          }}
        >
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md active:scale-90 transition-transform">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
        </button>`
);

fs.writeFileSync('src/components/shopping/media-section.tsx', code);
