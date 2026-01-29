import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, X, Lock } from 'lucide-react';
import { addPoem } from '../data/poems';
import '../styles/Upload.css';

const Upload = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!title || !text || !image || !password) {
            alert('모든 필드를 입력하고 이미지를 추가해주세요 (비밀번호 포함).');
            return;
        }

        setLoading(true);
        try {
            const newPoem = {
                title,
                text,
                password,
                image, // Base64 string for now, could be uploaded to Storage later
                author: "chiun" // Or dynamic user
            };

            await addPoem(newPoem);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-page animate-fade-in">
            <h1 className="page-title">Create Poem</h1>

            <div className="upload-form">
                <div className="image-upload-area">
                    {image ? (
                        <div className="image-preview">
                            <img src={image} alt="Preview" />
                            <button className="remove-image" onClick={() => { setImage(null); setImageFile(null); }}>
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <label className="upload-placeholder">
                            <ImageIcon size={48} />
                            <span>Add an atmospheric image</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                        </label>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Title of your masterpiece"
                        className="input-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="form-group password-group">
                    <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Set a secret key (to delete later)"
                            className="input-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <textarea
                        placeholder="Pour your heart out..."
                        className="input-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={8}
                    />
                </div>

                <button className="submit-btn" onClick={handleSubmit}>
                    Publish Poem
                </button>
            </div>
        </div>
    );
};

export default Upload;
