import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";
import { create } from "zustand";
import { getUsers } from "../../services/localData";
import { ochat } from "../../services/ochatapi";

/**
 * Chat store (Zustand) with SignalR integration.
 *
 * Features:
 * - idempotent SignalR connect / disconnect
 * - automatic rejoin of conversation groups on reconnect
 * - posts to REST API and also invokes SignalR events to notify other clients
 * - helpers to manage local state consistently
 * - simple loading/error flags
 */

export const useConversation = create((set, get) => ({
  // state
  conversations: [],
  messages: [],
  connection: null,
  currentConversationId: null,
  loading: false,
  error: null,

  // helpers
  setLoading: (v) => set({ loading: v }),
  setError: (err) => set({ error: err }),
  setCurrentConversation: (id) => set({ currentConversationId: id }),

  _addMessageLocal: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  _replaceOrAddConversation: (conv) =>
    set((state) => {
      const existing = state.conversations.find((c) => c.id === conv.id);
      if (existing) {
        return {
          conversations: state.conversations.map((c) =>
            c.id === conv.id ? { ...c, ...conv } : c
          ),
        };
      }
      return { conversations: [...state.conversations, conv] };
    }),

  // connect SignalR (idempotent)
  connectSignalR: async (options = {}) => {
    // options: { url?: string }
    const url =
      options.url ||
      "https://bp20z0p7-7254.asse.devtunnels.ms/chathub"; // keep your URL or override

    // avoid duplicate connections
    if (get().connection) {
      const conn = get().connection;
      // if already connected or connecting, just return
      if (conn.state === "Connected" || conn.state === "Connecting") {
        console.log("⚠️ SignalR: already connected/connecting");
        return conn;
      }
    }

    try {
      console.log("🔌 SignalR: building connection...");
      const connection = new HubConnectionBuilder()
        .withUrl(url, {
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      // ----- event handlers -----
      connection.on("ReceiveMessage", (message) => {
        console.log("📩 ReceiveMessage:", message);
        // avoid duplicates if present by id check (optional)
        get()._addMessageLocal(message);
      });

      connection.on("MessageSent", (message) => {
        console.log("✅ MessageSent (server ack):", message);
        // You might update message status here if you track local pending messages
      });

      connection.on("ReceiveReadReciept", (data) => {
        console.log("📬 ReceiveReadReciept:", data);
        // update local state if you hold per-message read receipts
      });

      connection.on("ReceiveReadSent", (data) => {
        console.log("📤 ReceiveReadSent:", data);
      });

      connection.on("ReceiveTypingStatus", (typingInfo) => {
        console.log("💬 ReceiveTypingStatus:", typingInfo);
        // you can set a separate typing state in the store if needed
      });

      // reconnect lifecycle hooks
      connection.onreconnecting((error) => {
        console.warn("🟠 SignalR reconnecting...", error);
        set({ error: "SignalR reconnecting..." });
      });

      connection.onreconnected(async (connectionId) => {
        console.log("🟢 SignalR reconnected. ConnectionId:", connectionId);
        set({ error: null });
        // rejoin conversation groups so server will push relevant messages
        try {
          const { conversations } = get();
          if (Array.isArray(conversations)) {
            for (const c of conversations) {
              if (c?.id) {
                try {
                  await connection.invoke("JoinConversation", c.id);
                  console.log(`🔁 Rejoined conversation ${c.id}`);
                } catch (err) {
                  console.warn(
                    `⚠️ Failed to rejoin conversation ${c.id}:`,
                    err
                  );
                }
              }
            }
          }
        } catch (err) {
          console.error("❌ Error during rejoin on reconnect:", err);
        }
      });

      connection.onclose((error) => {
        console.warn("🔴 SignalR closed:", error);
        // clear connection but allow reconnection attempts by withAutomaticReconnect
        set({ connection: null });
      });

      // start connection
      console.log("🔎 SignalR starting...");
      await connection.start();
      console.log("🟢 SignalR Connected");

      set({ connection });
      return connection;
    } catch (error) {
      console.error("🔴 SignalR Connection Error:", error);
      set({ error: error.message || String(error) });
      throw error;
    }
  },

  // gracefully stop the connection
  disconnectSignalR: async () => {
    const conn = get().connection;
    if (!conn) {
      console.log("⚠️ No SignalR connection to stop");
      return;
    }
    try {
      await conn.stop();
      set({ connection: null });
      console.log("🔌 SignalR disconnected");
    } catch (err) {
      console.error("❌ Error disconnecting SignalR:", err);
    }
  },

  // join a conversation group on the server (SignalR)
  joinConversation: async (conversationId) => {
    const conn = get().connection;
    if (!conn) {
      console.warn("⚠️ joinConversation: no SignalR connection");
      return;
    }
    try {
      await conn.invoke("JoinConversation", conversationId);
      console.log(`🔔 Joined conversation group ${conversationId}`);
    } catch (err) {
      console.error("❌ JoinConversation error:", err);
    }
  },

  leaveConversation: async (conversationId) => {
    const conn = get().connection;
    if (!conn) {
      console.warn("⚠️ leaveConversation: no SignalR connection");
      return;
    }
    try {
      await conn.invoke("LeaveConversation", conversationId);
      console.log(`🔕 Left conversation group ${conversationId}`);
    } catch (err) {
      console.error("❌ LeaveConversation error:", err);
    }
  },

  // Add Conversation (REST) + auto-join SignalR group
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
        createdDate: new Date().toISOString(),
      };

      const res = await ochat.post("Conversation/Add", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // update local conversations
      get()._replaceOrAddConversation(res.data);

      // auto join group if SignalR connected
      try {
        await get().joinConversation(res.data.id);
      } catch (err) {
        // non-fatal
        console.warn("⚠️ Could not auto-join conversation via SignalR:", err);
      }

      console.log("✅ Add Conversation Response:", res.data);
      set({ loading: false });
      return res.data;
    } catch (error) {
      console.error("❌ Add Conversation Error:", error);
      set({
        loading: false,
        error: error.message || "Failed to add conversation",
      });
      throw error;
    }
  },

  // Add a member to conversation (REST) + optional SignalR notification
  addConversationMember: async (
    conversationId,
    employeeId,
    employeeName,
    isAdmin = false
  ) => {
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

      // notify server via SignalR so other clients can update in real time
      try {
        const conn = get().connection;
        if (conn) {
          await conn.invoke("AddMemberToConversation", {
            conversationId,
            employeeId,
            employeeName,
            isAdmin,
          });
        }
      } catch (signalErr) {
        console.warn(
          "⚠️ addConversationMember: failed to notify via SignalR:",
          signalErr
        );
      }

      console.log("✅ Add Conversation Member:", res.data);
      set({ loading: false });
      return res.data;
    } catch (error) {
      console.error("❌ Add Conversation Member Error:", error);
      set({ loading: false, error: error.message || String(error) });
      throw error;
    }
  },

  // Send message: POST then invoke SignalR SendMessage (so others receive it)
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

      // POST to REST API first (server may enrich message: id, timestamps, etc.)
      const res = await ochat.post("Message/Add", payload);
      const message = res.data;

      // update local state
      get()._addMessageLocal(message);

      // push message via SignalR so other connected clients get it in real-time
      try {
        const conn = get().connection;
        if (conn) {
          await conn.invoke("SendMessage", message);
        }
      } catch (signalErr) {
        console.warn("⚠️ addMessage: failed to invoke SendMessage:", signalErr);
      }

      console.log("✅ Message Sent:", message);
      set({ loading: false });
      return message;
    } catch (error) {
      console.error("❌ Send Message Error:", error);
      set({ loading: false, error: error.message || String(error) });
      throw error;
    }
  },

  // Mark message as read (REST) + emit read receipt via SignalR
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
        readAt: new Date().toISOString(),
      };

      const res = await ochat.post("MessageRead/Add", payload);
      console.log("✅ Message Read Recorded (REST):", res.data);

      // notify via SignalR
      try {
        const conn = get().connection;
        if (conn) {
          await conn.invoke("SendReadReceipt", payload);
        }
      } catch (signalErr) {
        console.warn(
          "⚠️ markMessageRead: failed to notify via SignalR:",
          signalErr
        );
      }

      set({ loading: false });
      return res.data;
    } catch (error) {
      console.error("❌ Message Read Error:", error);
      set({ loading: false, error: error.message || String(error) });
      throw error;
    }
  },

  // optionally fetch conversations/messages (example helpers)
  loadConversations: async () => {
    set({ loading: true, error: null });
    try {
      const user = getUsers();
      const res = await ochat.get("Conversation/List", {
        params: {
          workspaceId: user?.workspaceId,
          stationId: user?.stationId,
          companyId: user?.companyId,
        },
      });
      const list = res.data || [];
      set({ conversations: list, loading: false });
      return list;
    } catch (err) {
      console.error("❌ loadConversations error:", err);
      set({ loading: false, error: err.message || String(err) });
      throw err;
    }
  },

  loadMessagesForConversation: async (conversationId) => {
    set({ loading: true, error: null });
    try {
      const user = getUsers();
      const res = await ochat.get("Message/List", {
        params: {
          workspaceId: user?.workspaceId,
          stationId: user?.stationId,
          companyId: user?.companyId,
          conversationId,
        },
      });
      const msgs = res.data || [];
      // replace messages for the currently selected conversation
      // depending on your UI, you may want to merge rather than replace
      set({ messages: msgs, loading: false });
      return msgs;
    } catch (err) {
      console.error("❌ loadMessagesForConversation error:", err);
      set({ loading: false, error: err.message || String(err) });
      throw err;
    }
  },
}));
