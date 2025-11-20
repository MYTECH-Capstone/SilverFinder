//Created 11/18/2025 - Rachel Townsend
//Don't forget to install expo-location "npx expo install expo-location"

import {useState, useEffect, useRef} from 'react';
import * as Location from 'expo-location';

export default function useLocation(){

}

const getCurrentLocation = async () => {
    try{
        setIsLoading(true);
        setError(null);
    }

    const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });

    const locationData = {
        latitude: 
        longitude: 
        accuracy: 
        heading:
        speed: 
        timestamp:
    };

    setLocation(locationData);
    setIsLoading(false);
    
    return locationData;
} 
catch(err){
    
}