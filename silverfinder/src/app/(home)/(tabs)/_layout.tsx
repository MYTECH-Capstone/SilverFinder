// will be out tabs navigator, adding a tabs.screen component will require a corressponding.tsx file
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import AuthProvider from "../../../providers/AuthProvider";

export default function TabsNavigator() {
  return (
    <Tabs>
      <Tabs.Screen
        name="Appointments"
        options={{
          headerShown: false,
          title: "Appointments",
          tabBarIcon: () => <Feather name="calendar" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,   //map fills the full screen
          title: "Location",
          tabBarIcon: () => (
            <Ionicons name="location-outline" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="My Information"
        options={{
          headerShown: false,
          title: "My Information",
          tabBarIcon: () => (
            <Ionicons name="settings-outline" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="CreateGroup"
        options={{
          headerShown: false,
          title: "Groups",
          tabBarIcon: () => <Ionicons name="people" size={24} color="black" />,
        }}
      />
      {/*Deleted 5th tab*/}
    </Tabs>
  );
}
