import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-expo';
import { chatClient } from '../../../../../lib/stream';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../providers/AuthProvider';

export default function ChatScreen() {
  const { groupId, groupName } = useLocalSearchParams();
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState<any>(null);

  useEffect(() => {
    const connect = async () => {
      // Basic safety checks
      if (!user || !groupId) return;
      
      try {
        // 1. Get Token
        const { data, error } = await supabase.functions.invoke('stream-token');
        if (error || !data?.token) throw new Error("Could not fetch token");

        // 2. Manage Connection
        // If someone else is connected, kick them out first
        if (chatClient.userID && chatClient.userID !== user.id) {
          await chatClient.disconnectUser();
        }
        
        // Connect our current user
        if (!chatClient.userID) {
          await chatClient.connectUser({ id: user.id }, data.token);
        }
        
        // 3. The "Livestream" Switch
        // Changing the type to 'livestream' removes the member-only requirement.
        const channelInstance = chatClient.channel('livestream', groupId as string, {
          name: groupName as string,
        });

        // watch() on a livestream channel works for ANYONE with a valid token
        await channelInstance.watch();
        
        setActiveChannel(channelInstance);
        setConnected(true);
      } catch (err: any) {
        console.error("Chat Setup Error:", err.message);
      }
    };

    connect();

    // Reset state when leaving
    return () => {
      setConnected(false);
      setActiveChannel(null);
    };
  }, [groupId, user?.id]);

  if (!connected || !activeChannel) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient}>
        {/* Pass the specific channel instance from state here */}
        <Channel channel={activeChannel}>
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </OverlayProvider>
  );
}

/*import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-expo';
import { chatClient } from '../../../../../lib/stream';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../providers/AuthProvider';

export default function ChatScreen() {
  const { groupId, groupName } = useLocalSearchParams();
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const connect = async () => {
      if (!user || !groupId) return;
      
      try {
        // 1. Fetch token from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('stream-token');
        if (error || !data?.token) throw new Error("Token fetch failed");

        // 2. Connect user (disconnect existing if necessary)
        if (chatClient.userID && chatClient.userID !== user.id) {
          await chatClient.disconnectUser();
        }
        
        if (!chatClient.userID) {
          await chatClient.connectUser({ id: user.id }, data.token);
        }
        
        // 3. Initialize and Watch the Channel
        // With Auth Checks OFF, this will automatically add the user as a member
        const newChannel = chatClient.channel('messaging', groupId as string, {
          name: groupName as string,
        });

        await newChannel.watch();
        
        setChannel(newChannel);
        setConnected(true);
      } catch (err: any) {
        console.error("Chat Setup Error:", err.message);
      }
    };

    connect();

    return () => { 
      // We don't necessarily want to disconnect EVERY time the screen blurs
      // but we should set connected to false to trigger the loading state for the next group
      setConnected(false);
    };
  }, [groupId, user?.id]);

  if (!connected || !channel) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </OverlayProvider>
  );
}

/*import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-expo';
import { chatClient } from '../../../../../lib/stream';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../providers/AuthProvider';

export default function ChatScreen() {
  const { groupId, groupName } = useLocalSearchParams();
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connect = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.functions.invoke('stream-token');
        if (error || !data?.token) return;

        if (chatClient.userID !== user.id) {
          if (chatClient.userID) await chatClient.disconnectUser();
          await chatClient.connectUser({ id: user.id }, data.token);
        }
        
        // Use the query channels method or the GetOrCreate logic
        const channel = chatClient.channel('messaging', groupId as string, {
          name: groupName as string,
          members: [user.id], // Request to be a member
        });

        // This is the specific call that "joins" the user to the channel
        // if they have the 'Join Channel' permission.
        await channel.watch();
        
        setConnected(true);
      } catch (err: any) {
        console.error("Error in Chat connect flow:", err.message);
        
        // IF ERROR 17 PERSISTS: This is the fallback
        if (err.message.includes('code 17')) {
          console.warn("Permission denied. Ensure 'Join Channel' is enabled in Dashboard.");
        }
      }
    };

    connect();

    return () => { 
      const cleanup = async () => {
        setConnected(false);
        await chatClient.disconnectUser();
      };
      cleanup();
    };
  }, [groupId, user?.id]);

  if (!connected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Define the channel instance for the UI components
  const channel = chatClient.channel('messaging', groupId as string);

  return (
    <OverlayProvider>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </OverlayProvider>
  );
}
/*import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chat, Channel, MessageList, MessageInput, OverlayProvider } from 'stream-chat-expo';
import { chatClient } from '../../../../../lib/stream';
import { supabase } from '../../../../../lib/supabase';
import { useAuth } from '../../../../../providers/AuthProvider';

export default function ChatScreen() {
  const { groupId, groupName } = useLocalSearchParams();
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connect = async () => {
      if (!user) return;
      
      // fetch token from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('stream-token');
      // Check if data is null or if there is an error
     

      if (error) {
        // debug: parse the actual JSON error message sent by the Edge Function catch block
        try {
          const errorBody = await error.context.json();
          console.error('DETAILED SERVER ERROR:', errorBody);
        } catch (e) {
          console.error('Token generation failed:', error.message);
        }
        return; 
      }
      // connect user and use token
      await chatClient.connectUser({ id: user.id }, data.token);
      
      // set up Channel, generate at bottom
      const channel = chatClient.channel('messaging', groupId as string, {
        name: groupName as string,
      });
      await channel.watch();
      setConnected(true);
    };

    connect();
    
    
    return () => { chatClient.disconnectUser(); };
    }, [groupId]);

  if (!connected) return <ActivityIndicator style={{ flex: 1 }} />;

  const channel = chatClient.channel('messaging', groupId as string);

  return (
    <OverlayProvider>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <MessageList />
            <MessageInput />
          </View>
        </Channel>
      </Chat>
    </OverlayProvider>
  );
}
/*import { Text } from 'react-native';

export default function MainTabScreen() {
  return (
    <Text>Chat screen</Text>
  );
}*/