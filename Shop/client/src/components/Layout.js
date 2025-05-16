// src/components/Layout.js
import { Outlet } from 'react-router-dom';
import ChatComponent from './Chat';

const Layout = () => {
  return (
    <div className="app-container">
      <Outlet /> {/* This is where your page content will render */}
      <ChatComponent />
    </div>
  );
};

export default Layout;