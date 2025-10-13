import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {Redirect } from 'expo-router';

export default function HomeScreen() {
  return (
   <Redirect href={'/(auth)/login'} /> //Redirect to the main tab navigator
  );
}

