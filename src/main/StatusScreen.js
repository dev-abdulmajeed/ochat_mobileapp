import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { darkTheme, lightTheme } from '../constants/ThemeColors';

const StatusScreen = () => {
  const {theme} = React.useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}> 
      <Text style={{color: colors.text}}>StatusScreen</Text>
    </View>
  )
}

export default StatusScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})