//This is the map component 
//Created by Rachel Townsend

import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator} from 'react-native';
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import useLocation from '../hooks/useLocation';

console.log("Map is rendering"); //diagnostic

export default function LocationMap(){
    const{
        location,
        error, 
        isLoading,
        startWatchingLocation,
        stopWatchingLocation,
    } = useLocation();

    const [followUser, setFollowUser] = useState(true);
    const [mapReady, setMapReady] = useState(false);
    const [mapType, setMapType] = useState('standard');
    const mapRef = useRef(null);

    useEffect(() => {
        console.log("Starting location watch...");
        startWatchingLocation();
        return () => {
            console.log("Stopping location watch...");
            stopWatchingLocation();
        };
    },[]);

    //create follow mode?
    useEffect(() => {
        if(location && mapRef.current && followUser && mapReady){
            mapRef.current.animateCamera({
                center:{
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
                zoom: 16,
            }, {duration: 1000});
        }
    }, [location, followUser, mapReady]);

    const handleRecenterPress = () => {
        if(location && mapRef.current){
            setFollowUser(true);
            mapRef.current.animateCamera({
                center: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
                zoom: 16,
            }, {duration: 500});
        }
    };

    const handleMapPress = () =>{
        setFollowUser(false);
    };

    const toggleMapType = () => {
        const types = ['standard', 'satellite', 'hybrid'];
        const currentIndex = types.indexOf(mapType);
        const nextIndex = (currentIndex + 1) % types.length;
        setMapType(types[nextIndex]);
    };

    if(error){
        return(
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>Currently unable to load map</Text>
                <Text style={styles.errorSubtext}>{error}</Text>
                <Text style={styles.errorHint}>
                    Please enable location services in your device settings
                </Text>
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
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                mapType={mapType}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={false}
                showsTraffic={false}
                onPress={handleMapPress}
                onPanDrag={handleMapPress}
                onMapReady={() => setMapReady(true)}
                rotateEnabled={true}
                pitchEnabled={false}            
            >
                {location && (
                    <>
                    {location.accuracy && location.accuracy < 100 && (
                    <Circle
                        center= {{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        radius = {location.accuracy}
                        fillColor = "rgba(66, 133, 244, 0.15)"
                        strokeColor = "rgba(66, 133, 244, 0.4)"
                        strokeWidth={1}
                        />
                    )}
                        
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}

                        anchor = {{x: 0.5, y: 0.5}}
                        flat = {true}
                        rotation = {location.heading || 0}
                        >
                           <View style={styles.markerContainer}>
                                <View style={styles.markerPulse} />
                                <View style={styles.markerDot}>
                                    {location.heading && (
                                        <View style={styles.markerArrow} />
                                    )}
                                </View>
                            </View> 
                        </Marker>
                    </>
                )}
            </MapView>

//location status
            <View style={styles.topOverlay}>
                <View style={styles.statusCard}>
                    <View style = {styles.statusRow}>
                        <View style = {styles.statusDot}/>
                        <Text style = {styles.statusText}>
                            {location ? 'Live Location' : 'Searching...'}
                        </Text>
                    </View>
                    {location && location.accuracy &&(
                        <Text style = {styles.accuracyBadge}>
                            +{location.accuracy.toFixed(0)}m
                        </Text>
                    )}
                </View>
            </View>


            <View style = {styles.bottomControls}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleMapType}
                >
                    <Text style={styles.controlButtonText}>🗺️</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.recenterButton,
                        followUser && styles.recenterButtonActive,
                    ]}
                    onPress={handleRecenterPress}
                >
                    <Text style={styles.recenterButtonText}>
                        {followUser ? '📍' : '🎯'}
                    </Text>
                </TouchableOpacity>
            </View>

            {followUser && location && (
                <View style={styles.followingBadge}>
                    <Text style={styles.followingText}>Following Your Location</Text>
                </View>
            )}

            {(isLoading || !location) && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>Getting your location...</Text>
                        <Text style={styles.loadingSubtext}>
                            Make sure tracking is enabled
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,  
    },

    map:{
        width: '100%',
        height: '100%',
    },

    errorContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 30,
    },

    errorIcon:{
        fontSize: 70,
        marginBottom: 20,
    },

    errorText:{
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f44336',
        marginBottom: 10,
        textAlign: 'center',
    },

    errorSubtext:{
        fontSize: 15,
        color: '#699',
        textAlign: 'center',
        marginBottom: 15,
    },

    errorHint:{
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },

    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
  },

    markerPulse: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderWidth: 2,
        borderColor: 'rgba(66, 133, 244, 0.4)',
    },

    markerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#4285F4',
        borderWidth: 3,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },

    markerArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'white',
        transform: [{ rotate: '180deg' }],
    },

    topOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    statusCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },

    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },

    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },

    accuracyBadge: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10,
    },

    bottomControls: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        flexDirection: 'column',
        gap: 12,
    },

    controlButton: {
        backgroundColor: 'white',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    controlButtonText: {
        fontSize: 22,
    },

    recenterButton: {
        backgroundColor: 'white',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    recenterButtonActive: {
        backgroundColor: '#4CAF50',
    },

    recenterButtonText: {
        fontSize: 28,
     },

    followingBadge: {
        position: 'absolute',
        bottom: 110,
        alignSelf: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.95)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },

    followingText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
    },

    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },

    loadingCard: {
        alignItems: 'center',
        padding: 30,
    },

    loadingText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
        marginTop: 15,
    },

    loadingSubtext: {
        fontSize: 14, 
        color: '#699',
        marginTop: 8,
    },
});
