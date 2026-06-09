import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { database } from './firebaseConfig';
import { ref, push, onValue, update, increment, set } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av'; // Added Video Import for Student Feed View

const FeedScreen = ({ pin, onBack }) => {
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [myVotes, setMyVotes] = useState({}); 
  const [studentId] = useState(() => 'student_' + Math.random().toString(36).substring(2, 11));

  // --- 1. REGISTER UNIQUE ANONYMOUS STUDENT PRESENCE ---
  useEffect(() => {
    const studentPresenceRef = ref(database, `rooms/${pin}/students/${studentId}`);
    set(studentPresenceRef, true);
    return () => {
      set(studentPresenceRef, null);
    };
  }, [pin, studentId]);

  // --- 2. LIVE POSTS LISTENER & DYNAMIC SORTING ---
  useEffect(() => {
    const postsRef = ref(database, `rooms/${pin}/posts`);
    return onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = Object.keys(data).map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => b.votes - a.votes);
        setPosts(postList);
      } else {
        setPosts([]);
      }
    });
  }, [pin]);

  // --- 3. LIVE SESSION TERMINATION LISTENER (INSTANT KICK-OUT) ---
  useEffect(() => {
    const statusRef = ref(database, `rooms/${pin}/status`);
    return onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (status && status.toLowerCase() === 'closed') {
        if (Platform.OS === 'web') {
          window.alert("Sesi Tamat: Guru telah menamatkan sesi kelas ini.");
        } else {
          Alert.alert("Sesi Tamat", "Guru telah menamatkan sesi kelas ini.");
        }
        onBack(); 
      }
    });
  }, [pin, onBack]);

  // --- 4. CROSS-PLATFORM CLOUDINARY UPLOAD LOGIC ---
  const uploadToCloudinary = async (fileUri, fileType) => {
    setUploading(true);
    const cloudName = "dcnpa6whw"; 
    const uploadPreset = "suara_kami_preset"; 

    const data = new FormData();

    if (Platform.OS === 'web') {
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
      return result.secure_url; 
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

  // --- 5. FILE SELECTION ACTION CONTROLLERS ---
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
          text: `Lampiran ${mediaType.toUpperCase()}`, 
          votes: 0,
          timestamp: Date.now()
        });
      }
    }
  };

  // --- 6. SPAM DEFIANT DOUBLE-VOTE CONSTRAINT CONTROL ---
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
      <View style={styles.headerLayout}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backBtn}>← Keluar</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Bilik PIN: {pin}</Text>
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.postBubble}>
            
            {/* Render Image Attachments safely */}
            {item.type === 'image' && (
              <View style={styles.mediaContainer}>
                <Image source={{ uri: item.content }} style={styles.mediaPreview} />
              </View>
            )}

            {/* UPGRADED: Render Live Video Streams directly inside the Student Feed */}
            {item.type === 'video' && (
              <View style={styles.mediaContainer}>
                <Video 
                  source={{ uri: item.content }} 
                  style={styles.mediaPreview} 
                  useNativeControls 
                  resizeMode="contain" 
                />
              </View>
            )}

            {item.type === 'file' && <Text style={styles.mediaLabel}>📄 Dokumen PDF Sedia Di Dashboard Pendidik</Text>}
            
            <Text style={styles.postText}>{item.type === 'text' ? item.content : item.text}</Text>
            
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

      {uploading && <ActivityIndicator size="large" color="#3498DB" style={{marginBottom: 10}} />}

      <View style={styles.inputContainerWrapper}>
        <View style={styles.inputBar}>
          <TouchableOpacity onPress={() => handlePickMedia('image')}><Text style={styles.icon}>🖼️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handlePickMedia('video')}><Text style={styles.icon}>🎥</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handlePickMedia('file')}><Text style={styles.icon}>📂</Text></TouchableOpacity>
          <TextInput style={styles.input} placeholder="Tanya sesuatu secara rawak (anonymously)..." value={message} onChangeText={setMessage} />
          <TouchableOpacity onPress={handleSendText}><Text style={styles.sendIcon}>▶️</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6', paddingHorizontal: 15, paddingTop: 50 },
  headerLayout: { alignSelf: 'center', width: '100%', maxWidth: 600, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3498DB' },
  backBtn: { color: '#3498DB', fontWeight: 'bold', fontSize: 15 },
  listContent: { paddingBottom: 100 },
  postBubble: { 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 15, 
    elevation: 3,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600 
  },
  mediaContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#1E1E1E', 
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mediaPreview: { 
    width: '100%', 
    height: '100%', 
    ...Platform.select({
      web: { objectFit: 'contain' },
      default: { resizeMode: 'contain' }
    })
  },
  mediaLabel: { color: '#3498DB', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
  postText: { fontSize: 16, color: '#333', marginTop: 5, lineHeight: 22 },
  voteBtn: { alignSelf: 'flex-end', backgroundColor: '#E3F2FD', padding: 8, borderRadius: 8, marginTop: 10, alignItems: 'center', minWidth: 110 },
  voteDisabled: { backgroundColor: '#EEE' },
  voteText: { color: '#1976D2', fontWeight: 'bold', fontSize: 12 },
  voteSubText: { fontSize: 9, color: '#999' },
  inputContainerWrapper: { width: '100%', alignItems: 'center', position: 'absolute', bottom: 20, left: 0, right: 0, paddingHorizontal: 15 },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 30, padding: 10, elevation: 10, width: '100%', maxWidth: 600 },
  input: { flex: 1, height: 40, paddingHorizontal: 10 },
  icon: { fontSize: 22, marginHorizontal: 5 },
  sendIcon: { fontSize: 24, color: '#3498DB', marginLeft: 10 }
});

export default FeedScreen;