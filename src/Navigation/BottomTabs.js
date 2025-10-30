import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Width, Height, getResponsiveFont } from '../constants/size';
import HomeScreen from '../main/HomeScreen';
import CommunityScreen from '../main/CommunityScreen';
import StatusScreen from '../main/StatusScreen';
import SettingsScreen from '../main/SettingsScreen';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../constants/ThemeColors';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const { theme } = useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          height: Height * 0.09,
          borderTopWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          paddingBottom: Height * 0.01,
        },
        tabBarLabelStyle: {
          fontSize: getResponsiveFont(12),
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Community':
              iconName = 'group';
              break;
            case 'Status':
              iconName = 'bar-chart';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialIcons name={iconName} size={size || 26} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
