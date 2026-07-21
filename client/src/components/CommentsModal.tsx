import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { interactionService } from '@/services/interactionService';
import { toast } from 'sonner';

interface CommentsModalProps {
  item: any;
  onClose: () => void;
}

export default function CommentsModal({ item, onClose }: CommentsModalProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  
  const itemType = item.media_type === 'tv' ? 'tvshow' : 'movie';

  const fetchComments = async () => {
    try {
      const fetched = await interactionService.getComments(item.id.toString(), itemType);
      setComments(fetched);
    } catch (e) {
      toast.error('Could not load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [item.id, itemType]);

  const submitComment = async () => {
    if (!user) return toast.error('Please sign in to comment');
    if (!newComment.trim()) return toast.error('Comment cannot be empty');
    
    try {
      const userName = user.firstName || user.username || 'User';
      await interactionService.addComment(
        user.id,
        userName,
        item.id.toString(),
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
      <div className="p-3 bg-gray-800 rounded-lg mb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 font-medium">{c.user_name || `User ${c.user_id.substring(0, 5)}`}</p>
            <p className="text-sm text-gray-100 mt-1">{c.content}</p>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <button onClick={() => handleReaction('like')} className="text-gray-400 hover:text-red-500 text-xs">
              ❤️ {reactions.likes}
            </button>
            <button onClick={() => handleReaction('dislike')} className="text-gray-400 hover:text-blue-500 text-xs">
              👎 {reactions.dislikes}
            </button>
          </div>
        </div>
        <div className="mt-2 flex space-x-3 text-xs text-gray-400">
          <button onClick={() => setReplyingTo(c)} className="hover:text-white font-semibold">Reply</button>
        </div>
        
        {/* Replies */}
        {comments.filter(reply => reply.parent_id === c.id).map(reply => (
          <div key={reply.id} className="mt-2 ml-4 pl-3 border-l border-gray-600">
            <p className="text-xs text-gray-400 font-medium">{reply.user_name || `User ${reply.user_id.substring(0, 5)}`}</p>
            <p className="text-sm text-gray-200 mt-1">{reply.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-1/4 bg-gray-900 rounded-t-3xl shadow-2xl z-50 flex flex-col transition-transform transform translate-y-0">
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white">
          Comments <span className="text-sm font-normal text-gray-400 ml-1">{comments.length}</span>
        </h3>
        <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-white">
          ✕
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <p className="text-gray-400 text-center mt-4">Loading comments...</p>}
        {!loading && comments.length === 0 && <p className="text-gray-400 text-center mt-4">Be the first to comment!</p>}
        {comments.filter(c => !c.parent_id).map((c) => (
          <CommentItem key={c.id} c={c} />
        ))}
      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-800">
        {replyingTo && (
          <div className="mb-2 flex justify-between items-center text-xs text-gray-400 bg-gray-800 p-2 rounded">
            <span>Replying to {replyingTo.user_name || `User ${replyingTo.user_id.substring(0,5)}`}</span>
            <button onClick={() => setReplyingTo(null)} className="hover:text-white">Cancel</button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-3 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
          />
          <button
            onClick={submitComment}
            disabled={!newComment.trim()}
            className="p-3 bg-red-600 rounded-full text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ↗
          </button>
        </div>
      </div>
    </div>
  );
}
