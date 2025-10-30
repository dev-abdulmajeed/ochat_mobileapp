// src/screens/ChatScreen.js
import React, { useState, useRef, useContext } from "react";
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

const ChatScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const colors = theme === "dark" ? darkTheme : lightTheme;
  const { userId, name } = route.params;

  const [messages, setMessages] = useState([
    { 
      id: "1", 
      text: "Hey! How are you?", 
      sender: "them", 
      time: "10:30 AM",
      status: "read" 
    },
    { 
      id: "2", 
      text: "I'm good, thanks! You?", 
      sender: "me", 
      time: "10:32 AM",
      status: "read" 
    },
    { 
      id: "3", 
      text: "Great! Are we still meeting tomorrow?", 
      sender: "them", 
      time: "10:35 AM",
      status: "read" 
    },
  ]);

  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const flatListRef = useRef(null);
  const recordingAnim = useRef(new Animated.Value(0)).current;

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleAttachment = (type) => {
    setShowAttachMenu(false);
    // Handle different attachment types
    console.log(`Attachment type: ${type}`);
  };

  const startRecording = () => {
    setIsRecording(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recordingAnim.stopAnimation();
    // Handle voice message
    const voiceMessage = {
      id: Date.now().toString(),
      type: "voice",
      duration: "0:15",
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    setMessages((prev) => [...prev, voiceMessage]);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";

    if (item.type === "voice") {
      return (
        <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
          <View style={styles.voiceMessage}>
            <TouchableOpacity style={styles.playButton}>
              <MaterialIcons name="play-arrow" size={24} color={isMe ? "#FFFFFF" : colors.text} />
            </TouchableOpacity>
            <View style={styles.voiceWaveform}>
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { 
                      height: Math.random() * 20 + 10,
                      backgroundColor: isMe ? "#FFFFFF" : colors.primary 
                    }
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.voiceDuration, { color: isMe ? "#FFFFFF" : colors.textSecondary }]}>
              {item.duration}
            </Text>
          </View>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, { color: isMe ? "rgba(255,255,255,0.7)" : colors.textSecondary }]}>
              {item.time}
            </Text>
            {isMe && (
              <MaterialIcons 
                name={item.status === "read" ? "done-all" : "done"} 
                size={16} 
                color={item.status === "read" ? "#34C759" : "rgba(255,255,255,0.7)"} 
              />
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, { color: isMe ? "#FFFFFF" : colors.text }]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, { color: isMe ? "rgba(255,255,255,0.7)" : colors.textSecondary }]}>
            {item.time}
          </Text>
          {isMe && (
            <MaterialIcons 
              name={item.status === "read" ? "done-all" : "done"} 
              size={16} 
              color={item.status === "read" ? "#34C759" : "rgba(255,255,255,0.7)"} 
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    );
  };

  const AttachmentMenu = () => (
    <View style={[styles.attachmentMenu, { backgroundColor: colors.card }]}>
      <TouchableOpacity 
        style={[styles.attachOption, { backgroundColor: '#7B68EE' }]}
        onPress={() => handleAttachment('document')}
      >
        <MaterialIcons name="insert-drive-file" size={24} color="#FFFFFF" />
        <Text style={styles.attachLabel}>Document</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.attachOption, { backgroundColor: '#FF6B6B' }]}
        onPress={() => handleAttachment('camera')}
      >
        <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
        <Text style={styles.attachLabel}>Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.attachOption, { backgroundColor: '#4ECDC4' }]}
        onPress={() => handleAttachment('gallery')}
      >
        <MaterialIcons name="photo" size={24} color="#FFFFFF" />
        <Text style={styles.attachLabel}>Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.attachOption, { backgroundColor: '#FFD93D' }]}
        onPress={() => handleAttachment('location')}
      >
        <MaterialIcons name="location-on" size={24} color="#FFFFFF" />
        <Text style={styles.attachLabel}>Location</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.attachOption, { backgroundColor: '#FF8A5B' }]}
        onPress={() => handleAttachment('contact')}
      >
        <MaterialIcons name="person" size={24} color="#FFFFFF" />
        <Text style={styles.attachLabel}>Contact</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.attachOption, { backgroundColor: '#6BCB77' }]}
        onPress={() => handleAttachment('audio')}
      >
        <MaterialIcons name="headset" size={24} color="#FFFFFF" />
        <Text style={styles.attachLabel}>Audio</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />

      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerProfile}
          onPress={() => navigation.navigate("Profile", { userId })}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>Online</Text>
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

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Attachment Menu */}
      {showAttachMenu && <AttachmentMenu />}

      {/* Message Input */}
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

              <Animated.View style={[styles.recordingDot, {
                opacity: recordingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1]
                })
              }]} />
              
              <Text style={[styles.recordingText, { color: colors.text }]}>
                Recording... Slide to cancel
              </Text>

              <TouchableOpacity 
                style={styles.sendRecording}
                onPress={stopRecording}
              >
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
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text 
                }]}
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
  container: { 
    flex: 1,
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 8,
  },
  headerProfile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerStatus: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },

  // Messages Styles
  messagesList: {
    flexGrow: 1,
    padding: 12,
  },
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
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  statusIcon: {
    marginLeft: 2,
  },

  // Voice Message Styles
  voiceMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 30,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    marginLeft: 4,
  },

  // Input Styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  attachButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
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
  micButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Recording Styles
  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  cancelRecording: {
    padding: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginHorizontal: 8,
  },
  recordingText: {
    flex: 1,
    fontSize: 15,
  },
  sendRecording: {
    padding: 8,
  },

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
  attachLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    marginTop: 4,
    fontWeight: "500",
  },
});