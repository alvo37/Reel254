import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { interactionService } from '@/services/interactionService';
import { toast } from 'sonner';

interface CommentsSectionProps {
  itemId: string;
  itemType: 'movie' | 'tvshow';
}

export default function CommentsSection({ itemId, itemType }: CommentsSectionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  const fetchComments = async () => {
    try {
      const fetched = await interactionService.getComments(itemId, itemType);
      setComments(fetched);
    } catch (e) {
      toast.error('Could not load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [itemId, itemType]);

  const submitComment = async () => {
    if (!user) return toast.error('Please sign in to comment');
    if (!newComment.trim()) return toast.error('Comment cannot be empty');
    
    try {
      const userName = user.firstName || user.username || 'User';
      await interactionService.addComment(
        user.id,
        userName,
        itemId,
        itemType,
        newComment,
        replyingTo ? replyingTo.id : undefined
      );
      
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
      toast.success('Comment added');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? `Failed to add comment: ${e.message}` : 'Failed to add comment');
    }
  };

  const CommentItem = ({ c }: { c: any }) => {
    const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
    
    useEffect(() => {
      interactionService.getCommentReactions(c.id).then(setReactions).catch(console.error);
    }, [c.id]);

    const handleReaction = async (type: 'like' | 'dislike') => {
      if (!user) return toast.error('Sign in to react');
      try {
        await interactionService.toggleCommentReaction(user.id, c.id, type);
        const newReactions = await interactionService.getCommentReactions(c.id);
        setReactions(newReactions);
      } catch (e) {
        toast.error(e instanceof Error ? `Failed to react: ${e.message}` : 'Failed to react');
      }
    };

    return (
      <div className="p-4 bg-gray-800 rounded-xl mb-3 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400 font-medium">{c.user_name || `User ${c.user_id.substring(0, 5)}`}</p>
            <p className="text-base text-gray-100 mt-2">{c.content}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => handleReaction('like')} className="text-gray-400 hover:text-red-500 text-sm flex items-center space-x-1">
              <span>❤️</span> <span>{reactions.likes}</span>
            </button>
            <button onClick={() => handleReaction('dislike')} className="text-gray-400 hover:text-blue-500 text-sm flex items-center space-x-1">
              <span>👎</span> <span>{reactions.dislikes}</span>
            </button>
          </div>
        </div>
        <div className="mt-3 flex space-x-3 text-sm text-gray-400">
          <button onClick={() => setReplyingTo(c)} className="hover:text-white font-semibold">Reply</button>
        </div>
        
        {/* Replies */}
        {comments.filter(reply => reply.parent_id === c.id).map(reply => (
          <div key={reply.id} className="mt-3 ml-6 pl-4 border-l-2 border-gray-600">
            <p className="text-sm text-gray-400 font-medium">{reply.user_name || `User ${reply.user_id.substring(0, 5)}`}</p>
            <p className="text-base text-gray-200 mt-1">{reply.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8 bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800">
      <h3 className="text-2xl font-bold text-white mb-6">
        Comments <span className="text-lg font-normal text-gray-400 ml-2">({comments.length})</span>
      </h3>
      
      <div className="mb-8">
        {replyingTo && (
          <div className="mb-2 flex justify-between items-center text-sm text-gray-400 bg-gray-800 p-3 rounded-lg">
            <span>Replying to {replyingTo.user_name || `User ${replyingTo.user_id.substring(0,5)}`}</span>
            <button onClick={() => setReplyingTo(null)} className="hover:text-white font-semibold">Cancel</button>
          </div>
        )}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-4 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          />
          <button
            onClick={submitComment}
            disabled={!newComment.trim()}
            className="px-6 py-4 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-gray-400 text-center py-4">Loading comments...</p>}
        {!loading && comments.length === 0 && <p className="text-gray-400 text-center py-4">Be the first to comment!</p>}
        {comments.filter(c => !c.parent_id).map((c) => (
          <CommentItem key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
