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

        );
    }

    if(permissionStatus === 'granted'){
        return null; //shows nothing when permission is already granted
    }

    return(

    )

    const styles = StyleSheet.create({

    });