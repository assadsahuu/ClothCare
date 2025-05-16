import React, { useState, useEffect } from 'react';
import '../css/DashboardScreen.css';

function WelcomeAnimation() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() =>{
        setTimeout(() => {
            setIsVisible(true);
        }, 500);
    }, []);

    return (
        <div className={`welcome-message ${isVisible ? 'visible' : ''}`}>
            Welcome to Your Dashboard!
        </div>
    );
}

export default WelcomeAnimation;
