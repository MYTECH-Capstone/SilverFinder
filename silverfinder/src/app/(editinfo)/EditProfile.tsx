import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, TextInput, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'expo-router'
import Avatar from '../components/Avatar'


export default function EditProfile() {
  const { session } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  /*const [race, setRace] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [eyeColor, setEyeColor] = useState('')
  const [hairColor, setHairColor] = useState('')
  const [marks, setMarks] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [conditions, setConditions] = useState('')
  const [medications, setMedications] = useState('')
  const [allergies, setAllergies] = useState('')
  const [devices, setDevices] = useState('')
  const [physician, setPhysician] = useState('')
  const [vehicleDescription, setVehicleDescription] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
*/
  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single()

      if (error && status !== 406) throw error

      if(data) {
      setUsername(data.username || '')
      setWebsite(data.website || '')
      setAvatarUrl(data.avatar_url || '')
      }
    } catch (error: any) {
        Alert.alert(error.message)
    } finally {
      setLoading(false)  
    } 
    }

  async function updateProfile() {
    try {
      setLoading(true)

      const updates: any = {
        id: session.user.id,
        updated_at: new Date().toISOString(),
      }

      if (username) updates.username = username
      if (website) updates.website = website
      if (avatarUrl) updates.avatar_url = avatarUrl

      const { error } = await supabase
      .from('profiles').update(updates)
      .eq('id', session.user.id)

      if (error) throw error

      Alert.alert('Profile updated!')
      router.push('/(tabs)/My Information')
    } catch (error: any) {
       Alert.alert('update error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffd8a8' }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        <Avatar
          url={avatarUrl}
          size={100}
          onUpload={(filePath: string) => {
          setAvatarUrl(filePath)
          }}
          canUpload={true}
/>

        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, styles.disabled]} value={session?.user?.email || ''} editable={false} />

        <Text style={styles.label}>Username</Text>
        <TextInput style={[styles.input]} value={username} onChangeText={setUsername} />

        <Text style={styles.label}>Website</Text>
        <TextInput style={[styles.input]} value={website} onChangeText={setWebsite} />

        <Text style={styles.title}>User Info </Text>

       
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

        <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.replace('/(tabs)/My Information')}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>

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
    marginBottom: 20,
  },
});


/* 
        race,
        age: parseInt(age),
        gender, height, weight,
        eye_color: eyeColor,
        hair_color: hairColor,
        dis_marks: marks,
        blood_type: bloodType,
        conditions, medications, allergies,
        devices, physician,
        vehicle_descr: vehicleDescription,
        plate_number: plateNumber,
        updated_at: new Date(),
        */


        /*
         <Text style={styles.label}>Race</Text>
        <TextInput style={styles.input} value={race} onChangeText={setRace} />

        <Text style={styles.label}>Age</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />

        <Text style={styles.label}>Gender</Text>
        <TextInput style={styles.input} value={gender} onChangeText={setGender} />

        <Text style={styles.label}>Height</Text>
        <TextInput style={styles.input} value={height} onChangeText={setHeight} />

        <Text style={styles.label}>Weight</Text>
        <TextInput style={styles.input} value={weight} onChangeText={setWeight} />

        <Text style={styles.label}>Eye Color</Text>
        <TextInput style={styles.input} value={eyeColor} onChangeText={setEyeColor} />

        <Text style={styles.label}>Hair Color</Text>
        <TextInput style={styles.input} value={hairColor} onChangeText={setHairColor} />

        <Text style={styles.label}>Distinguishing Marks</Text>
        <TextInput style={styles.input} value={marks} onChangeText={setMarks} />

        <Text style={styles.label}>Blood Type</Text>
        <TextInput style={styles.input} value={bloodType} onChangeText={setBloodType} />

        <Text style={styles.label}>Conditions</Text>
        <TextInput style={styles.input} value={conditions} onChangeText={setConditions} />

        <Text style={styles.label}>Medications</Text>
        <TextInput style={styles.input} value={medications} onChangeText={setMedications} />

        <Text style={styles.label}>Allergies</Text>
        <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} />

        <Text style={styles.label}>Devices</Text>
        <TextInput style={styles.input} value={devices} onChangeText={setDevices} />

        <Text style={styles.label}>Physician</Text>
        <TextInput style={styles.input} value={physician} onChangeText={setPhysician} />

        <Text style={styles.label}>Vehicle Description</Text>
        <TextInput style={styles.input} value={vehicleDescription} onChangeText={setVehicleDescription} />

        <Text style={styles.label}>Plate Number</Text>
        <TextInput style={styles.input} value={plateNumber} onChangeText={setPlateNumber} />
       
        */

        /*
        setRace(data.race || '')
      setAge(data.age?.toString() || '')
      setGender(data.gender || '')
      setHeight(data.height || '')
      setWeight(data.weight || '')
      setEyeColor(data.eye_color || '')
      setHairColor(data.hair_color || '')
      setMarks(data.dis_marks || '')
      setBloodType(data.blood_type || '')
      setConditions(data.conditions || '')
      setMedications(data.medications || '')
      setAllergies(data.allergies || '')
      setDevices(data.devices || '')
      setPhysician(data.physician || '')
      setVehicleDescription(data.vehicle_descr || '')
      setPlateNumber(data.plate_number || '')
      */