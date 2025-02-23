"use client";

import React, { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { io, Socket } from "socket.io-client";
import { encryptMessage, decryptMessage, getKeysFromStorage } from '@/lib/cryptoUtils';
import { toast } from "sonner";

type Message = {
  id: string;
  text: string;
  encryptedText?: string;
  sender: "user" | "other";
  timestamp: number;
};

function ChatClient({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerPublicKey, setPeerPublicKey] = useState(
    sessionStorage.getItem(`peerKey-${roomId}`) || ""
  );
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [publicKey, setPublicKey] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedKey = sessionStorage.getItem("keyedin_publickey");
    if (!storedKey?.trim()) {
      router.push("/");
      return;
    }
    setPublicKey(storedKey);

    if (!roomId?.trim()) {
      router.push("/");
      return;
    }

    const socketInstance = io("https://bmh7d6sg-5000.inc1.devtunnels.ms/", {
      auth: {
        publicKey: storedKey,
        roomId: roomId
      },
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    const handleRegister = () => {
      socketInstance.emit("register", { 
        publicKey: storedKey,
        roomId: roomId 
      }, (response: { status: string }) => {
        if (response?.status !== "success") {
          console.error("Registration failed");
        }
      });
    };

    socketInstance.on("connect", () => {
      setConnectionStatus("Connected");
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      setConnectionStatus(`Disconnected: ${reason}`);
      sessionStorage.removeItem(`peerKey-${roomId}`);
      if (reason === "io server disconnect") {
        router.push("/");
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setConnectionStatus(`Error: ${err.message}`);
    });

    socketInstance.on("room message", async (data: {
      id: string, 
      message: string, 
      from: string, 
      timestamp: number
    }) => {
      try {
        const myKeys = await getKeysFromStorage();
        if (!myKeys) throw new Error("No keys found");

        const decryptedMessage = await decryptMessage(data.message, myKeys.privateKey);
        
        setMessages(prev => [...prev, {
          id: data.id,
          text: decryptedMessage,
          encryptedText: data.message,
          sender: data.from === storedKey ? "user" : "other",
          timestamp: data.timestamp
        }]);
      } catch (error) {
        console.error("Decryption error:", error);
      }
    });

    // Inside the useEffect where socket events are set up
socketInstance.on("peers list", ({ peers }: { peers: string[] }) => {
  if (peers.length > 0) {
    const existingPeerKey = peers[0]; // Assuming 1:1 chat
    sessionStorage.setItem(`peerKey-${roomId}`, existingPeerKey);
    setPeerPublicKey(existingPeerKey);
    console.log("Received existing peers:", peers);
  }
});

    socketInstance.on("peer connected", ({ peerKey }) => {
      sessionStorage.setItem(`peerKey-${roomId}`, peerKey);
      setPeerPublicKey(peerKey);
      console.log("Peer connected:", peerKey);
    });

    socketInstance.on("peer disconnected", () => {
      sessionStorage.removeItem(`peerKey-${roomId}`);
      setPeerPublicKey("");
      console.log("Peer disconnected");
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      if (error.code === "INVALID_REGISTRATION") {
        router.push("/");
      }
      
      if (error.code === 'ROOM_FULL') {
        // Display a toast notification
        router.push("/");
        toast.error("Room Full") // Replace with your toast library (e.g., Toastify, SweetAlert)
    } else {
        console.error('Registration error:', error.message);
    }
    });

    if (socketInstance.connected) {
      handleRegister();
    } else {
      socketInstance.on("connect", handleRegister);
    }

    setSocket(socketInstance);

    return () => {
      sessionStorage.removeItem(`peerKey-${roomId}`);
      socketInstance.off("connect", handleRegister);
      socketInstance.disconnect();
    };
  }, [roomId, router]);

  const handleSend = async () => {
    if (!message.trim() || !socket || !peerPublicKey) return;

    try {
      const peerKeyData = Uint8Array.from(atob(peerPublicKey), c => c.charCodeAt(0));
      const peerKey = await window.crypto.subtle.importKey(
        'spki',
        peerKeyData,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        true,
        ['encrypt']
      );

      const encryptedMessage = await encryptMessage(message, peerKey);
      const tempId = `${socket.id}-${Date.now()}`;
      
      setMessages(prev => [...prev, {
        id: tempId,
        text: message,
        encryptedText: encryptedMessage,
        sender: "user",
        timestamp: Date.now()
      }]);

      socket.emit("room message", 
        { message: encryptedMessage },
        (ack: { status: string; messageId: string }) => {
          if (ack.status === "delivered") {
            setMessages(prev => prev.map(msg => 
              msg.id === tempId ? { ...msg, id: ack.messageId } : msg
            ));
          }
        }
      );

      setMessage("");
    } catch (error) {
      console.error("Encryption error:", error);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl p-4"
      >
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <Avatar className="border-2 border-white">
                    <AvatarFallback>
                      {publicKey.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {peerPublicKey && (
                    <Avatar className="border-2 border-white">
                      <AvatarFallback>
                        {peerPublicKey.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {connectionStatus}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 h-[70vh] flex flex-col">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <AnimatePresence initial={false}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`max-w-[75%] flex gap-2 ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {msg.sender === "user"
                              ? publicKey.slice(0, 2).toUpperCase()
                              : peerPublicKey.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-black"
                        }`}>
                          <p className="font-semibold">{msg.text}</p>
                          {msg.encryptedText && (
                            <p className="text-xs mt-1 font-mono break-all opacity-50">
                              Encrypted: {msg.encryptedText.substring(0, 50)}...
                            </p>
                          )}
                          <p className={`text-xs mt-1 ${
                            msg.sender === "user" 
                              ? "text-blue-100" 
                              : "text-gray-500"
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </AnimatePresence>
            </ScrollArea>

            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button 
                  onClick={handleSend}
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  return <ChatClient roomId={roomId} />;
}