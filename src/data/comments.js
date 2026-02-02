import { supabase } from '../lib/supabase';

export const getComments = async (poemId) => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('poem_id', poemId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return data;
};

export const addComment = async (poemId, comment) => {
    // 1. Add comment to comments table
    const { data, error } = await supabase
        .from('comments')
        .insert([{
            poem_id: poemId,
            ...comment
        }])
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        throw error;
    }

    // 2. Increment comment count in poems table (client-side approximation for now, idealized triggers would handle this)
    // We fetch the current poem to get the count, then update it. 
    // Ideally this should be a stored procedure or trigger to be atomic.
    // For this simple app, we'll try to update it directly.
    try {
        const { data: poem } = await supabase
            .from('poems')
            .select('comments')
            .eq('id', poemId)
            .single();

        if (poem) {
            await supabase
                .from('poems')
                .update({ comments: (poem.comments || 0) + 1 })
                .eq('id', poemId);
        }
    } catch (err) {
        console.error('Error updating comment count:', err);
    }

    return data;
};

export const deleteComment = async (commentId, poemId, password) => {
    // 1. Verify password (simple client-side check logic requires fetching first, 
    // but better to just try delete with eq filter if we trust client, 
    // BUT we need to check password. 
    // So we fetch, check, then delete.)

    // Fetch comment to check password
    const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('password')
        .eq('id', commentId)
        .single();

    if (fetchError || !comment) {
        throw new Error('Comment not found');
    }

    if (comment.password !== password) {
        throw new Error('Incorrect password');
    }

    // Delete
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        throw error;
    }

    // Decrement count
    try {
        const { data: poem } = await supabase
            .from('poems')
            .select('comments')
            .eq('id', poemId)
            .single();

        if (poem && poem.comments > 0) {
            await supabase
                .from('poems')
                .update({ comments: poem.comments - 1 })
                .eq('id', poemId);
        }
    } catch (err) {
        console.error('Error updating comment count:', err);
    }

    return true;
};
