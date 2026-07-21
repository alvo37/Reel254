'use client';
import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/reusables/Navbar/Navbar';
import { backendService } from '@/services/backendService';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import VideoActions from '@/components/VideoActions';
import CommentsModal from '@/components/CommentsModal';

const GENRES = [
  { id: 0, name: 'All Trending' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export default function FeedPage() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(0);
  const [page, setPage] = useState(1);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // Reset feed when genre changes
  useEffect(() => {
    setMediaItems([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre]);

  // Fetch movies based on current page and genre
  useEffect(() => {
    async function fetchFeed() {
      if (true) setLoading(true);
      try {
        let movieData: any[] = [];
        let tvData: any[] = [];

        if (selectedGenre === 0) {
          movieData = await backendService.getTrendingMovies(page);
          tvData = await backendService.getTrendingTVShows(page);
        } else {
          movieData = await backendService.getMoviesByGenre(selectedGenre, page);
          tvData = await backendService.getTVShowsByGenre(selectedGenre, page);
        }

        const combined = [
          ...movieData.map((item: any) => ({ ...item, media_type: 'movie' })),
          ...tvData.map((item: any) => ({ ...item, media_type: 'tv' })),
        ];

        const shuffled = [...combined].sort(() => 0.5 - Math.random());

        const withTrailers = await Promise.all(
          shuffled.map(async (item: any) => {
            const trailerKey =
              item.media_type === 'tv'
                ? await backendService.getTVTrailer(item.id)
                : await backendService.getMovieTrailer(item.id);
            return { ...item, trailerKey };
          }),
        );
        const validItems = withTrailers.filter((item) => item.trailerKey);

        setMediaItems((prev) => {
          const newItems = page === 1 ? validItems : [...prev, ...validItems];
          const uniqueItems = Array.from(
            new Map(newItems.map((item) => [`${item.media_type}-${item.id}`, item])).values(),
          );
          if (page === 1 && uniqueItems.length > 0) {
            setActiveMediaId(`${uniqueItems[0].media_type}-${uniqueItems[0].id}`);
          }
          // Determine if there are more items to load
          if (validItems.length === 0) {
            setHasMore(false);
          }
          return uniqueItems;
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, [selectedGenre, page]);

  // Set up IntersectionObserver for videos and infinite scroll
  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const mediaKey = entry.target.getAttribute('data-key');
            if (mediaKey) setActiveMediaId(mediaKey);
          }
        });
      },
      { threshold: 0.5 }, // trigger when 50% of the video is visible
    );

    const container = scrollRef.current;
    if (container) {
      const children = container.querySelectorAll('.snap-start');
      children.forEach((child) => videoObserver.observe(child));
    }

    // Observer for infinite scrolling
    const infiniteObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current && hasMore) {
      infiniteObserver.observe(loadMoreRef.current);
    }

    return () => {
      videoObserver.disconnect();
      infiniteObserver.disconnect();
    };
  }, [mediaItems, loading]);

  const handleWatchlist = async (item: any) => {
    if (!user) return toast.error('Please sign in to add to watchlist');
    try {
      if (item.media_type === 'tv') {
        await backendService.addTVToWatchlist(user.id, item.id);
      } else {
        await backendService.addToWatchlist(user.id, item.id, item.id);
      }
      toast.success('Added to your watchlist!');
    } catch (e) {
      toast.error('Failed to add to watchlist');
    }
  };

  // Comment modal state
  const [showComments, setShowComments] = useState(false);
  const [commentMovie, setCommentMovie] = useState<any>(null);

  const openComments = (item: any) => {
    setCommentMovie(item);
    setShowComments(true);
  };

  const closeComments = () => {
    setShowComments(false);
    setCommentMovie(null);
  };

  const shareVideo = async (item: any) => {
    const shareUrl = `${window.location.origin}/${item.media_type === 'tv' ? 'tvshows' : 'films'}/${item.id}`;
    const shareText = `Check out this ${item.media_type === 'tv' ? 'show' : 'movie'}: ${item.title || item.name}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title || item.name, text: shareText, url: shareUrl });
        return;
      } catch (e) {
        console.error('Native share failed', e);
      }
    }
    // Fallback to WhatsApp and clipboard
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-black text-white min-h-screen pt-[70px] flex flex-col">
      <Navbar />

      {/* Category Selector - Dropdown */}
      <div className="absolute top-[120px] left-1/2 transform -translate-x-1/2 z-20">
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(Number(e.target.value))}
            className="bg-black/60 text-white border border-gray-600 rounded-full pl-4 pr-10 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md appearance-none cursor-pointer"
          >
            {GENRES.map((genre) => (
              <option key={genre.id} value={genre.id} className="bg-black text-white">
                {genre.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-white">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
               <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="w-full h-[calc(100vh-70px)] overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      >
        {loading && page === 1 && (
          <p className="text-center p-8 mt-10 text-gray-400">Loading your feed...</p>
        )}
        {mediaItems.map((item) => (
          <div
            key={`${item.media_type}-${item.id}`}
            data-key={`${item.media_type}-${item.id}`}
            className="w-full h-[85vh] snap-start relative flex flex-col items-center justify-center border-b border-gray-800"
          >
            {activeMediaId === `${item.media_type}-${item.id}` ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${item.trailerKey}?autoplay=1&mute=0&loop=1&playlist=${item.trailerKey}&controls=1&modestbranding=1`}
                title={item.title || item.name}
                allow="autoplay; encrypted-media; fullscreen"
                className="absolute top-0 left-0 w-full h-full border-none z-0"
              ></iframe>
            ) : (
              <div className="absolute top-0 left-0 w-full h-full bg-gray-900 flex items-center justify-center z-0">
                <p className="text-gray-500">Scroll to play</p>
              </div>
            )}

            <div className="absolute bottom-20 left-4 max-w-[70%] drop-shadow-lg z-10 bg-black/40 p-4 rounded-xl backdrop-blur-sm pointer-events-none">
              <h2 className="text-2xl font-bold mb-2 text-white">{item.title || item.name}</h2>
              <p className="text-sm line-clamp-3 text-gray-200">{item.overview}</p>
            </div>

            <VideoActions
              item={item}
              onOpenComments={openComments}
              onShare={shareVideo}
              onWatchlist={handleWatchlist}
            />
          </div>
        ))}
        {!loading && mediaItems.length === 0 && (
          <p className="text-center p-8 mt-10 text-gray-400">No trailers available.</p>
        )}
        {mediaItems.length > 0 && (
          <div
            ref={loadMoreRef}
            className="w-full h-24 flex items-center justify-center snap-start"
          >
            {loading ? (
              <p className="text-gray-400">Loading more...</p>
            ) : (
              <p className="text-gray-600 opacity-50">Scroll to load more</p>
            )}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showComments && commentMovie && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeComments}>
          <div onClick={(e) => e.stopPropagation()}>
            <CommentsModal item={commentMovie} onClose={closeComments} />
          </div>
        </div>
      )}
    </div>
  );
}
