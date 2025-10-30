import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useEmployeesStore } from "../zustand/employees/useEmployeesStore";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/ThemeColors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { softnav } from "../services/NavigationService";


const BASE_IMAGE_URL = "https://api.qa.osquare.solutions/";

const HomeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const colors = theme === "dark" ? darkTheme : lightTheme;
  const { recentChats } = useEmployeesStore();
  const navigation = useNavigation();

  const renderChat = ({ item }) => {
    const imageUrl = item.profilePic
      ? `${BASE_IMAGE_URL}${item.profilePic.replace(/\\/g, "/")}`
      : "https://cdn-icons-png.flaticon.com/512/847/847969.png";

    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: colors.card }]}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            userId: item.userId,
            name: `${item.firstName} ${item.lastName}`,
          })
        }
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.avatar} />

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={[styles.chatTime, { color: colors.textSecondary }]}>
              {item.lastMessageTime || "Mon"}
            </Text>
          </View>

          <View style={styles.chatFooter}>
            <View style={styles.messageRow}>
              {item.isRead && (
                <Text style={styles.checkmark}>✓✓</Text>
              )}
              <Text
                style={[styles.chatMessage, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.lastMessage || "Let's discuss our first option"}
              </Text>
            </View>

            {item.isPinned && (
              <Text style={styles.pinIcon}>📌</Text>
            )}
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chats</Text>
        <TouchableOpacity onPress={() => softnav("newchat")}>
           <MaterialIcons name="edit" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search for messages or users"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </View>

      {/* Saved Messages */}
      <TouchableOpacity
        style={[styles.savedMessages, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate("SavedMessages")}
      >
        <View style={styles.savedIconContainer}>
          <Text style={styles.savedIcon}>🔖</Text>
        </View>
        <View style={styles.savedContent}>
          <Text style={[styles.savedTitle, { color: colors.text }]}>Saved Messages</Text>
          <Text style={[styles.savedSubtitle, { color: colors.textSecondary }]}>
            @jacob_d
          </Text>
        </View>
        <Text style={[styles.savedTime, { color: colors.textSecondary }]}>Fri</Text>
        <Text style={styles.pinIcon}>📌</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={recentChats}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderChat}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No recent chats
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />



    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  editButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
  },
  composeIcon: {
    fontSize: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
  },
  savedMessages: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  savedIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#3390EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  savedIcon: {
    fontSize: 24,
  },
  savedContent: {
    flex: 1,
  },
  savedTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  savedSubtitle: {
    fontSize: 15,
  },
  savedTime: {
    fontSize: 14,
    marginRight: 8,
  },
  pinIcon: {
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 14,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkmark: {
    color: '#34C759',
    fontSize: 16,
    marginRight: 4,
  },
  chatMessage: {
    fontSize: 15,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
  },
  activeBadge: {
    marginBottom: 2,
  },
});