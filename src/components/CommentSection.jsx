import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../data/comments';
import { MessageCircle, Trash2, Lock } from 'lucide-react';
import '../styles/CommentSection.css';

const CommentSection = ({ poemId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState({ author_name: '', password: '', content: '' });
    const [isSecret, setIsSecret] = useState(false); // New state for secret toggle
    const [submitting, setSubmitting] = useState(false);

    // Deletion states
    const [deleteId, setDeleteId] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');

    // Unlock states
    const [unlockId, setUnlockId] = useState(null);
    const [unlockPassword, setUnlockPassword] = useState('');
    const [unlockedIds, setUnlockedIds] = useState(new Set()); // IDs unlocked in this session
    const [myCommentIds, setMyCommentIds] = useState(new Set());
    const [isPoemOwner, setIsPoemOwner] = useState(false);

    useEffect(() => {
        fetchComments();

        // Load local history to identify "My Comments"
        const savedMyComments = JSON.parse(localStorage.getItem('my_comments') || '[]');
        setMyCommentIds(new Set(savedMyComments));

        // Check if I am the owner of this poem (to see all secrets)
        const myPoems = JSON.parse(localStorage.getItem('my_poems') || '[]'); // Assuming we store created poem IDs
        // Note: 'my_poems' might store full objects or IDs. Adjust based on app convention.
        // If my_poems stores IDs:
        if (myPoems.includes(Number(poemId)) || myPoems.includes(String(poemId))) {
            setIsPoemOwner(true);
        }
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
            const commentData = { ...newComment, is_secret: isSecret };
            const result = await addComment(poemId, commentData);

            // Save to "My Comments"
            if (result && result.id) {
                const updatedMyComments = [...Array.from(myCommentIds), result.id];
                localStorage.setItem('my_comments', JSON.stringify(updatedMyComments));
                setMyCommentIds(new Set(updatedMyComments));
            }

            setNewComment({ author_name: '', password: '', content: '' });
            setIsSecret(false);
            fetchComments();
        } catch (error) {
            console.error(error);
            alert('댓글 등록 중 오류가 발생했습니다. (is_secret 컬럼이 DB에 추가되었는지 확인해주세요)');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnlockConfirm = () => {
        const targetComment = comments.find(c => c.id === unlockId);
        if (targetComment && targetComment.password === unlockPassword) {
            setUnlockedIds(prev => new Set(prev).add(unlockId));
            setUnlockId(null);
            setUnlockPassword('');
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeletePassword('');
        setUnlockId(null); // Close unlock if open
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

    // Check visibility
    const canSeeComment = (comment) => {
        if (!comment.is_secret) return true; // Public
        if (isPoemOwner) return true; // Poem Owner
        if (myCommentIds.has(comment.id)) return true; // Comment Author (cached)
        if (unlockedIds.has(comment.id)) return true; // Temporarily unlocked
        return false;
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
                <div className="comment-options">
                    <button
                        type="button"
                        className={`secret-toggle-btn ${isSecret ? 'active' : ''}`}
                        onClick={() => setIsSecret(!isSecret)}
                    >
                        <Lock size={14} className="lock-icon" />
                        <span>비밀 이야기</span>
                    </button>
                </div>
                <textarea
                    name="content"
                    placeholder={isSecret ? "이 글은 작가님과 나만 볼 수 있어요. (비밀 이야기)" : "따뜻한 감상을 남겨주세요..."}
                    value={newComment.content}
                    onChange={handleInputChange}
                    className={`comment-textarea ${isSecret ? 'secret-mode' : ''}`}
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
                    comments.map(comment => {
                        const isVisible = canSeeComment(comment);

                        return (
                            <div key={comment.id} className={`comment-item ${comment.is_secret ? 'secret' : ''}`}>
                                <div className="comment-meta">
                                    <div className="author-wrapper">
                                        <span className="comment-author">{comment.author_name}</span>
                                        {comment.is_secret && <Lock size={12} className="meta-lock-icon" />}
                                    </div>
                                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                                </div>

                                {isVisible ? (
                                    <p className="comment-text">{comment.content}</p>
                                ) : (
                                    <div className="secret-placeholder" onClick={() => setUnlockId(comment.id)}>
                                        <Lock size={16} />
                                        <span>비밀 댓글입니다. (클릭하여 열기)</span>
                                    </div>
                                )}

                                {/* Actions (Delete) - Only show if visible or it's a secret placeholder (anyone can try to delete/unlock) */}
                                <button
                                    className="comment-delete-btn"
                                    onClick={() => handleDeleteClick(comment.id)}
                                >
                                    <Trash2 size={14} />
                                </button>

                                {/* Unlock Modal/Input (Inline) */}
                                {unlockId === comment.id && !isVisible && (
                                    <div className="comment-action-overlay">
                                        <p>비밀글 확인</p>
                                        <input
                                            type="password"
                                            placeholder="비밀번호 입력"
                                            value={unlockPassword}
                                            onChange={(e) => setUnlockPassword(e.target.value)}
                                            className="action-pw-input"
                                            autoFocus
                                        />
                                        <div className="overlay-buttons">
                                            <button onClick={handleUnlockConfirm} className="confirm-btn">확인</button>
                                            <button onClick={() => { setUnlockId(null); setUnlockPassword(''); }} className="cancel-btn">취소</button>
                                        </div>
                                    </div>
                                )}

                                {/* Delete Confirmation (Inline) */}
                                {deleteId === comment.id && (
                                    <div className="comment-action-overlay">
                                        <p>댓글 삭제</p>
                                        <input
                                            type="password"
                                            placeholder="비밀번호 입력"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            className="action-pw-input"
                                            autoFocus
                                        />
                                        <div className="overlay-buttons">
                                            <button onClick={handleDeleteConfirm} className="confirm-btn delete">삭제</button>
                                            <button onClick={() => setDeleteId(null)} className="cancel-btn">취소</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CommentSection;
