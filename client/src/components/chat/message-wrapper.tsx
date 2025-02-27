"use client";

import { motion } from "framer-motion";
import type { Message } from "@/types/chat";
import MessageItem from "./message-item";

interface MessageWrapperProps {
  message: Message;
}

export default function MessageWrapper({ message }: MessageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <MessageItem message={message} />
    </motion.div>
  );
}
