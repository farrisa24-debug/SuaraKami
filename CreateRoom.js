import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { database } from './firebaseConfig';
import { ref, set } from 'firebase/database';

const CreateRoom = ({ onRoomCreated, onBack }) => {
  const [subject, setSubject] = useState('');
  const [password, setPassword] = useState(''); // New State
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (subject.trim() === '' || password.trim() === '') {
      Alert.alert("Info Diperlukan", "Sila masukkan nama subjek dan kata laluan.");
      return;
    }

    setLoading(true);
    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit PIN

    try {
      await set(ref(database, `rooms/${pin}`), {
        subject: subject,
        password: password, // Save Password to Firebase
        status: 'Open',
        createdAt: Date.now()
      });
      setLoading(false);
      onRoomCreated(pin, subject);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Gagal membuka bilik. Cuba lagi.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Kembali</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Buka Bilik Baru</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Subjek / Topik</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Multimedia Design"
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kata Laluan Guru (Untuk Rejoin)</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan kata laluan"
          secureTextEntry={true} // Hides the characters
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>BUKA BILIK & JANA PIN</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6', padding: 25, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20 },
  backText: { color: '#3498DB', fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', marginBottom: 40, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#7F8C8D', marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, elevation: 2, fontSize: 16 },
  createBtn: { backgroundColor: '#3498DB', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, elevation: 5 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default CreateRoom;