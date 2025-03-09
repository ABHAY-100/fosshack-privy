"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    setCode(value);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 8) {
      toast.error("Invalid room code!");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rooms/${code}`);
      if (!response.ok) throw new Error("Failed to check room");
      const { exists } = await response.json();

      if (!exists) {
        toast.error("Room does not exist or has expired.");
        return;
      }

      router.push(`/chat/${code}`);
    } catch {
      toast.error("Failed to verify room. Try again.");
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
                join room
              </CardTitle>
              <CardDescription className="text-center text-md text-muted-foreground lowercase">
                got a code? drop it in and you’re in.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="text-center space-y-2">
                  <div className="relative">
                    <div className="flex justify-center gap-2">
                      {Array(8)
                        .fill(0)
                        .map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="w-14 h-16"
                          >
                            <div
                              className={`border-2 border-dashed rounded-none h-full flex items-center justify-center text-2xl font-mono ${
                                code[i]
                                  ? "border-primary"
                                  : "border-muted-foreground/20"
                              }`}
                            >
                              {code[i] || ""}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                    <Input
                      type="text"
                      inputMode="text"
                      pattern="[A-Z0-9]*"
                      value={code}
                      onChange={handleCodeChange}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text caret-transparent"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10, display: "none" }}
                animate={{
                  opacity: code.length === 8 ? 1 : 0,
                  y: code.length === 8 ? 0 : 10,
                  display: code.length === 8 ? "block" : "none",
                }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={handleJoin}
                  className="w-full lowercase text-xl font-semibold py-7 rounded-none mt-2"
                  size="lg"
                >
                  step in and chat securely
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}