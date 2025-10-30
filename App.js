import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import NewStack from './src/Navigation/NewStack'
import "react-native-gesture-handler";
import { navigationRef } from './src/services/NavigationService';
import { ThemeProvider } from './src/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkTheme, lightTheme } from './src/constants/ThemeColors';

const App = () => {
   
  return (
    <SafeAreaView style={{flex:1}}>
    <NavigationContainer ref={navigationRef}>
      <ThemeProvider>
      <NewStack />
      </ThemeProvider>
    </NavigationContainer>
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({})