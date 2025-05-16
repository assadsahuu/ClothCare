import { Alert, Button, TextInput, Modal, Label, Card, Table } from 'flowbite-react';
import React, { useEffect, useRef, useState } from 'react';
import { ref, query, set, update, remove, onValue, orderByChild, equalTo } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Rider() {
    const currentUser = useSelector(state => state.user.currentUser);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState("");
    const [formData, setFormData] = useState({});
    const [imageUploadError, setImageUploadError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const filePickerRef = useRef();
    const [riders, setRiders] = useState([]);
    const [mode, setMode] = useState('view'); // 'view', 'add', 'edit'
    const [selectedRider, setSelectedRider] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    // Fetch riders belonging to current shop
    useEffect(() => {
        if (!currentUser?.uid) return;

        const ridersQuery = query(
            ref(db, 'RIDER'),
            orderByChild('shopRiderId'),
            equalTo(currentUser.uid)
        );

        const unsubscribe = onValue(ridersQuery, (snapshot) => {
            const ridersData = snapshot.val() || {};
            const ridersList = Object.entries(ridersData).map(([id, data]) => ({
                id,
                ...data,
            }));
            setRiders(ridersList);
        });

        return () => unsubscribe();
    }, [currentUser.uid]);

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
    };

    // Upload Image to Firebase Storage
    const uploadImage = async (riderId) => {
        if (!imageFile) return null;

        try {
            const fileName = `profile_images/riders/${riderId}`;
            const imgRef = storageRef(storage, fileName);
            await uploadBytesResumable(imgRef, imageFile);
            return await getDownloadURL(imgRef);
        } catch (error) {
            setImageUploadError("Image upload error.");
            return null;
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    // Handle Form Submit (Add/Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            let imageUrl = imageFileUrl;

            if (imageFile) {
                imageUrl = await uploadImage(formData.riderUniqueId);
            }

            const riderData = {
                ...formData,
                riderImageUri: imageUrl || selectedRider?.riderImageUri,
            };

            if (mode === 'add') {
                // Check if rider ID already exists
                const existingRider = riders.find(r => r.riderUniqueId === formData.riderUniqueId);
                if (existingRider) {
                    throw new Error('Rider ID already exists');
                }

                await set(
                    ref(db, `RIDER/${formData.riderUniqueId}`),
                    {
                        ...riderData,
                        shopRiderId: currentUser.uid
                    }
                );
                setSuccessMessage('Rider added successfully!');
            } else if (mode === 'edit') {
                await update(
                    ref(db, `RIDER/${selectedRider.id}`),
                    riderData
                );
                setSuccessMessage('Rider updated successfully!');
            }

            setMode('view');
            setImageFile(null);
            setFormData({});
        } catch (error) {
            setErrorMessage(error.message || "Failed to save rider");
        }
    };

    // Handle Delete Rider
    const handleDelete = async (riderId) => {
        if (window.confirm('Are you sure you want to delete this rider?')) {
            try {
                await remove(ref(db, `RIDER/${riderId}`));
                setSuccessMessage('Rider deleted successfully!');
            } catch (error) {
                setErrorMessage('Failed to delete rider');
            }
        }
    };

    // Start Editing Rider
    const startEdit = (rider) => {
        setSelectedRider(rider);
        setFormData({
            riderName: rider.riderName,
            riderPhone: rider.riderPhone,
            riderBikeNum: rider.riderBikeNum,
            riderUniqueId: rider.riderUniqueId,
            riderpassword: rider.riderpassword
        });
        setImageFileUrl(rider.riderImageUri || "");
        setMode('edit');
    };
    const handleViewLocation = (rider) => {
        if (rider.latitude && rider.longitude) {
            setSelectedLocation({
                lat: rider.latitude,
                lng: rider.longitude
            });
            setShowMapModal(true);
        } else {
            setErrorMessage('Location data not available for this rider');
        }
    };

    // Add Map component
    const RiderLocationMap = ({ location }) => {
        return (
            <div className="h-96 w-full">
                <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    className="h-full w-full rounded-lg"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.lat, location.lng]}>
                        <Popup>
                            Rider Location
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        );
    };


    return (
        <div className='max-w-7xl mx-auto p-3 md:p-6'>
            <h1 className='my-4 md:my-7 text-center font-semibold text-2xl md:text-3xl'>Manage Rider</h1>

            {mode === 'view' ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Rider Details</h2>
                        <Button onClick={() => setMode('add')} size="sm" className="ml-auto">
                            Add New Rider
                        </Button>
                    </div>

                    <Card className="overflow-x-auto">
                        <div className="min-w-full">
                            <Table hoverable className="w-full">
                                <Table.Head>
                                    <Table.HeadCell className="whitespace-nowrap">Name</Table.HeadCell>
                                    <Table.HeadCell className="whitespace-nowrap hidden sm:table-cell">Bike Number</Table.HeadCell>
                                    <Table.HeadCell className="whitespace-nowrap hidden md:table-cell">Phone</Table.HeadCell>
                                    <Table.HeadCell className="whitespace-nowrap">Actions</Table.HeadCell>
                                </Table.Head>
                                <Table.Body className="divide-y">
                                    {riders.map((rider) => (
                                        <Table.Row key={rider.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                {rider.riderName}
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap hidden sm:table-cell">
                                                {rider.riderBikeNum}
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap hidden md:table-cell">
                                                {rider.riderPhone}
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    <Button size="xs" onClick={() => startEdit(rider)} className="flex-1 min-w-[70px]">
                                                        Edit
                                                    </Button>
                                                    <Button size="xs" color="failure" onClick={() => handleDelete(rider.id)} className="flex-1 min-w-[70px]">
                                                        Delete
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        color="purple"
                                                        onClick={() => handleViewLocation(rider)}
                                                        className="flex-1 min-w-[70px]"
                                                    >
                                                        <span className="hidden sm:inline">Location</span>
                                                        <span className="sm:hidden">Map</span>
                                                    </Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </div>
                    </Card>
                </>
            ) : (
                <Card className="max-w-2xl mx-auto">
                    <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center">
                            <input type="file" accept='image/*' hidden onChange={handleImageChange} ref={filePickerRef} />
                            <div
                                className="relative w-24 h-24 md:w-32 md:h-32 cursor-pointer shadow-md overflow-hidden rounded-full"
                                onClick={() => filePickerRef.current.click()}
                            >
                                <img
                                    src={imageFileUrl || '/default-rider.png'}
                                    alt="Rider"
                                    className='rounded-full w-full h-full object-cover border-4 md:border-8 border-[lightgray]'
                                />
                            </div>
                            {imageUploadError && <Alert color='failure' className="mt-2">{imageUploadError}</Alert>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor='riderName' value='Full Name' />
                                <TextInput
                                    type='text'
                                    id='riderName'
                                    placeholder='Rider Full Name'
                                    value={formData.riderName || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor='riderBikeNum' value='Bike Number' />
                                <TextInput
                                    type='text'
                                    id='riderBikeNum'
                                    placeholder='Bike Number'
                                    value={formData.riderBikeNum || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor='riderPhone' value='Phone Number' />
                                <TextInput
                                    type='tel'
                                    id='riderPhone'
                                    placeholder='Phone Number'
                                    value={formData.riderPhone || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor='riderUniqueId' value='Rider ID' />
                                <TextInput
                                    type='text'
                                    id='riderUniqueId'
                                    placeholder='Rider ID'
                                    value={formData.riderUniqueId || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={mode === 'edit'}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor='riderpassword' value='Password' />
                            <TextInput
                                type='password'
                                id='riderpassword'
                                placeholder='Password'
                                value={formData.riderpassword || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                color="gray"
                                onClick={() => setMode('view')}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                            >
                                {mode === 'add' ? 'Add Rider' : 'Update Rider'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {successMessage && (
                <Alert className="mt-4 mx-auto max-w-2xl" color="success" onDismiss={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert className="mt-4 mx-auto max-w-2xl" color="failure" onDismiss={() => setErrorMessage(null)}>
                    {errorMessage}
                </Alert>
            )}

            <Modal show={showMapModal} onClose={() => setShowMapModal(false)} size="xl">
                <Modal.Header>Rider Location</Modal.Header>
                <Modal.Body>
                    {selectedLocation ? (
                        <div className="h-64 sm:h-96 w-full">
                            <MapContainer
                                center={[selectedLocation.lat, selectedLocation.lng]}
                                zoom={13}
                                scrollWheelZoom={true}
                                className="h-full w-full rounded-lg"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                                    <Popup>Rider Location</Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    ) : (
                        <Alert color="info">Loading map...</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowMapModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Rider;