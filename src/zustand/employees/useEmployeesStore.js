import { create } from "zustand";
import { osquare } from "../../services/api";

export const useEmployeesStore = create((set) => ({
  employees: [],
  profile: null,
  loading: false,
  error: null,

  // Fetch all employees
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const res = await osquare.get("Employee/GetAll");
      set({ employees: res.data, loading: false });
      console.log("Employees Data:", res.data);
    } catch (error) {
      set({
        loading: false,
        error: error.message || "Failed to fetch employees",
      });
    }
  },

getProfile: async () => {
  set({ loading: true, error: null });
  try {
    const res = await osquare.post(
      "Employee/GetProfile",
      {}, // send empty object if no body required
      { headers: { "Content-Type": "application/json" } }
    );

    set({ profile: res.data, loading: false });
    console.log("✅ Profile API Response:", res.data);
  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    set({
      loading: false,
      error: error.message || "Failed to fetch profile",
    });
  }
},

}));
