import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar } from 'flowbite-react';
import { HiArrowSmRight, HiUser } from 'react-icons/hi'
import { FaRegCalendarCheck } from 'react-icons/fa';
import { signoutSuccess } from '../redux/user/userSlice'
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice'

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
          <Link to='/Dashboard?tab=profile'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'profile'} icon={HiUser} label={'User'} labelColor='dark'>Profile</Sidebar.Item>
          </Link>
          <Link to='/Dashboard?tab=orders'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'orders'} icon={FaRegCalendarCheck} labelColor='dark'>Orders Details</Sidebar.Item>
          </Link>
          <Link to='/chatting'>
            <Sidebar.Item className='p-4' as='div' active={tab === 'orders'} icon={FiMessageCircle} labelColor='dark'>Chats</Sidebar.Item>
          </Link>
         <div>

         </div>
          <Sidebar.Item className='cursor-pointer' icon={HiArrowSmRight} onClick={handleSignout} >Sign Out</Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  )
}

export default DashSidebar