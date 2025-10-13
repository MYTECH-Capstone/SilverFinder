//define global providers
//Will render a stack later when we have multiple screens in home 
import { Slot, Stack } from 'expo-router';
import AuthProvider from '../providers/AuthProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function RootLayout(){
    return(
        <GestureHandlerRootView>
            <AuthProvider>
                <Slot />
            </AuthProvider>
            
        </GestureHandlerRootView>
)

}