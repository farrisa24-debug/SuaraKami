import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Platform } from 'react-native';
import { Video } from 'expo-av';

const AnalyticsScreen = ({ stats, onFinish }) => {
  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Memuat Naik Analitik...</Text>
      </View>
    );
  }

  // Fallback calculations for charts if variables aren't set
  const chartData = stats.chartData || { textCount: 0, mediaCount: 0, posts: [] };
  const maxVotes = Math.max(...chartData.posts.map(p => p.votes || 1), 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* --- HEADER --- */}
      <View style={styles.headerSection}>
        <Text style={styles.trophyIcon}>📈</Text>
        <Text style={styles.title}>Dashboard Analitik Kelas</Text>
        <Text style={styles.subtitle}>Subjek: {stats.subject || 'Umum'}</Text>
      </View>

      {/* --- 3-BOX METRIC MATRIX --- */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalStudents || 0}</Text>
          <Text style={styles.statLabel}>👥 Pelajar Menyertai</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalPosts || 0}</Text>
          <Text style={styles.statLabel}>📝 Soalan Ditanya</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalVotes || 0}</Text>
          <Text style={styles.statLabel}>👍 Jumlah Undian</Text>
        </View>
      </View>

      {/* --- GRAPH GRAPH GRAPH: LIVE DEMAND METRICS BAR CHART --- */}
      <View style={styles.chartCard}>
        <Text style={styles.cardLabel}>📊 GRAF METRIK: TOP 5 SOALAN & POPULARITI UNDIAN</Text>
        {chartData.posts && chartData.posts.length > 0 ? (
          <View style={styles.barGraphContainer}>
            {chartData.posts.map((post, index) => {
              // Calculate percentage height dynamically for the bars
              const barHeightPercentage = `${Math.max(15, ((post.votes || 0) / maxVotes) * 100)}%`;
              const shortText = post.type === 'text' 
                ? (post.content.length > 15 ? `${post.content.substring(0, 15)}...` : post.content)
                : `[${post.type.toUpperCase()}]`;

              return (
                <View key={post.id || index} style={styles.graphColumn}>
                  <Text style={styles.barVoteValue}>{post.votes} 👍</Text>
                  {/* Dynamic Height Filled Bar */}
                  <View style={[styles.graphBar, { height: barHeightPercentage }]} />
                  <Text style={styles.barLabel} numberOfLines={1}>{shortText}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noDataText}>Tiada data undian yang mencukupi untuk menjana graf.</Text>
        )}
        
        {/* Sub-Legend Matrix */}
        <View style={styles.legendRow}>
          <Text style={styles.legendText}>ℹ️ Graf di atas menunjukkan taburan soalan mengikut undian terbanyak dari pelajar.</Text>
        </View>
      </View>

      {/* --- QUESTION DISTRIBUTION MODULE --- */}
      <View style={styles.chartCard}>
        <Text style={styles.cardLabel}>📂 STRUKTUR TABURAN FORMAT SOALAN</Text>
        <View style={styles.distributionContainer}>
          <View style={styles.distRow}>
            <Text style={styles.distText}>🔤 Soalan Format Teks:</Text>
            <Text style={styles.distCount}>{chartData.textCount || 0} Fail</Text>
          </View>
          <View style={styles.distRow}>
            <Text style={styles.distText}>🖼️ Lampiran Multimedia (Imej/Video/PDF):</Text>
            <Text style={styles.distCount}>{chartData.mediaCount || 0} Fail</Text>
          </View>
        </View>
      </View>

      {/* --- WINNING TOP QUESTION CARD --- */}
      <View style={styles.topQuestionCard}>
        <Text style={styles.cardLabel}>🏆 SOALAN TERATAS (UNDIAN TERTINGGI)</Text>
        {stats.topQuestion ? (
          <View style={styles.cardContent}>
            {stats.topQuestion.type === 'text' && (
              <Text style={styles.topText}>"{stats.topQuestion.content}"</Text>
            )}
            {stats.topQuestion.type === 'image' && (
              <View style={styles.mediaContainer}>
                <Image source={{ uri: stats.topQuestion.content }} style={styles.analyticsMedia} resizeMode="contain" />
                <Text style={styles.mediaSubtext}>
                  🖼️ {stats.topQuestion.text || "Lampiran Imej Teratas"}
                </Text>
              </View>
            )}
            {stats.topQuestion.type === 'video' && (
              <View style={styles.mediaContainer}>
                <Video source={{ uri: stats.topQuestion.content }} style={styles.analyticsMedia} useNativeControls resizeMode="contain" />
                <Text style={styles.mediaSubtext}>
                  🎥 {stats.topQuestion.text || "Lampiran Video Teratas"}
                </Text>
              </View>
            )}
            {stats.topQuestion.type === 'file' && (
              <View style={styles.mediaContainer}>
                <TouchableOpacity style={styles.analyticsPdfBtn} onPress={() => Linking.openURL(stats.topQuestion.content)}>
                  <Text style={styles.pdfBtnText}>📄 BUKA DOKUMEN PDF TERATAS</Text>
                </TouchableOpacity>
                <Text style={styles.mediaSubtext}>{stats.topQuestion.text || "Dokumen PDF Teratas"}</Text>
              </View>
            )}
            <Text style={styles.topVotesCount}>👍 Diundi sebanyak {stats.topQuestion.votes} kali</Text>
          </View>
        ) : (
          <Text style={styles.noPostsText}>Tiada soalan yang direkodkan dalam sesi ini.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={onFinish}>
        <Text style={styles.doneBtnText}>KEMBALI KE MENU UTAMA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  contentContainer: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerSection: { alignItems: 'center', marginBottom: 25 },
  trophyIcon: { fontSize: 45, marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#2C3E50', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7F8C8D', marginTop: 5, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: '#FFF', width: '31%', padding: 12, borderRadius: 15, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#3498DB' },
  statLabel: { fontSize: 9, color: '#95A5A6', fontWeight: 'bold', marginTop: 5, textAlign: 'center' },
  
  // --- BAR CHART STYLES ---
  chartCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 18, marginBottom: 20, elevation: 2 },
  barGraphContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, paddingTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  graphColumn: { alignItems: 'center', width: '18%', height: '100%', justifyContent: 'flex-end' },
  barVoteValue: { fontSize: 10, fontWeight: 'bold', color: '#27AE60', marginBottom: 4 },
  graphBar: { width: '70%', backgroundColor: '#3498DB', borderTopLeftRadius: 6, borderTopRightRadius: 6, minHeight: 10 },
  barLabel: { fontSize: 9, color: '#7F8C8D', marginTop: 6, width: '100%', textAlign: 'center' },
  legendRow: { marginTop: 5 },
  legendText: { fontSize: 10, color: '#95A5A6', fontStyle: 'italic', textAlign: 'center' },
  noDataText: { fontSize: 12, color: '#95A5A6', fontStyle: 'italic', textAlign: 'center', marginVertical: 30 },

  distributionContainer: { paddingVertical: 5 },
  distRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  distText: { fontSize: 13, color: '#34495E', fontWeight: '500' },
  distCount: { fontSize: 13, fontWeight: 'bold', color: '#2C3E50' },

  topQuestionCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 18, marginBottom: 25, elevation: 3, borderWidth: 1, borderColor: '#EBF0F1' },
  cardLabel: { fontSize: 10, fontWeight: '800', color: '#95A5A6', marginBottom: 12, letterSpacing: 0.5 },
  cardContent: { marginTop: 5 },
  topText: { fontSize: 18, fontWeight: '700', color: '#2C3E50', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
  mediaContainer: { alignItems: 'center', width: '100%' },
  analyticsMedia: { width: '100%', height: 180, borderRadius: 10, backgroundColor: '#ECF0F1' },
  mediaSubtext: { fontSize: 12, color: '#3498DB', fontWeight: '700', marginTop: 8, textAlign: 'center' },
  analyticsPdfBtn: { backgroundColor: '#F39C12', paddingVertical: 12, borderRadius: 10, alignItems: 'center', width: '100%' },
  pdfBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  topVotesCount: { fontSize: 12, fontWeight: '800', color: '#2ECC71', marginTop: 12, textAlign: 'right' },
  noPostsText: { color: '#7F8C8D', fontStyle: 'italic', textAlign: 'center' },
  doneBtn: { backgroundColor: '#2C3E50', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: 'white', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 }
});

export default AnalyticsScreen;