import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Phone, User, ArrowRight, Shield, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface ChatMessage {
  id: string;
  content: string;
  direction: "visitor" | "support";
  createdAt: string | null;
}

const STBCS_NUMBER = "(855) STB-1987";
const SESSION_KEY = "stbcs_chat_session";
const CHAT_STATE_KEY = "stbcs_chat_open";

function formatTime(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function LiveChatWidget() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [tcpaConsent, setTcpaConsent] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageCountRef = useRef(0);

  if (location === "/messages") return null;

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      setSessionToken(saved);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPulseAnimation(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch(`/api/live-chat/messages?sessionToken=${encodeURIComponent(sessionToken)}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);
        if (!isOpen && data.length > lastMessageCountRef.current) {
          setUnreadCount(prev => prev + (data.length - lastMessageCountRef.current));
        }
        lastMessageCountRef.current = data.length;
      }
    } catch {}
  }, [sessionToken, isOpen]);

  useEffect(() => {
    if (sessionToken) {
      fetchMessages();
      pollIntervalRef.current = setInterval(fetchMessages, 5000);
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [sessionToken, fetchMessages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized, sessionToken]);

  const startChat = async () => {
    if (!phone.trim() || !tcpaConsent) return;
    setIsStarting(true);
    setError("");
    try {
      const res = await fetch("/api/live-chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() || undefined, tcpaConsent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start chat");
      setSessionToken(data.sessionToken);
      sessionStorage.setItem(SESSION_KEY, data.sessionToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !sessionToken || isSending) return;
    const content = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    setMessages(prev => [...prev, {
      id: `temp-${Date.now()}`,
      content,
      direction: "visitor",
      createdAt: new Date().toISOString(),
    }]);

    try {
      const res = await fetch("/api/live-chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      await fetchMessages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endChat = async () => {
    if (sessionToken) {
      try {
        await fetch("/api/live-chat/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken }),
        });
      } catch {}
    }
    sessionStorage.removeItem(SESSION_KEY);
    setSessionToken(null);
    setMessages([]);
    setPhone("");
    setName("");
    setTcpaConsent(false);
    setIsOpen(false);
  };

  return (
    <>
      <style>{`
        @keyframes chat-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
        }
        @keyframes chat-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chat-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .chat-widget-open {
          animation: chat-slide-up 0.25s ease-out;
        }
        .chat-message-in {
          animation: chat-fade-in 0.2s ease-out;
        }
        .chat-bubble-pulse {
          animation: chat-pulse 2s ease-in-out infinite;
        }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @media (prefers-reduced-motion: reduce) {
          .chat-widget-open,
          .chat-message-in,
          .chat-bubble-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {isOpen && !isMinimized && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[380px] max-h-[min(600px,calc(100vh-120px))] flex flex-col rounded-2xl overflow-hidden border border-zinc-700/60 shadow-2xl shadow-black/40 chat-widget-open"
          style={{ backdropFilter: "blur(20px)" }}
          role="dialog"
          aria-label="Live chat with STB Cybersecurity"
          data-testid="live-chat-dialog"
        >
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 px-4 py-3 flex items-center justify-between border-b border-zinc-700/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Shield className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-tight">STB Cybersecurity</h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Online — typically replies in minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                aria-label="Minimize chat"
                data-testid="button-minimize-chat"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-colors"
                aria-label="Close chat"
                data-testid="button-close-chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!sessionToken ? (
            <div className="bg-zinc-900/95 flex-1 overflow-y-auto">
              <div className="p-5 space-y-4">
                <div className="text-center space-y-2 pb-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center">
                    <MessageSquare className="h-7 w-7 text-orange-400" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Need cybersecurity help?</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
                    Chat with our team via SMS. We help with incident response, ransomware recovery, and threat intelligence.
                  </p>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Your name (optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John"
                      autoComplete="given-name"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"
                      data-testid="input-chat-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Phone number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        autoComplete="tel"
                        required
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all"
                        data-testid="input-chat-phone"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                    <input
                      type="checkbox"
                      id="chat-tcpa-consent"
                      checked={tcpaConsent}
                      onChange={e => setTcpaConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-orange-500 shrink-0"
                      data-testid="checkbox-chat-tcpa-consent"
                    />
                    <label htmlFor="chat-tcpa-consent" className="text-[10px] text-zinc-500 leading-relaxed">
                      I agree to the{" "}
                      <a href="/sms-terms" target="_blank" rel="noopener" className="text-orange-400/80 hover:text-orange-400 underline">SMS Terms</a>
                      {" "}&amp;{" "}
                      <a href="/privacy" target="_blank" rel="noopener" className="text-orange-400/80 hover:text-orange-400 underline">Privacy Policy</a>
                      . I consent to SMS communication via {STBCS_NUMBER}. Msg &amp; data rates may apply. Reply STOP to opt out.
                    </label>
                  </div>

                  <button
                    onClick={startChat}
                    disabled={!phone.trim() || !tcpaConsent || isStarting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                    data-testid="button-start-chat"
                  >
                    {isStarting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Start Chat
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-zinc-600">
                  <Shield className="h-3 w-3" />
                  <span>Encrypted &amp; TCPA compliant</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto bg-zinc-900/95 p-4 space-y-3" style={{ minHeight: "280px", maxHeight: "400px" }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="flex gap-1 mb-3">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-orange-400/60 rounded-full typing-dot" style={{ animationName: "typing-dot", animationDuration: "1.2s", animationIterationCount: "infinite" }} />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500">Connecting you with our team...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[85%] chat-message-in",
                        msg.direction === "visitor" ? "ml-auto" : ""
                      )}
                    >
                      {msg.direction === "support" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-[10px] text-zinc-500 font-medium">STBCS Team</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                          msg.direction === "visitor"
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-orange-500/10"
                            : "bg-zinc-800 border border-zinc-700/50 text-zinc-200 rounded-bl-md"
                        )}
                      >
                        {msg.content}
                      </div>
                      <p className={cn(
                        "text-[10px] text-zinc-600 mt-1",
                        msg.direction === "visitor" ? "text-right" : ""
                      )}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-zinc-900/95 border-t border-zinc-700/50 p-3">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 transition-all min-h-[40px] max-h-24"
                    data-testid="input-chat-message"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isSending}
                    className="px-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center"
                    aria-label="Send message"
                    data-testid="button-chat-send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[9px] text-zinc-600">
                    SMS via {STBCS_NUMBER} · <a href="/sms-terms" target="_blank" rel="noopener" className="text-orange-400/50 hover:text-orange-400/80 underline">Terms</a>
                  </p>
                  <button
                    onClick={endChat}
                    className="text-[9px] text-zinc-600 hover:text-red-400 transition-colors"
                    data-testid="button-end-chat"
                  >
                    End chat
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {isOpen && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-20 right-4 sm:right-6 z-[9999] bg-zinc-900 border border-zinc-700/60 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl shadow-black/30 hover:border-orange-500/30 transition-all group"
          aria-label="Expand chat"
          data-testid="button-expand-chat"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-white">STB Cybersecurity</p>
            <p className="text-[10px] text-emerald-400">Chat active</p>
          </div>
          <Maximize2 className="h-4 w-4 text-zinc-500 group-hover:text-orange-400 transition-colors ml-2" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); setPulseAnimation(false); }}
          className={cn(
            "fixed bottom-4 right-4 sm:right-6 z-[9999] w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all",
            pulseAnimation && "chat-bubble-pulse"
          )}
          aria-label="Open live chat"
          data-testid="button-open-chat"
        >
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </>
  );
}