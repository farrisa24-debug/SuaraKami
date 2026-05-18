import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { database } from './firebaseConfig';
import { ref, get } from 'firebase/database';

const TeacherJoin = ({ onJoinSuccess, onBack }) => {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState(''); // New State for Verification

  const handleRejoin = async () => {
    if (pin.length !== 6 || password === '') {
      Alert.alert("Input Salah", "Sila masukkan PIN 6-digit dan kata laluan.");
      return;
    }

    const roomRef = ref(database, `rooms/${pin}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      const roomData = snapshot.val();
      
      // Check Password
      if (roomData.password === password) {
        onJoinSuccess(pin, roomData.subject);
      } else {
        Alert.alert("Gagal", "Kata laluan salah. Sila cuba lagi.");
      }
    } else {
      Alert.alert("Tidak Wujud", "Bilik dengan PIN ini tidak ditemui.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Kembali</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Rejoin Sebagai Guru</Text>
      <Text style={styles.subtitle}>Masukkan PIN dan Kata Laluan bilik anda</Text>

      <TextInput
        style={styles.input}
        placeholder="PIN 6-Digit"
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPin}
      />

      <TextInput
        style={styles.input}
        placeholder="Kata Laluan Guru"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.joinBtn} onPress={handleRejoin}>
        <Text style={styles.btnText}>MASUK DASHBOARD</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C3E50', padding: 25, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20 },
  backText: { color: '#3498DB', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  subtitle: { color: '#BDC3C7', marginBottom: 30 },
  input: { backgroundColor: '#FFF', width: '100%', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 18, textAlign: 'center' },
  joinBtn: { backgroundColor: '#3498DB', width: '100%', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default TeacherJoin;