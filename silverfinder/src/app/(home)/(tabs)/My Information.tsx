import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, TextInput, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native'
//import { Text, View } from '@/components/Themed';
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../providers/AuthProvider'

export default function MyInformationScreen() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()

      if (error && status !== 406) throw error
      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      Alert.alert('Profile updated!')
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffd8a8'}}> 
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings Page</Text>
      <TouchableOpacity style={styles.emergencyButton}>
        <Text style={styles.emergencyText}>
          Press this button if you need immediate help!
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Email</Text>
      <TextInput style={[styles.input, styles.disabled]} value={session?.user?.email || ''} editable={false} />

      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} />

      <Text style={styles.label}>Website</Text>
      <TextInput style={styles.input} value={website} onChangeText={setWebsite} />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={updateProfile}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
        <Image
        source={{ uri: 'https://i.pinimg.com/736x/79/ed/a3/79eda3184ce3eae8ae30bff6ee6ca2e3.jpg' }}
        style={styles.profileImage}
        />
        <Text style={styles.profileName}> Rosie Johnson </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Personal Description</Text>

        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Race</Text>
            <Text style={styles.value}>White</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Age</Text>
            <Text style={styles.value}>78</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Gender</Text>
            <Text style={styles.value}>Female</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Height</Text>
            <Text style={styles.value}>5'4</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Weight</Text>
            <Text style={styles.value}>140 pounds</Text>
            </View>
          
          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Eye Color</Text>
            <Text style={styles.value}>Brown</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Hair Color</Text>
            <Text style={styles.value}>Gray</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Distinguishing Marks</Text>
            <Text style={styles.value}>left ear mole</Text>
            </View>  
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Medical Information</Text>
        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Blood Type</Text>
            <Text style={styles.value}>O+</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Conditions</Text>
            <Text style={styles.value}>Diabetes, Hypertension</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Medications</Text>
            <Text style={styles.value}>Metformin, Lisinopril</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Allergies</Text>
            <Text style={styles.value}>Penicillin</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Devices</Text>
            <Text style={styles.value}>Hearing Aid</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Physician</Text>
            <Text style={styles.value}>Dr. Smith</Text>
          </View>

        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Vehicle Information</Text>
        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Vehicle Description</Text>
            <Text style={styles.value}>Gray Toyota Camry</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Plate Number</Text>
            <Text style={styles.value}>123 4567</Text>
          </View>

        </View>
      </View>

    </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#f2f2f2',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonSecondary: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emergencyButton: {
    backgroundColor: 'red',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    width: '75%',
    alignSelf: 'center'
  },
  emergencyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#ff5f15',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ff5f15'
  },
  editButton: {
    backgroundColor: 'rgba(218, 144, 55, 1)',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  descriptorBox: {
    backgroundColor: '#e6e6e6',
    padding: 10,
    borderRadius: 4,
    width: '48%',
    marginBottom: 5,
  },
  descrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#555'
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
})
