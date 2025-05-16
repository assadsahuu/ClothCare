import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ChatList = ({ onChatSelect }) => {
    const currentUser = useSelector((state) => state.user.currentUser);
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState({});
    const navigate = useNavigate();
    const { chatId: currentChatId } = useParams();

    // Fetch all chats the current user is involved in
    useEffect(() => {
        if (!currentUser) return;
        const chatsRef = ref(db, 'CHATS');

        const unsubscribe = onValue(chatsRef, (snapshot) => {
            const chatsData = snapshot.val();
            const userChats = [];

            if (!chatsData) {
                setChats([]);
                return;
            }

            Object.keys(chatsData).forEach(chatId => {
                const [user1, user2] = chatId.split('_');

                if (user1 === currentUser.uid || user2 === currentUser.uid) {
                    const messages = Object.values(chatsData[chatId] || {});
                    const lastMessage = messages[messages.length - 1];
                    const otherUserId = user1 === currentUser.uid ? user2 : user1;

                    userChats.push({
                        chatId,
                        otherUserId,
                        lastMessage: lastMessage?.message || 'No messages yet',
                        timestamp: lastMessage?.timestamp || Date.now()
                    });
                }
            });

            userChats.sort((a, b) => b.timestamp - a.timestamp);
            setChats(userChats);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch user details
    useEffect(() => {
        if (!currentUser) return;

        const usersRef = ref(db, 'SHOPS');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val() || {};
            setUsers(usersData);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleChatSelect = (selectedChatId) => {
        onChatSelect(selectedChatId);
        navigate(`chat/${selectedChatId}`);
    };

    if (!currentUser) return <div className="p-4 text-gray-700 dark:text-gray-300">Please log in</div>;

    return (
        <div className="w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <h1 className="p-4 text-xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
                Chats
            </h1>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {chats.map(chat => (
                    <div
                        key={chat.chatId}
                        className={`p-4 cursor-pointer transition-colors ${currentChatId === chat.chatId
                                ? 'bg-blue-50 dark:bg-gray-700'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        onClick={() => handleChatSelect(chat.chatId)}
                    >
                        <div className="flex items-start gap-3">
                            {/* Profile Picture */}
                            <div className="flex-shrink-0">
                                <img
                                    src={users[chat.otherUserId]?.image}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                {/* Fallback avatar */}
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hidden">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                                        {users[chat.otherUserId]?.name?.[0] || '?'}
                                    </span>
                                </div>
                            </div>

                            {/* Chat Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                    {users[chat.otherUserId]?.name || 'Unknown User'}
                                </div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {chat.lastMessage.length > 30
                                        ? `${chat.lastMessage.substring(0, 30)}...`
                                        : chat.lastMessage}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;