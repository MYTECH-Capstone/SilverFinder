// app/(tabs)/CreateGroup/index.tsx
import React from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function GroupsHome() {
  const router = useRouter();

  return (
    <View style={{ flex: 1}}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Groups</Text>
      </View>

    <View style={styles.container}>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/CreateGroup/Create')} >
        <Text style={styles.buttonText}>CREATE A GROUP</Text>
        </TouchableOpacity>
      
      <TouchableOpacity style={styles.button}  onPress={() => router.push('/CreateGroup/Join')}>
        <Text style={styles.buttonText}>JOIN A GROUP</Text>
        </TouchableOpacity>

      <TouchableOpacity style={styles.button}  onPress={() => router.push('/(home)/(tabs)/CreateGroup/MyGroups')} >
        <Text style={styles.buttonText}>VIEW MY GROUPS</Text>
        </TouchableOpacity>
    </View>
    </View>

  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffd8a8', 
    paddingTop: 30, 
    paddingBottom: 60,
    alignItems: 'center',
  },
  container: { 
    flex: 1,
    backgroundColor: '#ffd8a8', 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
   },
  headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
        marginTop: 8,
        color: '#333',
        justifyContent:'flex-start'
  },
  button: {
    backgroundColor: '#ffa726ff', 
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },

});
