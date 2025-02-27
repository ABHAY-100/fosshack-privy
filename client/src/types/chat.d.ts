export type Message = {
  id: string;
  text: string;
  encryptedText?: string;
  sender: "user" | "other";
  timestamp: number;
};
