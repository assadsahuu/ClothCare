import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom';

function UserAccessDashboard() {

    const { currentUser } = useSelector((state) => state.user);

    return currentUser ? <Outlet /> : <Navigate to='/shopsignin' />
}

export default UserAccessDashboard