//Created on 11.19.25 - Rachel Townsend

import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import useLocation from '../hooks/useLocation';

export default function LocationDisplay(){
    const{
        location,
        error, 
        isLoading,
        getCurrentLocation,
        startWatchingLocation,
        stopWatchingLocation,
    } = useLocation();

    useEffect(() => {
        startWatchingLocation();
        return() => {
            stopWatchingLocation();
        };
    }, []);

    const formatCoordinate = (coord) => {
        return coord ? coord.toFixed(6): 'N/A';
    };

    const formatSpeed = (speed) => {
        if(!speed) return 'N/A';
        const kmh = (speed * 3.6).toFixed(2);
        return '${kmh} km/h';
    };

    const formatTimestamp = (timestamp) => {
        if(!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    if(isLoading && !location){
        return(
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
        );
    }

    if(error){
        return(
            <View style={styles.container}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }
}