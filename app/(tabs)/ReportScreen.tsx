import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { problemsApi } from '../../services/firebaseApi';
import { useAuthStore } from '../../stores/authStore';
import { useProblemsStore } from '../../stores/problemsStore';
import { useStatsStore } from '../../stores/statsStore';

const { width } = Dimensions.get('window');

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const categories = [
  { id: 'lighting', name: 'Iluminação', icon: 'lightbulb-outline', color: '#FF9800' },
  { id: 'pothole', name: 'Buracos', icon: 'construction', color: '#F44336' },
  { id: 'trash', name: 'Lixo', icon: 'delete', color: '#9C27B0' },
  { id: 'traffic', name: 'Trânsito', icon: 'traffic', color: '#2196F3' },
  { id: 'water', name: 'Água/Esgoto', icon: 'water-drop', color: '#00BCD4' },
  { id: 'others', name: 'Outros', icon: 'report-problem', color: '#607D8B' },
];

const urgencyLevels = [
  { id: 'low', name: 'Baixa', color: '#4CAF50', description: 'Não há risco imediato' },
  { id: 'medium', name: 'Média', color: '#FF9800', description: 'Requer atenção em breve' },
  { id: 'high', name: 'Alta', color: '#F44336', description: 'Situação de risco' },
];

// Mapeamento das categorias do ReportScreen para o mockData
const categoryMapping: { [key: string]: 'road' | 'lighting' | 'cleaning' | 'others' } = {
  'lighting': 'lighting',
  'pothole': 'road',
  'trash': 'cleaning',
  'traffic': 'others',
  'water': 'others',
  'others': 'others',
};

/**
 * Integração completa entre ReportScreen, mockApi e authStore:
 * - Coleta dados do formulário
 * - Mapeia categorias do UI para o modelo de dados
 * - Salva o problema no mockData via mockApi
 * - Atualiza pontos do usuário no authStore
 * - Fornece feedback visual ao usuário
 */

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  
  // Stores para notificar atualizações
  const problemsStore = useProblemsStore();
  const statsStore = useStatsStore();
  
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState('medium');
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoords | null>(
    params.userLocation ? JSON.parse(params.userLocation as string) : null
  );
  const [mapRegion, setMapRegion] = useState(
    params.initialRegion ? JSON.parse(params.initialRegion as string) : {
      latitude: -23.550520,
      longitude: -46.633308,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  // Animated values
  const progressValue = useSharedValue(0);

  const isFormValid = description.trim() && selectedCategory && selectedLocation;

  const steps = [
    { title: 'Localização', icon: 'location-on', completed: !!selectedLocation },
    { title: 'Descrição', icon: 'description', completed: !!description.trim() },
    { title: 'Categoria', icon: 'category', completed: !!selectedCategory },
    { title: 'Finalizar', icon: 'send', completed: isFormValid },
  ];

  useEffect(() => {
    // Update progress based on completed steps
    const completedSteps = steps.filter(step => step.completed).length;
    const progress = (completedSteps / steps.length) * 100;
    progressValue.value = withTiming(progress, { duration: 300 });
  }, [selectedLocation, description, selectedCategory, isFormValid, progressValue, steps]);



  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permissão negada', 'Precisamos da sua localização para reportar o problema.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 10,
      });
      const { latitude, longitude } = location.coords;
      const newLocation = { latitude, longitude };
      setSelectedLocation(newLocation);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização atual.');
      console.log(error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para adicionar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0]]);
      setShowPhotoModal(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0]]);
      setShowPhotoModal(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const onMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      setShowMapModal(false);
    } else {
      Alert.alert('Atenção', 'Por favor, selecione uma localização no mapa.');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Atenção', 'Por favor, descreva o problema encontrado.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Atenção', 'Por favor, selecione uma categoria para o problema.');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Atenção', 'Por favor, selecione a localização do problema.');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mapear categoria do ReportScreen para categoria do mockData
      const mappedCategory = categoryMapping[selectedCategory] || 'others';

      // Gerar um título baseado na categoria
      const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'Problema';
      const title = `${categoryName} - ${description.trim().substring(0, 50)}${description.trim().length > 50 ? '...' : ''}`;

      // Preparar dados do problema para criar
      const problemData = {
        title,
        description: description.trim(),
        category: mappedCategory,
        status: 'pending' as const,
        priority: selectedUrgency as 'low' | 'medium' | 'high',
        location: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          address: `Lat: ${selectedLocation.latitude.toFixed(6)}, Lng: ${selectedLocation.longitude.toFixed(6)}`,
        },
        images: photos.map(photo => photo.uri), // Usar URIs das fotos
        reportedBy: user.id,
      };

             console.log('Enviando reporte:', problemData);
       console.log('Usuário atual:', user);

             // Chamar a API para criar o problema
       const response = await problemsApi.createProblem(problemData);

       if (response.success && response.data) {
         // Calcular pontos baseado na categoria e urgência
         let points = 10; // Base
         if (selectedUrgency === 'high') points += 15;
         else if (selectedUrgency === 'medium') points += 10;
         else points += 5;
         
         if (photos.length > 0) points += 5;

         // Atualizar pontos do usuário
         await useAuthStore.getState().updateUser({ 
           points: user.points + points 
         });

         // Notificar stores sobre o novo report
         problemsStore.notifyNewReport(response.data);
         statsStore.notifyNewReport(user.id);

         setIsSubmitting(false);

        Alert.alert(
          'Reporte Enviado! 🎉',
          `Obrigado por contribuir com a cidade!\n\n+${points} pontos ganhos\n\nSeu reporte foi registrado com ID: ${response.data.id} e será analisado pela equipe responsável.`,
          [
            {
              text: 'Ver no Mapa',
              onPress: () => {
                resetForm();
                router.back();
              }
            },
            {
              text: 'Novo Reporte',
              onPress: () => resetForm(),
              style: 'cancel'
            }
          ]
        );
      } else {
        setIsSubmitting(false);
        Alert.alert(
          'Erro ao Enviar',
          response.error || 'Ocorreu um erro ao enviar o reporte. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Erro ao enviar reporte:', error);
      Alert.alert(
        'Erro de Conexão',
        'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const resetForm = () => {
    setDescription('');
    setSelectedCategory(null);
    setSelectedUrgency('medium');
    setPhotos([]);
    setSelectedLocation(params.userLocation ? JSON.parse(params.userLocation as string) : null);
  };

  const getLocationText = () => {
    if (!selectedLocation) return 'Selecione a localização do problema';
    return `Lat: ${selectedLocation.latitude.toFixed(6)}, Lng: ${selectedLocation.longitude.toFixed(6)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.title}>Reportar Problema</Text>
            <TouchableOpacity onPress={() => Alert.alert('Ajuda', 'Descreva o problema de forma clara e selecione a categoria adequada.')}>
              <MaterialIcons name="help-outline" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${isFormValid ? 100 : 33}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {isFormValid ? 'Pronto para enviar!' : 'Preencha os campos obrigatórios'}
            </Text>
          </View>

          {/* Localização */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Localização do Problema <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[styles.locationCard, !selectedLocation && styles.locationCardEmpty]}
              onPress={() => setShowMapModal(true)}
            >
              <MaterialIcons name="location-on" size={24} color={selectedLocation ? "#2E7D32" : "#999"} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>
                  {selectedLocation ? 'Local Selecionado' : 'Selecionar Local'}
                </Text>
                <Text style={[styles.locationAddress, !selectedLocation && styles.locationAddressEmpty]}>
                  {getLocationText()}
                </Text>
              </View>
              <View style={styles.locationActions}>
                <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
                  <MaterialIcons name="my-location" size={18} color="#2E7D32" />
                </TouchableOpacity>
                <MaterialIcons name="edit" size={18} color="#2E7D32" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Descrição do Problema <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, description.trim() && styles.textInputFilled]}
              placeholder="Ex: Buraco grande na pista, causando risco para veículos..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Categorias */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Categoria <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardSelected
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <MaterialIcons name={category.icon as any} size={28} color={category.color} />
                  </View>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.id && styles.categoryNameSelected
                  ]}>
                    {category.name}
                  </Text>
                  {selectedCategory === category.id && (
                    <View style={styles.selectedIndicator}>
                      <MaterialIcons name="check-circle" size={16} color="#2E7D32" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nível de Urgência */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nível de Urgência</Text>
            <View style={styles.urgencyContainer}>
              {urgencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.urgencyButton,
                    selectedUrgency === level.id && [styles.urgencyButtonSelected, { borderColor: level.color }]
                  ]}
                  onPress={() => setSelectedUrgency(level.id)}
                >
                  <View style={[styles.urgencyDot, { backgroundColor: level.color }]} />
                  <View style={styles.urgencyInfo}>
                    <Text style={[
                      styles.urgencyName,
                      selectedUrgency === level.id && styles.urgencyNameSelected
                    ]}>
                      {level.name}
                    </Text>
                    <Text style={styles.urgencyDescription}>{level.description}</Text>
                  </View>
                  {selectedUrgency === level.id && (
                    <MaterialIcons name="radio-button-checked" size={20} color={level.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fotos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Fotos {photos.length > 0 && `(${photos.length})`}
            </Text>
            
            {photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <MaterialIcons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity 
              style={styles.addPhotoButton} 
              onPress={() => setShowPhotoModal(true)}
            >
              <MaterialIcons name="add-a-photo" size={24} color="#2E7D32" />
              <Text style={styles.addPhotoText}>
                {photos.length === 0 ? 'Adicionar Fotos' : 'Adicionar Mais Fotos'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Botão de Envio Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            !isFormValid && styles.submitButtonDisabled,
            isSubmitting && styles.submitButtonLoading
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Animated.View style={styles.loadingSpinner}>
                <MaterialIcons name="hourglass-empty" size={20} color="white" />
              </Animated.View>
              <Text style={styles.submitButtonText}>Enviando...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.submitButtonText}>Enviar Reporte</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal de Mapa para Seleção de Localização */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <MaterialIcons name="close" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Selecionar Localização</Text>
            <TouchableOpacity onPress={confirmLocation}>
              <Text style={styles.mapModalConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          
          <MapView
            style={styles.modalMap}
            region={mapRegion}
            onPress={onMapPress}
            showsUserLocation={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Localização do Problema"
                description="Toque no mapa para alterar a localização"
              >
                <View style={styles.mapMarker}>
                  <MaterialIcons name="location-on" size={30} color="#F44336" />
                </View>
              </Marker>
            )}
          </MapView>
          
          <View style={styles.mapModalInstructions}>
            <Text style={styles.mapInstructionText}>
              Toque no mapa para selecionar a localização exata do problema
            </Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal de Foto */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Foto</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <MaterialIcons name="camera-alt" size={24} color="#2E7D32" />
              <Text style={styles.modalOptionText}>Tirar Foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color="#2E7D32" />
              <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancel} 
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#F44336',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 100,
  },
  textInputFilled: {
    borderColor: '#2E7D32',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 56) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E8',
  },
  categoryIcon: {
    borderRadius: 25,
    padding: 12,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  urgencyContainer: {
    gap: 8,
  },
  urgencyButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  urgencyButtonSelected: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  urgencyInfo: {
    flex: 1,
  },
  urgencyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  urgencyNameSelected: {
    fontWeight: '600',
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  photosContainer: {
    marginBottom: 12,
  },
  photoItem: {
    position: 'relative',
    marginRight: 12,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 14,
    color: '#2E7D32',
    marginTop: 8,
    fontWeight: '500',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  locationButton: {
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonLoading: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSpinner: {
    transform: [{ rotate: '45deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalCancel: {
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  locationCardEmpty: {
    borderColor: '#F44336',
    borderStyle: 'dashed',
  },
  locationAddressEmpty: {
    color: '#999',
    fontStyle: 'italic',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  mapModalConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  modalMap: {
    flex: 1,
  },
  mapMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapModalInstructions: {
    backgroundColor: 'white',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mapInstructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});