import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../data/comments';
import { MessageCircle, Trash2, Lock } from 'lucide-react';
import '../styles/CommentSection.css';

const CommentSection = ({ poemId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState({ author_name: '', password: '', text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        fetchComments();
    }, [poemId]);

    const fetchComments = async () => {
        const data = await getComments(poemId);
        setComments(data);
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewComment(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.author_name || !newComment.password || !newComment.text) {
            alert('Please fill in all fields (Name, Password, Comment).');
            return;
        }

        setSubmitting(true);
        try {
            await addComment(poemId, newComment);
            setNewComment({ author_name: '', password: '', text: '' });
            fetchComments(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Error adding comment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeletePassword('');
    };

    const handleDeleteConfirm = async () => {
        if (!deletePassword) return;

        try {
            await deleteComment(deleteId, poemId, deletePassword);
            setDeleteId(null);
            setDeletePassword('');
            fetchComments();
        } catch (error) {
            alert(error.message || 'Error deleting comment.');
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="comment-section">
            <h3 className="comment-header">
                <MessageCircle size={20} />
                Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="comment-form">
                <div className="comment-inputs">
                    <input
                        type="text"
                        name="author_name"
                        placeholder="Name"
                        value={newComment.author_name}
                        onChange={handleInputChange}
                        className="comment-input small"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={newComment.password}
                        onChange={handleInputChange}
                        className="comment-input small"
                    />
                </div>
                <textarea
                    name="text"
                    placeholder="Write a warm comment..."
                    value={newComment.text}
                    onChange={handleInputChange}
                    className="comment-textarea"
                />
                <button type="submit" className="comment-submit-btn" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Comment'}
                </button>
            </form>

            {/* Comment List */}
            <div className="comment-list">
                {loading ? (
                    <p className="loading-text">Loading thoughts...</p>
                ) : comments.length === 0 ? (
                    <p className="empty-text">No comments yet. Be the first to share your mind.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-meta">
                                <span className="comment-author">{comment.author_name}</span>
                                <span className="comment-date">{formatDate(comment.created_at)}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>

                            <button
                                className="comment-delete-btn"
                                onClick={() => handleDeleteClick(comment.id)}
                            >
                                <Trash2 size={14} />
                            </button>

                            {/* Inline Delete Confirmation */}
                            {deleteId === comment.id && (
                                <div className="comment-delete-confirm">
                                    <input
                                        type="password"
                                        placeholder="Enter PW"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="delete-pw-input"
                                        autoFocus
                                    />
                                    <button onClick={handleDeleteConfirm} className="confirm-btn">Confirm</button>
                                    <button onClick={() => setDeleteId(null)} className="cancel-btn">Cancel</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
