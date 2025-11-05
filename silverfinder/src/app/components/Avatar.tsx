import React, { useEffect, useState } from 'react'
import { View, Image, Button, Alert, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../lib/supabase'


export function getAvatarUrl(path: string | null) {
  if (!path) return null
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

interface AvatarProps {
  url: string | null
  size?: number
  onUpload: (filePath: string) => void
  canUpload?: boolean
}

export default function Avatar({ url, size = 100, onUpload, canUpload = false }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) {
      const publicUrl = getAvatarUrl(url)
      setAvatarUrl(publicUrl)
    } else {
      setAvatarUrl(null)
    }
  }, [url])



  async function uploadAvatar() {
    try {
      setUploading(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      })

      if (result.canceled) return

      const image = result.assets[0]
      const file = await fetch(image.uri)
      const blob = await file.blob()
      
      // Get proper file extension
      let fileExt = 'jpg' // default
      if (image.uri) {
        const uriParts = image.uri.split('.')
        const lastPart = uriParts[uriParts.length - 1].split('?')[0]
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lastPart.toLowerCase())) {
          fileExt = lastPart.toLowerCase()
        }
      }
      
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      console.log('Uploading file:', fileName)
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false
        })

      if (uploadError) throw uploadError

      console.log('Upload successful:', fileName)
      onUpload(fileName)
    } catch (error: any) {
      Alert.alert('Upload failed', error.message)
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }
  

  return (
    <View style={{ alignItems: 'center' , marginVertical: 20 }}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          onLoad={() => console.log('Image loaded successfully')}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#ccc',
          }}
        />
      )}
      {uploading ? (
        <ActivityIndicator style={{ marginTop: 10 }} />
      ) : (

        canUpload && ( <Button  title="Upload Picture" onPress={uploadAvatar} color='#db731fff' />
        
      ))}
    </View>
  );
}
