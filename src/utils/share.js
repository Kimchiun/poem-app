export const shareContent = async (title, text, url) => {
    // 1. Try Native Share API (Mobile)
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: text,
                url: url,
            });
            return { success: true, method: 'native' };
        } catch (error) {
            console.error('Error sharing:', error);
            // User cancelled or share failed, might want to fallback or just return
            return { success: false, error };
        }
    }

    // 2. Fallback to Clipboard (Desktop)
    try {
        await navigator.clipboard.writeText(url);
        return { success: true, method: 'clipboard' };
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return { success: false, error };
    }
};
