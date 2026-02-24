// Displays the location
//updated by Rachel - 11.19.25

//import { Text } from 'react-native';
import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import LocationPermissionRequest from '../../../components/LocationPermissionRequest';
import Map from '../../../components/Map';
import * as Location from 'expo-location';

export default function LocationScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    checkExistingPermission();
  }, []);
  
  const checkExistingPermission = async () => {
    try{
      const {status} = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      setIsCheckingPermission(false);
    } catch(error){
      console.error('Error checking permission:', error);
      setIsCheckingPermission(false);
    }
  };

  if(isCheckingPermission){
    return <View style={styles.container} />;
  }
  if(!hasPermission){
    return(
      <LocationPermissionRequest
        onPermissionGranted={() => setHasPermission(true)}
        />
    );
  }

  return (
    <View style={styles.container}>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
