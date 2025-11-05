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

      if (result.canceled || !result.assets || result.assets.length === 0) return

      const image = result.assets[0]
      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())
      
      // Get proper file extension
      const uriParts = image.uri.split('.')
      let fileExt = uriParts.pop()?.split('?')[0].toLowerCase() ?? 'jpeg'

      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      if(!allowedExtensions.includes(fileExt)) {
        const mimeExt = image.mimeType?.split('/').pop()?.toLowerCase()
        fileExt = allowedExtensions.includes(mimeExt) ? mimeExt : 'jpeg' ;
      }

      const contentType = image.mimeType ?? `image/${fileExt}` ;

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      console.log('Uploading file:', fileName)
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arraybuffer, {
          contentType: contentType,
          upsert: false
        })

      if (uploadError) throw uploadError

      console.log('Upload successful:', data.path)
      onUpload(data.path)
    } catch (error: any) {
      Alert.alert('Upload failed', error.message || 'Error occurred during upload.')
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
