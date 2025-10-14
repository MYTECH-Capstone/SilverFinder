import { Redirect, Stack } from "expo-router";
import {useAuth} from "../../providers/AuthProvider";
export default function AuthLayout() {
    const { user } = useAuth();
    //if there is a user
    if(user){
        return <Redirect href="/(home)/(tabs)" />;
    }
    return <Stack />;
    }