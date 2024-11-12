// src/constants/chat.ts
import { ChatMessage } from "@/types/chat";

export const getWelcomeMessage = (): ChatMessage => {
  const messages = [
    "Hi! I'm your music mood assistant. Tell me how you're feeling, what you're doing, or what kind of music you're in the mood for!",
    "Ready to find your perfect soundtrack? Let me know your mood or what you're up to!",
    "Welcome to MoodMix! Share your current vibe, and I'll help create the perfect playlist for you!",
    "Hey there! Looking for the perfect music to match your mood? I'm here to help!",
  ];

  return {
    role: "assistant",
    content: messages[Math.floor(Math.random() * messages.length)],
    timestamp: Date.now(),
  };
};

export const WELCOME_MESSAGE = getWelcomeMessage();
