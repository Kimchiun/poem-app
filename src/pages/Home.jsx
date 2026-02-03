import React, { useState, useEffect } from 'react';
import PoemCard from '../components/PoemCard';
import PasswordModal from '../components/PasswordModal';
import { getPoems, deletePoem } from '../data/poems';
import '../styles/Home.css';

const Home = () => {
    const [poems, setPoems] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = React.useRef(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPoem, setSelectedPoem] = useState(null);

    const fetchPoems = async (pageNum) => {
        if (loading) return;
        setLoading(true);
        try {
            const newPoems = await getPoems(pageNum, 2);
            if (newPoems.length === 0) {
                setHasMore(false);
            } else {
                setPoems(prev => {
                    // Prevent duplicates just in case
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewPoems = newPoems.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNewPoems];
                });
            }
        } catch (error) {
            console.error("Failed to fetch poems", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPoems(0);
    }, []);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prevPage => {
                        const nextPage = prevPage + 1;
                        fetchPoems(nextPage);
                        return nextPage;
                    });
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading]);

    const handleDeleteClick = (poem) => {
        setSelectedPoem(poem);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (password, onError) => {
        if (password === selectedPoem.password) {
            await deletePoem(selectedPoem.id);
            // Refresh list
            // Refresh list - Reset to first page
            setPage(0);
            setPoems([]);
            setHasMore(true);
            fetchPoems(0);

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

                {/* Sentinel element for Infinite Scroll */}
                <div ref={observerTarget} className="loading-sentinel">
                    {!hasMore && poems.length > 0 && <div className="feed-end">모든 별을 다 보았습니다. 🌌</div>}
                </div>
            </div>

            {/* Global Full-screen Loader */}
            {loading && (
                <div className="loading-container">
                    <div className="star">✨</div>
                    <p className="loading-text">별들을 모으는 중...</p>
                </div>
            )}

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
