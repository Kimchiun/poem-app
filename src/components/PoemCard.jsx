import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, MessageCircle, Trash2 } from 'lucide-react';
import { shareContent } from '../utils/share';
import '../styles/PoemCard.css';

const PoemCard = ({ poem, onDelete }) => {
    const [likes, setLikes] = React.useState(poem.likes);
    const [isLiked, setIsLiked] = React.useState(false);

    React.useEffect(() => {
        const likedPoems = JSON.parse(localStorage.getItem('liked_poems') || '[]');
        if (likedPoems.includes(poem.id)) {
            setIsLiked(true);
        }
        setLikes(poem.likes); // Sync with prop updates
    }, [poem.id, poem.likes]);

    const handleLike = async (e) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        const newIsLiked = !isLiked;
        const newLikes = newIsLiked ? likes + 1 : Math.max(0, likes - 1);

        // Optimistic UI update
        setIsLiked(newIsLiked);
        setLikes(newLikes);

        // Update LocalStorage
        const likedPoems = JSON.parse(localStorage.getItem('liked_poems') || '[]');
        let updatedLikedPoems;
        if (newIsLiked) {
            updatedLikedPoems = [...likedPoems, poem.id];
        } else {
            updatedLikedPoems = likedPoems.filter(id => id !== poem.id);
        }
        localStorage.setItem('liked_poems', JSON.stringify(updatedLikedPoems));

        // API Call (Fire and forget, or handle error)
        try {
            await import('../data/poems').then(mod => mod.toggleLike(poem.id, newIsLiked));
        } catch (error) {
            console.error('Failed to update like', error);
            // Revert on error (optional, keeping it simple for now)
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click

        const shareUrl = `${window.location.origin}/poem/${poem.id}`;
        const result = await shareContent(poem.title, `Read "${poem.title}" by ${poem.author}`, shareUrl);

        if (result.success && result.method === 'clipboard') {
            alert('링크가 복사되었습니다!');
        }
    };

    return (
        <Link to={`/poem/${poem.id}`} className="poem-card animate-fade-in">
            <div className="poem-image-container">
                <img src={poem.image} alt="Poem visual" className="poem-image" />
                <div className="poem-overlay"></div>
            </div>

            <div className="poem-content">
                <div className="poem-header">
                    <div className="author-info">
                        <div className="author-avatar">{poem.author[0]}</div>
                        <span className="author-name">{poem.author}</span>
                    </div>
                    <span className="poem-date">{poem.date}</span>
                </div>

                <div className="poem-body">
                    <h3 className="poem-title">{poem.title}</h3>
                    <p className="poem-text">{poem.text}</p>
                </div>

                <div className="poem-footer">
                    <button
                        className={`action-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        <span>{likes}</span>
                    </button>
                    <button className="action-btn" onClick={(e) => e.preventDefault()}>
                        <MessageCircle size={20} />
                        <span>{poem.comments}</span>
                    </button>
                    <button className="action-btn ml-auto" onClick={handleShare}>
                        <Share2 size={20} />
                    </button>
                    <button className="action-btn delete-btn" onClick={(e) => {
                        e.preventDefault();
                        onDelete(poem);
                    }}>
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default PoemCard;
