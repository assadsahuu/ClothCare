import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, Modal, TextInput, Textarea } from 'flowbite-react';
import '../css/home.css';

function YourServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/shop/getmyservices/${currentUser._id}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setServices(data);
            } catch (err) {
                setError(err.message || 'Error fetching services');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser._id) {
            fetchServices();
        }
    }, [currentUser._id]);

    const handleEditClick = (service) => {
        setCurrentService(service);
        setEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditModalOpen(false);
        setCurrentService(null);
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch(`/api/shop/updateservice/${currentService._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentService),
            });

            if (!response.ok) {
                throw new Error('Failed to update service');
            }

            // Update services list with new details
            setServices((prevServices) =>
                prevServices.map((service) =>
                    service._id === currentService._id ? currentService : service
                )
            );

            handleCloseModal();
        } catch (err) {
            console.error(err.message);
            alert('Failed to update service');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentService((prev) => ({ ...prev, [name]: value }));
    };

    if (!currentUser._id) return <div>Please log in to view your services.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const rating = 3;
    const totalStars = 5;

    return (
        <>
            <div className="services-container">
                <h2>Services for Shop: {currentUser.name || 'Unnamed Shop'}</h2>
                {services.length === 0 ? (
                    <p>No services available for this shop.</p>
                ) : (
                    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 services-list">
                        {services.map((service, index) => (
                            <li
                                key={index}
                                className="service-item flex flex-col justify-between rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                <Card className="h-full w-full flex flex-col">
                                    <a href="#">
                                        <img
                                            src={service.itemPicture}
                                            alt={service.service_name}
                                            className="h-48 w-full overflow-hidden rounded-lg"
                                        />
                                    </a>
                                    <div className="p-4">
                                        <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                            {service.service_name}
                                        </h5>
                                        <p className="tracking-tight text-gray-900 dark:text-white">
                                            {service.description}
                                        </p>

                                        <div className="mb-5 mt-2.5 flex items-center">
                                            {Array.from({ length: totalStars }).map((_, index) => (
                                                <svg
                                                    key={index}
                                                    className={`h-5 w-5 ${
                                                        index < rating
                                                            ? 'text-yellow-300'
                                                            : 'text-gray-300'
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="ml-3 mr-2 rounded bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-200 dark:text-cyan-800">
                                                {rating}.0
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                ${service.price}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                                <Button onClick={() => handleEditClick(service)}>Edit</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <Modal show={isEditModalOpen} onClose={handleCloseModal}>
                    <Modal.Header>Edit Service</Modal.Header>
                    <Modal.Body>
                        <div>
                            <TextInput
                                label="Name"
                                name="service_name"
                                value={currentService.service_name}
                                onChange={handleChange}
                            />
                            <Textarea
                                label="Description"
                                name="description"
                                value={currentService.description}
                                onChange={handleChange}
                            />
                            <TextInput
                                label="Price"
                                type="number"
                                name="price"
                                value={currentService.price}
                                onChange={handleChange}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleSaveChanges}>Save</Button>
                        <Button color="gray" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}

export default YourServices;
