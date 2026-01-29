import React, { useState } from 'react';
import { X, Lock, Trash2 } from 'lucide-react';
import '../styles/PasswordModal.css';

const PasswordModal = ({ isOpen, onClose, onConfirm, poemTitle }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password) {
            setError('비밀번호를 입력해주세요');
            return;
        }

        onConfirm(password, onError);
    };

    const onError = () => {
        setError('비밀번호가 일치하지 않습니다');
        setPassword('');
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>게시물 삭제</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-message">
                        정말로 <span className="highlight-text">"{poemTitle}"</span> 게시물을 삭제하시겠습니까?
                        삭제된 게시물은 복구할 수 없습니다.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className={`password-input-container ${error ? 'has-error' : ''}`}>
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                autoFocus
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={onClose}>
                                취소
                            </button>
                            <button type="submit" className="confirm-delete-btn">
                                <Trash2 size={18} />
                                <span>삭제하기</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;
