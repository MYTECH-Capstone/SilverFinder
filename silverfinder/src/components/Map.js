//This is the map component 
//Created by Rachel Townsend

import React, {use, useEffect, useRef, useState} from 'react';
import {View, Stylesheet, TouchableOpacity, Text, Alert, LayoutAnimation} from 'react-native';
import MapView, {Maker, Circle} from 'react-native-maps';
import useLocation from '';

export default function LocationMap(){
    const{
        location, 
        isLoading,
        startWatchingLocation,
        stopWatchingLocation,
    } = useLocation();

    const [followUser, setFollowUser] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef(null);

    useEffect(() => {
        startWatchingLocation();
        return () => {
            stopWatchingLocation();
        };
    },[]);

    useEffect(() => {
        if(location && mapRef.current && followUser && mapReady){
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [location, followUser, mapReady]);

    const handleRecenterPress = () => {
        if(location && mapRef.current){
            setFollowUser(true);
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        } else{
            Alert.alert('Location is not avaliable', 'Waiting for location data...');
        }
    };

    const handleMapPress = () =>{
        setFollowUser(false);
    };

    if(error){
        return(
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>Unable to load map</Text>
                <Text style={styles.errorSubtext}>{error}</Text>
            </View>
        );
    }

    const initialRegion = location
    ?{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    }
    :{
        //default Denton, TX
        latitude: 33.2148,
        longitude: -97.1331,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return(

    )

    

}
