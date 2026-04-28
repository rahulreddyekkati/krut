"use client";

import { useState, useEffect } from "react";
import styles from "./WorkerDashboard.module.css";

interface WorkerDashboardProps {
    user: any;
    activeAssignment: any;
    myShifts: {
        upcoming: any[];
        currentCycle: any[];
        cycleStart?: string;
        cycleEnd?: string;
        pendingReleases?: string[]
    };
    openShifts: any[];
    onRefresh: () => Promise<void>;
    onLogout: () => Promise<void>;
}

type Tab = "HOME" | "MY_SHIFTS" | "OPEN_SHIFTS" | "TRAINING" | "MESSAGES";

const formatTimeStr = (timeStr?: string) => {
    if (!timeStr) return "-";
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};

const getNextOccurrenceDate = (dayOfWeek: number) => {
    const now = new Date();
    const result = new Date();
    const currentDay = now.getDay();
    let distance = (dayOfWeek - currentDay + 7) % 7;
    result.setDate(now.getDate() + distance);
    return result;
};

const isShiftStarted = (startTimeStr?: string) => {
    if (!startTimeStr) return true;
    const now = new Date();
    const [h, m] = startTimeStr.split(':').map(Number);
    const startMins = h * 60 + m;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return nowMins >= startMins;
};

const isWithin2Hours = (shiftDate: Date, startTimeStr?: string) => {
    if (!startTimeStr) return true;
    const [h, m] = startTimeStr.split(':').map(Number);
    const shiftStart = new Date(shiftDate);
    shiftStart.setHours(h, m, 0, 0);
    const now = new Date();
    
    // If shift is in the past, it's definitely not "within 2 hours of starting" in a way that blocks release
    // (Actual status handling should take over for past shifts)
    if (now > shiftStart) return false;

    const diffMs = shiftStart.getTime() - now.getTime();
    return diffMs < 2 * 60 * 60 * 1000;
};

const formatToClockTime = (date: Date | string | null) => {
    if (!date) return "--:--";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "--:--";
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function WorkerDashboard({
    user,
    activeAssignment,
    myShifts,
    openShifts,
    onRefresh,
    onLogout
}: WorkerDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>("HOME");
    const [trainingDocs, setTrainingDocs] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [chatThreads, setChatThreads] = useState<any[]>([]);
    const [currentChat, setCurrentChat] = useState<any | null>(null);
    const [messageContent, setMessageContent] = useState("");
    const [isSelectingContact, setIsSelectingContact] = useState(false);
    const [contacts, setContacts] = useState<any[]>([]);
    const [contactSearch, setContactSearch] = useState("");
    const [showRecapPopup, setShowRecapPopup] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [pendingRecaps, setPendingRecaps] = useState<any[]>([]);
    const [selectedRecapData, setSelectedRecapData] = useState<any>(null);
    const [recapForm, setRecapForm] = useState<{
        rushLevel: string;
        customersSampled: string;
        receiptTotal: string;
        reimbursementTotal: string;
        inventoryData: { [itemId: string]: { beginning: string; purchased: string; sold: string; storePrice: string } };
        customerFeedback: string;
        receiptUrls: string[];
    }>({
        rushLevel: '',
        customersSampled: '',
        receiptTotal: '',
        reimbursementTotal: '',
        inventoryData: {},
        customerFeedback: '',
        receiptUrls: []
    });

    // Load inventory items from API when recap popup opens
    useEffect(() => {
        if (showRecapPopup) {
            fetch("/api/inventory")
                .then(res => res.json())
                .then(items => {
                    setInventoryItems(items);
                    // Initialize inventory data for each item
                    const initData: any = {};
                    items.forEach((item: any) => {
                        if (!recapForm.inventoryData[item.id]) {
                            initData[item.id] = { beginning: "", purchased: "", sold: "", storePrice: "" };
                        }
                    });
                    if (Object.keys(initData).length > 0) {
                        setRecapForm(prev => ({
                            ...prev,
                            inventoryData: { ...prev.inventoryData, ...initData }
                        }));
                    }
                })
                .catch(e => console.error("Failed to load inventory", e));
        }
    }, [showRecapPopup]);

    // Fetch all pending recaps for this worker from the API
    useEffect(() => {
        async function fetchPendingRecaps() {
            try {
                const res = await fetch('/api/worker/pending-recaps');
                if (res.ok) {
                    const data = await res.json();
                    setPendingRecaps(data.pendingRecaps || []);
                }
            } catch (e) {
                console.error('Failed to fetch pending recaps', e);
            }
        }
        fetchPendingRecaps();
    }, [showRecapPopup]); // Re-fetch when popup closes (in case a recap was submitted)

    const updateInventoryField = (itemId: string, field: string, value: string) => {
        setRecapForm(prev => ({
            ...prev,
            inventoryData: {
                ...prev.inventoryData,
                [itemId]: {
                    ...prev.inventoryData[itemId],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmitRecap = async () => {
        const jobId = selectedRecapData?.jobId || activeAssignment?.job?.id;
        if (!jobId) {
            alert('No job found for this recap.');
            return;
        }

        // Build inventory data with names for the API
        const inventoryWithNames: any = {};
        Object.entries(recapForm.inventoryData).forEach(([itemId, data]) => {
            const item = inventoryItems.find((i: any) => i.id === itemId);
            inventoryWithNames[itemId] = { ...data, name: item?.name || 'Unknown' };
        });

        try {
            const res = await fetch('/api/worker/submit-recap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    assignmentId: selectedRecapData?.assignmentId, // Pass assignmentId
                    rushLevel: recapForm.rushLevel,
                    customersSampled: recapForm.customersSampled,
                    receiptTotal: recapForm.receiptTotal,
                    reimbursementTotal: recapForm.reimbursementTotal,
                    inventoryData: inventoryWithNames,
                    customerFeedback: recapForm.customerFeedback,
                    receiptUrl: JSON.stringify(recapForm.receiptUrls)
                })
            });

            if (res.ok) {
                alert('Recap submitted successfully!');
                setShowRecapPopup(false);
                setSelectedRecapData(null);
                setRecapForm({
                    rushLevel: '',
                    customersSampled: '',
                    receiptTotal: '',
                    reimbursementTotal: '',
                    inventoryData: {},
                    customerFeedback: '',
                    receiptUrls: []
                });
                onRefresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit recap');
            }
        } catch (e) {
            console.error('Failed to submit recap', e);
            alert('Failed to submit recap. Please try again.');
        }
    };

    useEffect(() => {
        if (activeTab === "TRAINING") {
            fetchTrainingDocs();
        } else if (activeTab === "MESSAGES") {
            fetchChatThreads();
        }
    }, [activeTab]);

    useEffect(() => {
        if (isSelectingContact) {
            fetchContacts();
        }
    }, [isSelectingContact, contactSearch]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (ids: string[]) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids })
            });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
            }
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch(`/api/messages/contacts?q=${encodeURIComponent(contactSearch)}`);
            if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
                setContacts(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        }
    };

    const handleStartChat = async (contact: any) => {
        // Optimistically check if we already have a direct thread with this contact
        const existingThread = chatThreads.find(t => 
            t.type === "DIRECT" && t.participants?.some((p: any) => p.id === contact.id)
        );

        if (existingThread) {
            setCurrentChat(existingThread);
            setIsSelectingContact(false);
            setContactSearch("");
        } else {
            // We'll create it on first message, or we can create it now
            setCurrentChat({
                type: "DIRECT",
                participants: [user, contact],
                messages: [],
                tempRecipientId: contact.id
            });
            setIsSelectingContact(false);
            setContactSearch("");
        }
    };

    const fetchChatThreads = async () => {
        try {
            const res = await fetch("/api/messages");
            if (res.ok) {
                setChatThreads(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch chat threads", error);
        }
    };

    const sendMessage = async () => {
        if (!messageContent.trim()) return;
        try {
            const body: any = { 
                content: messageContent,
                type: currentChat?.type || "DIRECT" 
            };
            
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
                fetchChatThreads();
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const fetchTrainingDocs = async () => {
        const res = await fetch("/api/training");
        if (res.ok) {
            setTrainingDocs(await res.json());
        }
    };

    const handleAction = async (action: string, id: string, date?: string) => {
        let endpoint = "/api/jobs/actions";
        let body: any = { action, jobId: id, date };

        if (action === "CLOCK_IN" || action === "CLOCK_OUT") {
            endpoint = "/api/timeclock";
            body = { action, assignmentId: id };
        }

        if (action === "RELEASE") {
            body = { action, assignmentId: id };
        }

        try {
            console.log(`Executing ${action} on ${endpoint} with`, body);
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
                    "x-timezone-offset": new Date().getTimezoneOffset().toString()
                },
                body: JSON.stringify(body)
            });
            const rawText = await res.text();
            console.log(`${action} raw response [${res.status}]:`, rawText);
            const data = rawText ? JSON.parse(rawText) : {};
            if (res.ok) {
                console.log(`${action} success:`, data);
                await onRefresh();
            } else {
                console.error(`${action} failed:`, data);
                alert(`${action} failed: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Action error:", error);
            alert(`Network error during ${action}`);
        }
    };

    const renderHome = () => (
        <div className={styles.tabContent}>
            <div className={styles.clockInCard}>
                <button
                    onClick={() => {
                        if (!activeAssignment) return;
                        handleAction(
                            activeAssignment.clockIn ? "CLOCK_OUT" : "CLOCK_IN",
                            activeAssignment.id
                        );
                    }}
                    disabled={!activeAssignment || (activeAssignment.clockIn && activeAssignment.clockOut) || (!activeAssignment.clockIn && !isShiftStarted(activeAssignment.job.startTimeStr))}
                    className={`${styles.clockBtn} ${activeAssignment?.clockOut ? styles.clockCompleted : activeAssignment?.clockIn ? styles.clockOut : ""}`}
                >
                    <div className={styles.clockLabel}>
                        {activeAssignment?.clockOut
                            ? "done"
                            : activeAssignment?.clockIn
                                ? "clocked in"
                                : "Clock In"}
                    </div>
                    {activeAssignment && (
                        <div className={styles.storeName}>
                            {activeAssignment.job.store.name}
                        </div>
                    )}
                </button>

                {activeAssignment && !activeAssignment.clockIn && !isShiftStarted(activeAssignment.job.startTimeStr) && (
                    <p className={styles.restrictionMsg}>Clocking in opens at {formatTimeStr(activeAssignment.job.startTimeStr)}</p>
                )}

                <div className={styles.timeLabelsRow}>
                    <div className={styles.timeLabelItem}>
                        <span className={styles.timeLabelValue}>{formatToClockTime(activeAssignment?.clockIn)}</span>
                        <span className={styles.timeLabelName}>Start Time</span>
                    </div>
                    <div className={styles.timeLabelItem}>
                        <span className={styles.timeLabelValue}>--:--</span>
                        <span className={styles.timeLabelName}>Break Time</span>
                    </div>
                    <div className={styles.timeLabelItem}>
                        <span className={styles.timeLabelValue}>{formatToClockTime(activeAssignment?.clockOut)}</span>
                        <span className={styles.timeLabelName}>End Time</span>
                    </div>
                </div>

                {!activeAssignment && (
                    <p className={styles.emptyMsg}>No shift active today</p>
                )}
            </div>

            <div className={styles.todaySummary}>
                <h3>Today's Shift</h3>
                {activeAssignment ? (
                    <div className={styles.shiftDetail}>
                        <div className={styles.timeRange}>
                            {formatTimeStr(activeAssignment.job.startTimeStr)} - {formatTimeStr(activeAssignment.job.endTimeStr)}
                        </div>
                        <div className={styles.dateLabel}>
                            {activeAssignment.date
                                ? new Date(activeAssignment.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })
                                : `Today, ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`}
                        </div>
                        <div className={styles.location}>{activeAssignment.job.store.address}</div>
                    </div>
                ) : (
                    <p className={styles.emptyMsg}>Take a break, you have no shifts today!</p>
                )}
            </div>

            {pendingRecaps.map((recap: any) => (
                <div className={styles.recapBanner} key={recap.assignmentId}>
                    <div className={styles.recapBannerLeft}>
                        <div className={styles.recapIcon}>📋</div>
                        <div>
                            <div className={styles.recapTitle}>Incomplete Recap</div>
                            <div className={styles.recapSubtitle}>
                                {new Date(recap.shiftDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                                {' — '}{recap.storeName}
                            </div>
                        </div>
                    </div>
                    <button
                        className={styles.recapBtn}
                        onClick={() => { setSelectedRecapData(recap); setShowRecapPopup(true); }}
                    >
                        Do Recap
                    </button>
                </div>
            ))}
        </div>
    );

    const renderMyShifts = () => {
        const cycleHeader = myShifts.cycleStart && myShifts.cycleEnd
            ? `${new Date(myShifts.cycleStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date(myShifts.cycleEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
            : "Current Cycle";

        const cycleShifts = [...(myShifts.currentCycle || [])].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : getNextOccurrenceDate(a.dayOfWeek).getTime();
            const dateB = b.date ? new Date(b.date).getTime() : getNextOccurrenceDate(b.dayOfWeek).getTime();
            return dateA - dateB;
        });

        return (
            <div className={styles.tabContent}>
                <div className={styles.sectionHeader}>
                    <h3>{cycleHeader}</h3>
                </div>
                <div className={styles.list}>
                    {cycleShifts.length > 0 ? (
                        cycleShifts.map((a) => (
                            <div key={a.id} className={styles.listItem}>
                                <div className={styles.listInfo}>
                                    <div className={styles.listTitle}>
                                        {a.date
                                            ? new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
                                            : getNextOccurrenceDate(a.dayOfWeek).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className={styles.listSubtitle}>{a.job?.store?.name}</div>
                                    <div className={styles.listTime}>
                                        {formatTimeStr(a.job?.startTimeStr)} - {formatTimeStr(a.job?.endTimeStr)}
                                    </div>
                                </div>
                                {(() => {
                                    const shiftDate = a.date
                                        ? new Date(a.date)
                                        : getNextOccurrenceDate(a.dayOfWeek);
                                    
                                    // Set hours for shift start/end comparison
                                    const [startH, startM] = (a.job?.startTimeStr || "00:00").split(':').map(Number);
                                    const [endH, endM] = (a.job?.endTimeStr || "23:59").split(':').map(Number);
                                    
                                    const startDateTime = new Date(shiftDate);
                                    startDateTime.setHours(startH, startM, 0, 0);
                                    
                                    const endDateTime = new Date(shiftDate);
                                    endDateTime.setHours(endH, endM, 0, 0);
                                    // Handle overnight if needed (though rare for this app)
                                    if (endDateTime < startDateTime) endDateTime.setDate(endDateTime.getDate() + 1);

                                    const now = new Date();
                                    const isPast = now > endDateTime;
                                    const isOngoing = now >= startDateTime && now <= endDateTime;

                                    const dateKey = `${a.job?.id}|${shiftDate.toISOString().split('T')[0]}`;
                                    const alreadyRequested = myShifts.pendingReleases?.includes(dateKey);
                                    const tooClose = isWithin2Hours(shiftDate, a.job?.startTimeStr);

                                    // Status rendering
                                    if (a.clockIn && a.clockOut) {
                                        return <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>Completed</span>;
                                    }
                                    if (a.clockIn && !a.clockOut) {
                                        return <span style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>{isPast ? "Recap Pending" : "Clocked In"}</span>;
                                    }
                                    if (isPast && !a.clockIn) {
                                        return <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>No Show</span>;
                                    }
                                    if (alreadyRequested) {
                                        return <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 500, padding: '0.4rem 0.8rem', background: '#fef3c7', borderRadius: '6px' }}>Requested</span>;
                                    }

                                    return tooClose ? (
                                        <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{isPast ? "Closed" : "Too close to release"}</span>
                                    ) : (
                                        <button
                                            onClick={() => handleAction("RELEASE", a.id)}
                                            className={styles.releaseBtn}
                                        >
                                            Release
                                        </button>
                                    );
                                })()}
                            </div>
                        ))
                    ) : (
                        <p className={styles.emptyMsg}>No shifts in this cycle.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderOpenShifts = () => (
        <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
                <h3>Available Shifts</h3>
            </div>
            <div className={styles.list}>
                {openShifts.length > 0 ? (
                    openShifts.map((job) => (
                        <div key={job.id} className={styles.listItem}>
                            <div className={styles.listInfo}>
                                <div className={styles.listTitle}>
                                    {job.date ? new Date(job.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'Open Shift'}
                                    {job.isReleasedShift && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#10b981', background: '#d1fae5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Released Shift</span>}
                                </div>
                                <div className={styles.listSubtitle}>{job.store?.name}</div>
                                <div className={styles.listTime}>
                                    {formatTimeStr(job.startTimeStr)} - {formatTimeStr(job.endTimeStr)}
                                </div>
                            </div>
                            {job.isRequested ? (
                                <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 500, padding: '0.4rem 0.8rem', background: '#fef3c7', borderRadius: '6px' }}>Requested</span>
                            ) : (
                                <button
                                    onClick={() => handleAction("ACCEPT", job.id, job.date)}
                                    className={styles.acceptBtn}
                                >
                                    Request Shift
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyCenter}>
                        <p className={styles.emptyMsg}>No open shifts available right now.</p>
                        <p className={styles.emptyHint}>Check back later or notify your manager if you want more hours.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderTraining = () => (
        <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
                <h3>Training Materials</h3>
            </div>
            {trainingDocs.length > 0 ? (
                <div className={styles.grid}>
                    {trainingDocs.map((doc) => (
                        <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className={styles.docCard}>
                            <div className={styles.docIcon}>📄</div>
                            <div className={styles.docTitle}>{doc.title}</div>
                            <div className={styles.docCategory}>{doc.category}</div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyCenter}>
                    <p className={styles.emptyMsg}>No training materials assigned yet.</p>
                </div>
            )}
        </div>
    );

    const renderMessages = () => (
        <div className={styles.tabContent}>
            <div className={styles.sectionHeader} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {(currentChat || isSelectingContact) && (
                        <button onClick={() => { setCurrentChat(null); setIsSelectingContact(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                    )}
                    <h3>{isSelectingContact ? "New Message" : currentChat ? (currentChat.participants?.find((p: any) => p.id !== user.id)?.name || currentChat.type.replace('_', ' ')) : "Messages"}</h3>
                </div>
                {!currentChat && !isSelectingContact && (
                    <button 
                        onClick={() => { setIsSelectingContact(true); setContactSearch(""); }}
                        style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                )}
            </div>
            
            {!currentChat && !isSelectingContact && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            style={{ width: '100%', padding: '0.75rem 1rem', paddingLeft: '2.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }}
                        />
                        <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    <div className={styles.list}>
                        {chatThreads.map(thread => {
                            const recipient = thread.participants?.find((p: any) => p.id !== user.id);
                            return (
                                <div key={thread.id} className={styles.listItem} onClick={() => setCurrentChat(thread)} style={{ cursor: 'pointer' }}>
                                    <div className={styles.listInfo}>
                                        <div className={styles.listTitle}>{recipient?.name || thread.type.replace('_', ' ')}</div>
                                        <div className={styles.listSubtitle}>
                                            {thread.messages?.[0]?.content || "No messages yet"}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                        {thread.messages?.[0] ? new Date(thread.messages[0].createdAt).toLocaleDateString() : ""}
                                    </div>
                                </div>
                            );
                        })}
                        {chatThreads.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                                <p>No active conversations.</p>
                                <button 
                                    onClick={() => setIsSelectingContact(true)}
                                    style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}
                                >
                                    Start your first chat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isSelectingContact && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search by name, market, or store..." 
                            value={contactSearch}
                            onChange={(e) => setContactSearch(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem', paddingLeft: '2.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.875rem', outline: 'none' }}
                            autoFocus
                        />
                        <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    <div className={styles.list}>
                        {contacts.map(contact => (
                            <div key={contact.id} className={styles.listItem} onClick={() => handleStartChat(contact)} style={{ cursor: 'pointer' }}>
                                <div className={styles.listInfo}>
                                    <div className={styles.listTitle}>{contact.name}</div>
                                    <div className={styles.listSubtitle}>
                                        {contact.role.replace('_', ' ')} • {contact.market?.name || "Global"}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {contacts.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>No contacts found.</p>
                        )}
                    </div>
                </div>
            )}
            
            {currentChat && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '60vh', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1rem' }}>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '1rem', paddingBottom: '1rem' }}>
                        {[...(currentChat.messages || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((msg: any, i: number) => (
                            <div key={i} style={{
                                alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                                background: msg.senderId === user.id ? '#6366f1' : '#f3f4f6',
                                color: msg.senderId === user.id ? 'white' : '#111827',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                borderBottomRightRadius: msg.senderId === user.id ? '2px' : '12px',
                                borderBottomLeftRadius: msg.senderId === user.id ? '12px' : '2px',
                                maxWidth: '80%',
                                fontSize: '0.875rem'
                            }}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                        <input 
                            type="text" 
                            placeholder="Type a message..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', outline: 'none' }}
                        />
                        <button 
                            onClick={sendMessage}
                            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navLeft}>
                    <div className={styles.navBrand}>Kruto Tastes</div>
                    <div className={styles.userName}>{user.name}</div>
                </div>
                <div className={styles.navRight}>
                    <button 
                        className={`${styles.msgBtn} ${activeTab === "MESSAGES" ? styles.active : ""}`} 
                        aria-label="Messages"
                        onClick={() => setActiveTab("MESSAGES")}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                    <div style={{ position: 'relative' }}>
                        <button 
                            className={styles.msgBtn}
                            onClick={() => setShowNotifications(!showNotifications)}
                            aria-label="Notifications"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            {notifications.length > 0 && <span className={styles.msgBadge} />}
                        </button>

                        {showNotifications && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                width: '280px',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                border: '1px solid #e5e7eb',
                                zIndex: 1000,
                                maxHeight: '400px',
                                overflowY: 'auto'
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Notifications</h4>
                                    {notifications.length > 0 && (
                                        <button 
                                            onClick={() => markAsRead(notifications.map(n => n.id))}
                                            style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                                            No new notifications
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                style={{ 
                                                    padding: '1rem', 
                                                    borderBottom: '1px solid #f3f4f6',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s',
                                                    background: 'white'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                onClick={() => markAsRead([n.id])}
                                            >
                                                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#111827', marginBottom: '0.25rem' }}>{n.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: '1.4' }}>{n.message}</div>
                                                <div style={{ fontSize: '0.625rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.logoutBtn}
                        aria-label="Logout"
                        onClick={onLogout}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className={styles.menu}>
                <button
                    className={`${styles.menuItem} ${activeTab === "HOME" ? styles.active : ""}`}
                    onClick={() => setActiveTab("HOME")}
                >
                    Home
                </button>
                <button
                    className={`${styles.menuItem} ${activeTab === "MY_SHIFTS" ? styles.active : ""}`}
                    onClick={() => setActiveTab("MY_SHIFTS")}
                >
                    My Shifts
                </button>
                <button
                    className={`${styles.menuItem} ${activeTab === "OPEN_SHIFTS" ? styles.active : ""}`}
                    onClick={() => setActiveTab("OPEN_SHIFTS")}
                >
                    Open Shifts
                </button>
                <button
                    className={`${styles.menuItem} ${activeTab === "TRAINING" ? styles.active : ""}`}
                    onClick={() => setActiveTab("TRAINING")}
                >
                    Training
                </button>
            </div>

            <main className={styles.main}>
                {activeTab === "HOME" && renderHome()}
                {activeTab === "MY_SHIFTS" && renderMyShifts()}
                {activeTab === "OPEN_SHIFTS" && renderOpenShifts()}
                {activeTab === "TRAINING" && renderTraining()}
                {activeTab === "MESSAGES" && renderMessages()}
            </main>

            {/* ── Recaps Popup ── */}
            {showRecapPopup && (
                <div className={styles.recapOverlay} onClick={() => setShowRecapPopup(false)}>
                    <div className={styles.recapPopup} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.recapPopupHeader}>
                            <h2>Recaps</h2>
                            <button className={styles.recapCloseBtn} onClick={() => setShowRecapPopup(false)}>×</button>
                        </div>
                        <div className={styles.recapPopupBody}>
                            {/* ── Shift Info Header ── */}
                            <div className={styles.recapShiftInfo}>
                                <div className={styles.recapShiftRow}>
                                    <span className={styles.recapLabel}>Worker</span>
                                    <span className={styles.recapValue}>{user?.name}</span>
                                </div>
                                <div className={styles.recapShiftRow}>
                                    <span className={styles.recapLabel}>Market</span>
                                    <span className={styles.recapValue}>{user?.market?.name || '—'}</span>
                                </div>
                                <div className={styles.recapShiftRow}>
                                    <span className={styles.recapLabel}>Store</span>
                                    <span className={styles.recapValue}>{selectedRecapData?.storeName || activeAssignment?.job?.store?.name}</span>
                                </div>
                                <div className={styles.recapShiftRow}>
                                    <span className={styles.recapLabel}>Date</span>
                                    <span className={styles.recapValue}>{selectedRecapData ? new Date(selectedRecapData.shiftDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className={styles.recapShiftRow}>
                                    <span className={styles.recapLabel}>Clock In</span>
                                    <span className={styles.recapValue}>{formatToClockTime(selectedRecapData?.clockIn || activeAssignment?.clockIn)}</span>
                                </div>
                                <div className={styles.recapShiftRow}>
                                    <span className={styles.recapLabel}>Clock Out</span>
                                    <span className={styles.recapValue}>{formatToClockTime(selectedRecapData?.clockOut || activeAssignment?.clockOut)}</span>
                                </div>
                            </div>

                            {/* ── Rush Level ── */}
                            <div className={styles.recapSection}>
                                <label className={styles.recapSectionLabel}>How was the rush?</label>
                                <div className={styles.rushOptions}>
                                    {['Very Busy', 'Medium', 'Slow'].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            className={`${styles.rushOption} ${recapForm.rushLevel === level ? styles.rushSelected : ''}`}
                                            onClick={() => setRecapForm(prev => ({ ...prev, rushLevel: level }))}
                                        >
                                            {level === 'Very Busy' ? '🔥' : level === 'Medium' ? '⚡' : '🐢'}
                                            <span>{level}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Numbers Section ── */}
                            <div className={styles.recapSection}>
                                <label className={styles.recapSectionLabel}>Sales Summary</label>
                                <div className={styles.recapFieldGrid}>
                                    <div className={styles.recapField}>
                                        <label>Customers Sampled</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={recapForm.customersSampled}
                                            onChange={(e) => setRecapForm(prev => ({ ...prev, customersSampled: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.recapField}>
                                        <label>Receipt Total</label>
                                        <div className={styles.currencyInput}>
                                            <span className={styles.currencySymbol}>$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={recapForm.receiptTotal}
                                                onChange={(e) => setRecapForm(prev => ({ ...prev, receiptTotal: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.recapField}>
                                        <label>Reimbursement Total</label>
                                        <div className={styles.currencyInput}>
                                            <span className={styles.currencySymbol}>$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={recapForm.reimbursementTotal}
                                                onChange={(e) => setRecapForm(prev => ({ ...prev, reimbursementTotal: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Inventory Tracking ── */}
                            <div className={styles.recapSection}>
                                <label className={styles.recapSectionLabel}>Inventory Tracking</label>
                                {inventoryItems.length > 0 ? (
                                    <div className={styles.inventoryTrackList}>
                                        {inventoryItems.map(item => (
                                            <div key={item.id} className={styles.inventoryTrackItem}>
                                                <div className={styles.inventoryTrackHeader}>
                                                    <span className={styles.inventoryTrackName}>{item.name}</span>
                                                    <span className={styles.inventoryTrackMeta}>{item.volume} {item.unit}{item.category ? ` · ${item.category}` : ''}</span>
                                                </div>
                                                <div className={styles.inventoryTrackFields}>
                                                    <div className={styles.invField}>
                                                        <label>Beginning Inv.</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={recapForm.inventoryData[item.id]?.beginning || ''}
                                                            onChange={(e) => updateInventoryField(item.id, 'beginning', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className={styles.invField}>
                                                        <label>Purchased</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={recapForm.inventoryData[item.id]?.purchased || ''}
                                                            onChange={(e) => updateInventoryField(item.id, 'purchased', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className={styles.invField}>
                                                        <label>Bottles Sold</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={recapForm.inventoryData[item.id]?.sold || ''}
                                                            onChange={(e) => updateInventoryField(item.id, 'sold', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className={styles.invField}>
                                                        <label>Store Price</label>
                                                        <div className={styles.currencyInput}>
                                                            <span className={styles.currencySymbol}>$</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={recapForm.inventoryData[item.id]?.storePrice || ''}
                                                                onChange={(e) => updateInventoryField(item.id, 'storePrice', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={styles.recapPlaceholder}>No inventory items added yet. Add items in the admin Inventory page first.</p>
                                )}
                            </div>

                            {/* ── Upload Receipts ── */}
                            <div className={styles.recapSection}>
                                <label className={styles.recapSectionLabel}>Upload Receipts</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length > 0) {
                                            const newUrls: string[] = [];
                                            let processed = 0;
                                            files.forEach(file => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    const img = new Image();
                                                    img.onload = () => {
                                                        const canvas = document.createElement('canvas');
                                                        const MAX_DIM = 800; // compress heavily for DB storage
                                                        let width = img.width;
                                                        let height = img.height;

                                                        if (width > height) {
                                                            if (width > MAX_DIM) {
                                                                height *= MAX_DIM / width;
                                                                width = MAX_DIM;
                                                            }
                                                        } else {
                                                            if (height > MAX_DIM) {
                                                                width *= MAX_DIM / height;
                                                                height = MAX_DIM;
                                                            }
                                                        }
                                                        canvas.width = width;
                                                        canvas.height = height;
                                                        const ctx = canvas.getContext('2d');
                                                        ctx?.drawImage(img, 0, 0, width, height);
                                                        
                                                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                                        newUrls.push(dataUrl);
                                                        processed++;
                                                        if (processed === files.length) {
                                                            setRecapForm(prev => ({ ...prev, receiptUrls: [...prev.receiptUrls, ...newUrls] }));
                                                        }
                                                    };
                                                    img.src = reader.result as string;
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                        fontSize: '0.875rem',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                />
                                {recapForm.receiptUrls && recapForm.receiptUrls.length > 0 && (
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {recapForm.receiptUrls.map((url, idx) => (
                                            <div key={idx} style={{ position: 'relative' }}>
                                                <img src={url} alt={`Receipt ${idx + 1}`} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                                                <button onClick={() => setRecapForm(prev => ({ ...prev, receiptUrls: prev.receiptUrls.filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Customer Feedback ── */}
                            <div className={styles.recapSection}>
                                <label className={styles.recapSectionLabel}>Customer Feedback</label>
                                <textarea
                                    className={styles.feedbackTextarea}
                                    placeholder="Any notes or customer feedback from today's shift..."
                                    rows={3}
                                    value={recapForm.customerFeedback}
                                    onChange={(e) => setRecapForm(prev => ({ ...prev, customerFeedback: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className={styles.recapPopupFooter}>
                            <button className={styles.recapSubmitBtn} onClick={handleSubmitRecap}>Submit Recap</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
