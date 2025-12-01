//This is the map component 
//Created by Rachel Townsend

import React, {useEffect, useRef, useState} from 'react';
import {View, Stylesheet, TouchableOpacity, Text, Alert} from 'react-native';
import MapView, {Maker, Circle} from 'react-native-maps';
import useLocation from '';

export default function LocationMap(){
    const{
        location, 
        isLoading,
        startWatchingLocation,
        stopWatchingLocation,
    } = useLocation();

}
