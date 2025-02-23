"use client";

import { useEffect } from "react";
import { generateAndStoreKeys } from "@/lib/cryptoUtils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  /** Generate and store encryption keys on first visit */
  useEffect(() => {
    const initKeys = async () => {
      try {
        await generateAndStoreKeys();
      } catch (error) {
        console.error("Failed to generate keys:", error);
        toast.error("Failed to initialize encryption. Please refresh the page.");
      }
    };

    initKeys();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black from-background to-muted py-[120px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 pt-[12px]">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-semibold">
              Welcome to Privy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Create Room Button with animation */}
            <motion.div whileHover={{ scale: 1.0 }} whileTap={{ scale: 0.98 }}>
              <Link href="/create-room" className="w-full">
                <Button className="w-full text-lg py-8 space-x-4" size="lg">
                  <span>Create Room</span>
                </Button>
              </Link>
            </motion.div>
            {/* Join Room Button with animation */}
            <motion.div whileHover={{ scale: 1.0 }} whileTap={{ scale: 0.98 }}>
              <Link href="/join-room" className="w-full">
                <Button
                  variant="outline"
                  className="w-full text-lg py-8 space-x-4"
                  size="lg"
                >
                  <span>Join Room</span>
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
