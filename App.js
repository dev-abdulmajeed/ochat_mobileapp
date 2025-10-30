import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import NewStack from './src/Navigation/NewStack'
import "react-native-gesture-handler";
import { navigationRef } from './src/services/NavigationService';
import { ThemeProvider } from './src/context/ThemeContext';

const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <ThemeProvider>
      <NewStack />
      </ThemeProvider>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})