import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, TextInput, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'
import { useRouter} from 'expo-router'
import Avatar from '../components/Avatar'



export default function EditProfile() {
  const { session } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [race, setRace] = useState('')
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
      setAvatarUrl(data.avatar_url || '')
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
        updated_at: new Date().toISOString(),
      }


      if (username) updates.username = username
      if (avatarUrl) updates.avatar_url = avatarUrl

      const { error } = await supabase
      .from('profiles').update(updates)
      .eq('id', session.user.id)

      if (error) throw error

      Alert.alert('Profile updated!')
      router.push('/(home)/(tabs)/My Information')
    } catch (error: any) {
       Alert.alert('update error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8f3' }}>
      <StatusBar barStyle="dark-content" />
 
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(home)/(tabs)/My Information')}>
          <Text style={styles.topBarBack}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, loading && { opacity: 0.5 }]}
          onPress={updateProfile}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>
      
      
      
      
      
      
      
      <ScrollView style={styles.container}>

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

        <Text style={styles.label}>Name</Text>
        <TextInput style={[styles.input]} value={username} onChangeText={setUsername} />

        <Text style={styles.title}>User Information </Text>
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

        <View style={styles.dangerCard}>
          <Text style={styles.dangerCardLabel}>⚠️  Account Actions</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={() => supabase.auth.signOut()}>
            <Text style={styles.dangerBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
 
        <View style={{ height: 40 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    padding: 16,
    backgroundColor: '#fff8f3',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#a75a27', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
  },
  input: {
  backgroundColor: '#ffffff', 
  borderWidth: 1.5, 
  borderColor: '#f0d5be',
  borderRadius: 12,
  padding: 14,
  marginBottom: 20,
  fontSize: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
},
  disabled: {
    backgroundColor: '#f2f2f2',
    borderColor: '#e2e2e2',
    color: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 18,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0d5be',
  },
  topBarBack: {
    color: '#e85d04',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 11,
    minWidth: 72,
  },
  topBarTitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#e85d04',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
    minWidth: 72,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  signOutSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0d5be',
    alignItems: 'center',
    gap: 8,
  },
  signOutLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#bfa090',
  },
  signOutText: {
    fontSize: 15,
    color: '#c0392b',
    fontWeight: '600',
  },
  dangerCard: {
    marginTop: 24,
    backgroundColor: '#fff5f5',
    borderWidth: 1.5,
    borderColor: '#f5c6c2',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  dangerCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333]',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dangerBtn: {
    borderWidth: 1.5,
    borderColor: '#c0392b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: '#c0392b',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 24,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 3,
},
sectionTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#e85d04', 
  marginBottom: 12,
  textTransform: 'uppercase',
  letterSpacing: 1,
},
});