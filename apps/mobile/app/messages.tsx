import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { fetchWithAuth } from '../utils/apiClient';

export default function MessagesScreen() {
  const [threads, setThreads] = useState<any[]>([]);
  const [currentThread, setCurrentThread] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

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

  const sendMessage = async () => {
    if (!messageText.trim() || !currentThread) return;
    setSending(true);
    try {
      const res = await fetchWithAuth('/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: messageText,
          threadId: currentThread.id,
          type: currentThread.type || 'DIRECT',
        }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setCurrentThread((prev: any) => ({
          ...prev,
          messages: [...(prev.messages || []), newMsg],
        }));
        setMessageText('');
      }
    } catch (e) {
      console.log('Failed to send message', e);
    } finally {
      setSending(false);
    }
  };

  // ─── Thread Detail View ───
  if (currentThread) {
    const messages = [...(currentThread.messages || [])].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const recipientName = currentThread.participants?.find((p: any) => p.name)?.name || 'Chat';

    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentThread(null)} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{recipientName}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item, i) => item.id || `msg-${i}`}
          contentContainerStyle={styles.chatContent}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={[styles.bubbleText, item.isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                {item.content}
              </Text>
              <Text style={[styles.bubbleTime, item.isMine && { color: 'rgba(255,255,255,0.6)' }]}>
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
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
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
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

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#6366F1" />
      ) : threads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No Messages</Text>
          <Text style={styles.emptyText}>Your conversations will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
          renderItem={({ item }) => {
            const recipient = item.participants?.find((p: any) => p.name);
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

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#6B7280' },

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
