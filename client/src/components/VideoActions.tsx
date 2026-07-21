import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { interactionService } from '@/services/interactionService';
import { toast } from 'sonner';

interface VideoActionsProps {
  item: any;
  onOpenComments: (item: any) => void;
  onShare: (item: any) => void;
  onWatchlist: (item: any) => void;
}

export default function VideoActions({ item, onOpenComments, onShare, onWatchlist }: VideoActionsProps) {
  const { user } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const itemType = item.media_type === 'tv' ? 'tvshow' : 'movie'; // feed handles movies/tv

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const count = await interactionService.getLikesCount(item.id.toString(), itemType);
        setLikesCount(count);

        if (user) {
          const liked = await interactionService.getUserLikeStatus(user.id, item.id.toString(), itemType);
          setIsLiked(liked);
        }

        const comments = await interactionService.getComments(item.id.toString(), itemType);
        setCommentsCount(comments.length);
      } catch (e) {
        console.error('Error fetching interactions', e);
      }
    };
    fetchInteractions();
  }, [item.id, itemType, user]);

  const handleLike = async () => {
    if (!user) return toast.error('Please sign in to like');
    try {
      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

      await interactionService.toggleLike(user.id, item.id.toString(), itemType);
    } catch (e) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast.error(e instanceof Error ? `Failed to like: ${e.message}` : 'Failed to like');
    }
  };

  return (
    <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-6 z-10">
      <div className="flex flex-col items-center">
        <button
          onClick={handleLike}
          className={`p-3 rounded-full transition-colors backdrop-blur-md ${isLiked ? 'bg-red-600 text-white' : 'bg-black/60 text-white hover:bg-gray-600'}`}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
        <span className="text-white text-xs mt-1 drop-shadow-md font-semibold">{likesCount}</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={() => onOpenComments(item)}
          className="p-3 bg-black/60 text-white rounded-full hover:bg-gray-600 transition-colors backdrop-blur-md"
        >
          💬
        </button>
        <span className="text-white text-xs mt-1 drop-shadow-md font-semibold">{commentsCount}</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={() => onShare(item)}
          className="p-3 bg-black/60 text-white rounded-full hover:bg-gray-600 transition-colors backdrop-blur-md"
        >
          ↗️
        </button>
        <span className="text-white text-xs mt-1 drop-shadow-md font-semibold">Share</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={() => onWatchlist(item)}
          className="p-3 bg-black/60 text-white rounded-full hover:bg-blue-600 transition-colors backdrop-blur-md"
        >
          ➕
        </button>
        <span className="text-white text-xs mt-1 drop-shadow-md font-semibold">Save</span>
      </div>
    </div>
  );
}
