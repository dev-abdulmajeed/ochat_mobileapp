import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Platform,
} from "react-native";
import { useEmployeesStore } from "../zustand/employees/useEmployeesStore";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../constants/ThemeColors";
import {useConversation} from "../zustand/conversation/useConversation";
import { getUsers } from "../services/localData";

const BASE_IMAGE_URL = "https://api.qa.osquare.solutions/";

const NewChat = () => {
  const { theme } = useContext(ThemeContext);
  const colors = theme === "dark" ? darkTheme : lightTheme;
  const { addConversation, addConversationMember } = useConversation();


  const { employees, loading, error, fetchEmployees, addToRecentChats } =
    useEmployeesStore();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter((employee) => {
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const email = employee.email?.toLowerCase() || "";
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  // Group employees alphabetically
  const groupedEmployees = filteredEmployees.reduce((groups, employee) => {
    const firstLetter = employee.firstName[0].toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(employee);
    return groups;
  }, {});

  const sections = Object.keys(groupedEmployees)
    .sort()
    .map((letter) => ({
      title: letter,
      data: groupedEmployees[letter],
    }));

const renderEmployee = ({ item }) => {
  const imageUrl = item.profilePic
    ? `${BASE_IMAGE_URL}/${item.profilePic}`
    : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <TouchableOpacity
      style={[styles.employeeItem, { backgroundColor: colors.card }]}
      activeOpacity={0.6}
      onPress={async () => {
        try {
          const currentUser = getUsers();
          
          // 1️⃣ Create a new conversation
          const conversation = await addConversation(
            `${currentUser?.firstName} & ${item.firstName}`,
            0 // type 0 = direct chat
          );

          if (!conversation?.id) {
            console.warn("Conversation creation failed");
            return;
          }

          // 2️⃣ Add current user as member
          await addConversationMember(
            conversation.id,
            currentUser.id,
            `${currentUser.firstName} ${currentUser.lastName}`,
            true // isAdmin
          );

          // 3️⃣ Add the selected employee as member
          await addConversationMember(
            conversation.id,
            item.userId,
            `${item.firstName} ${item.lastName}`,
            false
          );

          // 4️⃣ Navigate to Chat Screen
          navigation.navigate("ChatScreen", {
            conversationId: conversation.id,
            name: `${item.firstName} ${item.lastName}`,
            email: item.email,
            profilePic: item.profilePic,
          });
        } catch (error) {
          console.error("Error creating chat:", error);
        }
      }}
    >
      <Image source={{ uri: imageUrl }} style={styles.avatar} />
      <View style={styles.employeeInfo}>
        <Text style={[styles.employeeName, { color: colors.text }]} numberOfLines={1}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={[styles.employeeStatus, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.email || "Available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

  const renderSectionHeader = ({ section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.card}
        />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Chat</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading contacts...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colors.card}
        />
        
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Chat</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchEmployees}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.card}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Chat</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {filteredEmployees.length} {filteredEmployees.length === 1 ? "contact" : "contacts"}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchWrapper, { backgroundColor: colors.background }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <View style={styles.clearIconContainer}>
                <Text style={styles.clearIcon}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      {searchQuery.length === 0 && (
        <View style={[styles.quickActions, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate("NewGroup")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#34C759' }]}>
              <Text style={styles.quickActionEmoji}>👥</Text>
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              New Group
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate("NewChannel")}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.quickActionEmoji}>📢</Text>
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              New Channel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contacts Header */}
      {filteredEmployees.length > 0 && (
        <View style={[styles.contactsHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.contactsHeaderText, { color: colors.textSecondary }]}>
            CONTACTS
          </Text>
        </View>
      )}

      {/* Employee List */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item: section }) => (
          <View>
            {renderSectionHeader({ section })}
            {section.data.map((employee) => (
              <View key={employee.id}>
                {renderEmployee({ item: employee })}
              </View>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {searchQuery ? "🔍" : "👥"}
            </Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? "No Results" : "No Contacts"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery 
                ? `No contacts found for "${searchQuery}"`
                : "Add some contacts to start chatting"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default NewChat;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
  },
  backIcon: {
    fontSize: 34,
    color: "#007AFF",
    fontWeight: "400",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  placeholder: {
    width: 50,
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
  },
  searchIcon: {
    fontSize: 16,
    marginHorizontal: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearIconContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  clearIcon: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 32,
  },
  quickActionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  quickActionEmoji: {
    fontSize: 14,
  },
  quickActionText: {
    fontSize: 17,
    fontWeight: "500",
  },

  // Contacts Header
  contactsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactsHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Employee Item
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: "400",
    marginBottom: 2,
  },
  employeeStatus: {
    fontSize: 15,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});