
import { supabase } from '../lib/supabase';

// Helper to format Supabase date to display format
const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
};

export const getPoems = async (page = 0, limit = 2) => {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('poems')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching poems:', error);
        return [];
    }

    return data.map(poem => ({
        ...poem,
        date: formatDate(poem.created_at)
    }));
};

export const getPoemById = async (id) => {
    const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching poem:', error);
        return null;
    }

    return {
        ...data,
        date: formatDate(data.created_at)
    };
};

export const addPoem = async (poem) => {
    // Exclude id (let DB generate it) and date (let DB handle created_at)
    const { id, date, ...poemData } = poem;

    const { data, error } = await supabase
        .from('poems')
        .insert([poemData])
        .select();

    if (error) {
        console.error('Error adding poem:', error);
        throw error;
    }

    return data[0];
};

export const deletePoem = async (id) => {
    const { error } = await supabase
        .from('poems')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting poem:', error);
        throw error;
    }

    return true;
};

export const toggleLike = async (id, isLiking) => {
    // 1. Get current likes
    const { data: poem, error: fetchError } = await supabase
        .from('poems')
        .select('likes')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching poem for like:', fetchError);
        throw fetchError;
    }

    // 2. Calculate new likes
    // Ensure we don't go below 0
    const currentLikes = poem.likes || 0;
    const newLikes = isLiking ? currentLikes + 1 : Math.max(currentLikes - 1, 0);

    // 3. Update
    const { data, error } = await supabase
        .from('poems')
        .update({ likes: newLikes })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error toggling like:', error);
        throw error;
    }

    return data.likes;
};

export const getPoemsByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];

    const { data, error } = await supabase
        .from('poems')
        .select('*')
        .in('id', ids)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching liked poems:', error);
        return [];
    }

    return data.map(poem => ({
        ...poem,
        date: formatDate(poem.created_at)
    }));
};
