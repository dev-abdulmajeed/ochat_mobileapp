import { create } from "zustand";
import { osquare } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set, get) => ({
  loading: false,
  error: false,

  // ------------------- LOGIN -------------------
  login: async (email, password) => {
    set({ loading: true, error: false });

    try {
      const payload = {
        email,
        password,
        currentDomain: "localhost",
        client: "",
      };

      const res = await osquare.post("User/Login", payload);
      const { grantToken } = res.data;
      console.log("Login response:", res.data);

      if (!grantToken) throw new Error("Grant token not received");

      // Save grant token asynchronously
      await AsyncStorage.setItem("grantToken", grantToken);

      // Immediately exchange for access token
      await get().grantToken(grantToken);

      set({ loading: false });
      return res.data;
    } catch (error) {
      console.log("Login error:", error);
      set({ loading: false, error: true });
      throw error;
    }
  },

  // ------------------- GRANT TOKEN -------------------
  grantToken: async (grantTokenParam) => {
    try {
      const savedGrantToken = await AsyncStorage.getItem("grantToken");
      const grantToken = grantTokenParam || savedGrantToken;
      if (!grantToken) throw new Error("No grant token found");

      const encoded = encodeURIComponent(grantToken);
      const { data } = await osquare.post(`User/Grant?grantToken=${encoded}`);

      const { token, refreshToken, user } = data;
      console.log("Grant token response:", data);

      // Save all auth info asynchronously
      if (token) await AsyncStorage.setItem("token", token);
      if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
      if (user) await AsyncStorage.setItem("user", JSON.stringify(user));
      console.log("refreshtoken", refreshToken);
      
      console.log("Grant token exchanged and saved successfully");
      return data;
    } catch (error) {
      console.log("Grant token error:", error);
      throw error;
    }
  },

  // ------------------- LOGOUT -------------------
  logout: async () => {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken", "grantToken", "user"]);
      console.log("Cleared all auth data from storage");
    } catch (error) {
      console.log("Logout error:", error);
    }
  },
}));
