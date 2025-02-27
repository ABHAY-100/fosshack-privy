"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
}

export default function MessageInput({
  message,
  setMessage,
  onSend,
}: MessageInputProps) {
  return (
    <div className="bg-card border-t sticky bottom-0 z-10 p-4 shadow-md">
      <div className="flex gap-3">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          className="border-2 border-solid rounded-none focus:ring-0"
          style={{ outline: "none", boxShadow: "none" }}
        />
        <Button
          onClick={onSend}
          disabled={!message.trim()}
          className="rounded-none flex"
        >
          <Send className="h-4 w-6 scale-125" />
        </Button>
      </div>
    </div>
  );
}
