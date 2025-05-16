import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiUser } from 'react-icons/hi'
import { FaRegCalendarCheck, FaStar, FaTags ,FaMotorcycle} from 'react-icons/fa';
import { MdMiscellaneousServices } from 'react-icons/md';
import { signoutSuccess } from '../redux/user/userSlice'
import { useDispatch } from 'react-redux';
import { MdAdd } from "react-icons/md";
import { clearCart } from '../redux/cartSlice';
import { FiMessageCircle } from 'react-icons/fi';


function DashSidebar() {
  const location = useLocation();
  const [tab, setTab] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');

    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignout = async () => {
    try {
      dispatch(signoutSuccess());
      dispatch(clearCart());

    } catch (error) {
      console.log(error.message);
    }
  };


  return (
    <Sidebar className=" w-full md:w-56">
      <Sidebar.Items className=''>
        <Sidebar.ItemGroup >
          <Link to='/shopDashboard?tab=profile'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'profile'} icon={HiUser} label={'Shop'} labelColor='dark'>Profile</Sidebar.Item>
          </Link>
          <Link to='/shopDashboard?tab=shoporder'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'shoporder'} icon={FaRegCalendarCheck} labelColor='dark'>Orders Details</Sidebar.Item>
          </Link>
          <Link to='/shopDashboard?tab=rider'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'rider'} icon={FaMotorcycle} labelColor='dark'>Rider</Sidebar.Item>
          </Link>

          <Link to='/shopDashboard?tab=addsevises'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'addsevises'} icon={MdAdd} labelColor='dark'>Add Services</Sidebar.Item>
          </Link>
          <Link to='/shopDashboard?tab=yourservices'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'yourservices'} icon={MdMiscellaneousServices} labelColor='dark'> 🧥    Your Services</Sidebar.Item>
          </Link>
          <Link to='/chatting'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'orders'} icon={FiMessageCircle} labelColor='dark'>Chats</Sidebar.Item>
          </Link>
          <Link to='/shopDashboard?tab=addoffer'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'addoffer'} icon={FaTags} labelColor='dark'>Your Discount Offer</Sidebar.Item>
          </Link>
          <Link to='/shopDashboard?tab=reviews'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'reviews'} icon={FaStar} labelColor='dark'> Reviews</Sidebar.Item>
          </Link>
          <Sidebar.Item className='cursor-pointer' icon={HiArrowSmRight} onClick={handleSignout} >Sign Out</Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  )
}
export default DashSidebar