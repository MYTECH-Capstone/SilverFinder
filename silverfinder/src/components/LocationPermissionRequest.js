//Location permission request component 
//Created on 10/27/25 by Rachel Townsend

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import * as Location from 'expo-location';

export default function LocationPermissionRequest({onPermissionGranted}){
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async() => {
        try{
            const {status} = await Location.getForegroundPermissionsAsync();
            setPermissionStatus(status);
            setIsLoading(false);

            if(status ==='granted'){
                onPermissionGranted && onPermissionGranted();
            }
        } catch(error){
            console.error('Error checking location permission:', error);
            setIsLoading(false);
        }
    };

    const requestPermission = async() => {
        try{
            const {status} = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);

            if(status === 'granted'){
                Alert.alert(
                    'Permission Granted',
                    'Thank you! Your location will help keep you connected with your home group.',
                    [{text: 'ok', onPress: () => onPermissionGranted && onPermissionGranted()}]
                );
            }
        } catch(error){
            console.error('Error requesting location permission:', error);
            Alert.alert('Error', 'Alert: Something went wrong. Please try again.');
        }
    };

    if(isLoading){
        return(
            <View style = {styles.container}>
                <Text style = {styles.loadingText}>Checking permissions...</Text>
            </View>
        );
    }

    if(permissionStatus === 'granted'){
        return null; //shows nothing when permission is already granted
    }

    return(
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Location Access Needed</Text>
        <Text style={styles.description}>
          Silver Finder needs your location to help your caretakers know where you are and keep you safe.
        </Text>
        <Text style={styles.bulletPoint}>✓ See your location on the map</Text>
        <Text style={styles.bulletPoint}>✓ Get notified if you go outside safe areas</Text>
        <Text style={styles.bulletPoint}>✓ Stay connected with your home group</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Enable Location</Text>
        </TouchableOpacity>
        
        <Text style={styles.privacy}>
          Your location is only shared with your home group members.
        </Text>
      </View>
    </View>
    );
}

    const styles = StyleSheet.create({
        container:{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            padding: 20,
        },
        card: {
            backgroundColor: 'white',
            borderRadius: 15,
            padding: 30,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
            maxWidth: 400,
        },
        icon: {
            fontSize: 60,
            marginBottom: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 15,
            color: '#333',
            textAlign: 'center',
        },
        description: {
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 24,
        },
        bulletPoint: {
            fontSize: 14,
            color: '#555',
            marginBottom: 8,
            alignSelf: 'flex-start',
        },
        button: {
            backgroundColor: '#4CAF50',
            paddingVertical: 15,
            paddingHorizontal: 40,
            borderRadius: 25,
            marginTop: 20,
            marginBottom: 15,
        },
        buttonText: {
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
        },
        privacy: {
            fontSize: 12,
            color: '#999',
            textAlign: 'center',
            fontStyle: 'italic',
        },
        loadingText: {
            fontSize: 16,
            color: '#666',
        },
});