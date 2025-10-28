import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, TextInput, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../providers/AuthProvider'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'

export default function MyInformationScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  useFocusEffect (
  React.useCallback(() => {
    if (session) getProfile();
    }, [session])
  );

  async function getProfile() {
    try {
      const { data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single()
      if(error) throw error
      setProfile(data)
    } catch (error) {
      console.error(error)
    }   
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ffd8a8'}}> 
    <ScrollView style={styles.container}>

      <TouchableOpacity style={styles.emergencyButton}>
        <Text style={styles.emergencyText}>
          Press this button if you need immediate help!
        </Text>
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(editinfo)/EditProfile')}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>

        <Image
        source={{ uri: profile?.avatar_url || 'https://ibcces.org/wp-content/uploads/2019/03/blank-profile-picture-763x1024.jpg' }}
        style={styles.profileImage}
        />
        <Text style={styles.profileName}> {profile?.username}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Personal Description</Text>

        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Race</Text>
            <Text style={styles.value}>{profile?.race}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Age</Text>
            <Text style={styles.value}>{profile?.age}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Gender</Text>
            <Text style={styles.value}>{profile?.gender}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Height</Text>
            <Text style={styles.value}>{profile?.height}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Weight</Text>
            <Text style={styles.value}>{profile?.weight}</Text>
            </View>
          
          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Eye Color</Text>
            <Text style={styles.value}>{profile?.eye_color}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Hair Color</Text>
            <Text style={styles.value}>{profile?.hair_color}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Distinguishing Marks</Text>
            <Text style={styles.value}>{profile?.dis_marks}</Text>
            </View>  
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Medical Information</Text>
        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Blood Type</Text>
            <Text style={styles.value}>{profile?.blood_type}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Conditions</Text>
            <Text style={styles.value}>{profile?.conditions}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Medications</Text>
            <Text style={styles.value}>{profile?.medications}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Allergies</Text>
            <Text style={styles.value}>{profile?.allergies}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Devices</Text>
            <Text style={styles.value}>{profile?.devices}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Physician</Text>
            <Text style={styles.value}>{profile?.physician}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Vehicle Information</Text>
        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Vehicle Description</Text>
            <Text style={styles.value}>{profile?.vehicle_descr}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Plate Number</Text>
            <Text style={styles.value}>{profile?.plate_number}</Text>
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
});


