"use client";

import React, { useState, useRef, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import DOMPurify from "dompurify";
import {
  encryptMessage,
  decryptMessage,
  getKeysFromStorage,
  generateAndStoreKeys,
  exportPublicKey,
} from "@/lib/crypto/web-crypto";
import { toast } from "sonner";
import { Message } from "@/types/chat";

import User1 from "@/assets/user_1.jpg";
import User2 from "@/assets/user_2.jpg";

function ChatClient({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerPublicKey, setPeerPublicKey] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        let keys = await getKeysFromStorage();
        if (!keys) {
          keys = await generateAndStoreKeys();
        }

        const publicKeyString = await exportPublicKey(keys.publicKey);

        if (!publicKeyString || !keys.privateKey) {
          toast.error("Failed to initialize encryption keys");
          router.push("/");
          return;
        }

        const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
          auth: {
            publicKey: publicKeyString,
            roomId: roomId,
          },
          reconnectionAttempts: 3,
          timeout: 5000,
        });

        const handleRegister = () => {
          socketInstance.emit("register", {
            publicKey: publicKeyString,
            roomId: roomId,
          });
        };

        socketInstance.on("connect", () => {
          setConnectionStatus("Connected");
          handleRegister();
        });

        socketInstance.on("room_full", () => {
          router.push("/");
          toast.error("Room is full");
        });

        socketInstance.on("disconnect", (reason) => {
          setConnectionStatus("Disconnected");
          sessionStorage.removeItem(`peerKey-${roomId}`);
          if (reason === "io server disconnect") {
            router.push("/");
          }
        });

        socketInstance.on("connect_error", (err) => {
          toast.error("Connection error");
          setConnectionStatus(`Error: ${err.message}`);
        });

        socketInstance.on(
          "room message",
          async (data: {
            id: string;
            message: string;
            from: string;
            timestamp: number;
          }) => {
            try {
              const myKeys = await getKeysFromStorage();
              if (!myKeys) throw new Error("No keys found");

              const decryptedMessage = await decryptMessage(
                data.message,
                myKeys.privateKey
              );

              setMessages((prev) => [
                ...prev,
                {
                  id: data.id,
                  text: decryptedMessage,
                  encryptedText: data.message,
                  sender:
                    data.from === myKeys.publicKeyString ? "user" : "other",
                  timestamp: data.timestamp,
                },
              ]);
            } catch (error: unknown) {
              toast.error(String(error));
            }
          }
        );

        socketInstance.on("peers list", ({ peers }: { peers: string[] }) => {
          if (peers.length > 0) {
            const existingPeerKey = peers[0];
            sessionStorage.setItem(`peerKey-${roomId}`, existingPeerKey);
            setPeerPublicKey(existingPeerKey);
          }
        });

        socketInstance.on("peer connected", ({ peerKey }) => {
          sessionStorage.setItem(`peerKey-${roomId}`, peerKey);
          setPeerPublicKey(peerKey);
        });

        socketInstance.on("peer disconnected", () => {
          sessionStorage.removeItem(`peerKey-${roomId}`);
          setPeerPublicKey("");
        });

        socketInstance.on("error", (error) => {
          console.error("Socket error:", error);
          if (error.code === "INVALID_REGISTRATION") {
            toast.error(error.code);
            router.push("/");
          }

          if (error.code === "ROOM_FULL") {
            router.push("/");
            toast.error("Room Full");
          } else {
            toast.error(error.message);
          }
        });

        setSocket(socketInstance);

        return () => {
          sessionStorage.removeItem(`peerKey-${roomId}`);
          socketInstance.disconnect();
        };
      } catch (error) {
        console.error("Room initialization failed:", error);
        toast.error("Failed to establish secure connection");
        router.push("/join-room");
      }
    };

    initializeRoom();
  }, [roomId, router]);

  const handleSend = async () => {
    if (!message.trim() || !socket || !peerPublicKey) return;

    try {
      const sanitizedMessage = DOMPurify.sanitize(message.trim());

      const peerKeyData = Uint8Array.from(atob(peerPublicKey), (c) =>
        c.charCodeAt(0)
      );
      const peerKey = await window.crypto.subtle.importKey(
        "spki",
        peerKeyData,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
      );

      const encryptedMessage = await encryptMessage(sanitizedMessage, peerKey);
      const tempId = `${socket.id}-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          text: message,
          encryptedText: encryptedMessage,
          sender: "user",
          timestamp: Date.now(),
        },
      ]);

      socket.emit(
        "room message",
        { message: encryptedMessage },
        (ack: { status: string; messageId: string }) => {
          if (ack.status === "delivered") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempId ? { ...msg, id: ack.messageId } : msg
              )
            );
          }
        }
      );

      setMessage("");
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex items-center justify-center bg-black w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full"
      >
        <div className="w-full h-full flex flex-col">
          {/* Fixed Header */}
          <div className="bg-card border-b sticky top-0 z-10 shadow-md">
            <div className="p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="gap-2 bg-white/5 rounded-none ml-[-6px]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <Avatar className="border-[1px] border-white">
                    <Image
                      src={User1}
                      alt="User 1"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </Avatar>

                  {peerPublicKey && (
                    <Avatar className="border-[1px] border-white">
                      <Image
                        src={User2}
                        alt="User 2"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </Avatar>
                  )}
                </div>
                <div className="hidden font-medium px-3 text-sm tracking-wide sm:flex items-center bg-white/5 py-2">
                  status: {connectionStatus}
                </div>
                <div className="hidden font-medium px-3 text-sm tracking-wide sm:flex items-center bg-white/5 py-2">
                  room id: {roomId}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto p-4">
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
                    <div
                      className={`max-w-[75%] flex gap-3 ${
                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>
                          {msg.sender === "user" ? (
                            <Image
                              src={User1}
                              alt="User 1"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <Image
                              src={User2}
                              alt="User 2"
                              className="w-full h-full object-cover rounded-full"
                            />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`py-2 px-4 rounded-xl max-w-[50vw] break-words whitespace-normal overflow-hidden ${
                          msg.sender === "user"
                            ? "bg-[#512FEB] text-white"
                            : "bg-white/[0.1] text-white"
                        }`}
                      >
                        <p
                          className="font-semibold"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(msg.text),
                          }}
                        ></p>
                        <p
                          className={`text-xs ${
                            msg.sender === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        ></p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={scrollRef} />
              </div>
            </AnimatePresence>
          </div>

          {/* Fixed Footer */}
          <div className="bg-card border-t sticky bottom-0 z-10 p-4 shadow-md">
            <div className="flex gap-3">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="border-2 border-solid rounded-none focus:ring-0"
                style={{ outline: "none", boxShadow: "none" }}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className="rounded-none flex"
              >
                <Send className="h-4 w-6 scale-125" />
              </Button>
            </div>
          </div>
        </div>
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
