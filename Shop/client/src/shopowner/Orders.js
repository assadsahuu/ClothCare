import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import '../css/home.css';
import { Button, Modal } from 'flowbite-react';



const ShopOrderList = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateorder, setupdateorder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // For popup
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [filterType, setFilterType] = useState('received');







  const handleShowOrderDetails = (order) => {
    setSelectedOrder(order);
    setPopupVisible(true);
  };

  const handleClosePopup = () => {
    setSelectedOrder(null);
    setPopupVisible(false);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/shop/getordersforshopwithstatus/${currentUser._id}?status=${filterType}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?._id) {
      fetchOrders();
    }
  }, [currentUser, updateorder, filterType]);



  const handleAcceptOrder = async (orderId, statuss) => {

    try {
      setLoading(true);
      const response = await fetch(`/api/shop/updateorderstatus/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statuss,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setupdateorder('done') // Update the UI
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }
    } catch (err) {
      setError(err.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (orderId) => {
    handleAcceptOrder(orderId, 'inprocess');
  };
  const handleCancell = (orderId) => {
    handleAcceptOrder(orderId, 'cancelled');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="bg-white pl-4 py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="flex justify-center mb-6">
        <div className="w-full sm:w-64 md:w-72 lg:w-96">
          <label
            htmlFor="filterType"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Filter Orders
          </label>
          <select
            id="filterType"
            className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="received">New Orders</option>
            <option value="proceeding">In Process</option>
            <option value="completed">Completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 services-list">
        {orders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="space-y-4 sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800 mb-6 md:mb-8"
            >
              <dl className="sm:flex items-center justify-between gap-4">
                <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Date</dt>
                <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                  {new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(order.created_at))}
                </dd>
              </dl>
              <dl className="sm:flex items-center justify-between gap-4">
                <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Payment Method</dt>
                <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                  {order.payment_method.replace('_', ' ')}
                </dd>
              </dl>
              <dl className="sm:flex items-center justify-between gap-4">
                <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Total Price</dt>
                <dd className="font-medium text-gray-900 dark:text-white sm:text-end">
                  Rs. {order.total_price.toFixed(2)}
                </dd>
              </dl>
              <dl className="sm:flex items-center justify-between gap-4">
                <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Order Type</dt>
                <dd className="font-medium text-gray-900 dark:text-white sm:text-end">{order.order_type}</dd>
              </dl>
              <dl className="sm:flex items-center justify-between gap-4">
                <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Order  Delivery Time</dt>
                <dd className="font-medium text-gray-900 dark:text-white sm:text-end">{order.order_delivery_time}</dd>
              </dl>
              <dl className="sm:flex items-center justify-between gap-4">
                <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="font-medium text-gray-900 dark:text-white sm:text-end">{order.phoneNumber}</dd>
              </dl>
              {order.delivery_address && (
                <dl className="sm:flex items-center justify-between gap-4">
                  <dt className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">Address</dt>
                  <dd className="font-medium text-gray-900 dark:text-white sm:text-end">{order.delivery_address}</dd>
                </dl>
              )}
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => handleShowOrderDetails(order)}
                  className="py-1.5 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Order Details
                </Button>
                <Button onClick={() => handleAccept(order._id)}
                  className="py-1.5 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Accept
                </Button>
                <Button
                  onClick={() => handleCancell(order._id)}
                  className="py-1.5 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Cancell
                </Button>
              </div>

            </div>
          ))
        )}
      </div>
      {isPopupVisible && selectedOrder && (
        <Modal show={isPopupVisible} onClose={handleClosePopup} size="lg">
          <Modal.Header>Order Details</Modal.Header>
          <Modal.Body>
            <dl>
              <dt className="font-bold">Order ID:</dt>
              <dd>{selectedOrder._id}</dd>

              <dt className="font-bold">Items:</dt>
              <dd>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between mb-2">
                    <span>{item.service_name}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>Rs. {item.price}</span>
                  </div>
                ))}
              </dd>

              <dt className="font-bold">Total Price:</dt>
              <dd>Rs. {selectedOrder.total_price.toFixed(2)}</dd>

              <dt className="font-bold">Delivery Address:</dt>
              <dd>{selectedOrder.delivery_address || 'N/A'}</dd>
            </dl>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleClosePopup} color="gray">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </section>
  );
};

export default ShopOrderList;
