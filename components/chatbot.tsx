"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, User } from "lucide-react";
import Image from "next/image";
import { continueConversation, Message } from "@/actions/chat";
import { readStreamableValue } from "ai/rsc";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey there! How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await continueConversation([...messages, userMessage]);
      const { newMessage } = result;

      let accumulatedContent = "";
      let assistantMessageAdded = false;

      for await (const delta of readStreamableValue(newMessage)) {
        if (delta) {
          accumulatedContent += delta;
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];

            if (!assistantMessageAdded) {
              newMessages.push({
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: accumulatedContent,
              });
              assistantMessageAdded = true;
            } else if (lastMessage?.role === "assistant") {
              lastMessage.content = accumulatedContent;
            }
            return newMessages;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 p-0 bg-orange-500 hover:bg-orange-600"
          >
            <Image src="/images/bot.png" alt="Bot" width={40} height={40} />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="
          fixed bottom-4 right-4 z-50
          w-[95vw] max-w-[380px]
          h-[90vh] max-h-[600px] min-h-[500px]
          sm:w-[400px] sm:max-w-[420px]
          md:w-[450px] md:max-w-[480px]
          "
        >
          <Card className="bg-gray-900 border border-orange-500/30 shadow-2xl rounded-lg h-full flex flex-col">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/bot.png"
                    alt="Bot"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <CardTitle className="text-base sm:text-lg">
                    GTD Assistant
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4 text-white" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-3 pt-3">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-black border-2 border-orange-400 p-1 flex-shrink-0 self-start">
                          <Image
                            src="/images/bot.png"
                            alt="Bot"
                            width={24}
                            height={24}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div
                        className={`${
                          message.role === "user"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-800 text-gray-100"
                        } rounded-lg p-2 max-w-[80%] text-sm sm:text-base`}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="bg-gray-700 rounded-full p-1 flex-shrink-0 self-start">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-black border-2 border-orange-400 p-1 flex-shrink-0 self-start">
                        <Image
                          src="/images/bot.png"
                          alt="Bot"
                          width={24}
                          height={24}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="bg-gray-800 rounded-lg p-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="border-t border-gray-700 p-3">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
