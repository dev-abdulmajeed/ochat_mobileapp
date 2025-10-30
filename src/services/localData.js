import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUsers = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      console.log("User from local storage:", user);
      return user;
    } else {
      console.log("No user found in local storage");
      return null;
    }
  } catch (error) {
    console.error(" Error reading user from AsyncStorage:", error);
    return null;
  }
};
