"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function CreateRoomPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    // Simply generate and set the room code, no storage needed
    setRoomCode(Math.floor(100000 + Math.random() * 900000).toString());
  }, []);

  const handleCopy = async () => {
    setCopying(true);
    await navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied to clipboard!");
    setCopying(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join My Chat Room",
          text: `Use this code to join my chat: ${roomCode}\n https://privy-client.vercel.app`,
        });
      } catch (err) {
        toast.error(`Couldn't share room code : ${err}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black from-background to-muted py-[60px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-dashed rounded-none">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 rounded-none"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center gap-[8px]">
              <CardTitle className="text-center text-3xl lowercase">
                Room Created
              </CardTitle>
              <CardDescription className="text-center text-sm text-muted-foreground lowercase">
                Scan the QR or share the code—your call.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-none border-2 border-dashed border-primary/20 w-40 mx-auto"
            >
              <QRCodeSVG
                value={`https://privy-client.vercel.app`}
                size={128}
                className="w-full h-full border-none rounded-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="text-md font-semibold text-muted-foreground lowercase">
                  room code ⬇️
                </div>
                <div className="text-4xl font-mono font-semibold tracking-wider bg-muted rounded-none py-3">
                  {roomCode.split("").map((digit, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="inline-block mx-1"
                    >
                      {digit}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-dashed border-primary/20 rounded-none py-5 lowercase text-md"
                  onClick={handleCopy}
                  disabled={copying}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-dashed border-primary/20 rounded-none py-5 lowercase text-md"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => router.push(`/chat/${roomCode}`)}
                className="w-full lowercase text-xl font-semibold py-7 rounded-none mt-2"
                size="lg"
              >
                Continue to Chat
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
