import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { database } from './firebaseConfig';
import { ref, get } from 'firebase/database';

const JoinRoom = ({ onJoinSuccess, onBack }) => {
  const [pin, setPin] = useState('');

  const handleJoin = async () => {
    if (pin.length !== 6) {
      Alert.alert("Error", "Sila masukkan 6-digit PIN yang sah.");
      return;
    }

    const roomRef = ref(database, `rooms/${pin}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      if (snapshot.val().status === 'Open') {
        onJoinSuccess(pin);
      } else {
        Alert.alert("Bilik Ditutup", "Sesi ini telah tamat.");
      }
    } else {
      Alert.alert("PIN Salah", "Bilik tidak wujud. Sila semak PIN anda.");
    }
  };

  return (
    <View style={styles.container}>
      {/* --- BACK BUTTON --- */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>← Kembali</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Sertai Sesi</Text>
      <Text style={styles.subtitle}>Masukkan 6-digit PIN daripada guru anda</Text>

      <TextInput
        style={styles.input}
        placeholder="Contoh: 123456"
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPin}
      />

      <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
        <Text style={styles.joinBtnText}>MASUK BILIK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F4F7F6', 
    padding: 20 
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backText: {
    color: '#3498DB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2C3E50', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  input: {
    width: '80%',
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    elevation: 3,
    marginBottom: 20,
    letterSpacing: 5
  },
  joinBtn: {
    backgroundColor: '#1976D2',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 5
  },
  joinBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default JoinRoom;