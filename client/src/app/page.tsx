"use client";

import { useEffect } from "react";
import { generateAndStoreKeys } from "@/lib/crypto/web-crypto";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import PRIVY_LOGO from "../../public/privy_logo.svg";

export default function HomePage() {
  useEffect(() => {
    const initKeys = async () => {
      try {
        await generateAndStoreKeys();
      } catch (error) {
        console.error("Failed to generate keys:", error);
        toast.error(
          "Failed to initialize encryption. Please refresh the page."
        );
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
        className="w-full max-w-3xl"
      >
        <Card className="border-2 pt-[12px] rounded-none border-dashed">
          <CardHeader className="flex flex-col items-center gap-[10px]">
            <Image src={PRIVY_LOGO} alt="Privy Logo" />
            <div className="flex flex-col items-center gap-[8px]">
              <CardTitle className="text-center text-3xl font-semibold lowercase">
                welcome to privy
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground text-md lowercase font-normal">
                lock a room or slide in — pgp secured, no receipts. stay
                anonymous af.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex justify-between gap-4 max-sm:flex-col max-sm:items-center max-sm:justify-center">
              <motion.div
                whileHover={{ scale: 1.0 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Link href="/create-room" className="w-full">
                  <Button
                    className="w-full text-lg font-semibold py-7 rounded-none lowercase text-white bg-transparent border-2 border-white/[0.1] border-dashed hover:text-black"
                    size="lg"
                  >
                    <span>Start a secure chat</span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.0 }}
                whileTap={{ scale: 0.98 }}
                className="w-full"
              >
                <Link href="/join-room" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full text-lg font-semibold py-7 rounded-none lowercase text-white bg-transparent border-2 border-white/[0.1] border-dashed hover:text-black hover:bg-white"
                    size="lg"
                  >
                    <span>Enter with a room code</span>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
