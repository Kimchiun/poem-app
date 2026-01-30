import React, { useState, useEffect } from 'react';
import PoemCard from '../components/PoemCard';
import PasswordModal from '../components/PasswordModal';
import { getPoems, deletePoem } from '../data/poems';
import '../styles/Home.css';

const Home = () => {
    const [poems, setPoems] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPoem, setSelectedPoem] = useState(null);

    useEffect(() => {
        const fetchPoems = async () => {
            const data = await getPoems();
            setPoems(data);
        };
        fetchPoems();
    }, []);

    const handleDeleteClick = (poem) => {
        setSelectedPoem(poem);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (password, onError) => {
        if (password === selectedPoem.password) {
            await deletePoem(selectedPoem.id);
            // Refresh list
            const data = await getPoems();
            setPoems(data);
            setIsDeleteModalOpen(false);
            setSelectedPoem(null);
        } else {
            onError();
        }
    };

    return (
        <div className="home-page">
            <div className="feed-header">
                <h1>Discover</h1>
            </div>

            <div className="feed-container">
                {poems.map(poem => (
                    <PoemCard key={poem.id} poem={poem} onDelete={handleDeleteClick} />
                ))}
            </div>

            <PasswordModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                poemTitle={selectedPoem?.title}
            />
        </div>
    );
};

export default Home;
