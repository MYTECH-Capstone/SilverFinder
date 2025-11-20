//Created 11/18/2025 - Rachel Townsend
//Don't forget to install expo-location "npx expo install expo-location"

import {useState, useEffect, useRef} from 'react';
import * as Location from 'expo-location';
import { LocationSubscriber } from 'expo-location/build/LocationSubscribers';

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
    console.error('ERROR getting your current location:', err);
    setError(err.message);
    setIsLoading(false);
    return null;
}

//Regular updates
const startWatchingLocation = async () => {
    try{
        setError(null);

        const {status} = await Location.getForegroundPermissionsAsync();
        if(status !== 'granted'){
            setError('Location permission not granted');
            return;
        }
        if(LocationSubscription.current){
            locationSubscription.current.remove();
        }

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 10000, //10 seconds?
                distanceInterval: 10, //change later potentially
            },
            (newLocation) => {
                const locationData = {
                    latitude: 
                    longitude:
                    accuracy:
                    altitude:
                    heading:
                    speed:
                    timestamp:
                };

                setLocation(locationData);
                setIsLoading(false);
            }
        );
    }
    catch(err){

    }
};

const stopWatchingLocation

return{
    location, error, 
}