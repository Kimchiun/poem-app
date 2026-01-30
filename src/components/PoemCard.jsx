import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, MessageCircle, Trash2 } from 'lucide-react';
import { shareContent } from '../utils/share';
import '../styles/PoemCard.css';

const PoemCard = ({ poem, onDelete }) => {
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
                    <button className="action-btn" onClick={(e) => e.preventDefault()}>
                        <Heart size={20} />
                        <span>{poem.likes}</span>
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
