// app/(tabs)/CreateGroup/index.tsx
import { Stack } from 'expo-router'; // gets rid of the index header
import React from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from "@expo/vector-icons/AntDesign";

function GroupCard({
  icon, label, description, onPress,
}: {
  icon: string; label: string; description: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardIcon}>
        <AntDesign name={icon as any} size={26} color="#e85d04" />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function GroupsHome() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>👥</Text>
        </View>
        <Text style={styles.headerTitle}>Groups</Text>
        <Text style={styles.headerSub}>
          Create, join, or view your existing groups
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.cards}>
        <GroupCard
          icon="edit"
          label="Create a Group"
          description="Start a new group and invite people"
          onPress={() => router.push('/CreateGroup/Create')}
        />
        <GroupCard
          icon="login"
          label="Join a Group"
          description="Enter a code to join an existing group"
          onPress={() => router.push('/CreateGroup/Join')}
        />
        <GroupCard
          icon="team"
          label="View My Groups"
          description="See all the groups you belong to"
          onPress={() => router.push('/(home)/(tabs)/CreateGroup/MyGroups')}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff8f3',
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop:72,
    gap: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e85d040f', 
    borderWidth: 2,
    borderColor: '#f0d5be',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  headerIconText: { fontSize: 28 },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 15,
    color: '#a75a27',
    textAlign: 'center',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#f0d5be',
    marginBottom: 24,
  },
  cards: { 
    gap: 14 
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f0d5be',
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#e85d04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#e85d040f',
    borderWidth: 1.5,
    borderColor: '#f0d5be',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { 
    flex: 1, 
    gap: 3 
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cardDesc: {
    fontSize: 13,
    color: '#7a5c45',
    lineHeight: 18,
  },
});