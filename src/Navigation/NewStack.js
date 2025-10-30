import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import SplashScreen from '../main/SplashScreen';
import BottomTabs from './BottomTabs'
import UpdateScreen from '../services/UpdateScreen';
import LoginScreen from '../auth/LoginScreen';
import ChatScreen from '../main/ChatScreen';
import NewChat from '../screens/NewChat';
import Appearance from '../screens/Appearance';

const NewStack = () => {
  const Nav = createNativeStackNavigator();
  return (
    <Nav.Navigator
      initialRouteName="splash"
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
        headerTintColor: '#FFF',
      }}>
      <Nav.Screen name="splash" component={SplashScreen} />
      <Nav.Screen name="home" component={BottomTabs} />
      <Nav.Screen name='login' component={LoginScreen}/>
      <Nav.Screen name='appupdate' component={UpdateScreen}/>
      <Nav.Screen name="ChatScreen" component={ChatScreen} />
      <Nav.Screen name='newchat' component={NewChat}/>
      <Nav.Screen name='appearance' component={Appearance}/>
    </Nav.Navigator>
  );
};

export default NewStack;
