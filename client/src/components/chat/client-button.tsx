"use client";

import type { ReactNode } from "react";

interface ClientButtonProps {
  onClick: () => void;
  children: ReactNode;
}

export default function ClientButton({ onClick, children }: ClientButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent border-none cursor-pointer"
    >
      {children}
    </button>
  );
}
