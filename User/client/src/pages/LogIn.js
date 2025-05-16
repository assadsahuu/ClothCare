import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label, TextInput, Button, Alert, Spinner } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase';
import logo from '../assets/logo5.png';
import team from '../assets/logo6.png';
import ForgetPassword from '../components/ForgetPassword';
import OAuth from '../components/OAuth';
import { verifyEmail } from '../components/Verifications';

export default function SignIn() {
    const [formData, setFormData] = useState({});
    const [showForgetPassword, setShowForgetPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error: errorMessage } = useSelector(state => state.user);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            return dispatch(signInFailure('Please fill out all fields.'));
        }

        try {
            dispatch(signInStart());

            // ✅ Check email validity
            const isEmailValid = await verifyEmail(formData.email);
            if (!isEmailValid) {
                return dispatch(signInFailure('Invalid email. Please enter a valid email.'));
            }

            // ✅ Sign in with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // ✅ Check if email is verified
            if (!user.emailVerified) {
                return dispatch(signInFailure('Please verify your email before signing in.'));
            }

            // ✅ Retrieve user details from Realtime Database
            const userRef = ref(db, `USERS/${user.uid}`);
            const userSnapshot = await get(userRef);

            if (!userSnapshot.exists()) {
                return dispatch(signInFailure('User data not found.'));
            }

            const userData = userSnapshot.val();

            // ✅ Store user data in Redux
            dispatch(signInSuccess({ uid: user.uid, ...userData }));

            navigate('/');

        } catch (error) {
            dispatch(signInFailure(error.message || 'Sign in failed.'));
        }
    };

    return (
        <div className='min-h-screen mt-20'>
            <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row gap-5 md:items-center">
                {/* Left */}
                <div className='flex-1'>
                    <Link to="/" className='text-4xl font-bold dark:text-white'>
                        <img className='' src={logo} alt="Logo" />
                    </Link>
                    <img src={team} alt="Img" />
                </div>
                {/* Right */}
                <div className="flex-1">
                    <form className='gap-4 flex flex-col' onSubmit={handleSubmit}>
                        <div>
                            <Label value='Email' />
                            <TextInput autoComplete='email' type='email' placeholder='Name@company.com' id='email' onChange={handleChange} />
                        </div>
                        <div>
                            <Label value='Password' />
                            <TextInput autoComplete='new-password' type='password' placeholder='********' id='password' onChange={handleChange} />
                        </div>

                        {/* Forgot Password Button */}
                        <p className="text-blue-600 cursor-pointer text-sm mt-1" onClick={() => setShowForgetPassword(true)}>
                            Forgot Password?
                        </p>

                        <Button className='sm' type='submit' disabled={loading} pill outline>
                            {loading ? (
                                <>
                                    <Spinner size='sm' />
                                    <span className='pl-3'>Loading...</span>
                                </>
                            ) : 'Sign In'}
                        </Button>
                        <OAuth />
                    </form>

                    <div className='mt-5 flex text-sm gap-2'>
                        <span>Don't Have an account?</span>
                        <Link to='/SignUp' className='text-blue-500'>Sign Up</Link>
                    </div>

                    {errorMessage && (
                        <Alert className="mt-5" color='failure'>
                            {String(errorMessage)}
                        </Alert>
                    )}
                </div>
            </div>

            {/* Forget Password Modal */}
            {showForgetPassword && (
                <ForgetPassword
                    show={showForgetPassword}
                    onClose={() => setShowForgetPassword(false)}
                />
            )}
        </div>
    );
}
