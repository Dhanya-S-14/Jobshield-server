import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { sendChatMessage, getQuickActions } from '../../services/chatbotService';

const ChatBubble = ({ message, isUser }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot, { borderColor: isUser ? colors.primary : colors.border }]}>
      {!isUser && (
        <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="shield-checkmark" size={14} color="#fff" />
        </View>
      )}
      <View style={[styles.bubbleContent, isUser ? { backgroundColor: colors.primary } : { backgroundColor: colors.inputBg }]}>
        <Text style={[styles.bubbleText, { color: isUser ? '#fff' : colors.text }]}>{message.text}</Text>
      </View>
    </View>
  );
};

const TypingIndicator = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.bubble, styles.bubbleBot]}>
      <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
        <Ionicons name="shield-checkmark" size={14} color="#fff" />
      </View>
      <View style={[styles.bubbleContent, { backgroundColor: colors.inputBg, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 12 }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.typingDot, { backgroundColor: colors.textSecondary, animationDelay: `${i * 0.2}s` }]} />
        ))}
      </View>
    </View>
  );
};

const ChatBotScreen = () => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([{
      id: 1,
      text: "Hi! I'm JobShield AI Assistant. Ask me about:\n\n- How to detect job scams\n- Red flags in job postings\n- Company verification\n- Salary safety tips\n- Staying safe while job hunting",
      isUser: false
    }]);
    loadQuickActions();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadQuickActions = async () => {
    try {
      const actions = await getQuickActions();
      setQuickActions(actions);
    } catch (err) {}
  };

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { id: Date.now(), text: msg, isUser: true }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(msg);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, isUser: false }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Sorry, an error occurred. Please try again.', isUser: false }]);
      Toast.show({ type: 'error', text1: 'Chat error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, borderBottomColor: colors.border }]}>
        <Ionicons name="shield-checkmark" size={24} color="#fff" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>JobShield AI</Text>
          <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Always here to help</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.messagesContainer} contentContainerStyle={{ padding: spacing.md }}>
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} isUser={msg.isUser} />
        ))}
        {loading && <TypingIndicator />}
      </ScrollView>

      {messages.length <= 1 && quickActions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsContainer}>
          {quickActions.map(action => (
            <TouchableOpacity key={action.id} onPress={() => handleSend(action.message)} style={[styles.quickAction, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Text style={[styles.quickActionText, { color: colors.primary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about job scams..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={() => handleSend()}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => handleSend()} disabled={!input.trim() || loading} style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.textSecondary }]}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, ...shadows.sm },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  headerSubtitle: { fontSize: typography.xs },
  messagesContainer: { flex: 1 },
  bubble: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end', gap: 8 },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleBot: { justifyContent: 'flex-start' },
  botAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bubbleContent: { maxWidth: '75%', padding: spacing.sm, borderRadius: borderRadius.lg },
  bubbleText: { fontSize: typography.sm, lineHeight: 20 },
  typingDot: { width: 8, height: 8, borderRadius: 4, opacity: 0.6 },
  quickActionsContainer: { maxHeight: 50, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  quickAction: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, marginRight: spacing.sm },
  quickActionText: { fontSize: typography.xs, fontWeight: '500' },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1 },
  input: { flex: 1, padding: spacing.sm + 4, borderRadius: borderRadius.lg, borderWidth: 1, fontSize: typography.sm },
  sendBtn: { width: 44, height: 44, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
});

export default ChatBotScreen;
