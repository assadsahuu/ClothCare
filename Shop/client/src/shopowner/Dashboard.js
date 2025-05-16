import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from './DashboardBar';
import Profile from './Profile';
import DashboardScreen from '../components/DashboardSceen';
import AddServise from './AddServise';
import YourServices from './YourServices';
import OrderDetail from '../components/OrderDetails';
import PromotionOffers from './PromotionOffers';
import Reviews  from '../components/Reviews.js'
import Rider from '../components/RiderMangement.js';

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
      </div >
      {tab === 'profile' && <Profile />}
      {tab === 'addsevises' && <AddServise />}
      {tab === 'yourservices' && <YourServices />}
      {tab === 'shoporder' && <OrderDetail />}
      {tab === 'addoffer' && <PromotionOffers />}
      {tab === 'reviews' && <Reviews   />}
      {tab === 'rider' && <Rider   />}
      {tab === '' && <DashboardScreen />}
    </div>
  )
}
