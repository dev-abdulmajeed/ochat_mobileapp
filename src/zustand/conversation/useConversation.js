import { create } from "zustand";
import { getUsers} from "../../services/"
import { ochat } from "../../services/ochatapi";


export const useConversation = create((set) => ({
  conversations: [],
  loading: false,
  error: null,

  addConversation:async (id) => {
    set({ loading: true, error: null });
    try {
        const Userid = getUsers()?.id;
        const workspaceId = getUsers()?.workspaceId;
        const stationId = getUsers()?.stationId;
        const companyId = getUsers()?.companyId;
        const res = await ochat.post(`Conversation/Add/`,{
            id : Userid,
            workspaceId: workspaceId,
            stationId: stationId,
            companyId: companyId,
        },
            {
                headers: { "Content-Type": "application/json", },
            }
        );
        set({ conversations: res.data, loading: false });
        console.log("Add Conversation API Response:", res.data);
    } catch (error) {
        console.error("Add Conversation Error:", error);
        set({
            loading: false,
            error: error.message || "Failed to add conversation",
            }
         )
    }
  },
  
  addConversationMember:async () => {},

  addMessage:async () => {},

  MessageRead:async () => {},
}))