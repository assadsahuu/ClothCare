import axios from 'axios';

const API_KEY = process.env.REACT_APP_HUNTER_API_KEY; // Replace with your actual API Key

/**
 * Verifies an email using Hunter.io API.
 * @param {string} email - The email address to verify.
 * @returns {Promise<boolean>} - Returns true if email is valid, otherwise false.
 */
export const verifyEmail = async (email) => {


    try {
       
        const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${API_KEY}`;
        const response = await axios.get(url);

        // Extract email status
        const status = response.data.data.status;

        // Check if email is invalid, unknown, or disposable
        if (status === 'invalid' || status === 'unknown' || status === 'disposable') {
            throw new Error('Email is not valid. Please enter a valid email.');
        }
        return true; // Email is valid
    } catch (error) {
        console.error('Email Verification Error:', error.message);
        return false; // Email is not valid
    }
};
