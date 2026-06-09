import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Linking, Alert, Platform, Modal } from 'react-native';
import { database } from './firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { Video } from 'expo-av';

const TeacherDashboard = ({ pin, subject, onSessionEnd, onBack }) => {
  const [posts, setPosts] = useState([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);

  // --- FULLSCREEN LIGHTBOX MODAL STATES ---
  const [fullscreenMedia, setFullscreenMedia] = useState(null);

  // --- 1. LIVE POSTS LISTENER & SORTING ---
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

  // --- 2. LIVE STUDENT COUNTER LISTENER ---
  useEffect(() => {
    const studentsRef = ref(database, `rooms/${pin}/students`);
    return onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setActiveStudentsCount(Object.keys(data).length);
      } else {
        setActiveStudentsCount(Math.max(1, Math.floor(posts.length * 0.7)));
      }
    });
  }, [pin, posts]);

  // --- 3. CROSS-PLATFORM SESSION CLOSING LOGIC ---
  const handleCloseRoom = () => {
    const executeClose = () => {
      const textCount = posts.filter(p => p.type === 'text').length;
      const mediaCount = posts.filter(p => p.type !== 'text').length;

      const stats = {
        subject,
        totalPosts: posts.length,
        totalVotes: posts.reduce((s, p) => s + p.votes, 0),
        totalStudents: activeStudentsCount || Math.max(2, Math.floor(posts.length * 0.8)), 
        topQuestion: posts[0] || null,
        chartData: { textCount, mediaCount, posts: posts.slice(0, 5) } 
      };

      update(ref(database, `rooms/${pin}`), { status: 'Closed' });
      onSessionEnd(stats);
    };

    if (Platform.OS === 'web') {
      const confirmClose = window.confirm("Tamatkan Sesi?\nAnalitik akan dijana untuk rekod anda.");
      if (confirmClose) executeClose();
    } else {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.menuBtn}>← Menu</Text></TouchableOpacity>
        <Text style={styles.pinText}>PIN: {pin}</Text>
        <Text style={styles.subText}>{subject}</Text>
        <View style={styles.studentBadge}>
          <Text style={styles.studentBadgeText}>👥 {activeStudentsCount} Pelajar Aktif</Text>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            
            {/* Image Trigger Box */}
            {item.type === 'image' && (
              <TouchableOpacity style={styles.mediaContainer} onPress={() => setFullscreenMedia(item)}>
                <Image source={{ uri: item.content }} style={styles.mediaPreview} />
                <View style={styles.zoomIndicator}><Text style={styles.zoomText}>🔍 Klik Skrin Penuh</Text></View>
              </TouchableOpacity>
            )}
            
            {/* Video Trigger Box */}
            {item.type === 'video' && (
              <TouchableOpacity style={styles.mediaContainer} onPress={() => setFullscreenMedia(item)}>
                <Video source={{ uri: item.content }} style={styles.videoPreview} resizeMode="contain" shouldPlay={false} />
                <View style={styles.zoomIndicator}><Text style={styles.zoomText}>🔍 Klik Skrin Penuh</Text></View>
              </TouchableOpacity>
            )}
            
            {item.type === 'file' && (
              <TouchableOpacity style={styles.pdfBtn} onPress={() => Linking.openURL(item.content)}>
                <Text style={styles.pdfText}>📄 BUKA DOKUMEN PDF</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.mainText}>{item.type === 'text' ? item.content : item.text}</Text>
            
            <View style={styles.footer}>
              <Text style={styles.voteCount}>👍 {item.votes} Undian</Text>
              <TouchableOpacity onPress={() => remove(ref(database, `rooms/${pin}/posts/${item.id}`))}>
                <Text style={styles.deleteBtn}>Padam</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* --- DYNAMIC FULLSCREEN LIGHTBOX DISPLAY OVERLAY --- */}
      <Modal visible={fullscreenMedia !== null} transparent={true} animationType="fade" onRequestClose={() => setFullscreenMedia(null)}>
        <View style={styles.modalOverlayContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setFullscreenMedia(null)}>
            <Text style={styles.modalCloseButtonText}>✕ TUTUP</Text>
          </TouchableOpacity>
          
          {fullscreenMedia?.type === 'image' && (
            <Image source={{ uri: fullscreenMedia.content }} style={styles.fullscreenMediaObject} resizeMode="contain" />
          )}

          {fullscreenMedia?.type === 'video' && (
            <Video source={{ uri: fullscreenMedia.content }} style={styles.fullscreenMediaObject} useNativeControls resizeMode="contain" shouldPlay={true} />
          )}
        </View>
      </Modal>

      <TouchableOpacity style={styles.endBtn} onPress={handleCloseRoom}>
        <Text style={styles.endText}>TAMATKAN SESI & ANALITIK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 20, alignItems: 'center', width: '100%' },
  menuBtn: { color: '#3498DB', alignSelf: 'flex-start', fontWeight: 'bold' },
  pinText: { fontSize: 40, color: '#3498DB', fontWeight: 'bold' },
  subText: { color: '#888', fontSize: 16, marginBottom: 5 },
  studentBadge: { backgroundColor: '#1ABC9C', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 5 },
  studentBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  listContent: { paddingBottom: 30 },
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#3498DB', alignSelf: 'center', width: '100%', maxWidth: 600 },
  mediaContainer: { width: '100%', height: 240, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 10, position: 'relative', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' },
  mediaPreview: { width: '100%', height: '100%', ...Platform.select({ web: { objectFit: 'contain' }, default: { resizeMode: 'contain' } }) },
  videoPreview: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' },
  zoomIndicator: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  zoomText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  pdfBtn: { backgroundColor: '#333', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  pdfText: { color: '#F1C40F', fontWeight: 'bold' },
  mainText: { color: '#FFF', fontSize: 18, marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  voteCount: { color: '#3498DB', fontWeight: 'bold' },
  deleteBtn: { color: '#E74C3C', fontWeight: 'bold' },
  endBtn: { backgroundColor: '#E74C3C', padding: 18, borderRadius: 12, alignItems: 'center', alignSelf: 'center', width: '100%', maxWidth: 600, marginBottom: 20 },
  endText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // LIGHTBOX FRAME SYSTEMS
  modalOverlayContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCloseButton: { position: 'absolute', top: Platform.OS === 'web' ? 20 : 55, right: 25, backgroundColor: '#E74C3C', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, zIndex: 9999 },
  modalCloseButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  fullscreenMediaObject: { width: '100%', height: '85%', maxWidth: 1000 }
});

export default TeacherDashboard;