"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import Chatbot from "./Chatbot";

export default function ChatbotWrapper() {
  const { user, userProfile } = useAuth();

  if (!user) return null;

  return <Chatbot userId={user.id} userProfile={userProfile} />;
}
