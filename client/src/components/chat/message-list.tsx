import type { Message } from "@/types/chat";
import type { RefObject } from "react";
import MessageWrapper from "./message-wrapper";

interface MessageListProps {
  messages: Message[];
  scrollRef: RefObject<HTMLDivElement>;
}

export default function MessageList({ messages, scrollRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="space-y-4">
        {messages.map((msg) => (
          <MessageWrapper key={msg.id} message={msg} />
        ))}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
