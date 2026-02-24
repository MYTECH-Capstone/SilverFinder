//Created on 11.19.25 - Rachel Townsend
/*
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

    return(
        <ScrollView style={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>📍 Your Location</Text>

                {location ? (
                    <View style={styles.locationCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Latitude:</Text>
                            <Text style={styles.value}>{formatCoordinate(location.latitude)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Longitude:</Text>
                            <Text style={styles.value}>{formatCoordinate(location.longitude)}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Accuracy:</Text>
                            <Text style={styles.value}>
                                {location.accuracy ? `±${location.accuracy.toFixed(0)}m` : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Altitude:</Text>
                            <Text style={styles.value}>
                                {location.altitude ? `${location.altitude.toFixed(1)}m` : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Speed:</Text>
                            <Text style={styles.value}>{formatSpeed(location.speed)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Heading:</Text>
                            <Text style={styles.value}>
                                {location.heading ? `${location.heading.toFixed(0)}°` : 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Last Update:</Text>
                            <Text style={[styles.value, styles.timestampText]}>
                                {formatTimestamp(location.timestamp)}
                            </Text>
                        </View>

                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Live Tracking Active</Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.noLocationText}>No location data available</Text>
                )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                            <Text style={styles.buttonText}>📍 Get Current Location</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonSecondary} onPress={stopWatchingLocation}>
                            <Text style={styles.buttonSecondaryText}>⏸ Stop Tracking</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={startWatchingLocation}>
                            <Text style={styles.buttonText}>▶ Resume Tracking</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.infoText}>
                        💡 Location updates automatically every 10 seconds or when you move 10 meters
                    </Text>
                </View>
            </ScrollView>
        );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    color: '#333',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
  },
  timestampText: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 500,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  buttonSecondaryText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  noLocationText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});
*/