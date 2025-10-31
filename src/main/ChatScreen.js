// src/screens/ChatScreen.js
import React, { useState, useRef, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Animated,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ThemeContext } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../constants/ThemeColors";
import { useConversation } from "../zustand/conversation/useConversation";
import { getUsers } from "../services/localData";
import { useToast } from "react-native-toast-notifications";

const ChatScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const colors = theme === "dark" ? darkTheme : lightTheme;

  const { conversationId, name, profilePic, userId } = route.params;
  const { connectSignalR, addMessage, messages, connection } = useConversation();
  const currentUser = getUsers();
  const toast = useToast();

  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const flatListRef = useRef(null);
  const recordingAnim = useRef(new Animated.Value(0)).current;

  // ✅ Connect to SignalR once
  useEffect(() => {
    if (!connection) {
      connectSignalR()
        .then(() => console.log("🟢 Connected to SignalR"))
        .catch((err) => console.log("🔴 SignalR connect error:", err));
    }
  }, [connection]);

  // ✅ Filter messages by conversation ID
  useEffect(() => {
    const filtered = messages.filter((m) => m.conversationId === conversationId);
    setLocalMessages(filtered);
  }, [messages]);

  // ✅ Send message via API + auto-scroll
  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");

    try {
      await addMessage(conversationId, content, 0);
      toast.show("Message sent ✅", { type: "success" });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error("❌ Send message failed:", err);
      toast.show("Failed to send message ❌", { type: "danger" });
    }
  };

  // ✅ Handle attachments (future use)
  const handleAttachment = (type) => {
    setShowAttachMenu(false);
    toast.show(`Attachment: ${type}`, { type: "info" });
  };

  // ✅ Recording animation handlers
  const startRecording = () => {
    setIsRecording(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(recordingAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recordingAnim.stopAnimation();
    toast.show("Recording stopped 🎤", { type: "info" });
  };

  // ✅ Render individual message
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser?.id;
    const messageTime = new Date(item.sentAt || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (item.type === 2) return null; // skip attachments for now

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isMe ? "#FFFFFF" : colors.text },
          ]}
        >
          {item.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              { color: isMe ? "rgba(255,255,255,0.7)" : colors.textSecondary },
            ]}
          >
            {messageTime}
          </Text>
          {isMe && (
            <MaterialIcons
              name={item.status === 1 ? "done-all" : "done"}
              size={16}
              color={item.status === 1 ? "#34C759" : "rgba(255,255,255,0.7)"}
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    );
  };

  // ✅ Attachment menu UI
  const AttachmentMenu = () => (
    <View style={[styles.attachmentMenu, { backgroundColor: colors.card }]}>
      {[
        { icon: "insert-drive-file", color: "#7B68EE", label: "Document", type: "document" },
        { icon: "camera-alt", color: "#FF6B6B", label: "Camera", type: "camera" },
        { icon: "photo", color: "#4ECDC4", label: "Gallery", type: "gallery" },
        { icon: "location-on", color: "#FFD93D", label: "Location", type: "location" },
        { icon: "person", color: "#FF8A5B", label: "Contact", type: "contact" },
        { icon: "headset", color: "#6BCB77", label: "Audio", type: "audio" },
      ].map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.attachOption, { backgroundColor: opt.color }]}
          onPress={() => handleAttachment(opt.type)}
        >
          <MaterialIcons name={opt.icon} size={24} color="#FFF" />
          <Text style={styles.attachLabel}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfile}
          onPress={() => navigation.navigate("Profile", { userId })}
        >
          <Image
            source={{
              uri: profilePic
                ? `https://api.qa.osquare.solutions/${profilePic}`
                : "https://cdn-icons-png.flaticon.com/512/847/847969.png",
            }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: colors.text }]}>{name}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="videocam" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="call" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={localMessages}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Attachment Menu */}
      {showAttachMenu && <AttachmentMenu />}

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <TouchableOpacity
                style={styles.cancelRecording}
                onPress={() => {
                  setIsRecording(false);
                  recordingAnim.stopAnimation();
                }}
              >
                <MaterialIcons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.recordingDot,
                  {
                    opacity: recordingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              />

              <Text style={[styles.recordingText, { color: colors.text }]}>
                Recording... Slide to cancel
              </Text>

              <TouchableOpacity style={styles.sendRecording} onPress={stopRecording}>
                <MaterialIcons name="send" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => setShowAttachMenu(!showAttachMenu)}
              >
                <MaterialIcons
                  name={showAttachMenu ? "close" : "add"}
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                  },
                ]}
                placeholder="Message"
                placeholderTextColor={colors.textSecondary}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={1000}
              />

              {input.trim() ? (
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <MaterialIcons name="send" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.micButton}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                >
                  <MaterialIcons name="mic" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: { padding: 8 },
  headerProfile: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 8 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "600" },
  headerActions: { flexDirection: "row" },
  headerButton: { padding: 8, marginLeft: 4 },

  messagesList: { flexGrow: 1, padding: 12 },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 18,
    padding: 10,
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: "#E8E8E8",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16, lineHeight: 20 },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: { fontSize: 11 },
  statusIcon: { marginLeft: 2 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  attachButton: { padding: 8, justifyContent: "center", alignItems: "center" },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: { padding: 8, justifyContent: "center", alignItems: "center" },

  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  cancelRecording: { padding: 8 },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginHorizontal: 8,
  },
  recordingText: { flex: 1, fontSize: 15 },
  sendRecording: { padding: 8 },

  attachmentMenu: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  attachOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  attachLabel: { fontSize: 10, color: "#FFF", marginTop: 4, fontWeight: "500" },
});
