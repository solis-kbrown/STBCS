import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import { 
  useSmsConversations, 
  useConversationMessages, 
  useSendSms,
  useMarkConversationRead,
  type SmsMessage,
  type SmsConversation
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  ArrowLeft,
  Lock,
  Crown,
  Plus,
  User,
  Clock,
  CheckCheck,
  Inbox
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

function ConversationsList({ 
  conversations, 
  selectedPhone, 
  onSelect 
}: { 
  conversations: SmsConversation[]; 
  selectedPhone: string | null; 
  onSelect: (phone: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Inbox className="h-12 w-12 text-zinc-600 mb-4" />
        <h3 className="text-lg font-medium text-zinc-300 mb-2">No messages yet</h3>
        <p className="text-sm text-zinc-500 max-w-xs">
          Messages from clients will appear here. Start a new conversation using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <button
          key={conv.phoneNumber}
          onClick={() => onSelect(conv.phoneNumber)}
          data-testid={`conversation-${conv.phoneNumber.replace(/\D/g, '')}`}
          className={cn(
            "w-full text-left p-3 rounded-lg transition-colors",
            selectedPhone === conv.phoneNumber
              ? "bg-orange-500/20 border border-orange-500/30"
              : "hover:bg-zinc-800/50"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200 truncate">
                    {formatPhoneNumber(conv.phoneNumber)}
                  </span>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-500 truncate">
                  {conv.lastMessage.content}
                </p>
              </div>
            </div>
            <span className="text-xs text-zinc-600 whitespace-nowrap">
              {conv.lastMessage.createdAt && formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function MessageThread({ 
  phoneNumber, 
  onBack 
}: { 
  phoneNumber: string; 
  onBack: () => void;
}) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading } = useConversationMessages(phoneNumber);
  const sendSms = useSendSms();
  const markRead = useMarkConversationRead();

  useEffect(() => {
    if (phoneNumber) {
      markRead.mutate(phoneNumber);
    }
  }, [phoneNumber]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendSms.mutate(
      { to: phoneNumber, content: message.trim() },
      {
        onSuccess: () => setMessage(""),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortedMessages = [...(messages || [])].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden"
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
          <User className="h-5 w-5 text-zinc-400" />
        </div>
        <div>
          <h3 className="font-medium text-zinc-200">{formatPhoneNumber(phoneNumber)}</h3>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Phone className="h-3 w-3" />
            SMS Conversation
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-3/4" />
            ))}
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            No messages in this conversation yet.
          </div>
        ) : (
          sortedMessages.map((msg) => (
            <div
              key={msg.id}
              data-testid={`message-${msg.id}`}
              className={cn(
                "max-w-[80%] p-3 rounded-xl",
                msg.direction === "outbound"
                  ? "ml-auto bg-orange-500/20 border border-orange-500/30"
                  : "bg-zinc-800 border border-zinc-700"
              )}
            >
              <p className="text-zinc-200 whitespace-pre-wrap break-words">{msg.content}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs text-zinc-500">
                  {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </span>
                {msg.direction === "outbound" && (
                  <CheckCheck className="h-3 w-3 text-zinc-500" />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="resize-none bg-zinc-800/50 border-zinc-700 min-h-[44px] max-h-32"
            rows={1}
            data-testid="input-message"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendSms.isPending}
            className="bg-orange-500 hover:bg-orange-600 px-4"
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-1.5">
          SMS via (855) STB-1987. Msg &amp; data rates may apply. <a href="/sms-terms" className="text-orange-400/60 hover:underline">SMS Terms</a>
        </p>
      </div>
    </div>
  );
}

function NewConversation({ onStart }: { onStart: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const sendSms = useSendSms();

  const handleSend = () => {
    if (!phone.trim() || !message.trim() || !smsConsent) return;
    sendSms.mutate(
      { to: phone.trim(), content: message.trim() },
      {
        onSuccess: () => {
          onStart(phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`);
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-medium text-zinc-200">New Conversation</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Phone Number</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="bg-zinc-800/50 border-zinc-700"
            data-testid="input-new-phone"
          />
        </div>
        <div>
          <label className="text-sm text-zinc-400 mb-1 block">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-zinc-800/50 border-zinc-700 min-h-[100px]"
            data-testid="input-new-message"
          />
        </div>
        <div className="flex items-start gap-2 p-2 bg-zinc-800/30 rounded-lg">
          <input
            type="checkbox"
            id="sms-messaging-consent"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 accent-orange-500"
            data-testid="checkbox-sms-messaging-consent"
          />
          <label htmlFor="sms-messaging-consent" className="text-[11px] text-zinc-500 leading-relaxed">
            I agree to the{" "}
            <a href="/sms-terms" target="_blank" className="text-orange-400/70 hover:underline">SMS Terms &amp; Conditions</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" className="text-orange-400/70 hover:underline">Privacy Policy</a>
            . I consent to two-way SMS communication via (855) STB-1987. Message and data rates may apply. Reply STOP to opt out. Reply HELP for help.
          </label>
        </div>
        <Button
          onClick={handleSend}
          disabled={!phone.trim() || !message.trim() || !smsConsent || sendSms.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600"
          data-testid="button-start-conversation"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </div>
    </div>
  );
}

export default function Messages() {
  useDocumentTitle("Messages | STB Cybersecurity", "Secure two-way SMS messaging with STB Cybersecurity for Business subscribers. Direct communication for incident response and threat alerts.");
  const { user, isAuthenticated, isBusiness } = useAuth();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  
  const { data: conversations, isLoading } = useSmsConversations();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-900/50">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                <Lock className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Business Exclusive</h2>
              <p className="text-zinc-400 mb-6">
                The Messages Center allows two-way SMS communication with clients. Sign in with a Business subscription to access this exclusive feature.
              </p>
              <p className="text-sm text-zinc-500">
                Click "Sign In" in the header to continue.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isBusiness) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-900/50">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                <Crown className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Business Exclusive Feature</h2>
              <p className="text-zinc-400 mb-6">
                Two-way SMS messaging is an exclusive feature for Business subscribers. Upgrade to our Business plan to unlock direct client communication.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600" asChild>
                <a href="/pricing">Upgrade to Business</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-orange-400" />
            Messages
          </h1>
          <p className="text-zinc-400 mt-2">
            Two-way SMS communication with clients via (855) STB-1987
          </p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="flex h-[calc(100vh-280px)] min-h-[500px]">
            <div className={cn(
              "w-full md:w-80 lg:w-96 border-r border-zinc-800 flex flex-col",
              selectedPhone && "hidden md:flex"
            )}>
              <div className="p-4 border-b border-zinc-800">
                <Button
                  onClick={() => {
                    setShowNewConversation(true);
                    setSelectedPhone(null);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  data-testid="button-new-conversation"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <ConversationsList
                    conversations={conversations || []}
                    selectedPhone={selectedPhone}
                    onSelect={(phone) => {
                      setSelectedPhone(phone);
                      setShowNewConversation(false);
                    }}
                  />
                )}
              </div>
            </div>

            <div className={cn(
              "flex-1 flex flex-col",
              !selectedPhone && !showNewConversation && "hidden md:flex"
            )}>
              {showNewConversation ? (
                <NewConversation
                  onStart={(phone) => {
                    setSelectedPhone(phone);
                    setShowNewConversation(false);
                  }}
                />
              ) : selectedPhone ? (
                <MessageThread
                  phoneNumber={selectedPhone}
                  onBack={() => setSelectedPhone(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">Select a conversation</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                      Choose a conversation from the list or start a new one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
