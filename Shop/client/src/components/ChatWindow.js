// ChatWindow.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, push, onValue } from 'firebase/database';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ChatWindow = () => {
    const { chatId } = useParams();
    const currentUser = useSelector((state) => state.user.currentUser);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    useEffect(() => {
        if (!currentUser || !chatId) return;
        // Extract other user ID from chatId
        const userIds = chatId.split('_');
        const otherUserId = userIds.find(id => id !== currentUser.uid);

        // Fetch other user's details
        const userRef = ref(db, `USERS/${otherUserId}`);
        onValue(userRef, (snapshot) => {
            setOtherUser(snapshot.val());
        });

        // Load messages
        const messagesRef = ref(db, `CHATS/${chatId}`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const messagesData = snapshot.val();
            const loadedMessages = messagesData ? Object.values(messagesData) : [];
            setMessages(loadedMessages);
        });

        return () => unsubscribe();
    }, [chatId, currentUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !currentUser) return;

        const newMessage = {
            message: message.trim(),
            user: currentUser.uid,
            timestamp: Date.now(),
            read: false
        };

        await push(ref(db, `CHATS/${chatId}`), newMessage);
        setMessage('');
    };

    if (!currentUser) return <div>Please log in</div>;
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                {otherUser?.image && (
                    <img
                        src={otherUser.imageUrl}
                        alt={otherUser.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                )}
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {otherUser ? otherUser.name : 'New Chat'}
                </h2>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        No messages yet
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.user === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.user === currentUser.uid
                            ? 'bg-blue-500 text-white rounded-tr-none'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none'
                            }`}>
                            <p className="break-words">{msg.message}</p>
                            {/* <div className="text-xs mt-1 opacity-70 text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div> */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <input

                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;