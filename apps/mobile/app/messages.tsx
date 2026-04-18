import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { router } from 'expo-router';
import { fetchWithAuth } from '../utils/apiClient';
import { useAuth } from '../providers/AuthProvider';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [currentThread, setCurrentThread] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // New chat state
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);

  // Search threads
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (showNewChat) {
      fetchContacts();
    }
  }, [showNewChat, contactSearch]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/messages');
      if (res.ok) {
        const data = await res.json();
        setThreads(data || []);
      }
    } catch (e) {
      console.log('Failed to load messages', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await fetchWithAuth(`/messages/contacts?q=${encodeURIComponent(contactSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data || []);
      }
    } catch (e) {
      console.log('Failed to load contacts', e);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleStartChat = (contact: any) => {
    // Check if there's already a thread with this contact
    const existingThread = threads.find(t =>
      t.type === 'DIRECT' && t.participants?.some((p: any) => p.id === contact.id)
    );

    if (existingThread) {
      setCurrentThread(existingThread);
    } else {
      setCurrentThread({
        type: 'DIRECT',
        participants: [user, contact],
        messages: [],
        tempRecipientId: contact.id,
      });
    }
    setShowNewChat(false);
    setContactSearch('');
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentThread) return;
    setSending(true);
    try {
      const body: any = { content: messageText };
      if (currentThread.id) {
        body.threadId = currentThread.id;
      } else if (currentThread.tempRecipientId) {
        body.recipientId = currentThread.tempRecipientId;
      }

      const res = await fetchWithAuth('/messages', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setCurrentThread((prev: any) => ({
          ...prev,
          id: newMsg.threadId,
          messages: [...(prev.messages || []), newMsg],
          tempRecipientId: undefined,
        }));
        setMessageText('');
        loadThreads();
      }
    } catch (e) {
      console.log('Failed to send message', e);
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Filter threads by search
  const filteredThreads = threads.filter((t: any) => {
    if (!searchQuery.trim()) return true;
    const name = t.participants?.find((p: any) => p.id !== user?.id)?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ─── Thread Detail View ───
  if (currentThread) {
    const messages = [...(currentThread.messages || [])].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const recipient = currentThread.participants?.find((p: any) => p.id !== user?.id);
    const recipientName = recipient?.name || 'Chat';

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentThread(null)} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{recipientName}</Text>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{(recipientName)[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item, i) => item.id || `msg-${i}`}
          contentContainerStyle={styles.chatContent}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.id || item.isMine;
            return (
              <View style={[styles.bubble, isMe ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                  {item.content}
                </Text>
                <Text style={[styles.bubbleTime, isMe && { color: 'rgba(255,255,255,0.6)' }]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
        />

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={messageText}
            onChangeText={setMessageText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !messageText.trim() && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={sending || !messageText.trim()}
          >
            <Text style={styles.sendText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ─── Thread List View ───
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Subheader: MESSAGES title + new chat button */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>MESSAGES</Text>
        <TouchableOpacity style={styles.newChatBtn} onPress={() => setShowNewChat(true)}>
          <Text style={styles.newChatBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : filteredThreads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No active conversations.</Text>
          <TouchableOpacity onPress={() => setShowNewChat(true)}>
            <Text style={styles.emptyLink}>Start your first chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
          renderItem={({ item }) => {
            const recipient = item.participants?.find((p: any) => p.id !== user?.id);
            const lastMsg = item.messages?.[item.messages.length - 1];
            return (
              <TouchableOpacity style={styles.threadItem} onPress={() => setCurrentThread(item)}>
                <View style={styles.threadAvatar}>
                  <Text style={styles.threadAvatarText}>{(recipient?.name || 'U')[0]}</Text>
                </View>
                <View style={styles.threadInfo}>
                  <Text style={styles.threadName}>{recipient?.name || 'Unknown'}</Text>
                  <Text style={styles.threadPreview} numberOfLines={1}>
                    {lastMsg?.content || 'No messages yet'}
                  </Text>
                </View>
                <Text style={styles.threadTime}>
                  {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* New Chat Modal */}
      <Modal visible={showNewChat} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { setShowNewChat(false); setContactSearch(''); }} style={styles.backBtn}>
              <Text style={styles.backText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Message</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Contact search */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={{ fontSize: 14, color: '#374151', fontWeight: '600', marginRight: 8 }}>To:</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Name, Market or Store"
                placeholderTextColor="#9CA3AF"
                value={contactSearch}
                onChangeText={setContactSearch}
                autoFocus
              />
            </View>
          </View>

          {contactsLoading ? (
            <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#6366F1" />
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>No contacts found.</Text>
                  <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Try searching by name.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.contactItem} onPress={() => handleStartChat(item)}>
                  <View style={styles.threadAvatar}>
                    <Text style={styles.threadAvatarText}>{(item.name || 'U')[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.threadName}>{item.name}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {(item.role || '').replace('_', ' ')} • {item.market?.name || item.homeStore?.name || 'Global'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 58, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 18, color: '#6366F1', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  avatarSmall: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarSmallText: { color: '#6366F1', fontSize: 14, fontWeight: '800' },

  /* Subheader */
  subHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  subHeaderTitle: {
    fontSize: 13, fontWeight: '700', color: '#374151',
    letterSpacing: 1,
  },
  newChatBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center',
  },
  newChatBtnText: { color: '#fff', fontSize: 22, fontWeight: '600', marginTop: -2 },

  /* Search bar */
  searchContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12,
    height: 44, borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },

  /* Empty state */
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 16, color: '#6B7280', marginBottom: 4 },
  emptyLink: { fontSize: 15, color: '#6366F1', fontWeight: '600' },

  /* Thread list */
  threadItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, marginBottom: 6, backgroundColor: '#F9FAFB',
  },
  threadAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  threadAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  threadInfo: { flex: 1 },
  threadName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  threadPreview: { fontSize: 13, color: '#9CA3AF' },
  threadTime: { fontSize: 11, color: '#D1D5DB' },

  /* Contact item */
  contactItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 12, marginBottom: 6, backgroundColor: '#F9FAFB',
  },

  /* Chat */
  chatContent: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#6366F1', borderBottomRightRadius: 4 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: '#111827' },
  bubbleTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },

  /* Composer */
  composer: {
    flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 36,
    borderTopWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#fff',
  },
  composerInput: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, padding: 12, paddingHorizontal: 16,
    fontSize: 15, color: '#111827', marginRight: 8,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366F1',
    justifyContent: 'center', alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
