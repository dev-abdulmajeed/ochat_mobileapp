import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import icons from '../constants/Icons';
import { Height, Width, getResponsiveFont } from '../constants/size';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const logAppVersionDetails = async () => {
      try {
        const platform = Platform.OS;
        const appName = DeviceInfo.getApplicationName();
        const version = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();
        const uniqueId = await DeviceInfo.getUniqueId();
        const systemVersion = DeviceInfo.getSystemVersion();
        const model = DeviceInfo.getModel();
        const brand = DeviceInfo.getBrand();

        console.log('==============================');
        console.log('APP VERSION DETAILS');
        console.log('==============================');
        console.log(`App Name: ${appName}`);
        console.log(`Platform: ${platform}`);
        console.log(`App Version: ${version}`);
        console.log(`Build Number: ${buildNumber}`);
        console.log(`Device ID: ${uniqueId}`);
        console.log(`Device Model: ${model}`);
        console.log(`Device Brand: ${brand}`);
        console.log(`System Version: ${systemVersion}`);
        console.log('==============================');
      } catch (err) {
        console.error('Error fetching device info:', err);
      }
    };

    logAppVersionDetails();
  }, []);

  // Check token & navigate
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userString = await AsyncStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        console.log('Checking auth token...', token ? 'FOUND' : 'MISSING');

        // Wait a bit for splash animation feel
        setTimeout(() => {
          if (token && user) {
            navigation.replace('home');
          } else {
            navigation.replace('login');
          }
        }, 2000);
      } catch (error) {
        console.error('Auth check error:', error);
        navigation.replace('login');
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Centered Logo */}
      <View style={styles.centerContent}>
        <Image
          source={icons.Logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Bottom “Powered by” section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.poweredByText}>Powered by</Text>
        <Image
          source={icons.PoweredBy}
          style={styles.poweredByImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  logo: {
    width: Width * 0.5,
    height: Height * 0.25,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: Height * 0.05,
    alignItems: 'center',
    width: Width,
  },
  poweredByText: {
    fontSize: getResponsiveFont(12),
    color: '#777',
    marginBottom: Height * 0.01,
  },
  poweredByImage: {
    width: Width * 0.3,
    height: Height * 0.05,
  },
});
