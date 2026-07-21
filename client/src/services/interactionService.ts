import { supabase } from '@/lib/supabaseclient';

export const interactionService = {
  // --- LIKES ---
  toggleLike: async (userId: string, itemId: string, itemType: 'movie' | 'tvshow' | 'feed') => {
    // Check if like exists
    const { data: existingLike, error: fetchError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message || 'Error fetching');

    if (existingLike) {
      // Remove like
      const { error } = await supabase.from('likes').delete().eq('id', existingLike.id);
      if (error) throw new Error(error.message || 'Error');
      return { action: 'removed' };
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert([{ user_id: userId, item_id: itemId, item_type: itemType }]);
      if (error) throw new Error(error.message || 'Error');
      return { action: 'added' };
    }
  },

  getLikesCount: async (itemId: string, itemType: 'movie' | 'tvshow' | 'feed') => {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId)
      .eq('item_type', itemType);

    if (error) throw new Error(error.message || 'Error');
    return count || 0;
  },

  getUserLikeStatus: async (userId: string | undefined, itemId: string, itemType: 'movie' | 'tvshow' | 'feed') => {
    if (!userId) return false;
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle();
      
    if (error) throw new Error(error.message || 'Error');
    return !!data;
  },

  // --- COMMENTS ---
  getComments: async (itemId: string, itemType: 'movie' | 'tvshow' | 'feed') => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, user_id, user_name, item_id, item_type, content, parent_id, created_at')
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching comments:', error.message);
      return [];
    }
    return data || [];
  },

  addComment: async (userId: string, userName: string, itemId: string, itemType: 'movie' | 'tvshow' | 'feed', content: string, parentId?: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        user_id: userId,
        user_name: userName,
        item_id: itemId,
        item_type: itemType,
        content,
        parent_id: parentId || null
      }])
      .select();

    if (error) throw new Error(error.message || 'Error');
    return data;
  },

  // --- COMMENT REACTIONS ---
  toggleCommentReaction: async (userId: string, commentId: string, reactionType: 'like' | 'dislike') => {
    const { data: existingReaction, error: fetchError } = await supabase
      .from('comment_reactions')
      .select('id, reaction_type')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message || 'Error fetching');

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Remove reaction
        const { error } = await supabase.from('comment_reactions').delete().eq('id', existingReaction.id);
        if (error) throw new Error(error.message || 'Error');
        return { action: 'removed' };
      } else {
        // Change reaction
        const { error } = await supabase
          .from('comment_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);
        if (error) throw new Error(error.message || 'Error');
        return { action: 'changed' };
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('comment_reactions')
        .insert([{ user_id: userId, comment_id: commentId, reaction_type: reactionType }]);
      if (error) throw new Error(error.message || 'Error');
      return { action: 'added' };
    }
  },

  getCommentReactions: async (commentId: string) => {
    const { data, error } = await supabase
      .from('comment_reactions')
      .select('reaction_type')
      .eq('comment_id', commentId);

    if (error) throw new Error(error.message || 'Error');

    let likes = 0;
    let dislikes = 0;
    
    if (data) {
      data.forEach((r: any) => {
        if (r.reaction_type === 'like') likes++;
        if (r.reaction_type === 'dislike') dislikes++;
      });
    }
    
    return { likes, dislikes };
  }
};
