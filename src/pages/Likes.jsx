import React, { useState, useEffect } from 'react';
import PoemCard from '../components/PoemCard';
import { getPoemsByIds } from '../data/poems';
import { Heart } from 'lucide-react';
import '../styles/Home.css'; // Re-use Home styles for consistency

const Likes = () => {
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedPoems = async () => {
            const likedIds = JSON.parse(localStorage.getItem('liked_poems') || '[]');

            if (likedIds.length > 0) {
                const data = await getPoemsByIds(likedIds);
                setPoems(data);
            } else {
                setPoems([]);
            }
            setLoading(false);
        };
        fetchLikedPoems();
    }, []);

    // Empty state
    if (!loading && poems.length === 0) {
        return (
            <div className="home-page">
                <div className="feed-header">
                    <h1>Liked Poems</h1>
                </div>
                <div className="empty-state" style={{ textAlign: 'center', marginTop: '100px', opacity: 0.6 }}>
                    <Heart size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                    <p>아직 마음에 담은 시가 없네요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="feed-header">
                <h1>My Collection</h1>
            </div>

            <div className="feed-container">
                {poems.map(poem => (
                    <PoemCard key={poem.id} poem={poem} onDelete={() => { }} />
                ))}
            </div>

            {/* Add some bottom padding for the mobile nav */}
            <div style={{ height: '80px' }}></div>
        </div>
    );
};

export default Likes;
