//Add location permission request component to the app
//Created on 10/27/25 by Rachel Townsend

import React, {useState} from "react";
import {View, Text, StyleSheet} from 'react-native';
import LocationPermissionRequest from './components/LocationPermissionRequest';
import LocationDisplay from "./components/LocationDisplay";

export default function App(){
    const [hasPermission, setHasPermission] = useState(false);
    if(!hasPermission){
        return(
            <LocationPermissionRequest onPermissionGranted = {() => setHasPermission(true)}
            />
        );
    }

    return(
        <View style = {StyleSheet.container}>
            <LocationDisplay />
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});


/*const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFA500',
    },
    subtext: {
        fontSize: 16,
        color: '#F4A460',
        marginTop: 10,
    },
});*/