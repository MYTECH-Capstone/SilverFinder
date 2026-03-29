import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, StatusBar} from 'react-native'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../providers/AuthProvider'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import Avatar from '../../components/Avatar'
import { Picker } from '@react-native-picker/picker'
import ReportMissingButton from '../../../components/ReportMissingButton'


export default function MyInformationScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const[updatingInterval, setUpdatingInterval] = useState(false)

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
      setLoading(true)
      const { data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user.id)
        .single()

      if(error) throw error

      setProfile(data)

    } catch (error) {
      console.error('error loading profile', error)
    } finally {
      setLoading(false)
    }  
    
  }

  async function updateInterval(days: number) {
    try {
      setUpdatingInterval(true)
      const { error } = await supabase
        .from('profiles')
        .update({ email_interval: days })
        .eq('id', session?.user.id)
      
      if (error) throw error

      setProfile({ ...profile, email_interval: days })

      await getProfile();

      console.log('Interval updated to', days, 'days')

    } catch (error: any) {
      console.error('Error updating interval:', error)
    } finally {
      setUpdatingInterval(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8f3'}}> 
    <ScrollView style={styles.container}>

      <StatusBar barStyle="dark-content" />
 
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <Text style={styles.topBarTitle}>My Information</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ReportMissingButton />

      <View style={styles.profileSection}>

        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(editinfo)/EditProfile')}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.avatarRing}>
         <Avatar
          url={profile?.avatar_url || null}
          size={80}
          onUpload={() => {}} 
          />
        </View>
        <Text style={styles.profileName}> {profile?.username || ''}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Personal Description</Text>

        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Race</Text>
            <Text style={styles.value}>{profile?.race || ''}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Age</Text>
            <Text style={styles.value}>{profile?.age || ''}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Gender</Text>
            <Text style={styles.value}>{profile?.gender || ''}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Height</Text>
            <Text style={styles.value}>{profile?.height || ''}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Weight</Text>
            <Text style={styles.value}>{profile?.weight || ''}</Text>
            </View>
          
          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Eye Color</Text>
            <Text style={styles.value}>{profile?.eye_color || ''}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Hair Color</Text>
            <Text style={styles.value}>{profile?.hair_color || ''}</Text>
            </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Distinguishing Marks</Text>
            <Text style={styles.value}>{profile?.dis_marks || ''}</Text>
            </View>  
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Medical Information</Text>
        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Blood Type</Text>
            <Text style={styles.value}>{profile?.blood_type || ''}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Conditions</Text>
            <Text style={styles.value}>{profile?.conditions || ''}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Medications</Text>
            <Text style={styles.value}>{profile?.medications || ''}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Allergies</Text>
            <Text style={styles.value}>{profile?.allergies || ''}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Devices</Text>
            <Text style={styles.value}>{profile?.devices || ''}</Text>
          </View> 

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Physician</Text>
            <Text style={styles.value}>{profile?.physician || ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Vehicle Information</Text>
        <View style={styles.grid}>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Vehicle Description</Text>
            <Text style={styles.value}>{profile?.vehicle_descr || ''}</Text>
          </View>

          <View style={styles.descriptorBox}>
            <Text style={styles.descrLabel}>Plate Number</Text>
            <Text style={styles.value}>{profile?.plate_number || ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}> Reminder Frequency</Text>
        <Text style={styles.helperText}> How often should we remind you to update this information?</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={profile?.email_interval || 90}
            onValueChange={(itemValue) => updateInterval(itemValue)}
            enabled={!updatingInterval}
            style={{
              fontSize: 16,
              paddingHorizontal: 10,  
              paddingVertical: 12,
            }}
          >
            <Picker.Item label="Every 30 days" value={30} />
            <Picker.Item label="Every 90 days" value={90} />
            <Picker.Item label="Every 180 days" value={180} />  
            <Picker.Item label="Turn Off Reminders" value={0} />
          </Picker>
        </View>
        {updatingInterval && <ActivityIndicator size="small" color= "#ff5f15" style={{ marginTop: 5 }} />}
           <Text style={styles.helperText}>{profile?.email_interval === 0 ? 'Reminders are turned off.' : `Your current interval is ${profile?.email_interval} days.`}</Text>       
      </View>

    </ScrollView>
    </View>
  );
}


// testing functions below, will self test

// returns profile with new interval
export function intervalCheck(profile: any, days: number) {
  return { ...profile, email_interval:days };
}

// text for display based on interval value

export function intervalText( interval: number | null | undefined) {
  if (interval === 0) {
    return 'Reminders are turned off.';
  } else if (!interval) return 'Your current interval is 90 days.';
  else return `Your current interval is ${interval} days.`;
}

export function profileFieldCheck(value: any) {
  return value ?? '';
}

// interval check test, if interval updates correctly should be good

console.assert(intervalCheck ({ email_interval: 90 }, 30).email_interval === 30,
 'interval check failed, should be 30 days');

// interval text test, should print out correct string based of the amount of days

console.log("==TEST MODE ACTIVE==");
if (intervalText(180) !== "Your current interval is 180 days.") {
  throw new Error("formatIntervalText failed for 180");
}

if (intervalText(90) !== "Your current interval is 90 days.") {
  throw new Error("formatIntervalText failed for 90");
}

// tests to make sure empty strings are for null and undefined fields

console.assert(profileFieldCheck(null) === '', 'profile field interval check failed for null');

console.assert(profileFieldCheck(undefined) === '', 'profile field interval check failed for undefined');

console.assert(profileFieldCheck('test') === 'test', 'profile field interval check failed for value');





const styles = StyleSheet.create({
  container: {
    marginTop: 0,
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
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderColor: '#f0d5be',
    borderWidth: 2,
    elevation: 2,
    position: 'relative',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 0,
    color: '#1a1a1a',
    textTransform: 'capitalize',
    paddingHorizontal: 4,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: '#f0d5be',
    borderWidth: 2,
    gap: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,    
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  editButton: {
    backgroundColor: '#e85d04',
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  editText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  descriptorBox: {
    backgroundColor: '#fff8f3',
    padding: 11,
    borderRadius: 16,
    borderColor:'#f0d5be',
    borderWidth: 1.5,
    width: '48%',
    marginBottom: 5,
  },
  descrLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9d4f1a', 
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  value: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    color: '#0a0a0aff',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    margin: 10,
    height: 80,
    overflow: 'hidden',
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1.5,
    borderColor: '#f0d5be',
  }, 
  topBarTitle: { 
    color: '#1a1a1a', 
    fontSize: 22, 
    fontWeight: '700' 
  },
  topBarSpacer: { 
    width: 50 
  },
  avatarRing: {
    // These must be larger than your avatar size (80)
    width: 90, 
    height: 90,
    borderRadius: 45, // Must be width/2 to be a perfect circle
    borderWidth: 2.5, // The thickness of the orange ring
    borderColor: '#e85d04', // The "Silver Finder" Orange
    
    // Centers the inner Avatar perfectly
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 8, // Spacing before the name
    
    // Optional: Add a very light shadow to make the ring "pop"
    elevation: 1, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});