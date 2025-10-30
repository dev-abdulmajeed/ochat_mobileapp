import { create } from "zustand";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getUsers } from "../../services";
import { ochat } from "../../services/ochatapi";

export const useConversation = create((set, get) => ({
  conversations: [],
  messages: [],
  connection: null,
  loading: false,
  error: null,

  // ✅ 1 Add Conversation
  addConversation: async (title = "New Chat", type = 0) => {
    set({ loading: true, error: null });
    try {
      const user = getUsers();
      const payload = {
        createdBy: user?.id,
        createdByName: user?.name,
        workspaceId: user?.workspaceId,
        stationId: user?.stationId,
        companyId: user?.companyId,
        type,
        title,
        isDeleted: false,
      };

      const res = await ochat.post("Conversation/Add", payload, {
        headers: { "Content-Type": "application/json" },
      });

      set((state) => ({
        conversations: [...state.conversations, res.data],
        loading: false,
      }));

      console.log("✅ Add Conversation Response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Add Conversation Error:", error);
      set({
        loading: false,
        error: error.message || "Failed to add conversation",
      });
    }
  },

  // ✅ 2️Add Conversation Member
  addConversationMember: async (conversationId, employeeId, employeeName, isAdmin = false) => {
    set({ loading: true, error: null });
    try {
      const user = getUsers();
      const payload = {
        workspaceId: user?.workspaceId,
        stationId: user?.stationId,
        companyId: user?.companyId,
        conversationId,
        employeeId,
        employeeName,
        isAdmin,
        joinedAt: new Date().toISOString(),
      };

      const res = await ochat.post("ConversationMember/Add", payload);
      console.log("✅ Add Conversation Member:", res.data);
      set({ loading: false });
      return res.data;
    } catch (error) {
      console.error("❌ Add Conversation Member Error:", error);
      set({ loading: false, error: error.message });
    }
  },

  // ✅ 3️ Send Message
  addMessage: async (conversationId, content, type = 0) => {
    set({ loading: true, error: null });
    try {
      const user = getUsers();
      const payload = {
        workspaceId: user?.workspaceId,
        stationId: user?.stationId,
        companyId: user?.companyId,
        conversationId,
        senderId: user?.id,
        sender: user?.name,
        type,
        content,
        status: 0,
        sentAt: new Date().toISOString(),
      };

      const res = await ochat.post("Message/Add", payload);
      console.log("✅ Message Sent:", res.data);

      set((state) => ({
        messages: [...state.messages, res.data],
        loading: false,
      }));

      return res.data;
    } catch (error) {
      console.error("❌ Send Message Error:", error);
      set({ loading: false, error: error.message });
    }
  },

  // ✅ 4️⃣ Mark Message as Read
  markMessageRead: async (messageId, employeeId) => {
    set({ loading: true, error: null });
    try {
      const user = getUsers();
      const payload = {
        workspaceId: user?.workspaceId,
        stationId: user?.stationId,
        companyId: user?.companyId,
        messageId,
        employeeId,
        employee: user?.name,
      };

      const res = await ochat.post("MessageRead/Add", payload);
      console.log("✅ Message Read Recorded:", res.data);
      set({ loading: false });
      return res.data;
    } catch (error) {
      console.error("❌ Message Read Error:", error);
      set({ loading: false, error: error.message });
    }
  },

  // ✅ 5️SignalR Connection Setup
  connectSignalR: async () => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("https://bp20z0p7-7254.asse.devtunnels.ms/chathub")
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // 🔹 Register events
      connection.on("ReceiveMessage", (message) => {
        console.log("📩 New Message Received:", message);
        set((state) => ({
          messages: [...state.messages, message],
        }));
      });

      connection.on("MessageSent", (message) => {
        console.log("✅ Message Sent Confirmed:", message);
      });

      connection.on("ReceiveReadReciept", (data) => {
        console.log("📬 Read Receipt Received:", data);
      });

      connection.on("ReceiveReadSent", (data) => {
        console.log("📤 Read Sent Confirmation:", data);
      });

      connection.on("ReceiveTypingStatus", (typingInfo) => {
        console.log("💬 Typing Status:", typingInfo);
      });

      await connection.start();
      console.log("🟢 SignalR Connected");

      set({ connection });
    } catch (error) {
      console.error("🔴 SignalR Connection Error:", error);
      set({ error: error.message });
    }
  },
}));
