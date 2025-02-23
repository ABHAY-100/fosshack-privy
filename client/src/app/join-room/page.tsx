"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function JoinRoomPage() {
  const router = useRouter()
  const [code, setCode] = useState("")

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
    setCode(value)
  }

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
            <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-center text-2xl">Join Room</CardTitle>
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
                  <div className="text-sm text-muted-foreground">Enter Room Code</div>
                  <div className="relative">
                    <div className="flex justify-center gap-2">
                      {Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="w-10 h-12"
                          >
                            <div
                              className={`border-2 rounded-lg h-full flex items-center justify-center text-2xl font-mono ${
                                code[i] ? "border-primary" : "border-muted-foreground/20"
                              }`}
                            >
                              {code[i] || ""}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                    <Input
                      type="number"
                      pattern="\d*"
                      value={code}
                      onChange={handleCodeChange}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text caret-transparent"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: code.length === 6 ? 1 : 0, y: code.length === 6 ? 0 : 10 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={() => router.push(`/chat/${code}`)}
                  className="w-full"
                  size="lg"
                  disabled={code.length !== 6}
                >
                  Join Chat
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}