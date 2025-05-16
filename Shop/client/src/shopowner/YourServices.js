import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Card, Modal, TextInput, Label } from 'flowbite-react';
import { ref, get, update, remove } from 'firebase/database';
import { db } from '../firebase';
import '../css/home.css';

function YourServices() {
    const [services, setServices] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [currentServiceKey, setCurrentServiceKey] = useState(null);
    const { currentUser } = useSelector((state) => state.user);

    const fetchServices = async () => {
        if (!currentUser || !currentUser.uid) {
            setError("Please log in to view your services");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const servicesRef = ref(db, `SHOPS/${currentUser.uid}/services`);
            const snapshot = await get(servicesRef);

            if (snapshot.exists()) {
                setServices(snapshot.val());
            } else {
                setServices({});
            }
        } catch (err) {
            setError(err.message || 'Error fetching services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [currentUser]);

    const deleteService = async (serviceKey) => {
        if (!currentUser || !currentUser.uid) return;

        try {
            const serviceRef = ref(db, `SHOPS/${currentUser.uid}/services/${serviceKey}`);
            await remove(serviceRef);

            // Update local state to remove the service
            const updatedServices = { ...services };
            delete updatedServices[serviceKey];
            setServices(updatedServices);

        } catch (error) {
            console.error("Error deleting service:", error.message);
            setError("Failed to delete service. Please try again.");
        }
    };

    const handleEditClick = (service, serviceKey) => {
        setCurrentService(service);
        setCurrentServiceKey(serviceKey);
        setEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditModalOpen(false);
        setCurrentService(null);
        setCurrentServiceKey(null);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const priceFields = ['dryclean', 'iron', 'washing', 'washing_And_Iron'];

        setCurrentService((prev) => {
            // Only validate price fields
            if (priceFields.includes(id)) {
                // Allow empty value
                if (value === '') {
                    return { ...prev, [id]: '' };
                }

                // Validate numeric input with optional decimal
                if (!/^(\d+\.?\d*|\.\d+)$/.test(value)) {
                    return prev; // Reject invalid characters
                }

                // Prevent multiple decimal points
                if ((value.match(/\./g) || []).length > 1) {
                    return prev;
                }

                // Convert to number and validate positivity
                const numericValue = parseFloat(value);
                if (isNaN(numericValue)) return prev;
                if (numericValue < 0) return prev;

                // Allow temporary trailing decimal (e.g., "123.")
                if (value.endsWith('.') && !value.endsWith('..')) {
                    return { ...prev, [id]: value };
                }

                return { ...prev, [id]: numericValue };
            }

            // For non-price fields, update normally
            return { ...prev, [id]: value };
        });
    };

    const handleSaveChanges = async () => {
        if (!currentUser || !currentUser.uid || !currentServiceKey) return;

        try {
            const serviceRef = ref(db, `SHOPS/${currentUser.uid}/services/${currentServiceKey}`);
            const { key, ...serviceData } = currentService;
            await update(serviceRef, serviceData);

            // Update services list with new details
            setServices((prevServices) => ({
                ...prevServices,
                [currentServiceKey]: currentService
            }));

            handleCloseModal();
        } catch (err) {
            console.error(err.message);
            setError('Failed to update service');
        }
    };

    if (!currentUser || !currentUser.uid) return <div>Please log in to view your services.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const servicesArray = Object.entries(services).map(([key, service]) => ({ key, ...service }));

    return (
        <>
            <div className="p-4 services-container space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Services for Shop: {currentUser.name || 'Unnamed Shop'}</h2>
                {servicesArray.length === 0 ? (
                    <p>No services available for this shop.</p>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 services-list">
                        {servicesArray.map((item) => (
                            <li
                                key={item.key}
                                className="service-item flex flex-col justify-between rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
                            >
                                <Card className="h-full w-full flex flex-col">
                                    <div>
                                        <img
                                            src={item.imagesUri}
                                            alt={item.key}
                                            className="h-48 w-full object-cover rounded-t-lg"
                                        />
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
                                            {item.key}
                                        </h5>

                                        {item.dryclean && (
                                            <div className="flex justify-between mb-1">
                                                <span>Dry Clean:</span>
                                                <span className="font-medium">Rs. {item.dryclean}</span>
                                            </div>
                                        )}

                                        {item.iron && (
                                            <div className="flex justify-between mb-1">
                                                <span>Iron:</span>
                                                <span className="font-medium">Rs. {item.iron}</span>
                                            </div>
                                        )}

                                        {item.washing && (
                                            <div className="flex justify-between mb-1">
                                                <span>washing: </span>
                                                <span className="font-medium">Rs. {item.washing}</span>
                                            </div>
                                        )}
                                        {item.washing_And_Iron && (
                                            <div className="flex justify-between mb-1">
                                                <span>washing_And_Iron: </span>
                                                <span className="font-medium">Rs. {item.washing_And_Iron}</span>
                                            </div>
                                        )}


                                    </div>
                                    <div className="flex gap-2 p-4 mt-auto">
                                        <Button outline pill className="flex-1" onClick={() => handleEditClick(item, item.key)}>
                                            Edit
                                        </Button>
                                        <Button pill outline className="flex-1" color="failure" onClick={() => deleteService(item.key)}>
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && currentService && (
                <Modal show={isEditModalOpen} onClose={handleCloseModal}>
                    <Modal.Header>Edit Service: {currentServiceKey}</Modal.Header>
                    <Modal.Body>
                        <div className="space-y-4">
                            {/* Service prices */}
                            <div>
                                <Label htmlFor="dryclean" value="Dry Clean Price" />
                                <TextInput
                                    id="dryclean"
                                    type="number"
                                    min={0}
                                    value={currentService.dryclean || ''}
                                    onChange={handleChange}
                                    placeholder="Enter dry clean price"
                                />
                            </div>

                            <div>
                                <Label htmlFor="iron" value="Iron Price" />
                                <TextInput
                                    id="iron"
                                    type="number"
                                    min={0}
                                    value={currentService.iron || ''}
                                    onChange={handleChange}
                                    placeholder="Enter iron price"
                                />
                            </div>

                            <div>
                                <Label htmlFor="washing" value="washing Price" />
                                <TextInput
                                    id="washing"
                                    type="number"
                                    min={0}
                                    value={currentService.washing || ''}
                                    onChange={handleChange}
                                    placeholder="Enter washing price"
                                />
                            </div>
                            <div>
                                <Label htmlFor="washing_And_Iron" value="washing_And_Iron Price" />
                                <TextInput
                                    id="washing_And_Iron"
                                    type="number"
                                    min={0}
                                    value={currentService.washing_And_Iron || ''}
                                    onChange={handleChange}
                                    placeholder="Enter washing_And_Iron price"
                                />
                            </div>


                        </div>
                    </Modal.Body>
                    <Modal.Footer className="justify-end">
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
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