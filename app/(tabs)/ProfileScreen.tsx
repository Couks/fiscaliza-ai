import { useAuthStore } from '@/stores/authStore';
import { useStatsStore } from '@/stores/statsStore';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    BounceIn,
    FadeIn,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const AnimatedBadgeCard = ({ 
  badge, 
  index 
}: { 
  badge: any; 
  index: number; 
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 100,
      });
      opacity.value = withTiming(1, {
        duration: 300,
      });
    }, index * 100);
    
    return () => clearTimeout(timer);
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.badgeCard, animatedStyle]}>
      <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
        <Icon name={badge.icon as any} size={24} color="white" />
      </View>
      <Text style={styles.badgeName}>{badge.name}</Text>
      <Text style={styles.badgeDescription}>{badge.description}</Text>
      {badge.earned && (
        <Animated.View 
          entering={BounceIn.delay(index * 100 + 500)}
          style={styles.earnedIndicator}
        >
          <Icon name="check-circle" size={16} color="#4CAF50" />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const AnimatedProgressBadge = ({ 
  badge, 
  index 
}: { 
  badge: any; 
  index: number; 
}) => {
  const progressValue = useSharedValue(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      progressValue.value = withTiming(badge.progress, {
        duration: 1000,
      });
    }, index * 200);
    
    return () => clearTimeout(timer);
  }, [index, badge.progress, progressValue]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  return (
    <Animated.View 
      entering={SlideInRight.delay(index * 150)}
      style={styles.nextBadgeCard}
    >
      <View style={[styles.nextBadgeIcon, { backgroundColor: badge.color + '20' }]}>
        <Icon name={badge.icon as any} size={20} color={badge.color} />
      </View>
      
      <View style={styles.nextBadgeInfo}>
        <Text style={styles.nextBadgeName}>{badge.name}</Text>
        <Text style={styles.nextBadgeDescription}>{badge.description}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { backgroundColor: badge.color },
                progressAnimatedStyle
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{badge.progress}%</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const AnimatedStatCard = ({ 
  stat, 
  index 
}: { 
  stat: any; 
  index: number; 
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-10);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      rotation.value = withSpring(0, {
        damping: 12,
        stiffness: 100,
      });
    }, index * 100);
    
    return () => clearTimeout(timer);
  }, [index, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
        <Icon name={stat.icon as any} size={24} color={stat.color} />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      {stat.subtitle && (
        <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
      )}
    </Animated.View>
  );
};

const badges = [
  {
    id: 1,
    name: 'Herói da Limpeza',
    description: 'Reportou 10 problemas de limpeza',
    icon: 'cleaning-services',
    color: '#9C27B0',
    earned: true,
    progress: 100,
  },
  {
    id: 2,
    name: 'Guardião da Cidade',
    description: 'Reportou 25 problemas no total',
    icon: 'security',
    color: '#2196F3',
    earned: true,
    progress: 100,
  },
  {
    id: 3,
    name: 'Observador de Iluminação',
    description: 'Reportou 5 problemas de iluminação',
    icon: 'lightbulb',
    color: '#FF9800',
    earned: true,
    progress: 100,
  },
  {
    id: 4,
    name: 'Especialista em Vias',
    description: 'Reporte 15 problemas de vias públicas',
    icon: 'construction',
    color: '#F44336',
    earned: false,
    progress: 73,
  },
  {
    id: 5,
    name: 'Cidadão Exemplar',
    description: 'Reporte 50 problemas no total',
    icon: 'emoji-events',
    color: '#FFD700',
    earned: false,
    progress: 46,
  },
  {
    id: 6,
    name: 'Vigilante Noturno',
    description: 'Reporte problemas durante a madrugada',
    icon: 'nights-stay',
    color: '#673AB7',
    earned: false,
    progress: 0,
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { userStats, globalStats, ranking, isLoading, lastUpdated, loadUserStats, loadRanking } = useStatsStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // Se não tiver usuário logado, usar dados padrão
  const userData = user || {
    id: '1',
    name: 'João Silva',
    level: 5,
    points: 1250,
    ranking: 47,
    badges: badges
  };

  const loadUserData = React.useCallback(async () => {
    try {
      await Promise.all([
        loadUserStats(userData.id),
        loadRanking(),
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setRefreshing(false);
    }
  }, [userData.id, loadUserStats, loadRanking]);

  React.useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Só recarregar quando lastUpdated indica um novo report
  React.useEffect(() => {
    if (lastUpdated > 0) {
      loadUserData();
    }
  }, [lastUpdated, loadUserData]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadUserData();
  }, [loadUserData]);

  const userBadges = userData.badges || badges;
  const earnedBadges = userBadges.filter(badge => badge.earned);
  const nextBadges = userBadges.filter(badge => !badge.earned);

  const getDisplayStats = () => {
    if (!userStats) return [];
    
    const userInRanking = ranking?.find((u: any) => u.id === userData.id);
    
    return [
      { 
        label: 'Problemas Reportados', 
        value: userStats.problemsReported, 
        icon: 'report-problem', 
        color: '#F44336',
        subtitle: 'Total criados'
      },
      { 
        label: 'Problemas Resolvidos', 
        value: userStats.problemsResolved, 
        icon: 'check-circle', 
        color: '#4CAF50',
        subtitle: 'Solucionados'
      },
      { 
        label: 'Pontos Acumulados', 
        value: userInRanking?.points || userData.points, 
        icon: 'stars', 
        color: '#FFD700',
        subtitle: 'Total de pontos'
      },
      { 
        label: 'Posição no Ranking', 
        value: `#${userInRanking?.ranking || userData.ranking}`, 
        icon: 'leaderboard', 
        color: '#2196F3',
        subtitle: 'Na cidade'
      },
    ];
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Deseja realmente sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/LoginScreen');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animated.View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Meu Perfil</Text>
            <Text style={styles.subtitle}>Cidadão Ativo</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </Animated.View>

        {/* Perfil do Usuário */}
        <Animated.View 
          entering={FadeIn.delay(200)}
          style={styles.profileCard}
        >
          <Animated.View 
            entering={BounceIn.delay(300)}
            style={styles.avatarContainer}
          >
            <View style={styles.avatar}>
              {(userData as any).avatar ? (
                <Image 
                  source={{ uri: (userData as any).avatar }} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Icon name="person" size={40} color="#2E7D32" />
              )}
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nv. {userData.level}</Text>
            </View>
          </Animated.View>
          
          <Animated.View 
            entering={SlideInRight.delay(400)}
            style={styles.userInfo}
          >
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userTitle}>Cidadão Ativo da Ilha do Governador</Text>
            <Animated.View 
              entering={FadeIn.delay(600)}
              style={styles.pointsContainer}
            >
              <Icon name="stars" size={16} color="#FFD700" />
              <Text style={styles.pointsText}>{userData.points.toLocaleString()} pontos</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={BounceIn.delay(700)}>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Suas Estatísticas</Text>
          <View style={styles.statsGrid}>
            {isLoading ? (
              // Loading placeholder
              Array.from({ length: 4 }).map((_, index) => (
                <View key={index} style={[styles.statCard, styles.loadingCard]}>
                  <View style={styles.loadingDot} />
                  <View style={styles.loadingLine} />
                  <View style={styles.loadingLineSmall} />
                </View>
              ))
            ) : (
              getDisplayStats().map((stat: any, index: number) => (
                <AnimatedStatCard 
                  key={index}
                  stat={stat}
                  index={index}
                />
              ))
            )}
          </View>
        </View>

        {/* Badges Conquistadas */}
        <View style={styles.badgesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges Conquistadas</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{earnedBadges.length}</Text>
            </View>
          </View>
          <View style={styles.badgesGrid}>
            {earnedBadges.map((badge, index) => (
              <AnimatedBadgeCard
                key={badge.id}
                badge={badge}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* Próximas Badges */}
        {nextBadges.length > 0 && (
          <View style={styles.badgesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximas Conquistas</Text>
              <View style={styles.progressIndicator}>
                <Icon name="trending-up" size={16} color="#FF9800" />
              </View>
            </View>
            {nextBadges.map((badge, index) => (
              <AnimatedProgressBadge
                key={badge.id}
                badge={badge}
                index={index}
              />
            ))}
          </View>
        )}

        {/* Ações */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <Animated.View entering={FadeIn.delay(1500)}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/HistoryScreen')}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#2196F3' + '20' }]}>
                  <Icon name="history" size={20} color="#2196F3" />
                </View>
                <View>
                  <Text style={styles.actionText}>Histórico de Reportes</Text>
                  <Text style={styles.actionSubtext}>Ver todos os seus reportes</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View entering={FadeIn.delay(1600)}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/RankingScreen')}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#FF9800' + '20' }]}>
                  <Icon name="leaderboard" size={20} color="#FF9800" />
                </View>
                <View>
                  <Text style={styles.actionText}>Ranking da Cidade</Text>
                  <Text style={styles.actionSubtext}>Você está em #{userData.ranking}º lugar</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View entering={FadeIn.delay(1700)}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/PointsGuideScreen')}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' + '20' }]}>
                  <Icon name="help" size={20} color="#4CAF50" />
                </View>
                <View>
                  <Text style={styles.actionText}>Como Ganhar Pontos</Text>
                  <Text style={styles.actionSubtext}>Dicas para subir no ranking</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(1800)}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/SettingsScreen')}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' + '20' }]}>
                  <Icon name="settings" size={20} color="#9C27B0" />
                </View>
                <View>
                  <Text style={styles.actionText}>Configurações</Text>
                  <Text style={styles.actionSubtext}>Notificações e privacidade</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#666" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingsButton: {
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
  },
  shareButton: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  statsSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeCount: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  progressIndicator: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIcon: {
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  badgesSection: {
    margin: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  badgeIcon: {
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  earnedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  nextBadgeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  nextBadgeIcon: {
    borderRadius: 20,
    padding: 12,
    marginRight: 16,
  },
  nextBadgeInfo: {
    flex: 1,
  },
  nextBadgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextBadgeDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  actionsSection: {
    margin: 16,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  // Novos estilos para loading e error states
  loadingCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  loadingDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  loadingLine: {
    width: '70%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginBottom: 4,
  },
  loadingLineSmall: {
    width: '50%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },
});