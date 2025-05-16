import React from 'react';
import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { auth, db, googleProvider } from '../firebase'; // Import db
import { signInWithPopup } from 'firebase/auth';
import { ref, get, set } from 'firebase/database'; // Import Firebase Realtime DB methods
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleGoogle = async () => {
        try {
            const resultsFromGoogle = await signInWithPopup(auth, googleProvider);
            const user = resultsFromGoogle.user;

            // Fetch existing user data from Firebase Realtime DB
            const userRef = ref(db, `USERS/${user.uid}`);
            const snapshot = await get(userRef);

            let userData;
            if (snapshot.exists()) {
                userData = snapshot.val(); // Get stored user data
            } else {
                // New user → Save to Firebase with default fields
                userData = {
                    name: user.displayName,
                    email: user.email,
                    imageUrl: user.photoURL || '',
                    number: '',
                    address: '',
                    rewardPoints: 0,
                };
                await set(userRef, userData);
            }

            // 🔥 Ensure providerData is stored in Redux
            dispatch(signInSuccess({
                uid: user.uid,
                providerData: user.providerData,  // Add this
                ...userData
            }));

            navigate('/dashboard?tab=profile');
        } catch (error) {
            console.error("Google Sign-In Error:", error.message);
            alert("Google Sign-In Failed: " + error.message);
        }
    };


    return (
        <Button gradientDuoTone="pinkToOrange" type="button" pill outline onClick={handleGoogle}>
            <AiFillGoogleCircle className="w-6 h-6 mr-2" />
            Continue with Google
        </Button>
    );
}

export default OAuth;
