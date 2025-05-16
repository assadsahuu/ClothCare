import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Label, TextInput, Button, Alert, Spinner } from 'flowbite-react';
import logo from '../assets/logo5.png';
import team from '../assets/logo6.png';
import OAuth from '../components/OAuth';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { verifyEmail } from '../components/Verifications';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        number: '',
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password || !formData.number) {
            return setErrorMessage('Please fill out all fields');
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            const isEmailValid = await verifyEmail(formData.email);
            if (!isEmailValid) {
                setErrorMessage('Invalid email. Please enter a valid email.');
                setLoading(false);
                return;
            }

            // ✅ Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // ✅ Send email verification
            await sendEmailVerification(user);

            // ✅ Update Firebase Authentication profile
            await updateProfile(user, { displayName: formData.name });

            // ✅ Save user details in Realtime Database
            await set(ref(db, `USERS/${user.uid}`), {
                name: formData.name,
                email: formData.email,
                number: formData.number,
                imageUrl: '',
                latitude: 0,
                longitude: 0,
                rewardPoints: 0,
                emailVerified: false // Track email verification status
            });

            setLoading(false);
            setErrorMessage('Verification email sent! Please verify your email before signing in.');
            setTimeout(() => navigate('/signin'), 3000);
        } catch (error) {
            setErrorMessage(error.message || 'Sign up failed');
            setLoading(false);
        }
    };
    return (
        <div className='min-h-screen mt-20'>
            <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row gap-20 md:items-center">
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
                            <Label value='Name' />
                            <TextInput type='text' placeholder='Full Name' id='name' onChange={handleChange} />
                        </div>
                        <div>
                            <Label value='Email' />
                            <TextInput autoComplete='email' type='email' placeholder='Name@company.com' id='email' onChange={handleChange} />
                        </div>
                        <div>
                            <Label value='Phone Number' />
                            <TextInput autoComplete='phone' type='text' placeholder='03123456789' id='number' onChange={handleChange} />
                        </div>
                        <div>
                            <Label value='Password' />
                            <TextInput autoComplete='new-password' type='password' placeholder='Password' id='password' onChange={handleChange} />
                        </div>

                        <Button type='submit' disabled={loading} pill outline>
                            {loading ? (
                                <>
                                    <Spinner size='sm' />
                                    <span className='pl-3'>Loading...</span>
                                </>
                            ) : 'Sign Up'}
                        </Button>
                        <OAuth />
                    </form>
                    <div className='mt-5 flex text-sm gap-2'>
                        <span>Have an account?</span>
                        <Link to='/signin' className='text-blue-500'>Sign In</Link>
                    </div>
                    {errorMessage && (
                        <Alert className="mt-5" color='failure'>
                            {String(errorMessage)}
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    );
}
