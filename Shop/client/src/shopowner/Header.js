import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar, Button, Dropdown, Navbar } from 'flowbite-react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import logo from '../assets/logo3.png';
import { signoutSuccess } from '../redux/user/userSlice';
import { clearCart } from '../redux/cartSlice'

function Header() {
    const path = useLocation().pathname;
    const { currentUser } = useSelector((state) => state.user);
    const { theme } = useSelector((state) => state.theme);
    // Count items in the cart
    const dispatch = useDispatch();

    const handleSignout = async () => {
        try {
            dispatch(signoutSuccess());
            dispatch(clearCart());

        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <Navbar className='bg-[#eceae9] border-b-2'>
            <Link to="/" className='self-center text-sm sm:text-xl font-semibold'>
                <img
                    className="w-24 h-10 rounded-md shadow-md hover:scale-105 transition-transform duration-300 ease-in-out"
                    src={logo}
                    alt="Logo"
                />

            </Link>
            <div className='flex items-center gap-8 md:order-2'>
                <Button onClick={() => dispatch(toggleTheme())} className='hidden sm:inline' color='gray' pill>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </Button>



                {currentUser ? (
                    <Dropdown arrowIcon={false} inline label={<Avatar img={currentUser.image} rounded />}>
                        <Dropdown.Header>
                            <span className='block text-sm'>{currentUser.name}</span>
                        </Dropdown.Header>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleSignout}>Sign Out</Dropdown.Item>
                    </Dropdown>
                ) : (
                    <>
                        <Link to='/shopsignin'><Button outline>SignIn</Button></Link>
                    </>
                )}
                <Navbar.Toggle />
            </div>

            <Navbar.Collapse>
                <Navbar.Link active={path === "/shopdashboard"}>
                    <Link to='/shopdashboard'>Dashboard</Link>
                </Navbar.Link>
                <Navbar.Link active={path === "/About"}>
                    <Link to='/About'>About Us</Link>
                </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;
