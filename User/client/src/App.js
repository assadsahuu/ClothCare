import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import About from './pages/About';
import UserAccessDashboard from './components/UserAccessDashboard';
import Home from './pages/Home';
import Footer from './components/Footer';
import ShopDetails from './pages/ShopDetails';
import Cart from './pages/Cart';
import ChatLayout from './components/ChatLayout';
import Reviews from './components/Reviews';


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
  ;
  return (
    <>
      <Header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md" />
      <Routes>

        <Route path='/' element={<Home />} />
        <Route path="/details/:shopId/services" element={<ShopDetails />} />
        <Route element={<UserAccessDashboard />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/chatting" element={<ChatLayout />}>
          <Route path="chat/:chatId" element={<div />} />
        </Route>
        <Route path="/signin" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/reviews/:shopId" element={<Reviews />} />

      </Routes>
      <Footer></Footer>
    </>
  );
}
export default App;
