import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Minus, 
  RotateCcw, 
  Send, 
  ExternalLink, 
  Mail, 
  Phone, 
  Sparkles, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import { sendChatMessage, fetchChatSuggestions } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  'What services does DWARIX offer?',
  'Can you build AI applications?',
  'Show me your projects.',
  'What technologies do you use?',
  'How can I start a project?',
  'How can I contact DWARIX?'
];

export default function Chatbot({ onNavigate, onSelectService }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [teaseDismissed, setTeaseDismissed] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [failedLastMessage, setFailedLastMessage] = useState(null);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  // Load backend suggestions on mount
  useEffect(() => {
    fetchChatSuggestions().then((sugs) => {
      if (Array.isArray(sugs) && sugs.length > 0) {
        setSuggestions(sugs);
      }
    });
  }, []);

  // Format current timestamp (e.g. 10:45 AM)
  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Prevent background scrolling on mobile when open
  useEffect(() => {
    if (isOpen && !isMinimized && window.innerWidth <= 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMinimized]);

  // Close or minimize on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setMessages([
        {
          id: 1,
          type: 'bot',
          time: formatTime(),
          text: "Hi! I'm the DWARIX business assistant. How can I assist you with your digital engineering goals today?",
          chips: suggestions
        }
      ]);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, hasGreeted, suggestions]);

  // Send message to server backend API
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      type: 'me',
      time: formatTime(),
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setFailedLastMessage(null);

    // Call server API
    const response = await sendChatMessage(text);
    setIsTyping(false);

    if (response.success) {
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        time: formatTime(),
        text: response.reply,
        chips: response.quickReplies,
        links: response.links,
        preselectService: response.preselectService,
        actionTarget: response.actionTarget,
        emailAction: response.emailAction,
        callAction: response.callAction
      };
      setMessages((prev) => [...prev, botMsg]);
    } else {
      // Server error or network offline
      setFailedLastMessage(text);
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        isError: true,
        time: formatTime(),
        text: response.isNetworkError
          ? "Unable to reach the DWARIX server. Please check your connection or send your enquiry via the contact form."
          : response.message || "Something went wrong while processing your request.",
        chips: ['Fill Contact Form', 'What services does DWARIX offer?']
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleRetry = () => {
    if (failedLastMessage) {
      handleSendMessage(failedLastMessage);
    }
  };

  const handleChipClick = (chip) => {
    if (chip === 'Fill Contact Form' || chip === 'Go to Contact Form' || chip === 'Get a Quote') {
      navigateToTarget('#contact');
      return;
    }
    if (chip === 'Show our work') {
      navigateToTarget('#work');
      return;
    }
    if (chip === 'Show technologies') {
      navigateToTarget('#tech');
      return;
    }
    if (chip === 'Show the process') {
      navigateToTarget('#process');
      return;
    }
    handleSendMessage(chip);
  };

  const navigateToTarget = (selector, preselectSvc = null) => {
    if (preselectSvc && onSelectService) {
      onSelectService(preselectSvc);
    }

    if (onNavigate) {
      const id = selector.replace('#', '');
      onNavigate(id);
    } else {
      const el = document.querySelector(selector);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    // Auto-minimize on mobile
    if (window.innerWidth <= 640) {
      setIsMinimized(true);
    }
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        time: formatTime(),
        text: "Conversation cleared. How can I help you today?",
        chips: suggestions
      }
    ]);
    setFailedLastMessage(null);
    inputRef.current?.focus();
  };

  return (
    <div className={`cb ${isOpen ? 'cb-open' : ''} ${isMinimized ? 'cb-minimized' : ''}`} id="cb">
      {/* Floating Tease Badge */}
      {!teaseDismissed && !isOpen && (
        <div
          className="cb-tease show"
          id="cbTease"
          onClick={() => {
            setIsOpen(true);
            setTeaseDismissed(true);
          }}
          role="status"
          aria-label="Chat assistant teaser"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#34D399', animation: 'pulse 2s infinite' }} />
            <span>Need advice or an estimate? Ask our AI assistant.</span>
          </div>
        </div>
      )}

      {/* Main Chat Panel */}
      <div
        className="cb-panel"
        role="dialog"
        aria-label="DWARIX Business Assistant"
        aria-modal={isOpen && window.innerWidth <= 640}
        data-lenis-prevent
      >
        {/* Chat Header */}
        <div className="cb-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <img src={logoImg} alt="DWARIX emblem" />
              <span style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10B981',
                border: '2px solid #1B1E24'
              }} />
            </div>
            <div>
              <b>DWARIX AI Assistant</b>
              <small>Real-time knowledge • Connected to Atlas</small>
            </div>
          </div>

          {/* Action controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="cb-icon-btn"
              onClick={handleClearConversation}
              title="Clear chat history"
              aria-label="Clear chat history"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="cb-icon-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Expand' : 'Minimize'}
              aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              <Minus size={15} />
            </button>
            <button
              type="button"
              className="cb-icon-btn"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        {!isMinimized && (
          <>
            <div className="cb-body" id="cbBody" ref={bodyRef} aria-live="polite">
              {messages.map((msg) => (
                <div key={msg.id} className={`msg-wrapper ${msg.type}`}>
                  <div className={`msg ${msg.type} ${msg.isError ? 'err' : ''}`}>
                    {msg.isError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', marginBottom: '6px', fontWeight: 600 }}>
                        <AlertCircle size={15} />
                        <span>System Notice</span>
                      </div>
                    )}

                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                    {/* Preselection Action Banner */}
                    {msg.preselectService && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                          type="button"
                          className="cb-action-btn primary"
                          onClick={() => navigateToTarget(msg.actionTarget || '#contact', msg.preselectService)}
                        >
                          <Sparkles size={14} />
                          <span>Scope {msg.preselectService} in Form ↗</span>
                        </button>
                      </div>
                    )}

                    {/* Interactive Action Links */}
                    {msg.links && msg.links.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                        {msg.links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cb-link-pill"
                          >
                            <span>{link.label}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Quick Direct Actions */}
                    {(msg.emailAction || msg.callAction) && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        {msg.emailAction && (
                          <a href={msg.emailAction} className="cb-link-pill">
                            <Mail size={13} />
                            <span>Email Directly</span>
                          </a>
                        )}
                        {msg.callAction && (
                          <a href={msg.callAction} className="cb-link-pill">
                            <Phone size={13} />
                            <span>Call Directly</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="msg-time">{msg.time}</span>
                  </div>

                  {/* Quick Reply Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="qr">
                      {msg.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleChipClick(chip)}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Retry button on error */}
              {failedLastMessage && (
                <div style={{ alignSelf: 'flex-start', margin: '4px 0 8px' }}>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="cb-action-btn secondary"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <RefreshCw size={13} />
                    <span>Retry sending</span>
                  </button>
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="msg bot typing" aria-label="Assistant is analyzing response">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            <form className="cb-foot" id="cbForm" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} noValidate>
              <input
                ref={inputRef}
                id="cbInput"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about AI, Web, Projects, Timelines..."
                aria-label="Your message to DWARIX assistant"
                autoComplete="off"
                maxLength={500}
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!inputValue.trim() || isTyping}
                style={{ opacity: !inputValue.trim() || isTyping ? 0.6 : 1 }}
              >
                <Send size={16} />
              </button>
            </form>

            <div className="cb-note">
              Real-time assistant connected to live DWARIX services & projects.
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button Launcher */}
      <button
        ref={launcherRef}
        className="cb-fab"
        id="cbFab"
        aria-label={isOpen ? 'Close DWARIX assistant' : 'Open DWARIX assistant'}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
          setTeaseDismissed(true);
        }}
      >
        <svg className="o" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 5h16v11H9l-5 4Z" />
          <circle cx="9" cy="10.5" r=".9" fill="currentColor" />
          <circle cx="12" cy="10.5" r=".9" fill="currentColor" />
          <circle cx="15" cy="10.5" r=".9" fill="currentColor" />
        </svg>
        <svg className="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
