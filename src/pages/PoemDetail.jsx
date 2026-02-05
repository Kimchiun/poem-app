import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import PasswordModal from '../components/PasswordModal';
import CommentSection from '../components/CommentSection';
import { getPoemById, deletePoem } from '../data/poems';
import { shareContent } from '../utils/share';
import '../styles/PoemDetail.css';

const PoemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poem, setPoem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (!poem) return;

        const likedPoems = JSON.parse(localStorage.getItem('liked_poems') || '[]');
        if (likedPoems.includes(poem.id)) {
            setIsLiked(true);
        }
        setLikes(poem.likes || 0);
    }, [poem]);

    const handleLike = async () => {
        if (!poem) return;

        const newIsLiked = !isLiked;
        const newLikes = newIsLiked ? likes + 1 : Math.max(0, likes - 1);

        setIsLiked(newIsLiked);
        setLikes(newLikes);

        const likedPoems = JSON.parse(localStorage.getItem('liked_poems') || '[]');
        let updatedLikedPoems;
        if (newIsLiked) {
            updatedLikedPoems = [...likedPoems, poem.id];
        } else {
            updatedLikedPoems = likedPoems.filter(id => id !== poem.id);
        }
        localStorage.setItem('liked_poems', JSON.stringify(updatedLikedPoems));

        try {
            await import('../data/poems').then(mod => mod.toggleLike(poem.id, newIsLiked));
        } catch (error) {
            console.error('Failed to update like', error);
        }
    };

    useEffect(() => {
        const fetchPoem = async () => {
            const foundPoem = await getPoemById(id);
            setPoem(foundPoem);
            setLoading(false);
        };
        fetchPoem();
    }, [id]);

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (password, onError) => {
        if (password === poem.password) {
            await deletePoem(id);
            navigate('/');
        } else {
            onError();
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const result = await shareContent(poem.title, `Read "${poem.title}" by ${poem.author}`, shareUrl);

        if (result.success && result.method === 'clipboard') {
            alert('링크가 복사되었습니다!');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="star">✨</div>
                <p className="loading-text">별들을 모으는 중...</p>
            </div>
        );
    }

    if (!poem) {
        return (
            <div className="poem-not-found">
                <h2>시를 찾을 수 없습니다</h2>
                <Link to="/" className="back-link">홈으로 돌아가기</Link>
            </div>
        );
    }

    const isOwner = poem.author === 'chiun';



    return (
        <div className="poem-detail-page animate-fade-in">
            <Link to="/" className="back-button">
                <ArrowLeft size={24} />
            </Link>

            <div className="detail-container">
                <div className="detail-image-wrapper">
                    <img src={poem.image} alt={poem.title} className="detail-image" />
                    <div className="detail-overlay"></div>
                </div>

                <div className="detail-content">
                    <div className="detail-header">
                        <h1 className="detail-title">{poem.title}</h1>
                        <div className="detail-meta">
                            <div className="detail-author">
                                <div className="author-avatar large">{poem.author[0]}</div>
                                <span className="author-name">{poem.author}</span>
                            </div>
                            <span className="detail-date">{poem.date}</span>
                        </div>
                    </div>

                    <div className="detail-body">
                        <p className="detail-text">{poem.text}</p>
                    </div>

                    <div className="detail-actions">
                        <button
                            className={`action-btn large ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                        >
                            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                            <span>{likes}</span>
                        </button>
                        <button className="action-btn large">
                            <MessageCircle size={24} />
                            <span>{poem.comments}</span>
                        </button>
                        <button className="action-btn large ml-auto" onClick={handleShare}>
                            <Share2 size={24} />
                        </button>
                        {isOwner && (
                            <button className="action-btn large delete-btn" onClick={handleDeleteClick}>
                                <Trash2 size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <CommentSection poemId={id} poemPassword={poem.password} />

            <PasswordModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                poemTitle={poem.title}
            />
        </div >
    );
};

export default PoemDetail;
