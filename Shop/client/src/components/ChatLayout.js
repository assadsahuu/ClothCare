// MainLayout.js
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import '../css/chats.css';

const ChatLayout = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  const handleChatSelect = (selectedChatId) => {
    navigate(`/chat/${selectedChatId}`);
  };

  return (
    <div className="main-layout">
      <div className="chat-list-container">
        <ChatList onChatSelect={handleChatSelect} currentUser={currentUser} />
      </div>
      <div className="chat-window-container">
        {chatId ? (
          <ChatWindow />
        ) : (
          <div className="empty-chat">
            <h2>Select a chat to start messaging</h2>
          </div>
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default ChatLayout;