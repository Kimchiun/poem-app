import React, { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../data/comments';
import { MessageCircle, Trash2, Lock, Crown, Check, X } from 'lucide-react';
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

        // Load local history to identify "My Comments"
        const savedMyComments = JSON.parse(localStorage.getItem('my_comments') || '[]');
        setMyCommentIds(new Set(savedMyComments));

        // Check if I am the owner of this poem (to see all secrets)
        const myPoems = JSON.parse(localStorage.getItem('my_poems') || '[]'); // Assuming we store created poem IDs
        if (myPoems.includes(Number(poemId)) || myPoems.includes(String(poemId))) {
            setIsPoemOwner(true);
        }
    }, [poemId]);

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
            alert('작가님 확인이 완료되었습니다.');
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    // ... (rest of functions)

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
                    <div className="verify-modal">
                        <h4>작가 확인</h4>
                        <p>작품 삭제 비밀번호를 입력해주세요.</p>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={verifyPassword}
                            onChange={(e) => setVerifyPassword(e.target.value)}
                            className="verify-input"
                            autoFocus
                        />
                        <div className="verify-buttons">
                            <button onClick={handleVerifyAuthor} className="glass-submit-btn small">확인</button>
                            <button onClick={() => setIsVerifyModalOpen(false)} className="cancel-btn">취소</button>
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
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => { setUnlockId(null); setUnlockPassword(''); }} className="icon-btn cancel">
                                                <X size={18} />
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
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => setDeleteId(null)} className="icon-btn cancel">
                                                <X size={18} />
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
