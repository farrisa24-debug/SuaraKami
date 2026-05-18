import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const AnalyticsScreen = ({ stats, onFinish }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>LAPORAN ANALITIK</Text>
      <Text style={styles.subHeader}>Sesi: {stats.subject}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalPosts}</Text>
          <Text style={styles.statLabel}>Soalan Ditanya</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalVotes}</Text>
          <Text style={styles.statLabel}>Jumlah Undian</Text>
        </View>
      </View>

      <View style={styles.topQuestionCard}>
        <Text style={styles.cardTitle}>⭐ SOALAN TERHANGAT</Text>
        {stats.topQuestion ? (
          <>
            <Text style={styles.topText}>"{stats.topQuestion.text}"</Text>
            <Text style={styles.topVotes}>{stats.topQuestion.votes} Pelajar Setuju</Text>
          </>
        ) : (
          <Text style={styles.topText}>Tiada data untuk dipaparkan.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.finishBtn} onPress={onFinish}>
        <Text style={styles.finishText}>KEMBALI KE MENU UTAMA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6', padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 5 },
  subHeader: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', marginBottom: 30 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: '#FFF', width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 3 },
  statValue: { fontSize: 32, fontWeight: 'bold', color: '#3498DB' },
  statLabel: { fontSize: 12, color: '#95A5A6', marginTop: 5 },
  topQuestionCard: { backgroundColor: '#34495E', padding: 25, borderRadius: 15, elevation: 5, marginBottom: 40 },
  cardTitle: { color: '#F1C40F', fontWeight: 'bold', marginBottom: 10 },
  topText: { color: '#FFF', fontSize: 18, fontStyle: 'italic', marginBottom: 10 },
  topVotes: { color: '#BDC3C7', fontSize: 14 },
  finishBtn: { backgroundColor: '#27AE60', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 50 },
  finishText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default AnalyticsScreen;