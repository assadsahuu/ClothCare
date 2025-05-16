import { useDispatch, useSelector } from 'react-redux';
import { decrementQuantity, incrementQuantity, removeFromCart, clearCart } from '../redux/cartSlice';
import { Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { db } from '../firebase';
import { useEffect } from 'react';
import { ref, update, get, push, runTransaction, set } from 'firebase/database';
import { Dialog } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';
import '../css/cart.css';
import { motion, AnimatePresence } from 'framer-motion';
//oredrnumber before

function Cart() {
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart);
    const currentUser = useSelector((state) => state.user.currentUser);
    var user = null;
    var shopId = null;
    var adress = null;
    if (cartItems && cartItems.length > 0) {
        shopId = cartItems[0].shopId;
        user = cartItems[0].user;
        adress = currentUser.address;
    }

    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});
    const [urgentFee, setUrgentFee] = useState(0);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [useRewardPoints, setUseRewardPoints] = useState(false);
    const [availableRewardPoints, setAvailableRewardPoints] = useState(0);


    var deliveryTimestamp = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days from now
    if (formData.order_delivery_time === "urgent") {
        deliveryTimestamp = Date.now() + 24 * 60 * 60 * 1000; // 1 day from now
    }
    // Calculate Order Summary with fallback values
    const totalItems = cartItems.reduce((total, item) => total + (item?.quantity || 0), 0);
    const originalPrice = cartItems.reduce(
        (total, item) => total + (Number(item?.price) || 0) * (item?.quantity || 0),
        0
    );
    useEffect(() => {
        // Check if counter exists and initialize if needed
        const checkCounter = async () => {
            const counterRef = ref(db, 'counters/orders');
            const snapshot = await get(counterRef);
            if (!snapshot.exists()) {
                await initializeOrderCounter(1000);
            }
        };
        checkCounter();
    }, []);

    useEffect(() => {
        setRewardPoints(Math.floor(originalPrice * 0.03)); // rounds down
    }, [originalPrice]);

    const total = urgentFee + originalPrice;

    const formatServiceType = (type) => {
        if (!type) return 'Standard Service';
        return String(type)
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/(^|\s)\S/g, char => char.toUpperCase()); // Capitalize first letters
    };
    useEffect(() => {
        const fetchRewardPoints = async () => {
            if (currentUser?.uid) {
                const userRef = ref(db, `USERS/${currentUser.uid}/rewardPoints`);
                const snapshot = await get(userRef);
                setAvailableRewardPoints(snapshot.exists() ? Number(snapshot.val()) : 0);
            }
        };
        fetchRewardPoints();
    }, [currentUser]);

    const deduction = useRewardPoints ? Math.min(availableRewardPoints, total) : 0;
    const finalTotal = Math.max(total - deduction, 0);

    const updateRewardPoints = async (userId, pointsToAdd) => {
        try {
            const userRef = ref(db, `USERS/${userId}/rewardPoints`);
            const snapshot = await get(userRef);

            let currentPoints = snapshot.exists() ? Number(snapshot.val()) : 0;
            const newTotal = currentPoints + pointsToAdd;

            await update(ref(db), {
                [`USERS/${userId}/rewardPoints`]: newTotal
            });
        } catch (error) {
            console.error("Error updating reward points:", error);
        }
    };

    const getShopMinOrder = async (shopId) => {
        try {
            const shopRef = ref(db, `SHOPS/${shopId}/min`);
            const snapshot = await get(shopRef);
            return snapshot.exists() ? Number(snapshot.val()) : 0;
        } catch (error) {
            console.error("Error fetching minimum order:", error);
            return 0;
        }
    };
    // Atomic counter functions
    const initializeOrderCounter = async (startingNumber = 1000) => {
        try {
            await set(ref(db, 'counters/orders'), startingNumber);
        } catch (error) {
            console.error("Failed to initialize counter:", error);
            throw error;
        }
    };

    const getNextOrderNumber = async () => {
        const counterRef = ref(db, 'counters/orders');

        try {
            const { snapshot } = await runTransaction(counterRef, (currentValue) => {
                if (currentValue === null) return 100000; // Initialize if doesn't exist
                return currentValue + 1;
            });
            return snapshot.val();
        } catch (error) {
            console.error("Failed to generate order number:", error);
            throw error;
        }
    };

    const handleCheckout = async () => {
        if (!formData.order_delivery_time || !formData.payment_method) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            // Get shop's minimum order requirement
            const minOrder = await getShopMinOrder(shopId);

            // Check if total meets minimum order requirement
            if (total < minOrder) {
                alert(`Total order amount must be at least Rs. ${minOrder}.`);
                return;
            }

            setShowConfirmation(true);
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Unable to process checkout. Please try again.');
        }
    };

    const handleConfirmCheckout = async () => {
        setShowConfirmation(false);
        try {
            const orderId = await saveOrderToFirebase(
                orderData,
                user,
                shopId,
                rewardPoints
            );

            if (useRewardPoints && deduction > 0) {
                await updateRewardPoints(currentUser.uid, -deduction);
            }

            setOrderId(orderId);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                dispatch(clearCart());
                navigate('/');
                setUrgentFee(0);
            }, 3000);
        } catch (error) {
            console.error('Order placement failed:', error);
            alert('Order placement failed. Please try again.');
        }
    };

    const addRewardPoints = async (userId, pointsToAdd) => {
        try {
            const userRef = ref(db, `USERS/${userId}/rewardPoints`);
            const snapshot = await get(userRef);

            let currentPoints = 0;
            if (snapshot.exists()) {
                currentPoints = snapshot.val();
            }

            const newTotal = currentPoints + pointsToAdd;

            await update(ref(db), {
                [`USERS/${userId}/rewardPoints`]: newTotal
            });
        } catch (error) {
            console.error("Error updating reward points:", error);
        }
    };

    const saveOrderToFirebase = async (orderData, userId, shopId, rewardPoints) => {
        try {
            // Get the next order number atomically
            const orderNumber = await getNextOrderNumber();

            // Create order with sequential number
            const orderId = push(ref(db, 'ORDERS')).key;
            const orderWithNumber = {
                ...orderData,
                orderNumber,
                orderId
            };

            // Prepare updates for atomic operation
            const updates = {
                [`ORDERS/${orderId}`]: orderWithNumber
            };

            await update(ref(db), updates);
            await addRewardPoints(userId, rewardPoints);

            console.log("Order placed successfully with number:", orderNumber);
            return orderId;
        } catch (error) {
            console.error("Error saving order:", error);
            throw error;
        }
    };
    const handleDecrement = (id) => dispatch(decrementQuantity(id));
    const handleIncrement = (id) => dispatch(incrementQuantity(id));
    const handleRemoveFromCart = (id) => dispatch(removeFromCart(id));

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (e.target.id === "order_delivery_time" && e.target.value === "urgent") {
            setUrgentFee(Math.floor(originalPrice * 0.1));
        } else if (e.target.id === "order_delivery_time") {
            setUrgentFee(0);
        }
    };


    const transformCartItems = (cartItems) => {
        const items = {};
        cartItems.forEach(item => {
            const { category, serviceType, price, quantity } = item;
            if (!items[category]) {
                items[category] = {};
            }
            items[category][serviceType] = { price, quantity };
        });
        return items;
    };

    const prepareOrderData = (cartItems, user, shopId, total, paymentMethod, deliveryTimestamp, adress) => {
        const items = transformCartItems(cartItems);
        // Default to current time  

        return {
            delivery: deliveryTimestamp,

            delivery_type: formData.order_delivery_time,
            items,
            method: paymentMethod,
            payment: "Pending",
            shop: shopId,
            status: "pending",
            time: Date.now(),
            total: finalTotal,
            rewardPointsUsed: useRewardPoints ? deduction : 0,
            user: user,
            delivery_address: adress,
            updatedAt: Date.now(),// Assuming user object has uid
        };
    };
    const orderData = prepareOrderData(cartItems, user, shopId, total, formData.payment_method, deliveryTimestamp, adress);

    const ConfirmationDialog = () => (
        <Dialog
            open={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                        Confirm Order
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-gray-600 dark:text-gray-400">
                        Are you sure you want to place this order?
                    </Dialog.Description>

                    <div className="mt-6 flex justify-end gap-4">
                        <Button
                            color="gray"
                            onClick={() => setShowConfirmation(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            gradientMonochrome="success"
                            onClick={handleConfirmCheckout}
                        >
                            Confirm Order
                        </Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );

    const SuccessAnimation = () => (
        <AnimatePresence>
            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircleIcon className="h-12 w-12 text-green-600 animate-draw-check" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                            Order Placed!
                        </h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Your order ID: {orderId}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Redirecting to home page...
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );


    return (
        <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <ConfirmationDialog />

            <AnimatePresence>
                {showSuccess && <SuccessAnimation />}
            </AnimatePresence>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Cart</h2>
            <div>

                <Button
                    pill outline
                    onClick={() => dispatch(clearCart())}
                    className="mb-4"
                    color="failure">



                    Clear Cart

                </Button>
            </div>

            {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Your cart is empty.</p>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items Section */}
                    <div className="flex-1">
                        <ul className="space-y-4">
                            {cartItems.map((item) => (
                                <li
                                    key={item?.id}
                                    className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm dark:bg-gray-900"
                                >
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={item?.itemPicture || '/default-service-image.jpg'}
                                            alt={item?.service_name || 'Service image'}
                                            className="h-20 w-20 rounded-lg object-cover"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {item?.service_name || 'Unnamed Service'}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Category: {item?.category || 'General'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Service Type: {formatServiceType(item?.serviceType)}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Rs. {item?.price || '0'} per item
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDecrement(item?.id)}
                                                className="w-8 h-8 flex items-center justify-center border rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item?.quantity || 0}</span>
                                            <button
                                                onClick={() => handleIncrement(item?.id)}
                                                className="w-8 h-8 flex items-center justify-center border rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFromCart(item?.id)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400"
                                        >
                                            Remove
                                        </button>
                                        <span className="w-20 text-right font-medium">
                                            Rs. {(item?.price || 0) * (item?.quantity || 0)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Order Summary Section */}
                    <div className="lg:w-96">
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <h3 className="text-xl font-semibold">Order Details</h3>

                            <form className="space-y-4">
                                <div>


                                    <label className="block mb-2 text-sm font-medium">
                                        Delivery Day
                                        <select
                                            id="order_delivery_time"
                                            onChange={handleChange}
                                            className="w-full mt-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
                                            required
                                        >
                                            <option value="">Select Order Type</option>
                                            <option value="normal">Standard (3-5 days)</option>
                                            <option value="urgent">Urgent (24 hours)</option>
                                        </select>
                                    </label>

                                    <label className="block mb-2 text-sm font-medium">
                                        Payment Method
                                        <select
                                            id="payment_method"
                                            onChange={handleChange}
                                            className="w-full mt-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
                                            required
                                        >
                                            <option value="">Select method</option>
                                            <option value="Cash On Delivery">Cash on Delivery</option>
                                            <option value="Stripe Payment(Online)">Online Payment</option>
                                        </select>
                                    </label>
                                </div>
                            </form>

                            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between">
                                    <span>Subtotal ({totalItems} items):</span>
                                    <span>Rs. {originalPrice}</span>
                                </div>
                                {urgentFee > 0 && (
                                    <div className="flex justify-between">
                                        <span>Urgent Delivery Fee:</span>
                                        <span>Rs. {urgentFee}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Reward Points Earned:</span>
                                    <span>{rewardPoints}</span>
                                </div>
                                {availableRewardPoints > 0 && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="useRewardPoints"
                                            checked={useRewardPoints}
                                            onChange={(e) => setUseRewardPoints(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="useRewardPoints" className="text-sm">
                                            Use Reward Points (Available: {availableRewardPoints} points)
                                        </label>
                                    </div>
                                )}

                                {useRewardPoints && (
                                    <div className="flex justify-between">
                                        <span>Reward Points Deducted:</span>
                                        <span>- Rs. {deduction}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-lg pt-2">
                                    <span>Total:</span>
                                    <span>Rs. {finalTotal}</span>
                                </div>
                            </div>

                            <Button
                                outline
                                pill
                                onClick={handleCheckout}
                                className="w-full mt-4"
                            >
                                Checkout
                            </Button>

                            <div className="text-center mt-4">
                                <Link
                                    to="/"
                                    className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;