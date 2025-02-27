import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import User1 from "@/assets/user_1.jpg";
import User2 from "@/assets/user_2.jpg";
import ClientButton from "./client-button";

interface ChatHeaderProps {
  connectionStatus: string;
  roomId: string;
  hasPeer: boolean;
  onBack: () => void;
}

export default function ChatHeader({
  connectionStatus,
  roomId,
  hasPeer,
  onBack,
}: ChatHeaderProps) {
  return (
    <div className="bg-card border-b sticky top-0 z-10 shadow-md">
      <div className="p-4 flex items-center justify-between">
        <ClientButton onClick={onBack}>
          <div className="gap-2 bg-white/5 rounded-none ml-[-6px] flex items-center px-3 py-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </div>
        </ClientButton>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <Avatar className="border-[1px] border-white">
              <Image
                src={User1 || "/placeholder.svg"}
                alt="User 1"
                className="w-full h-full object-cover rounded-full"
              />
            </Avatar>

            {hasPeer && (
              <Avatar className="border-[1px] border-white">
                <Image
                  src={User2 || "/placeholder.svg"}
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
  );
}
