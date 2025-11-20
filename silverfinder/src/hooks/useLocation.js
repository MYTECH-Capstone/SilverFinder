//Created 11/18/2025 - Rachel Townsend
//Don't forget to install expo-location "npx expo install expo-location"

import {useState, useEffect, useRef} from 'react';
import * as Location from 'expo-location';
//import { LocationSubscriber } from 'expo-location/build/LocationSubscribers';

export default function useLocation(){
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const locationSubscription = useRef(null);
    
    const getCurrentLocation = async () => {
    try{
        setIsLoading(true);
        setError(null);

        const {status} = await Location.getForegroundPermissionsAsync();
        if(status !== 'granted'){
            setError('Location permission not granted');
            setIsLoading(false);
            return null;
        }
    
        const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        const locationData = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy,
            heading: currentLocation.coords.heading,
            speed: currentLocation.coords.speed,
            timestamp: currentLocation.coords.timestamp,
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
};

//Regular updates
const startWatchingLocation = async () => {
    try{
        setError(null);

        const {status} = await Location.getForegroundPermissionsAsync();
        if(status !== 'granted'){
            setError('Location permission not granted');
            return;
        }
        if(locationSubscription.current){
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
                    latitude: newLocation.coords.latitude,
                    longitude: newLocation.coords.longitude,
                    accuracy: newLocation.coords.accuracy,
                    altitude: newLocation.coords.altitude,
                    heading: newLocation.coords.heading,
                    speed: newLocation.coords.speed,
                    timestamp: newLocation.coords.timestamp,
                };

                setLocation(locationData);
                setIsLoading(false);
            }
        );
    }
    catch(err){
        console.error('Error watching location:', err);
        setError(err.message);
        setIsLoading(false);
    }
};

const stopWatchingLocation = () => {
    if(locationSubscription.current){
        locationSubscription.current.remove();
        locationSubscription.current = null;
    }
};

useEffect(() => {
    return () => {
        stopWatchingLocation();
    };
}, []);

return{
    location, error, isLoading, getCurrentLocation, startWatchingLocation, stopWatchingLocation,
};
}