"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import {
  encryptMessage,
  decryptMessage,
  getKeysFromStorage,
  generateAndStoreKeys,
  exportPublicKey,
} from "@/lib/crypto/web-crypto";
import type { Message } from "@/types/chat";
import ChatHeader from "./chat-header";
import MessageList from "./message-list";
import MessageInput from "./message-input";

export default function ChatClient() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

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

    if (roomId) {
      initializeRoom();
    }
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

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full"
      >
        <div className="w-full h-full flex flex-col">
          <ChatHeader
            connectionStatus={connectionStatus}
            roomId={roomId}
            hasPeer={!!peerPublicKey}
            onBack={handleBack}
          />

          <MessageList
            messages={messages}
            scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
          />

          <MessageInput
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
          />
        </div>
      </motion.div>
    </div>
  );
}
