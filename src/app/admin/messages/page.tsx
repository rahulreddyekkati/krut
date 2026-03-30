"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../admin.module.css";

export default function AdminMessagesPage() {
    const [threads, setThreads] = useState<any[]>([]);
    const [currentChat, setCurrentChat] = useState<any | null>(null);
    const [messageContent, setMessageContent] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [contacts, setContacts] = useState<any[]>([]);
    const [isSelectingContact, setIsSelectingContact] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            await fetchUser();
            await fetchThreads();
            setIsLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (isSelectingContact) {
            fetchContacts();
        }
    }, [isSelectingContact, searchTerm]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentChat?.messages]);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                if (data?.user) {
                    setUser(data.user);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    };

    const fetchThreads = async () => {
        try {
            const res = await fetch("/api/messages");
            if (res.ok) {
                setThreads(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch threads", error);
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch(`/api/messages/contacts?q=${encodeURIComponent(searchTerm)}`);
            if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
                setContacts(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        }
    };

    const handleStartChat = async (contact: any) => {
        const existingThread = threads.find(t => 
            t.type === "DIRECT" && t.participants?.some((p: any) => p.id === contact.id)
        );

        if (existingThread) {
            setCurrentChat(existingThread);
        } else {
            setCurrentChat({
                type: "DIRECT",
                participants: [user, contact],
                messages: [],
                tempRecipientId: contact.id
            });
        }
        setIsSelectingContact(false);
        setSearchTerm("");
    };

    const sendMessage = async () => {
        if (!messageContent.trim()) return;
        try {
            const body: any = { content: messageContent };
            if (currentChat?.id) {
                body.threadId = currentChat.id;
            } else if (currentChat?.tempRecipientId) {
                body.recipientId = currentChat.tempRecipientId;
            }

            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const newMessage = await res.json();
                if (currentChat) {
                    setCurrentChat({
                        ...currentChat,
                        id: newMessage.threadId,
                        messages: [...(currentChat.messages || []), newMessage],
                        tempRecipientId: undefined
                    });
                }
                setMessageContent("");
                fetchThreads();
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading messaging...</div>;

    return (
        <div className={styles.messageContainer} style={{ height: 'calc(100vh - 80px)', position: 'relative', overflowX: 'hidden' }}>
            {/* Sidebar / Thread List */}
            <div className={`${styles.messageSidebar} ${currentChat && !isSelectingContact ? styles.messageSidebarHidden : ""}`}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <h1 className="heading h3" style={{ margin: 0 }}>Messages</h1>
                    <button 
                        className={styles.desktopOnlyBtn}
                        onClick={() => { setIsSelectingContact(true); setCurrentChat(null); }}
                        style={{ background: '#6366f1', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>

                {/* Mobile Floating New Message Button */}
                {!currentChat && !isSelectingContact && (
                    <button 
                        className={styles.floatingBtn}
                        onClick={() => { setIsSelectingContact(true); setCurrentChat(null); }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                )}

                <div style={{ padding: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            style={{ width: '100%', padding: '0.5rem 1rem', paddingLeft: '2.25rem', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', background: '#f3f4f6' }}
                        />
                        <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {isSelectingContact ? (
                        <div>
                            <div style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacts</div>
                            <div style={{ padding: '0.5rem 1.25rem' }}>
                                <input 
                                    type="text" 
                                    placeholder="To: Name, Market or Store" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }}
                                    autoFocus
                                />
                            </div>
                            {contacts.map(contact => (
                                <div 
                                    key={contact.id} 
                                    onClick={() => handleStartChat(contact)}
                                    className={styles.threadItem}
                                >
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{contact.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                                        {contact.role.replace('_', ' ')} • {contact.market?.name || contact.homeStore?.name || "Global"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        threads.map(thread => {
                            const recipient = thread.participants?.find((p: any) => p.id !== user?.id);
                            const isActive = currentChat?.id === thread.id;
                            return (
                                <div 
                                    key={thread.id} 
                                    onClick={() => { setCurrentChat(thread); setIsSelectingContact(false); }}
                                    className={`${styles.threadItem} ${isActive ? styles.threadItemActive : ""}`}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{recipient?.name || "Support"}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                            {thread.messages?.[0] ? new Date(thread.messages[0].createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ""}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.825rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {thread.messages?.[0]?.content || "No messages yet"}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${styles.messageChat} ${!currentChat ? styles.messageChatHidden : ""}`}>
                {currentChat ? (
                    <>
                        <div style={{ height: '60px', padding: '0 1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className={styles.backButton} onClick={() => setCurrentChat(null)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    <span>Back</span>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                    {currentChat.participants?.find((p: any) => p.id !== user?.id)?.name || "Message"}
                                </div>
                            </div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                                {(currentChat.participants?.find((p: any) => p.id !== user?.id)?.name?.[0] || 'S').toUpperCase()}
                            </div>
                        </div>

                        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {currentChat.messages?.map((msg: any, i: number) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={i} style={{
                                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isMe ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{
                                            background: isMe ? '#6366f1' : '#e9e9eb',
                                            color: isMe ? 'white' : '#000',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '18px',
                                            fontSize: '0.925rem',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            borderBottomRightRadius: isMe ? '4px' : '18px',
                                            borderBottomLeftRadius: isMe ? '18px' : '4px'
                                        }}>
                                            {msg.content}
                                        </div>
                                        {i === currentChat.messages.length - 1 && (
                                            <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '2px', padding: '0 4px' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb', background: 'white' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input 
                                    type="text" 
                                    placeholder="iMessage" 
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '0.925rem', background: '#f9fafb' }}
                                />
                                <button 
                                    onClick={sendMessage}
                                    disabled={!messageContent.trim()}
                                    style={{ background: '#6366f1', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: messageContent.trim() ? 1 : 0.5 }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.messageChatHidden} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <h2 className="heading h3">Your Messages</h2>
                        <p style={{ fontSize: '0.875rem' }}>Select a contact to start a conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
