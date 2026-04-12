import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiMessageCircle, FiShoppingBag } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { chatService } from "../services/chatService";
import { getSocket } from "../services/socket";
import "./ChatPage.css";

function ChatEmptyState() {
  return (
    <div className="chat-empty-state">
      <div className="chat-empty-art" aria-hidden>
        <div className="chat-empty-bubble chat-empty-bubble--lg" />
        <div className="chat-empty-bubble chat-empty-bubble--sm" />
        <FiMessageCircle className="chat-empty-icon" />
      </div>
      <h2>No conversations yet</h2>
      <p>
        Start a chat from any product listing—open a product and use{" "}
        <strong>Quick chat</strong> or <strong>Chat with Seller</strong>. Your threads
        will show up here.
      </p>
      <div className="chat-empty-actions">
        <Link to="/products" className="btn btn-primary chat-empty-btn">
          <FiShoppingBag aria-hidden />
          Browse marketplace
        </Link>
      </div>
    </div>
  );
}

const ChatPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeId = activeConvo?._id;
  const showSidebar = !productId && conversations.length > 0;
  const showEmpty = !productId && !loading && conversations.length === 0;

  const loadMessages = useCallback(async (conversationId) => {
    const items = await chatService.listMessages(conversationId);
    setMessages(items);
  }, []);

  const selectConversation = useCallback(
    async (convo) => {
      setActiveConvo(convo);
      setError("");
      try {
        await loadMessages(convo._id);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load messages");
      }
    },
    [loadMessages]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError("");
      try {
        if (productId) {
          const convo = await chatService.createOrGetConversationByProduct(productId);
          if (cancelled) return;
          setConversations((prev) => {
            const id = String(convo._id);
            const rest = prev.filter((c) => String(c._id) !== id);
            return [convo, ...rest];
          });
          setActiveConvo(convo);
          const items = await chatService.listMessages(convo._id);
          if (cancelled) return;
          setMessages(items);
        } else {
          const list = await chatService.listConversations();
          if (cancelled) return;
          setConversations(list);
          if (list.length > 0) {
            const first = list[0];
            setActiveConvo(first);
            const items = await chatService.listMessages(first._id);
            if (cancelled) return;
            setMessages(items);
          } else {
            setActiveConvo(null);
            setMessages([]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load chat");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!activeId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("chat:joinConversation", { conversationId: activeId });

    const onNewMessage = (incomingMessage) => {
      if (String(incomingMessage.conversationId) !== String(activeId)) return;
      setMessages((prev) => {
        const mid = incomingMessage._id;
        if (mid && prev.some((m) => String(m._id) === String(mid))) return prev;
        return [...prev, incomingMessage];
      });
    };

    socket.on("chat:newMessage", onNewMessage);
    return () => {
      socket.off("chat:newMessage", onNewMessage);
    };
  }, [activeId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    try {
      await chatService.sendMessage(activeId, text.trim());
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  const peerLabel = useMemo(() => {
    if (!activeConvo || !user?.id) return "Conversation";
    const uid = String(user.id);
    const buyer = activeConvo.buyerId?._id || activeConvo.buyerId;
    if (String(buyer) === uid) {
      return activeConvo.sellerId?.name || "Seller";
    }
    return activeConvo.buyerId?.name || "Buyer";
  }, [activeConvo, user?.id]);

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-container chat-container--centered">
          <div className="chat-loading">Loading messages…</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-page ${showSidebar ? "chat-page--split" : ""}`}>
      {showSidebar ? (
        <aside className="chat-sidebar">
          <div className="chat-sidebar-head">
            <h2>Chats</h2>
            <span className="chat-sidebar-count">{conversations.length}</span>
          </div>
          <ul className="chat-thread-list">
            {conversations.map((c) => {
              const isActive = String(c._id) === String(activeId);
              const title = c.productId?.title || "Listing";
              return (
                <li key={c._id}>
                  <button
                    type="button"
                    className={`chat-thread-item ${isActive ? "chat-thread-item--active" : ""}`}
                    onClick={() => selectConversation(c)}
                  >
                    <span className="chat-thread-title">{title}</span>
                    <span className="chat-thread-sub">{peerPreview(c, user?.id)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      ) : null}

      <div className="chat-main">
        <div className={`chat-container ${showSidebar ? "chat-container--thread" : ""}`}>
          {showEmpty ? (
            <ChatEmptyState />
          ) : (
            <>
              <div className="chat-header">
                <div>
                  <h2>{activeConvo?.productId?.title || "Conversation"}</h2>
                  {activeConvo ? (
                    <p className="chat-header-meta">
                      With {peerLabel}
                      {productId ? (
                        <Link to={`/product/${productId}`} className="chat-header-link">
                          · View listing
                        </Link>
                      ) : null}
                    </p>
                  ) : null}
                </div>
                <button type="button" className="chat-back-btn" onClick={() => navigate("/products")}>
                  Marketplace
                </button>
              </div>

              {error ? <div className="chat-error">{error}</div> : null}

              <div className="chat-messages">
                {!activeId ? (
                  <p className="chat-empty">Select a conversation or open a product to chat.</p>
                ) : messages.length === 0 ? (
                  <p className="chat-empty">Say hi—ask about condition, price, or pickup spot.</p>
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
                  placeholder={activeId ? "Type your message…" : "Pick a conversation first"}
                  disabled={!activeId}
                />
                <button type="submit" disabled={!activeId || !text.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function peerPreview(convo, myId) {
  if (!myId) return "";
  const uid = String(myId);
  const buyer = convo.buyerId?._id || convo.buyerId;
  if (String(buyer) === uid) {
    return convo.sellerId?.name ? `Seller: ${convo.sellerId.name}` : "Seller";
  }
  return convo.buyerId?.name ? `Buyer: ${convo.buyerId.name}` : "Buyer";
}

export default ChatPage;
