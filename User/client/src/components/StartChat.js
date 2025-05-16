import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi'; // Chat icon from react-icons

function StartChat({ userId }) {
    const currentUser = useSelector((state) => state.user.currentUser);
    const navigate = useNavigate();

    const generateChatId = () => {
        return [currentUser.uid, userId]
            .sort((a, b) => b.localeCompare(a))
            .join('_');
    };

    const handleUserClick = () => {
        const chatId = generateChatId();
        navigate(`/chatting/chat/${chatId}`);
    };

    return (
        <div>
            <button
                onClick={handleUserClick}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '24px'
                }}
                aria-label="Start Chat"
            >
                <FiMessageCircle />
            </button>
        </div>
    );
}

export default StartChat;
