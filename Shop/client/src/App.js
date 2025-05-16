import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import About from './pages/About';
import UserAccessDashboard from './components/UserAccessDashboard';
import Footer from './components/Footer';
import ShopSignIn from './shopowner/LogIn';
import ShopSignUp from './shopowner/SignUp';
import ShopDashboard from './shopowner/Dashboard';
import ShopHeader from './shopowner/Header';
import ShopDetails from './pages/ShopDetails';
import ChatLayout from './components/ChatLayout';



function App() {
  return (
    <div className="">

      <BrowserRouter>
        <MainContent />
      </BrowserRouter>


    </div>
  );
}

function MainContent() {



  return (
    <>
      <ShopHeader />
      <Routes>
        <Route path='/' element={<ShopDashboard />} />
        <Route path="/details/:shopId/services" element={<ShopDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/chatting" element={<ChatLayout />}>
          <Route path="chat/:chatId" element={<div />} />
        </Route>
        <Route path="/shopsignin" element={<ShopSignIn />} />
        <Route path="/shopsignup" element={<ShopSignUp />} />
        <Route element={<UserAccessDashboard />}>
          <Route path="/shopdashboard" element={<ShopDashboard />} />
        </Route>
      </Routes>
      <Footer></Footer>
    </>
  );
}
export default App;
