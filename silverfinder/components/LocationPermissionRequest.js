//Location permission request component 
//Created on 10/27/25 by Rachel Townsend

import React, { useEffect } from 'react';
import {} from 'react-native';
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

    const 