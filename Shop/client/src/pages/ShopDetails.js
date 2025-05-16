import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card } from 'flowbite-react';
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

    const handleAddToCart = (service, serviceType) => {
        if (!currentUser) {
            alert("Please login to add to cart");
            return;
        }

        const cartItem = {
            ...service,
            serviceType,
            price: service.prices[serviceType],
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
                const shopRef = ref(db, `SHOPS/${shopId}/services`);
                const snapshot = await get(shopRef);

                if (snapshot.exists()) {
                    const servicesData = snapshot.val();
                    const transformedServices = [];

                    // Add null check for servicesData
                    if (servicesData) {
                        Object.entries(servicesData).forEach(([category, details]) => {
                            // Add null check for details
                            if (details) {
                                const { imagesUri, ...priceTypes } = details;

                                // Only process if there are price types
                                if (priceTypes && Object.keys(priceTypes).length > 0) {
                                    transformedServices.push({
                                        id: category,
                                        service_name: category,
                                        prices: priceTypes,
                                        itemPicture: imagesUri || 'default-image-url',
                                        category: category
                                    });
                                }
                            }
                        });
                    }

                    setServices(transformedServices);
                } else {
                    setServices([]);
                }
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
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 services-list">
                    {services.map((service) => (
                        <li key={service.id} className="service-item flex flex-col justify-between rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                            <Card className="h-full w-full flex flex-col">
                                <Link to="#">
                                    <img
                                        src={service.itemPicture}
                                        alt={service.service_name}
                                        className="h-48 w-full object-cover rounded-lg"
                                    />
                                </Link>
                                <div className="p-4">
                                    <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                                        {service.service_name}
                                    </h5>

                                    {Object.entries(service.prices).map(([serviceType, price]) => (
                                        <div key={serviceType} className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-300 capitalize">
                                                {serviceType}:
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Rs. {price}
                                                </span>
                                                <Button
                                                    pill
                                                    outline
                                                    size="xs"
                                                    onClick={() => handleAddToCart(service, serviceType)}
                                                >

                                                    Add to Cart
                                                </Button>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ShopDetails;