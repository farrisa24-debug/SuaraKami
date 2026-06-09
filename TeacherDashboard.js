import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Linking, Alert, Platform } from 'react-native';
import { database } from './firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { Video } from 'expo-av';

const TeacherDashboard = ({ pin, subject, onSessionEnd, onBack }) => {
  const [posts, setPosts] = useState([]);

  // --- 1. LIVE POSTS LISTENER & SORTING ---
  useEffect(() => {
    const postsRef = ref(database, `rooms/${pin}/posts`);
    return onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = Object.keys(data).map(key => ({ id: key, ...data[key] }))
          .sort((a, b) => b.votes - a.votes); // Automatically keeps highest voted posts at the top
        setPosts(postList);
      } else {
        setPosts([]);
      }
    });
  }, [pin]);

  // --- 2. CROSS-PLATFORM SESSION CLOSING LOGIC ---
  const handleCloseRoom = () => {
    const executeClose = () => {
      // Package up metrics data to pass to the Analytics Module
      const stats = {
        subject,
        totalPosts: posts.length,
        totalVotes: posts.reduce((s, p) => s + p.votes, 0),
        topQuestion: posts[0] || null // Passes entire top-voted object (handles text/media correctly)
      };

      // 1. Update status to 'Closed' in Firebase to instantly trigger student kick-out listener
      update(ref(database, `rooms/${pin}`), { status: 'Closed' });
      
      // 2. Render the analytics summary UI view layout
      onSessionEnd(stats);
    };

    if (Platform.OS === 'web') {
      // --- WEB WORKFLOW: Avoid native Alert freezes using browser confirmation dialog ---
      const confirmClose = window.confirm("Tamatkan Sesi?\nAnalitik akan dijana untuk rekod anda.");
      if (confirmClose) {
        executeClose();
      }
    } else {
      // --- NATIVE MOBILE WORKFLOW: Native alert box UI ---
      Alert.alert(
        "Tamatkan Sesi?",
        "Analitik akan dijana untuk rekod anda.",
        [
          { text: "Batal", style: "cancel" },
          { text: "Tamat", onPress: executeClose }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Block */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.menuBtn}>← Menu</Text></TouchableOpacity>
        <Text style={styles.pinText}>PIN: {pin}</Text>
        <Text style={styles.subText}>{subject}</Text>
      </View>

      {/* Real-time Moderation Feed Scroll Container */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Dynamic Rendering Based on Attachment Media Type */}
            {item.type === 'image' && (
              <Image source={{ uri: item.content }} style={styles.media} resizeMode="contain" />
            )}
            
            {item.type === 'video' && (
              <Video source={{ uri: item.content }} style={styles.media} useNativeControls resizeMode="contain" />
            )}
            
            {item.type === 'file' && (
              <TouchableOpacity style={styles.pdfBtn} onPress={() => Linking.openURL(item.content)}>
                <Text style={styles.pdfText}>📄 BUKA DOKUMEN PDF</Text>
              </TouchableOpacity>
            )}

            {/* Display Question Content Text */}
            <Text style={styles.mainText}>{item.type === 'text' ? item.content : item.text}</Text>
            
            {/* Live Metrics Footer & Moderation Removal Actions */}
            <View style={styles.footer}>
              <Text style={styles.voteCount}>👍 {item.votes} Undian</Text>
              <TouchableOpacity onPress={() => remove(ref(database, `rooms/${pin}/posts/${item.id}`))}>
                <Text style={styles.deleteBtn}>Padam</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Persistent Session Termination Control Button */}
      <TouchableOpacity style={styles.endBtn} onPress={handleCloseRoom}>
        <Text style={styles.endText}>TAMATKAN SESI & ANALITIK</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- STYLESHEET MODULE OBJECTS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
  header: { marginBottom: 20, alignItems: 'center' },
  menuBtn: { color: '#3498DB', alignSelf: 'flex-start', fontWeight: 'bold' },
  pinText: { fontSize: 40, color: '#3498DB', fontWeight: 'bold' },
  subText: { color: '#888', fontSize: 16 },
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#3498DB' },
  media: { width: '100%', height: 220, borderRadius: 8, marginBottom: 10 },
  pdfBtn: { backgroundColor: '#333', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  pdfText: { color: '#F1C40F', fontWeight: 'bold' },
  mainText: { color: '#FFF', fontSize: 18, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  voteCount: { color: '#3498DB', fontWeight: 'bold' },
  deleteBtn: { color: '#E74C3C', fontWeight: 'bold' },
  endBtn: { backgroundColor: '#E74C3C', padding: 18, borderRadius: 12, alignItems: 'center' },
  endText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default TeacherDashboard;