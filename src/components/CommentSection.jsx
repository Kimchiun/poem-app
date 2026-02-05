import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../data/comments';
import { MessageCircle, Trash2, Lock, Crown } from 'lucide-react';
import '../styles/CommentSection.css';

const CommentSection = ({ poemId, poemPassword }) => {
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

    // Author Verification
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyPassword, setVerifyPassword] = useState('');

    useEffect(() => {
        fetchComments();

        try {
            // Load local history to identify "My Comments"
            const savedMyComments = JSON.parse(localStorage.getItem('my_comments') || '[]');
            setMyCommentIds(new Set(Array.isArray(savedMyComments) ? savedMyComments : []));

            // Check if I am the owner of this poem (to see all secrets)
            const myPoems = JSON.parse(localStorage.getItem('my_poems') || '[]');
            const myPoemsArray = Array.isArray(myPoems) ? myPoems : [];

            if (myPoemsArray.includes(Number(poemId)) || myPoemsArray.includes(String(poemId))) {
                setIsPoemOwner(true);
            }
        } catch (e) {
            console.error("Error parsing local storage:", e);
            // Reset if corrupted
            localStorage.removeItem('my_comments');
            localStorage.removeItem('my_poems');
        }
    }, [poemId]);

    const fetchComments = async () => {
        try {
            const data = await getComments(poemId);
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAuthor = () => {
        // Assume poemPassword is passed as prop. 
        // Note: We need to make sure poemPassword is destructured from props.
        if (verifyPassword === poemPassword) {
            setIsPoemOwner(true);
            setIsVerifyModalOpen(false);
            setVerifyPassword('');

            // Update LocalStorage
            const myPoems = JSON.parse(localStorage.getItem('my_poems') || '[]');
            if (!myPoems.includes(Number(poemId))) {
                myPoems.push(Number(poemId));
                localStorage.setItem('my_poems', JSON.stringify(myPoems));
            }
            // alert('작가님 확인이 완료되었습니다.'); // Removed as per user request
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
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
            <div className="comment-header-row">
                <h3 className="comment-header-title">
                    <MessageCircle size={20} />
                    댓글 ({comments.length})
                </h3>
                {!isPoemOwner && (
                    <button
                        className="author-verify-btn"
                        onClick={() => setIsVerifyModalOpen(true)}
                        title="작가 인증"
                    >
                        <Crown size={16} />
                        <span>작가 인증</span>
                    </button>
                )}
                {isPoemOwner && (
                    <span className="author-badge">
                        <Crown size={14} />
                        <span>작가 확인됨</span>
                    </span>
                )}
            </div>

            {/* Author Verify Modal (Inline/Overlay) */}
            {isVerifyModalOpen && (
                <div className="verify-modal-overlay">
                    <div className="verify-modal glass-panel">
                        <div className="modal-icon">
                            <Crown size={32} />
                        </div>
                        <h4>작가 인증</h4>
                        <p>작가님 본인 확인을 위해<br />설정하신 비밀번호를 입력해주세요.</p>
                        <input
                            type="password"
                            placeholder="비밀번호 입력"
                            value={verifyPassword}
                            onChange={(e) => setVerifyPassword(e.target.value)}
                            className="verify-input"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyAuthor()}
                        />
                        <div className="verify-buttons">
                            <button onClick={() => setIsVerifyModalOpen(false)} className="glass-btn cancel">취소</button>
                            <button onClick={handleVerifyAuthor} className="glass-btn confirm">인증하기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comment Form - Glass Postcard Design */}
            <form onSubmit={handleSubmit} className="comment-form-glass">

                {/* 1. Header: Inputs */}
                <div className="form-header">
                    <div className="input-group">
                        <input
                            type="text"
                            name="author_name"
                            placeholder="닉네임"
                            value={newComment.author_name}
                            onChange={handleInputChange}
                            className="glass-input"
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            value={newComment.password}
                            onChange={handleInputChange}
                            className="glass-input"
                        />
                    </div>
                </div>

                {/* 2. Body: Textarea */}
                <div className={`form-body ${isSecret ? 'secret-active' : ''}`}>
                    <textarea
                        name="content"
                        placeholder={isSecret ? "달에게만 들려줄 비밀 이야기를 적어보세요..." : "이 시에 대한 따뜻한 감상을 남겨주세요."}
                        value={newComment.content}
                        onChange={handleInputChange}
                        className="glass-textarea"
                    />
                </div>

                {/* 3. Footer: Actions */}
                <div className="form-footer">
                    {/* Secret Toggle Switch */}
                    <div className="secret-toggle-wrapper" onClick={() => setIsSecret(!isSecret)}>
                        <div className={`toggle-switch ${isSecret ? 'on' : 'off'}`}>
                            <div className="toggle-handle"></div>
                        </div>
                        <span className={`toggle-label ${isSecret ? 'active' : ''}`}>
                            {isSecret ? '비밀 이야기 ON' : '비밀 이야기 OFF'}
                        </span>
                        {isSecret && <Lock size={14} className="secret-icon-indicator" />}
                    </div>

                    <button type="submit" className="glass-submit-btn" disabled={submitting}>
                        {submitting ? '저장 중...' : '남기기'}
                    </button>
                </div>
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
                                ) : unlockId === comment.id ? (
                                    <div className="secret-inline-verify">
                                        <input
                                            type="password"
                                            placeholder="비밀번호"
                                            value={unlockPassword}
                                            onChange={(e) => setUnlockPassword(e.target.value)}
                                            className="inline-pw-input"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleUnlockConfirm()}
                                        />
                                        <div className="inline-actions">
                                            <button onClick={handleUnlockConfirm} className="icon-btn confirm">
                                                <span>✓</span>
                                            </button>
                                            <button onClick={() => { setUnlockId(null); setUnlockPassword(''); }} className="icon-btn cancel">
                                                <span>✕</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="secret-placeholder" onClick={() => setUnlockId(comment.id)}>
                                        <Lock size={16} />
                                        <span>비밀 댓글입니다.</span>
                                    </div>
                                )}

                                {/* Actions (Delete) */}
                                {!unlockId && (
                                    <button
                                        className="comment-delete-btn"
                                        onClick={() => handleDeleteClick(comment.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}

                                {/* Delete Confirmation (Inline) */}
                                {deleteId === comment.id && !isVisible && unlockId !== comment.id && (
                                    <div className="secret-inline-verify delete-mode">
                                        <span className="inline-label">삭제:</span>
                                        <input
                                            type="password"
                                            placeholder="비밀번호"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            className="inline-pw-input"
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleDeleteConfirm()}
                                        />
                                        <div className="inline-actions">
                                            <button onClick={handleDeleteConfirm} className="icon-btn delete">
                                                <span>✓</span>
                                            </button>
                                            <button onClick={() => setDeleteId(null)} className="icon-btn cancel">
                                                <span>✕</span>
                                            </button>
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
