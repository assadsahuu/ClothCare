import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useSelector } from 'react-redux';

const Reviews = () => {
    const currentUser = useSelector(state => state.user.currentUser);
    const [shopData, setShopData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [allRatings, setAllRatings] = useState([]);

    useEffect(() =>{
        const fetchShopData = () => {
            try {
                const db = getDatabase();
                const shopRef = ref(db, `SHOPS/${currentUser.uid}`);

                const unsubscribe = onValue(shopRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setShopData(data);
                        if (data.rating) {
                            const ratingsArray = Object.values(data.rating);
                            setAllRatings(ratingsArray);
                        }
                    } else {
                        setError('Shop not found');
                    }
                    setLoading(false);
                }, (error) => {
                    setError(error.message);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchShopData();
    }, [currentUser.uid]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <span key={index} className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}>
                ★
            </span>
        ));
    };

    const handleRatingFilter = (rating) => {
        setSelectedRating(selectedRating === rating ? null : rating);
    };

    const filteredRatings = selectedRating
        ? allRatings.filter(review => review.rate === selectedRating)
        : allRatings;

    if (loading) {
        return <div className="p-4 text-gray-500 dark:text-gray-400">Loading shop ratings...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 dark:text-red-400">Error: {error}</div>;
    }

    if (!shopData || !shopData.rating || allRatings.length === 0) {
        return <div className="p-4 text-gray-500 dark:text-gray-400">No ratings found for this shop</div>;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{shopData.name}</h1>
                <div className="mt-2 flex items-center">
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {shopData.ratings?.toFixed(1)}
                    </span>
                    <div className="ml-2">
                        {renderStars(Math.round(shopData.ratings || 0))}
                    </div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                        ({allRatings.length} reviews)
                    </span>
                </div>
                <div className="mt-4"> 
                    <h1>Filters</h1>
                </div>
            </div>

            {/* Rating Filter Buttons */}
            <div className="mb-6 flex flex-wrap gap-2">

                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => handleRatingFilter(rating)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center ${selectedRating === rating
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {renderStars(rating)}
                        <span className="ml-1">
                            ({allRatings.filter(r => r.rate === rating).length})
                        </span>
                    </button>
                ))}
                {selectedRating && (
                    <button
                        onClick={() => setSelectedRating(null)}
                        className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        Clear filter
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {filteredRatings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No reviews match the selected filter
                    </div>
                ) : (
                    filteredRatings.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    {renderStars(review.rate)}
                                    <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">
                                        ({review.rate}/5)
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                                {review.description}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;