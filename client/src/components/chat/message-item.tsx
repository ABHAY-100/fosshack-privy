import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import DOMPurify from "dompurify";
import type { Message } from "@/types/chat";
import User1 from "@/assets/user_1.jpg";
import User2 from "@/assets/user_2.jpg";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message: msg }: MessageItemProps) {
  return (
    <div
      className={`max-w-[75%] flex gap-3 ${
        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar className="h-7 w-7">
        <AvatarFallback>
          {msg.sender === "user" ? (
            <Image
              src={User1 || "/placeholder.svg"}
              alt="User 1"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <Image
              src={User2 || "/placeholder.svg"}
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
            msg.sender === "user" ? "text-blue-100" : "text-gray-500"
          }`}
        ></p>
      </div>
    </div>
  );
}
