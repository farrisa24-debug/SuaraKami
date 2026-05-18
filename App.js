import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import FeedScreen from './FeedScreen';
import TeacherDashboard from './TeacherDashboard';
import AnalyticsScreen from './AnalyticsScreen';
import TeacherJoin from './TeacherJoin';

export default function App() {
  const [userRole, setUserRole] = useState(null); 
  const [currentPin, setCurrentPin] = useState(null);
  const [currentSubject, setCurrentSubject] = useState('');
  const [sessionStats, setSessionStats] = useState(null);

  const goToTeacherDashboard = (pin, subject) => {
    setCurrentPin(pin);
    setCurrentSubject(subject);
    setUserRole('teacher-dashboard');
  };

  const handleSessionEnd = (stats) => {
    setSessionStats(stats);
    setUserRole('analytics');
  };

  const handleJoinSuccess = (pin) => {
    setCurrentPin(pin);
    setUserRole('student-feed');
  };

  const goBack = () => {
    setUserRole(null);
    setCurrentPin(null);
    setCurrentSubject('');
    setSessionStats(null);
  };

  // Navigation Logic
  if (userRole === 'teacher-create') return <CreateRoom onRoomCreated={goToTeacherDashboard} onBack={goBack} />;
  if (userRole === 'teacher-join') return <TeacherJoin onJoinSuccess={goToTeacherDashboard} onBack={goBack} />;
  if (userRole === 'teacher-dashboard') return <TeacherDashboard pin={currentPin} subject={currentSubject} onSessionEnd={handleSessionEnd} onBack={goBack} />;
  if (userRole === 'analytics') return <AnalyticsScreen stats={sessionStats} onFinish={goBack} />;
  if (userRole === 'student-entry') return <JoinRoom onJoinSuccess={handleJoinSuccess} onBack={goBack} />;
  if (userRole === 'student-feed') return <FeedScreen pin={currentPin} onBack={goBack} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* --- TOP SECTION (Branding) --- */}
      <View style={styles.headerSection}>
        <Text style={styles.logoText}>SUARA KAMI</Text>
        <Text style={styles.tagline}>Interaksi Pintar Dalam Kelas</Text>
      </View>

      {/* --- MAIN SECTION (Student Focus) --- */}
      <View style={styles.mainSection}>
        <TouchableOpacity 
          style={styles.studentHeroBtn} 
          onPress={() => setUserRole('student-entry')}
        >
          <Text style={styles.heroEmoji}>🎓</Text>
          <Text style={styles.heroBtnText}>SAYA PELAJAR</Text>
          <Text style={styles.heroSubText}>Sertai sesi menggunakan PIN</Text>
        </TouchableOpacity>
      </View>

      {/* --- BOTTOM SECTION (Teacher Row) --- */}
      <View style={styles.footerSection}>
        <Text style={styles.teacherLabel}>RUANGAN PENDIDIK</Text>
        <View style={styles.bottomRow}>
          <TouchableOpacity 
            style={[styles.secondaryBtn, { backgroundColor: '#3498DB' }]} 
            onPress={() => setUserRole('teacher-create')}
          >
            <Text style={styles.secBtnText}>BUKA BILIK</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { backgroundColor: '#2C3E50' }]} 
            onPress={() => setUserRole('teacher-join')}
          >
            <Text style={styles.secBtnText}>REJOIN BILIK</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.copyright}>Farris Digital Innovations © 2026</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F7F6', 
    paddingHorizontal: 20 
  },
  headerSection: {
    marginTop: 60,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#3498DB',
    letterSpacing: 2
  },
  tagline: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
    fontWeight: '500'
  },
  mainSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentHeroBtn: {
    backgroundColor: '#1976D2',
    width: '100%',
    height: 200,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  heroEmoji: {
    fontSize: 50,
    marginBottom: 10
  },
  heroBtnText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5
  },
  footerSection: {
    marginBottom: 40,
  },
  teacherLabel: {
    textAlign: 'center',
    color: '#95A5A6',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 15,
    letterSpacing: 1
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    width: '48%', // Allows side-by-side with a gap
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5
  },
  secBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13
  },
  copyright: {
    textAlign: 'center',
    marginTop: 30,
    color: '#BDC3C7',
    fontSize: 10
  }
});