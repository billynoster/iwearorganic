const fs = require('fs');
let code = fs.readFileSync('src/components/shopping/media-section.tsx', 'utf8');

code = code.replace(
  `import { calculateVibeMatch, PersonalizedPreferences } from '@/lib/vibe-utils';`,
  `import { calculateVibeMatch, PersonalizedPreferences } from '@/lib/vibe-utils';\nimport { useFirestore } from '@/firebase';\nimport { collection, query, orderBy, getDocs } from 'firebase/firestore';`
);

const newMediaSection = `
export function MediaSection({ onMediaClick, userPrefs, products = [] }: MediaSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();
  const [firebaseMedia, setFirebaseMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!firestore) return;
      try {
        const q = query(collection(firestore, 'videos'), orderBy('createdAt', 'desc'));
        const snaps = await getDocs(q);
        const fetched = snaps.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            videoUrl: data.videoUrl,
            title: data.title || '',
            category: data.category || '',
            color: 'Assorted',
            author: data.author || { name: '@creator', avatar: 'C' },
            caption: data.caption || '',
            song: data.song || 'Original Audio',
            likes: data.likes || '0',
            comments: data.comments || '0',
            vibeTags: data.vibeTags || []
          };
        });
        setFirebaseMedia(fetched);
      } catch (e) {
        console.error("Error fetching videos", e);
      }
    };
    fetchMedia();
  }, [firestore]);

  // AI-Curation: Sort videos based on user vibe match
  const curatedFeed = useMemo(() => {
    let sorted = [...firebaseMedia, ...BASE_MEDIA_ITEMS];
    if (userPrefs && (userPrefs.vibe || userPrefs.fit || userPrefs.goal)) {
      sorted = sorted.sort((a, b) => {
        const scoreA = calculateVibeMatch(userPrefs, a.vibeTags, a.title);
        const scoreB = calculateVibeMatch(userPrefs, b.vibeTags, b.title);
        return scoreB - scoreA;
      });
    }
    return sorted;
  }, [userPrefs, firebaseMedia]);
`;

code = code.replace(
  `export function MediaSection({ onMediaClick, userPrefs, products = [] }: MediaSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI-Curation: Sort videos based on user vibe match
  const curatedFeed = useMemo(() => {
    let sorted = [...BASE_MEDIA_ITEMS];
    if (userPrefs && (userPrefs.vibe || userPrefs.fit || userPrefs.goal)) {
      sorted = sorted.sort((a, b) => {
        const scoreA = calculateVibeMatch(userPrefs, a.vibeTags, a.title);
        const scoreB = calculateVibeMatch(userPrefs, b.vibeTags, b.title);
        return scoreB - scoreA;
      });
    }
    return sorted;
  }, [userPrefs]);`,
  newMediaSection.trim()
);

fs.writeFileSync('src/components/shopping/media-section.tsx', code);
