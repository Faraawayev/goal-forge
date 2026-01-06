import { PageLayout } from "@/components/layout-sidebar";
import { useChatStream, useConversations, useCreateConversation, useConversation } from "@/hooks/use-ai-chat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Plus, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Chat() {
  const { data: conversations, isLoading: loadingConversations } = useConversations();
  const createConversation = useCreateConversation();
  const [activeId, setActiveId] = useState<number | null>(null);

  // Select first conversation on load if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations]);

  const handleNewChat = () => {
    createConversation.mutate("New Goal Session", {
      onSuccess: (newConvo) => setActiveId(newConvo.id)
    });
  };

  return (
    <PageLayout title="AI Goal Coach">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat Sidebar */}
        <Card className="hidden md:flex flex-col col-span-1 p-4 gap-4 h-full">
          <Button onClick={handleNewChat} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" /> New Session
          </Button>
          
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-4">
              {loadingConversations ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)
              ) : conversations?.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveId(chat.id)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center gap-3",
                    activeId === chat.id 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-accent text-muted-foreground"
                  )}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-1 md:col-span-3 flex flex-col h-full overflow-hidden border shadow-lg relative">
          {activeId ? (
            <ChatWindow conversationId={activeId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <Bot className="w-16 h-16 mb-4 text-primary/20" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Your Personal Productivity Coach</h3>
              <p className="max-w-md mb-6">
                I can help you break down big goals into SMART tasks, review your sprint progress, or just brainstorm ideas.
              </p>
              <Button onClick={handleNewChat}>Start a Conversation</Button>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}

function ChatWindow({ conversationId }: { conversationId: number }) {
  const { data: conversation, isLoading } = useConversation(conversationId);
  const { sendMessage, isStreaming, streamedContent } = useChatStream(conversationId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages, streamedContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  if (isLoading) return <div className="p-8 flex items-center justify-center h-full"><Skeleton className="w-full h-full" /></div>;

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/20" ref={scrollRef}>
        {conversation?.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-3xl mx-auto",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-emerald-600 text-white"
            )}>
              {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={cn(
              "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
              msg.role === "user" 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-card border border-border rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isStreaming && (
          <div className="flex gap-3 max-w-3xl mx-auto animate-in fade-in duration-300">
             <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-card border border-border text-sm leading-relaxed shadow-sm">
              {streamedContent || <span className="animate-pulse">Thinking...</span>}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-card border-t border-border">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for help with your goals..."
            className="pr-12 py-6 rounded-xl shadow-inner bg-accent/30 border-transparent focus:bg-background focus:border-primary/50 transition-all"
            disabled={isStreaming}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 top-1.5 rounded-lg h-9 w-9 shadow-sm"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
