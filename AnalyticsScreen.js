import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Platform } from 'react-native';
import { Video } from 'expo-av';

const AnalyticsScreen = ({ stats, onFinish }) => {
  // Fallback check if stats didn't load properly
  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Memuat Naik Analitik...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* --- HEADER BLOCK --- */}
      <View style={styles.headerSection}>
        <Text style={styles.trophyIcon}>📊</Text>
        <Text style={styles.title}>Rumusan Analitik Sesi</Text>
        <Text style={styles.subtitle}>Subjek: {stats.subject || 'Umum'}</Text>
      </View>

      {/* --- STATS COUNTER COUNTERS ROW --- */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalPosts || 0}</Text>
          <Text style={styles.statLabel}>Jumlah Soalan</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalVotes || 0}</Text>
          <Text style={styles.statLabel}>Jumlah Undian</Text>
        </View>
      </View>

      {/* --- DYNAMIC WINNING TOP QUESTION CARD --- */}
      <View style={styles.topQuestionCard}>
        <Text style={styles.cardLabel}>🏆 SOALAN TERATAS (UNDIAN TERTINGGI)</Text>
        
        {stats.topQuestion ? (
          <View style={styles.cardContent}>
            
            {/* Case A: If the top post is a text question, render text string directly */}
            {stats.topQuestion.type === 'text' && (
              <Text style={styles.topText}>"{stats.topQuestion.content}"</Text>
            )}

            {/* Case B: If the top post is an image upload, render the image thumbnail */}
            {stats.topQuestion.type === 'image' && (
              <View style={styles.mediaContainer}>
                <Image 
                  source={{ uri: stats.topQuestion.content }} 
                  style={styles.analyticsMedia} 
                  resizeMode="contain" 
                />
                <Text style={styles.mediaSubtext}>
                  🖼️ {stats.topQuestion.text || "Lampiran Imej Teratas"}
                </Text>
              </View>
            )}

            {/* Case C: If the top post is a video clip, render live media player */}
            {stats.topQuestion.type === 'video' && (
              <View style={styles.mediaContainer}>
                <Video 
                  source={{ uri: stats.topQuestion.content }} 
                  style={styles.analyticsMedia} 
                  useNativeControls 
                  resizeMode="contain" 
                />
                <Text style={styles.mediaSubtext}>
                  🎥 {stats.topQuestion.text || "Lampiran Video Teratas"}
                </Text>
              </View>
            )}

            {/* Case D: If the top post is a PDF document, render download button redirector */}
            {stats.topQuestion.type === 'file' && (
              <View style={styles.mediaContainer}>
                <TouchableOpacity 
                  style={styles.analyticsPdfBtn} 
                  onPress={() => Linking.openURL(stats.topQuestion.content)}
                >
                  <Text style={styles.pdfBtnText}>📄 BUKA DOKUMEN PDF TERATAS</Text>
                </TouchableOpacity>
                <Text style={styles.mediaSubtext}>
                  {stats.topQuestion.text || "Dokumen PDF Teratas"}
                </Text>
              </View>
            )}

            {/* Vote metric data display */}
            <Text style={styles.topVotesCount}>👍 Diundi sebanyak {stats.topQuestion.votes} kali</Text>
          </View>
        ) : (
          <Text style={styles.noPostsText}>Tiada soalan yang direkodkan dalam sesi ini.</Text>
        )}
      </View>

      {/* --- DISMISS ACTION BUTTON --- */}
      <TouchableOpacity style={styles.doneBtn} onPress={onFinish}>
        <Text style={styles.doneBtnText}>KEMBALI KE MENU UTAMA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F7F6',
  },
  contentContainer: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 40
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trophyIcon: {
    fontSize: 50,
    marginBottom: 10
  },
  title: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#2C3E50',
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 15, 
    color: '#7F8C8D', 
    marginTop: 5,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statBox: {
    backgroundColor: '#FFF',
    width: '48%',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498DB'
  },
  statLabel: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: 'bold',
    marginTop: 5,
    letterSpacing: 0.5
  },
  topQuestionCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#EBF0F1'
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#95A5A6',
    marginBottom: 15,
    letterSpacing: 1
  },
  cardContent: {
    marginTop: 5
  },
  topText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    fontStyle: 'italic',
    lineHeight: 28,
    textAlign: 'center',
    paddingVertical: 10
  },
  mediaContainer: {
    alignItems: 'center',
    marginVertical: 5,
    width: '100%'
  },
  analyticsMedia: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#ECF0F1'
  },
  mediaSubtext: {
    fontSize: 13,
    color: '#3498DB',
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center'
  },
  analyticsPdfBtn: {
    backgroundColor: '#F39C12',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 5,
    width: '100%',
    elevation: 2
  },
  pdfBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5
  },
  topVotesCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2ECC71',
    marginTop: 15,
    textAlign: 'right',
    letterSpacing: 0.5
  },
  noPostsText: {
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10
  },
  doneBtn: {
    backgroundColor: '#2C3E50',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5
  },
  doneBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1
  }
});

export default AnalyticsScreen;