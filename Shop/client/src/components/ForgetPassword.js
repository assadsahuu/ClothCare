import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase auth instance
import { Modal, TextInput, Button, Alert } from "flowbite-react";

function ForgetPassword({ show, onClose }) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        setMessage(null);
        setError(null);
        setLoading(true);
    
        const trimmedEmail = email.trim();
    
        if (!trimmedEmail) {
            setError("Please enter your email.");
            setLoading(false);
            return;
        }
    
        try {
            await sendPasswordResetEmail(auth, trimmedEmail);
            setMessage("Password reset email sent! Check your inbox.");
            
            // ✅ Automatically close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);
            
            setEmail(""); // Clear email input after success
        } catch (err) {
            setError(err.message || "Failed to send password reset email.");
        }
    
        setLoading(false);
    };
    

    const handleFirebaseError = (errorCode) => {
        const errorMessages = {
            "auth/user-not-found": "No account found with this email.",
            "auth/invalid-email": "Invalid email format.",
            "auth/too-many-requests": "Too many attempts. Try again later.",
            "auth/network-request-failed": "Network error. Check your connection.",
        };
        setError(errorMessages[errorCode] || "Failed to send password reset email.");
    };

    return (
        <Modal show={show} onClose={onClose}>
            <Modal.Header>Reset Password</Modal.Header>
            <Modal.Body>
                {message && <Alert color="success">{message}</Alert>}
                {error && <Alert color="failure">{error}</Alert>}

                <TextInput
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4"
                    disabled={loading}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleResetPassword} disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button outline onClick={onClose} disabled={loading}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ForgetPassword;
