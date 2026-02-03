import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/components/AuthProvider';
import { MedicationCard } from '@/components/MedicationCard';
import { MedicationModal } from '@/components/MedicationModal';
import { getMedications, addMedication, updateMedication, deleteMedication, markMedicationTaken } from '@/lib/medications';
import type { Database } from '@/lib/supabase';

type Medication = Database['public']['Tables']['medications']['Row'];

const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function HomeScreen() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | undefined>();

  const loadMedications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await getMedications(user.id);
    
    if (error) {
      Alert.alert('Erro', 'Não foi possível carregar os medicamentos');
    } else {
      setMedications(data || []);
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const handleAddMedication = (day?: number) => {
    setEditingMedication(null);
    setSelectedDay(day);
    setModalVisible(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setSelectedDay(undefined);
    setModalVisible(true);
  };

  const handleSaveMedication = async (medicationData: any) => {
    if (!user) return;

    try {
      if (editingMedication) {
        await updateMedication(editingMedication.id, medicationData);
      } else {
        await addMedication({ ...medicationData, user_id: user.id });
      }
      
      await loadMedications();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o medicamento');
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      await deleteMedication(medicationId);
      await loadMedications();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o medicamento');
    }
  };

  const handleMarkTaken = async (medication: Medication, time: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const dateTimeKey = `${today}T${time}`;
    
    try {
      await markMedicationTaken(medication.id, dateTimeKey, medication.taken);
      await loadMedications();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar como tomado');
    }
  };

  const getMedicationsForDay = (day: number) => {
    return medications.filter(med => med.days.includes(day));
  };

  const getDosesForDay = (day: number) => {
    const medsForDay = getMedicationsForDay(day);
    const doses: Array<{ medication: Medication; time: string }> = [];
    
    medsForDay.forEach(med => {
      med.times.forEach(time => {
        doses.push({ medication: med, time });
      });
    });
    
    return doses.sort((a, b) => a.time.localeCompare(b.time));
  };

  const isMedicationTaken = (medication: Medication, time: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const dateTimeKey = `${today}T${time}`;
    return !!(medication.taken && medication.taken[dateTimeKey]);
  };

  const getTodayUpcoming = () => {
    const today = new Date().getDay();
    const currentTime = new Date();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const todayDoses = getDosesForDay(today);
    
    return todayDoses.filter(({ medication, time }) => {
      const [hours, minutes] = time.split(':').map(Number);
      const doseMinutes = hours * 60 + minutes;
      const isTaken = isMedicationTaken(medication, time);
      
      return !isTaken && doseMinutes >= currentMinutes && doseMinutes <= currentMinutes + 60;
    });
  };

  const upcomingDoses = getTodayUpcoming();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá!</Text>
            <Text style={styles.subtitle}>Como estão seus medicamentos hoje?</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#fff" />
            {upcomingDoses.length > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {upcomingDoses.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingTitle}>Próximas doses (1h)</Text>
          {upcomingDoses.slice(0, 2).map(({ medication, time }, index) => (
            <View key={`${medication.id}-${time}`} style={styles.upcomingCard}>
              <Text style={styles.upcomingMed}>{medication.name}</Text>
              <Text style={styles.upcomingTime}>{time}</Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadMedications} />
        }
        showsVerticalScrollIndicator={false}
      >
        {WEEK_DAYS.map((dayName, dayIndex) => {
          const doses = getDosesForDay(dayIndex);
          
          return (
            <View key={dayIndex} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dayName}</Text>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayCount}>{doses.length}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddMedication(dayIndex)}
                  >
                    <Plus size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {doses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Nenhum medicamento</Text>
                </View>
              ) : (
                doses.map(({ medication, time }) => (
                  <MedicationCard
                    key={`${medication.id}-${time}`}
                    medication={medication}
                    time={time}
                    isTaken={isMedicationTaken(medication, time)}
                    onTaken={() => handleMarkTaken(medication, time)}
                    onEdit={() => handleEditMedication(medication)}
                    onDelete={() => handleDeleteMedication(medication.id)}
                  />
                ))
              )}
            </View>
          );
        })}
      </ScrollView>

      <MedicationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveMedication}
        medication={editingMedication}
        selectedDay={selectedDay}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  upcomingSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  upcomingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  upcomingMed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  upcomingTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});