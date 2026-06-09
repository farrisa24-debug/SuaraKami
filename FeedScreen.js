import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { database } from './firebaseConfig';
import { ref, push, onValue, update, increment } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const FeedScreen = ({ pin, onBack }) => {
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [myVotes, setMyVotes] = useState({}); // Tracks student votes per post: { postId: voteCount }

  // --- 1. LIVE POSTS LISTENER & DYNAMIC SORTING ---
  useEffect(() => {
    const postsRef = ref(database, `rooms/${pin}/posts`);
    return onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = Object.keys(data).map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => b.votes - a.votes); // Automatically bubbles highest-voted questions to the top
        setPosts(postList);
      } else {
        setPosts([]);
      }
    });
  }, [pin]);

  // --- 2. LIVE SESSION TERMINATION LISTENER (INSTANT KICK-OUT) ---
  useEffect(() => {
    const statusRef = ref(database, `rooms/${pin}/status`);
    return onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (status === 'Closed') {
        if (Platform.OS === 'web') {
          window.alert("Sesi Tamat: Guru telah menamatkan sesi kelas ini.");
        } else {
          Alert.alert("Sesi Tamat", "Guru telah menamatkan sesi kelas ini.");
        }
        onBack(); // Safely pops the student out back to the landing main menu
      }
    });
  }, [pin, onBack]);

  // --- 3. CROSS-PLATFORM CLOUDINARY UPLOAD LOGIC ---
  const uploadToCloudinary = async (fileUri, fileType) => {
    setUploading(true);
    const cloudName = "dcnpa6whw"; 
    const uploadPreset = "suara_kami_preset"; 

    const data = new FormData();

    if (Platform.OS === 'web') {
      // --- WEB WORKFLOW: Convert browser blob URL to raw binary blob ---
      try {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        data.append("file", blob);
      } catch (error) {
        console.error("Gagal menukar fail web:", error);
        setUploading(false);
        return null;
      }
    } else {
      // --- NATIVE MOBILE WORKFLOW: Format using local device file paths ---
      const cleanUri = Platform.OS === 'android' ? fileUri : fileUri.replace('file://', '');
      const extension = fileUri.split('.').pop();

      data.append("file", {
        uri: cleanUri,
        type: fileType === 'image' ? `image/${extension}` : fileType === 'video' ? `video/${extension}` : 'application/pdf',
        name: `upload.${extension}`
      });
    }

    data.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      setUploading(false);
      return result.secure_url; // Returns the secure hosted media cloud link
    } catch (error) {
      setUploading(false);
      if (Platform.OS === 'web') {
        window.alert("Gagal memuat naik imej/fail ke pelayan awan Cloudinary.");
      } else {
        Alert.alert("Error", "Gagal memuat naik ke Cloudinary.");
      }
      return null;
    }
  };

  // --- 4. DEVICE MEDIA FILE PICKER SELECTOR ---
  const handlePickMedia = async (mediaType) => {
    let result;
    if (mediaType === 'file') {
      result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (Platform.OS === 'web') window.alert("Izin galeri diperlukan.");
        else Alert.alert("Akses Ditolak", "Izin galeri diperlukan.");
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        quality: 0.4,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const downloadUrl = await uploadToCloudinary(uri, mediaType);
      
      if (downloadUrl) {
        push(ref(database, `rooms/${pin}/posts`), {
          type: mediaType,
          content: downloadUrl,
          text: `Lampiran ${mediaType.toUpperCase()}`, // Safe metadata fallback label for reporting/analytics modules
          votes: 0,
          timestamp: Date.now()
        });
      }
    }
  };

  // --- 5. DOUBLE VOTE LIMIT SPAM CONTROL ALGORITHM ---
  const handleVote = (postId) => {
    const currentVotesForPost = myVotes[postId] || 0;

    if (currentVotesForPost < 2) {
      update(ref(database, `rooms/${pin}/posts/${postId}`), { votes: increment(1) });
      setMyVotes({ ...myVotes, [postId]: currentVotesForPost + 1 });
    } else {
      if (Platform.OS === 'web') {
        window.alert("Had Undi: Anda telah mencapai had 2 undian untuk soalan ini.");
      } else {
        Alert.alert("Had Undi", "Anda telah mencapai had 2 undian untuk soalan ini.");
      }
    }
  };

  // --- 6. PLAIN TEXT QUESTION SUBMISSION ---
  const handleSendText = () => {
    if (message.trim() === '') return;
    push(ref(database, `rooms/${pin}/posts`), {
      type: 'text',
      content: message,
      votes: 0,
      timestamp: Date.now()
    });
    setMessage('');
  };

  return (
    <View style={styles.container}>
      {/* Upper Navigation Row */}
      <TouchableOpacity onPress={onBack}><Text style={styles.backBtn}>← Keluar</Text></TouchableOpacity>
      <Text style={styles.header}>Bilik PIN: {pin}</Text>
      
      {/* Live Streams Scroll Container */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postBubble}>
            {item.type === 'image' && <Image source={{ uri: item.content }} style={styles.mediaPreview} />}
            {item.type === 'video' && <Text style={styles.mediaLabel}>📹 Video Clip Sedia Di Dashboard Pendidik</Text>}
            {item.type === 'file' && <Text style={styles.mediaLabel}>📄 Dokumen PDF Sedia Di Dashboard Pendidik</Text>}
            
            <Text style={styles.postText}>{item.type === 'text' ? item.content : item.text}</Text>
            
            {/* Interactive Crowdsourced Voting Button */}
            <TouchableOpacity 
              style={[styles.voteBtn, (myVotes[item.id] >= 2) && styles.voteDisabled]} 
              onPress={() => handleVote(item.id)}
            >
              <Text style={styles.voteText}>
                {myVotes[item.id] >= 2 ? "TAMAT HAD UNDI" : `Setuju (${item.votes})`}
              </Text>
              <Text style={styles.voteSubText}>{myVotes[item.id] || 0}/2 digunakan</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Cloud Transaction Status Display */}
      {uploading && <ActivityIndicator size="large" color="#3498DB" style={{marginBottom: 10}} />}

      {/* Persistent Bottom Action/Input Tray */}
      <View style={styles.inputBar}>
        <TouchableOpacity onPress={() => handlePickMedia('image')}><Text style={styles.icon}>🖼️</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handlePickMedia('video')}><Text style={styles.icon}>🎥</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handlePickMedia('file')}><Text style={styles.icon}>📂</Text></TouchableOpacity>
        <TextInput style={styles.input} placeholder="Tanya sesuatu secara rawak (anonymously)..." value={message} onChangeText={setMessage} />
        <TouchableOpacity onPress={handleSendText}><Text style={styles.sendIcon}>▶️</Text></TouchableOpacity>
      </View>
    </View>
  );
};

// --- STYLESHEET MODULE OBJECTS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6', padding: 20, paddingTop: 50 },
  header: { fontSize: 18, fontWeight: 'bold', color: '#3498DB', marginBottom: 10 },
  backBtn: { color: '#3498DB', marginBottom: 10, fontWeight: 'bold' },
  postBubble: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
  mediaPreview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  mediaLabel: { color: '#3498DB', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
  postText: { fontSize: 16, color: '#333', marginTop: 5 },
  voteBtn: { alignSelf: 'flex-end', backgroundColor: '#E3F2FD', padding: 8, borderRadius: 8, marginTop: 10, alignItems: 'center', minWidth: 100 },
  voteDisabled: { backgroundColor: '#EEE' },
  voteText: { color: '#1976D2', fontWeight: 'bold', fontSize: 13 },
  voteSubText: { fontSize: 9, color: '#999' },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 30, padding: 10, elevation: 10 },
  input: { flex: 1, height: 40, paddingHorizontal: 10 },
  icon: { fontSize: 22, marginHorizontal: 5 },
  sendIcon: { fontSize: 24, color: '#3498DB', marginLeft: 10 }
});

export default FeedScreen;