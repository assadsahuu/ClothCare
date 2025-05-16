import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ref, query, onValue, orderByChild, equalTo, update } from 'firebase/database';
import { db } from '../firebase'; // Import your Firebase configuration
import '../css/home.css';
import { Modal } from 'flowbite-react';
import StartChat from './StartChat';


const OrderDetails = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [filterType, setFilterType] = useState('pending');

  useEffect(() => {
    if (!currentUser?.uid) return;

    let isMounted = true;

    const ordersQuery = query(
      ref(db, 'ORDERS'),
      orderByChild('shop'),
      equalTo(currentUser.uid)
    );

    const unsubscribe = onValue(ordersQuery, (snapshot) => {
      if (!isMounted) return;

      try {
        const ordersArray = [];
        snapshot.forEach((childSnapshot) => {
          const order = childSnapshot.val();
          if (order.status === filterType) {
            ordersArray.push({
              id: childSnapshot.key,
              ...order,
              created_at: order.time,
              total_price: order.total,
              payment_method: order.method,
              delivery_address: order.delivery_address || 'N/A',
              order_delivery_time: new Date(order.delivery).toLocaleString()
            });
          }
        });
        setOrders(ordersArray);
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError('Error loading orders');
          console.error('Data error:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }, (error) => {
      if (isMounted) {
        setError('Failed to fetch orders');
        console.error('Firebase error:', error);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser, filterType]);




  const handleShowOrderDetails = (order) => {
    setSelectedOrder(order);
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setSelectedOrder(null);
    setPopupVisible(false);
  };

  const handleStatusUpdate = async (newStatus) => {

    if (!selectedOrder || ['completed'].includes(selectedOrder.status)) {
      return;
    }

    if (!selectedOrder) return;

    try {
      setLoading(true);
      const updates = {
        status: newStatus,
        prevStatus: selectedOrder.status // Store previous status for notifications
      };

      await update(ref(db, `ORDERS/${selectedOrder.id}`), updates);

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Close modal after successful update
      handleClosePopup();
    } catch (err) {
      setError('Status update failed');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  return (
    <section className="bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8 antialiased dark:from-gray-900 dark:to-gray-800 md:py-12">
      {/* Filter Section */}
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Orders</h1>
          <div className="w-full sm:w-64">
            <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter Orders
            </label>
            <select
              id="filterType"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="pending">🆕 Pending</option>
              <option value="proceeding">🔄 In Process</option>
              <option value="washing">🧺 Washing</option>
              <option value="delivery">🛵   Delivery </option>
              <option value="completed">✅ Completed</option>


            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="mx-auto max-w-7xl">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800">
            <svg
              className="h-24 w-24 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="transform overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:bg-gray-800"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                        }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.delivery_type === 'urgent' && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-100">
                          Urgent
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Order Number</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        Rs {order.total_price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Payment</span>
                      <span className="capitalize text-gray-900 dark:text-white">
                        {order.payment_method.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Delivery</span>
                      <span className="text-gray-900 dark:text-white">
                        {order.order_delivery_time}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => handleShowOrderDetails(order)}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      View Details
                    </button>
                    <div>
                      <StartChat userId={order.user} />
                      <span>chat</span>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isPopupVisible && selectedOrder && (
        <Modal
          show={isPopupVisible}
          onClose={handleClosePopup}
          size="xl"
          className="backdrop-blur-sm"
        >
          <Modal.Header className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Order Details
              </h3>
            </div>
          </Modal.Header>

          <Modal.Body className="p-6">

            <div className="space-y-6">
              {/* Only show status update if order is not completed/cancelled */}
              {!['completed', 'cancelled'].includes(selectedOrder.status) && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Update Order Status
                      </label>
                      <select
                        id="statusSelect"
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        disabled={loading}
                      >
                        <option value="pending">🆕 Pending</option>
                        <option value="proceeding">🔄 In Process</option>
                        <option value="washing">🧺 Washing</option>
                        <option value="delivery">🛵 Delivery</option>
                        <option value="completed">✅ Complete Order</option>
                      </select>
                    </div>
                    {loading && (
                      <svg className="ml-3 h-5 w-5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                </div>
              )}
              {/* Order Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID</p>
                  <p className="font-mono text-gray-900 dark:text-white">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Number</p>
                  <p className="font-mono text-gray-900 dark:text-white">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {Object.entries(selectedOrder.items).map(([category, services]) =>
                      Object.entries(services).map(([serviceType, details]) => (
                        <tr key={`${category}-${serviceType}`}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {category}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {serviceType}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {details.quantity}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                            Rs. {(details.price * details.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Delivery Address
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedOrder.delivery_address || 'N/A'}
                  </p>
                </div>
                <div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">


                  <div className="flex justify-between border-t border-gray-200 pt-4 dark:border-gray-600">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Rs. {selectedOrder.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              onClick={handleClosePopup}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </section>
  );
};
export default OrderDetails;