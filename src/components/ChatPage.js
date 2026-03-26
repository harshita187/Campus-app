import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { chatService } from "../services/chatService";
import { getSocket } from "../services/socket";
import "./ChatPage.css";

const ChatPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const conversationId = useMemo(() => conversation?._id, [conversation]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        const convo = productId
          ? await chatService.createOrGetConversationByProduct(productId)
          : null;

        if (!convo && !productId) {
          const allConversations = await chatService.listConversations();
          if (allConversations.length) {
            setConversation(allConversations[0]);
            const items = await chatService.listMessages(allConversations[0]._id);
            setMessages(items);
          }
        } else if (convo) {
          setConversation(convo);
          const items = await chatService.listMessages(convo._id);
          setMessages(items);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [productId]);

  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    socket.emit("chat:joinConversation", { conversationId });

    const onNewMessage = (incomingMessage) => {
      if (String(incomingMessage.conversationId) !== String(conversationId)) return;
      setMessages((prev) => [...prev, incomingMessage]);
    };

    socket.on("chat:newMessage", onNewMessage);
    return () => {
      socket.off("chat:newMessage", onNewMessage);
    };
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;
    try {
      await chatService.sendMessage(conversationId, text.trim());
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-container">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h2>{conversation?.productId?.title || "Conversation"}</h2>
          <button className="chat-back-btn" onClick={() => navigate("/products")}>
            Back to products
          </button>
        </div>

        {error && <div className="chat-error">{error}</div>}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <p className="chat-empty">Start conversation with seller.</p>
          ) : (
            messages.map((message) => {
              const senderId = message.senderId?._id || message.senderId;
              const me = senderId === (user?.id || user?._id);
              return (
                <div
                  key={message._id}
                  className={`chat-bubble ${me ? "chat-bubble-me" : "chat-bubble-other"}`}
                >
                  <div className="chat-sender">{message.senderId?.name || "User"}</div>
                  <div>{message.text}</div>
                </div>
              );
            })
          )}
        </div>

        <form className="chat-form" onSubmit={handleSend}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
