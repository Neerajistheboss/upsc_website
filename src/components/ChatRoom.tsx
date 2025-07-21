import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Message {
  id: string;
  user: string;
  content: string;
  createdAt: number;
}

interface ChatRoomProps {
  messages: Message[];
  displayName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  typingUsers: { [userId: string]: string };
  userId: string;
  setTyping: (isTyping: boolean) => void;
  messageInputRef: React.RefObject<HTMLInputElement>;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  messages,
  displayName,
  messageText,
  setMessageText,
  handleSendMessage,
  typingUsers,
  userId,
  setTyping,
  messageInputRef,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Virtualizer for dynamic height
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 8,
  });

  const items = virtualizer.getVirtualItems();

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (parentRef.current && items.length > 0) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className="flex flex-col flex-1 bg-card border rounded-lg p-4">
      <div
        ref={parentRef}
        className="h-[57vh] overflow-y-auto bg-background/50"
        style={{ position: 'relative', contain: 'strict' }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.map((virtualRow) => {
              const msg = messages[virtualRow.index];
              const isMine = msg.user === displayName;
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-4 py-2 rounded-lg mb-4 border ${isMine ? 'bg-primary/90 text-primary-foreground' : 'bg-background text-foreground'}`}>
                    <div className="text-xs font-medium mb-1">{msg.user}</div>
                    <div>{msg.content}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Typing indicator */}
      <div className="min-h-[20px] px-4 text-xs text-muted-foreground" style={{ height: '20px' }}>
        {Object.entries(typingUsers)
          .filter(([id]) => id !== userId)
          .map(([id, name]) => name)
          .slice(0, 3)
          .join(', ') +
          (Object.keys(typingUsers).filter(id => id !== userId).length > 0 ?
            (Object.keys(typingUsers).filter(id => id !== userId).length === 1 ? ' is typing...' : ' are typing...') :
            '')}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-background">
        <input
          ref={messageInputRef}
          type="text"
          value={messageText}
          onChange={e => {
            setMessageText(e.target.value);
            setTyping(true);
            if ((window as any).typingTimeoutRef) clearTimeout((window as any).typingTimeoutRef);
            (window as any).typingTimeoutRef = setTimeout(() => setTyping(false), 2000);
          }}
          onBlur={() => setTyping(false)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground"
          autoComplete="off"
        />
        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom; 