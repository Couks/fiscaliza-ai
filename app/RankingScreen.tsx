import { User } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    BounceIn,
    FadeIn,
    SlideInRight,
    SlideInUp
} from 'react-native-reanimated';

interface RankingUser extends Omit<User, 'password'> {
  problemsReported: number;
  problemsResolved: number;
  totalVotes: number;
  efficiency: number;
}

const categories = [
  { id: 'points', name: 'Pontos', icon: 'stars', color: '#FFD700' },
  { id: 'reports', name: 'Reportes', icon: 'report-problem', color: '#F44336' },
  { id: 'resolved', name: 'Resolvidos', icon: 'check-circle', color: '#4CAF50' },
  { id: 'votes', name: 'Votos', icon: 'thumb-up', color: '#2196F3' },
];

const medals = {
  1: { icon: 'emoji-events', color: '#FFD700', name: '1º Lugar' },
  2: { icon: 'emoji-events', color: '#C0C0C0', name: '2º Lugar' },
  3: { icon: 'emoji-events', color: '#CD7F32', name: '3º Lugar' },
};

const AnimatedRankingCard = ({ 
  user, 
  position, 
  category, 
  isCurrentUser,
  index 
}: { 
  user: RankingUser; 
  position: number; 
  category: string;
  isCurrentUser: boolean;
  index: number; 
}) => {
  const getValue = () => {
    switch (category) {
      case 'points': return user.points.toLocaleString();
      case 'reports': return user.problemsReported.toString();
      case 'resolved': return user.problemsResolved.toString();
      case 'votes': return user.totalVotes.toString();
      default: return user.points.toLocaleString();
    }
  };

  const medal = medals[position as keyof typeof medals];

  return (
    <Animated.View 
      entering={SlideInRight.delay(index * 100)}
    >
      <View style={[
        styles.rankingCard,
        isCurrentUser && styles.currentUserCard,
        position <= 3 && styles.topThreeCard
      ]}>
        <View style={styles.rankingLeft}>
          <View style={[styles.positionContainer, position <= 3 && { backgroundColor: medal?.color + '20' }]}>
            {position <= 3 ? (
              <Icon name={medal?.icon as any} size={20} color={medal?.color} />
            ) : (
              <Text style={styles.positionText}>#{position}</Text>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <View style={[styles.avatar, isCurrentUser && styles.currentUserAvatar]}>
              <Icon name="person" size={24} color={isCurrentUser ? '#2E7D32' : '#666'} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
                {user.name}
                {isCurrentUser && ' (Você)'}
              </Text>
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Nível {user.level}</Text>
                <Text style={styles.separatorText}>•</Text>
                <Text style={styles.efficiencyText}>
                  {user.efficiency}% eficiência
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.rankingRight}>
          <Text style={[styles.rankingValue, position <= 3 && { color: medal?.color }]}>
            {getValue()}
          </Text>
          <Text style={styles.rankingLabel}>
            {categories.find(c => c.id === category)?.name}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const AnimatedCategoryTab = ({ 
  category, 
  isSelected, 
  onPress, 
  index 
}: { 
  category: any; 
  isSelected: boolean; 
  onPress: () => void; 
  index: number; 
}) => (
  <Animated.View entering={FadeIn.delay(index * 100)}>
    <TouchableOpacity
      style={[
        styles.categoryTab,
        isSelected && [styles.categoryTabSelected, { backgroundColor: category.color + '20', borderColor: category.color }]
      ]}
      onPress={onPress}
    >
      <Icon 
        name={category.icon as any} 
        size={16} 
        color={isSelected ? category.color : '#666'} 
      />
      <Text style={[
        styles.categoryText,
        isSelected && { color: category.color, fontWeight: '600' }
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  </Animated.View>
);

export default function RankingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { globalStats, ranking, isLoading, lastUpdated, loadGlobalStats, loadRanking } = useStatsStore();
  const [selectedCategory, setSelectedCategory] = useState('points');

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        loadGlobalStats(),
        loadRanking(),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  }, [loadGlobalStats, loadRanking]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Só recarregar quando lastUpdated indica um novo report
  useEffect(() => {
    if (lastUpdated > 0) {
      loadData();
    }
  }, [lastUpdated, loadData]);

  // Ordenar baseado na categoria selecionada
  const sortedRanking = React.useMemo(() => {
    if (!ranking) return [];
    
    return [...ranking].sort((a, b) => {
      switch (selectedCategory) {
        case 'reports': return (b.problemsReported || 0) - (a.problemsReported || 0);
        case 'resolved': return (b.problemsResolved || 0) - (a.problemsResolved || 0);
        case 'votes': return (b.totalVotes || 0) - (a.totalVotes || 0);
        default: return b.points - a.points;
      }
    });
  }, [ranking, selectedCategory]);

  const currentUserPosition = sortedRanking.findIndex(u => u.id === user?.id) + 1;

  const renderCategoryTab = ({ item, index }: { item: any; index: number }) => (
    <AnimatedCategoryTab
      category={item}
      isSelected={selectedCategory === item.id}
      onPress={() => setSelectedCategory(item.id)}
      index={index}
    />
  );

  const renderRankingCard = ({ item, index }: { item: any; index: number }) => (
    <AnimatedRankingCard
      user={item}
      position={index + 1}
      category={selectedCategory}
      isCurrentUser={item.id === user?.id}
      index={index}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={SlideInUp.delay(100)}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Ranking da Cidade</Text>
          <Text style={styles.subtitle}>Ilha do Governador</Text>
        </View>
        <View style={styles.headerRight} />
      </Animated.View>

      {/* Global Stats */}
      {globalStats && (
        <Animated.View 
          entering={SlideInUp.delay(200)}
          style={styles.globalStatsContainer}
        >
          <Text style={styles.globalStatsTitle}>Estatísticas Gerais</Text>
          <View style={styles.globalStatsGrid}>
            <Animated.View entering={BounceIn.delay(300)} style={styles.globalStatCard}>
              <Icon name="group" size={24} color="#2196F3" />
              <Text style={styles.globalStatNumber}>{globalStats.totalUsers}</Text>
              <Text style={styles.globalStatLabel}>Usuários</Text>
            </Animated.View>
            <Animated.View entering={BounceIn.delay(400)} style={styles.globalStatCard}>
              <Icon name="report-problem" size={24} color="#F44336" />
              <Text style={styles.globalStatNumber}>{globalStats.totalProblems}</Text>
              <Text style={styles.globalStatLabel}>Problemas</Text>
            </Animated.View>
            <Animated.View entering={BounceIn.delay(500)} style={styles.globalStatCard}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.globalStatNumber}>{globalStats.resolvedProblems}</Text>
              <Text style={styles.globalStatLabel}>Resolvidos</Text>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {/* Your Position */}
      {currentUserPosition > 0 && (
        <Animated.View 
          entering={SlideInUp.delay(400)}
          style={styles.userPositionContainer}
        >
          <View style={styles.userPositionCard}>
            <Icon name="emoji-events" size={24} color="#FFD700" />
            <Text style={styles.userPositionText}>
              Sua posição: #{currentUserPosition}
            </Text>
            <Text style={styles.userPositionSubtext}>
              {categories.find(c => c.id === selectedCategory)?.name}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Categories */}
      <Animated.View 
        entering={SlideInUp.delay(600)}
        style={styles.categoriesContainer}
      >
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
        />
      </Animated.View>

      {/* Ranking List */}
      {isLoading ? (
        <Animated.View 
          entering={FadeIn}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Carregando ranking...</Text>
        </Animated.View>
      ) : (
        <Animated.View 
          entering={FadeIn.delay(800)}
          style={styles.listContainer}
        >
          <FlatList
            data={sortedRanking}
            renderItem={renderRankingCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.rankingList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  globalStatsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  globalStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  globalStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  globalStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  globalStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  globalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  userPositionContainer: {
    paddingHorizontal: 16,
  },
  userPositionCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  userPositionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userPositionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabSelected: {
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  rankingList: {
    padding: 16,
  },
  rankingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E8',
  },
  topThreeCard: {
    elevation: 4,
    shadowOpacity: 0.15,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentUserAvatar: {
    backgroundColor: '#E8F5E8',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentUserName: {
    color: '#2E7D32',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    color: '#666',
  },
  separatorText: {
    fontSize: 12,
    color: '#DDD',
  },
  efficiencyText: {
    fontSize: 12,
    color: '#666',
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  rankingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rankingLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
}); 