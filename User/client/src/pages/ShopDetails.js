import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import '../css/home.css';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';

function ShopDetails() {
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { shopId } = useParams();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [discountPercent, setDiscountPercent] = useState(0);

    const handleAddToCart = (service, serviceType) => {
        if (!currentUser) {
            alert("Please login to add to cart");
            return;
        }

        const discountedPrice = service.prices[serviceType].discountedPrice;

        const cartItem = {
            ...service,
            serviceType,
            price: discountedPrice,
            id: `${shopId}-${service.category}-${serviceType}`,
            shopId: shopId,
            user: currentUser.uid,
        };

        dispatch(addToCart(cartItem));
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);

                const shopRef = ref(db, `SHOPS/${shopId}`);
                const snapshot = await get(shopRef);

                if (!snapshot.exists()) {
                    setServices([]);
                    setLoading(false);
                    return;
                }

                const shopData = snapshot.val();
                const promotion = shopData.promotion;
                const discount = promotion?.percentage || 0;
                setDiscountPercent(discount);

                const servicesData = shopData.services;
                const transformedServices = [];

                if (servicesData) {
                    Object.entries(servicesData).forEach(([category, details]) => {
                        if (details) {
                            const { imagesUri, ...priceTypes } = details;
                            const prices = {};

                            Object.entries(priceTypes).forEach(([type, price]) => {
                                const originalPrice = Number(price);
                                const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
                                prices[type] = {
                                    originalPrice,
                                    discountedPrice,
                                };
                            });

                            transformedServices.push({
                                id: category,
                                service_name: category,
                                prices,
                                itemPicture: imagesUri || 'default-image-url',
                                category: category
                            });
                        }
                    });
                }

                setServices(transformedServices);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (shopId) fetchServices();
    }, [shopId]);

    if (!shopId) return <div>Shop ID not received.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="pr-4 pl-4 pb-4 pt-4 services-container">
            {services.length === 0 ? (
                <p>No services available for this shop.</p>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4 sm:px-0">
                    {services.map((service) => (
                        <li
                            key={service.id}
                            className="group relative transition-transform duration-200 hover:scale-[1.02]"
                        >
                            <div className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-lg dark:bg-gray-800 transition-shadow duration-200">
                                <Link to="#" className="block relative overflow-hidden aspect-square">
                                    <img
                                        src={service.itemPicture}
                                        alt={service.service_name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = '/fallback-image.jpg';
                                        }}
                                    />
                                </Link>

                                <div className="flex-1 p-4 md:p-5">
                                    <h3 className="mb-3">
                                        <Link to="#" className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                            {service.service_name}
                                        </Link>
                                    </h3>

                                    <div className="space-y-3">
                                        {Object.entries(service.prices).map(([serviceType, priceObj]) => (
                                            <div
                                                key={serviceType}
                                                className="flex flex-wrap justify-between items-center gap-2"
                                            >
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                                                    {serviceType}
                                                </span>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        {priceObj.discountedPrice < priceObj.originalPrice && (
                                                            <span className="text-sm line-through text-red-500">
                                                                RS. {priceObj.originalPrice.toLocaleString()}
                                                            </span>
                                                        )}
                                                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                                                            RS. {priceObj.discountedPrice.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <button
                                                    outline
                                                    pill
                                                        onClick={() => handleAddToCart(service, serviceType)}
                                                        className=" border border-primary-500/20 dark:border-primary-600/30 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-primary-600 hover:bg-primary-700 transition-all"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 mr-1.5 -ml-0.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ShopDetails;
