import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../data/comments';
import { MessageCircle, Trash2, Lock } from 'lucide-react';
import '../styles/CommentSection.css';

const CommentSection = ({ poemId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState({ author_name: '', password: '', content: '' });
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
        if (!newComment.author_name || !newComment.password || !newComment.content) {
            alert('닉네임, 비밀번호, 내용을 모두 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            await addComment(poemId, newComment);
            setNewComment({ author_name: '', password: '', content: '' });
            fetchComments(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('댓글 등록 중 오류가 발생했습니다.');
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
            alert(error.message || '댓글 삭제 중 오류가 발생했습니다.');
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
                댓글 ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="comment-form">
                <div className="comment-inputs">
                    <input
                        type="text"
                        name="author_name"
                        placeholder="닉네임"
                        value={newComment.author_name}
                        onChange={handleInputChange}
                        className="comment-input small"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        value={newComment.password}
                        onChange={handleInputChange}
                        className="comment-input small"
                    />
                </div>
                <textarea
                    name="content"
                    placeholder="따뜻한 감상을 남겨주세요..."
                    value={newComment.content}
                    onChange={handleInputChange}
                    className="comment-textarea"
                />
                <button type="submit" className="comment-submit-btn" disabled={submitting}>
                    {submitting ? '등록 중...' : '남기기'}
                </button>
            </form>

            {/* Comment List */}
            <div className="comment-list">
                {loading ? (
                    <p className="loading-text">댓글을 불러오는 중...</p>
                ) : comments.length === 0 ? (
                    <p className="empty-text">아직 남겨진 글이 없습니다. 가장 먼저 마음을 전해보세요.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-meta">
                                <span className="comment-author">{comment.author_name}</span>
                                <span className="comment-date">{formatDate(comment.created_at)}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>

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
                                        placeholder="비밀번호"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        className="delete-pw-input"
                                        autoFocus
                                    />
                                    <button onClick={handleDeleteConfirm} className="confirm-btn">확인</button>
                                    <button onClick={() => setDeleteId(null)} className="cancel-btn">취소</button>
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
