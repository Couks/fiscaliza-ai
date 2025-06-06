import { Problem } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useProblemsStore } from '@/stores/problemsStore';
import { useStatsStore } from '@/stores/statsStore';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
  SlideInUp,
  ZoomIn,
} from 'react-native-reanimated';

const statusConfig = {
  pending: { name: 'Pendente', color: '#F44336', icon: 'schedule' as const },
  in_progress: { name: 'Em Andamento', color: '#FF9800', icon: 'autorenew' as const },
  resolved: { name: 'Resolvido', color: '#4CAF50', icon: 'check-circle' as const },
};

const categories = {
  road: { name: 'Via Pública', icon: 'construction' as const, color: '#F44336' },
  lighting: { name: 'Iluminação', icon: 'lightbulb-outline' as const, color: '#FF9800' },
  cleaning: { name: 'Limpeza', icon: 'delete' as const, color: '#9C27B0' },
  others: { name: 'Outros', icon: 'report-problem' as const, color: '#607D8B' },
};

const filters = [
  { id: 'all', name: 'Todos', color: '#2E7D32' },
  { id: 'pending', name: 'Pendentes', color: '#F44336' },
  { id: 'in_progress', name: 'Em Andamento', color: '#FF9800' },
  { id: 'resolved', name: 'Resolvidos', color: '#4CAF50' },
];

const AnimatedProblemCard = ({ 
  item, 
  index 
}: { 
  item: Problem; 
  index: number; 
}) => {
  const router = useRouter();
  const category = categories[item.category];
  const status = statusConfig[item.status];
  const displayImage = item.images && item.images.length > 0 ? item.images[0] : 'https://oystr.com.br/wp-content/uploads/2022/08/placeholder.png';
  const timeAgo = getTimeAgo(item.reportedAt);

  return (
    <Animated.View 
      entering={SlideInRight.delay(index * 100)}
    >
      <TouchableOpacity 
        style={styles.problemCard}
        onPress={() => router.push({
          pathname: '/ProblemDetailsScreen',
          params: { problemId: item.id }
        })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Icon name={status.icon} size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.name}
              </Text>
            </View>
            <Text style={styles.dateText}>{timeAgo}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Animated.View 
            entering={ZoomIn.delay(index * 100 + 200)}
            style={styles.imageContainer}
          >
            <Image source={{ uri: displayImage }} style={styles.problemImage} />
            <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
              <Icon name={category.icon} size={14} color="white" />
            </View>
          </Animated.View>

          <View style={styles.problemInfo}>
            <Text style={styles.problemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.problemDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.categoryInfo}>
                <Icon name={category.icon} size={14} color={category.color} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </View>
              
              <View style={styles.engagementInfo}>
                <View style={styles.engagementItem}>
                  <Icon name="thumb-up" size={14} color="#4CAF50" />
                  <Text style={styles.engagementText}>{item.votes}</Text>
                </View>
                <View style={styles.engagementItem}>
                  <Icon name="comment" size={14} color="#2196F3" />
                  <Text style={styles.engagementText}>{item.comments.length}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hoje';
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
  return `${Math.floor(diffInDays / 30)} meses atrás`;
};

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Usar stores para dados centralizados
  const { userProblems: problems, isLoading: loading, lastUpdated } = useProblemsStore();
  const { userStats } = useStatsStore();
  
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const loadUserProblems = useCallback(async () => {
    if (!user) return;
    
    // Usar stores para carregar dados
    await useProblemsStore.getState().loadUserProblems(user.id);
    await useStatsStore.getState().loadUserStats(user.id);
  }, [user]);

  useEffect(() => {
    loadUserProblems();
  }, [loadUserProblems]);

  // Recarregar quando lastUpdated mudar (novo report criado)
  useEffect(() => {
    if (lastUpdated > 0 && user) {
      loadUserProblems();
    }
  }, [lastUpdated, user, loadUserProblems]);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredProblems(problems);
    } else {
      setFilteredProblems(problems.filter(p => p.status === selectedFilter));
    }
  }, [selectedFilter, problems]);

  const renderFilterChip = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 100)}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedFilter === item.id && [styles.filterChipSelected, { backgroundColor: item.color + '20', borderColor: item.color }]
        ]}
        onPress={() => setSelectedFilter(item.id)}
      >
        <Text style={[
          styles.filterText,
          selectedFilter === item.id && { color: item.color, fontWeight: '600' }
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderProblemCard = ({ item, index }: { item: Problem; index: number }) => (
    <AnimatedProblemCard item={item} index={index} />
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
          <Text style={styles.title}>Histórico de Reportes</Text>
          <Text style={styles.subtitle}>Seus problemas reportados</Text>
        </View>
        <View style={styles.headerRight} />
      </Animated.View>

      {/* Stats Summary */}
      {userStats && (
        <Animated.View 
          entering={SlideInUp.delay(200)}
          style={styles.statsContainer}
        >
          <Animated.View entering={BounceIn.delay(300)} style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.problemsReported}</Text>
            <Text style={styles.statLabel}>Reportados</Text>
          </Animated.View>
          <Animated.View entering={BounceIn.delay(400)} style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.problemsResolved}</Text>
            <Text style={styles.statLabel}>Resolvidos</Text>
          </Animated.View>
          <Animated.View entering={BounceIn.delay(500)} style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.totalVotes}</Text>
            <Text style={styles.statLabel}>Votos Recebidos</Text>
          </Animated.View>
          <Animated.View entering={BounceIn.delay(600)} style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.totalComments}</Text>
            <Text style={styles.statLabel}>Comentários</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Filters */}
      <Animated.View 
        entering={SlideInUp.delay(400)}
        style={styles.filtersContainer}
      >
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderFilterChip}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filtersList}
        />
      </Animated.View>

      {/* Problems List */}
      {loading ? (
        <Animated.View 
          entering={FadeIn}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </Animated.View>
      ) : filteredProblems.length === 0 ? (
        <Animated.View 
          entering={FadeIn.delay(500)}
          style={styles.emptyContainer}
        >
          <Icon name="history" size={64} color="#DDD" />
          <Text style={styles.emptyTitle}>Nenhum reporte encontrado</Text>
          <Text style={styles.emptyText}>
            {selectedFilter === 'all' 
              ? 'Você ainda não reportou nenhum problema.' 
              : `Você não tem reportes com status "${filters.find(f => f.id === selectedFilter)?.name}".`
            }
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/ReportScreen')}
          >
            <Icon name="add" size={20} color="white" />
            <Text style={styles.emptyButtonText}>Reportar Problema</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.View 
          entering={FadeIn.delay(500)}
          style={styles.listContainer}
        >
          <FlatList
            data={filteredProblems}
            renderItem={renderProblemCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.problemsList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  problemsList: {
    padding: 16,
  },
  problemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  problemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  problemInfo: {
    flex: 1,
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  problemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  engagementInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 