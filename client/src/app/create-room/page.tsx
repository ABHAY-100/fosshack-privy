"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function CreateRoomPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [copying, setCopying] = useState(false);

  /** Generate 6-digit room code on component mount */
  useEffect(() => {
    setRoomCode(Math.floor(100000 + Math.random() * 900000).toString());
  }, []);

  /** Handle copy to clipboard with user feedback */
  const handleCopy = async () => {
    setCopying(true);
    await navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied to clipboard!");
    setCopying(false);
  };

  /** Handle native share if available on device */
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my chat room",
          text: `Join my chat room with code: ${roomCode} https://privy-client.vercel.app/join-room`,
        });
      } catch (err) {
        toast.error(`Couldn't share room code : ${err}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black from-background to-muted py-[120px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-center text-2xl">Room Created</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20"
            >
              <QRCodeSVG
                value={`https://privy-client.vercel.app/chat/${roomCode}`}
                size={128}
                className="w-full h-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">Room Code</div>
                <div className="text-4xl font-mono font-semibold tracking-wider bg-muted rounded-lg py-4">
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
                  className="flex-1"
                  onClick={handleCopy}
                  disabled={copying}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
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
                className="w-full"
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