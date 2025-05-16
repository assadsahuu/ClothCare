import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashboardBar';
import DashProfile from '../components/DashboardProfile';
import DashboardScreen from '../components/DashboardSceen';
import OrderDetails from '../components/OrderDetails';


export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');

  useEffect(() => {

    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <div className=" md:w-56 " >
        <DashSidebar />
      </div>
      {tab === 'profile' && <DashProfile />}
      {tab === 'orders' && <OrderDetails />}
      {tab === '' && <DashboardScreen />}

    </div>
  )
}
