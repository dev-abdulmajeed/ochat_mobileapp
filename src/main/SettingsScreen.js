import React, { useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  Image 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../constants/ThemeColors';
import { resetnav, softnav } from '../services/NavigationService';
import { getUsers} from "../services/localData"

const SettingsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [user, setUser] = React.useState(null);

useEffect(() => {
  (async () => {
    const storedUser = await getUsers();
    if (storedUser) {
      setUser(storedUser);
    }
  })();
}, []);


  const MenuItem = ({ icon, title, badge, onPress, showArrow = true }) => (
    <TouchableOpacity 
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconContainer, { backgroundColor: icon.bg || '#007AFF' }]}>
          <MaterialIcons name={icon.name} size={20} color="#fff" />
        </View>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.menuRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showArrow && <MaterialIcons name="chevron-right" size={22} color="#C7C7CC" />}
      </View>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      resetnav('login');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text> 
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
            <MaterialIcons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Search</Text>
          </View>
        </View>

        {/* Profile Section */}
     <TouchableOpacity style={[styles.profileSection, { backgroundColor: colors.card }]}>
  {/* <Image 
    source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
    style={styles.avatar}
  /> */}
  <View style={styles.profileInfo}>
    <Text style={[styles.profileName, { color: colors.text }]}>
      {user?.name || 'No Name'}
    </Text>
    <Text style={[styles.profilePhone, { color: colors.textSecondary }]}>
      {user?.phone || 'No Phone'}
    </Text>
    <Text style={[styles.profileUsername, { color: colors.textSecondary }]}>
      @{user?.username || 'unknown'}
    </Text>
  </View>
  <MaterialIcons name="chevron-right" size={26} color="#C7C7CC" />
</TouchableOpacity>


        <View style={styles.menuSection}>
          <MenuItem 
            icon={{ name: 'message', bg: '#3390EC' }}
            title="Saved Messages"
            onPress={() => softnav('saved-messages')}
          />
          <MenuItem 
            icon={{ name: 'call', bg: '#32CD32' }}
            title="Recent Calls"
            onPress={() => softnav('recent-calls')}
          />
        </View>

        <View style={styles.menuSection}>
          <MenuItem 
            icon={{ name: 'notifications', bg: '#FF3B30' }}
            title="Notifications and Sounds"
            onPress={() => softnav('notifications')}
          />
          <MenuItem 
            icon={{ name: 'lock', bg: '#8E8E93' }}
            title="Privacy and Security"
            onPress={() => softnav('privacy')}
          />
          <MenuItem 
            icon={{ name: 'cloud', bg: '#34C759' }}
            title="Data and Storage"
            onPress={() => softnav('data-storage')}
          />
          <MenuItem 
            icon={{ name: 'palette', bg: '#007AFF' }}
            title="Appearance"
            onPress={() => softnav('appearance')}
          />

          {/* Logout */}
          <MenuItem 
            icon={{ name: 'logout', bg: '#FF3B30' }}
            title="Logout"
            showArrow={false}
            onPress={handleLogout}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

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
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
  },
  editButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  scrollView: {
    flex: 1,
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
  searchPlaceholder: {
    fontSize: 17,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
  },
  accountSection: {
    marginTop: 32,
    paddingVertical: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountName: {
    fontSize: 17,
  },
  addAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addAccountText: {
    color: '#007AFF',
    fontSize: 17,
  },
  menuSection: {
    marginTop: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 17,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});
