import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/components/AuthProvider';
import { getMedications } from '@/lib/medications';
import type { Database } from '@/lib/supabase';

type Medication = Database['public']['Tables']['medications']['Row'];

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadMedications = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await getMedications(user.id);
    
    if (!error && data) {
      setMedications(data);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadMedications();
  }, [user]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDayOfWeek = (date: Date) => {
    return date.getDay();
  };

  const getMedicationsForDate = (date: Date) => {
    const dayOfWeek = getDayOfWeek(date);
    return medications.filter(med => med.days.includes(dayOfWeek));
  };

  const getDosesForDate = (date: Date) => {
    const medsForDate = getMedicationsForDate(date);
    const doses: Array<{ medication: Medication; time: string }> = [];
    
    medsForDate.forEach(med => {
      med.times.forEach(time => {
        doses.push({ medication: med, time });
      });
    });
    
    return doses.sort((a, b) => a.time.localeCompare(b.time));
  };

  const isMedicationTaken = (medication: Medication, time: string, date: Date) => {
    const dateStr = date.toISOString().slice(0, 10);
    const dateTimeKey = `${dateStr}T${time}`;
    return !!(medication.taken && medication.taken[dateTimeKey]);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const doses = getDosesForDate(selectedDate);
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Agenda</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Calendar size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
            <ChevronLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            {!isToday && (
              <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                <Text style={styles.todayText}>Hoje</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
            <ChevronRight size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadMedications} />
        }
        showsVerticalScrollIndicator={false}
      >
        {doses.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum medicamento</Text>
            <Text style={styles.emptySubtitle}>
              Não há medicamentos agendados para este dia
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {doses.map(({ medication, time }, index) => {
              const isTaken = isMedicationTaken(medication, time, selectedDate);
              const isPast = isToday && new Date() > new Date(`${selectedDate.toDateString()} ${time}`);
              
              return (
                <View key={`${medication.id}-${time}`} style={styles.timelineItem}>
                  <View style={styles.timelineTime}>
                    <Text style={[styles.timeText, isTaken && styles.timeTextTaken]}>
                      {time}
                    </Text>
                  </View>
                  
                  <View style={styles.timelineLine}>
                    <View style={[
                      styles.timelineDot,
                      isTaken && styles.timelineDotTaken,
                      isPast && !isTaken && styles.timelineDotMissed,
                    ]} />
                    {index < doses.length - 1 && <View style={styles.timelineConnector} />}
                  </View>
                  
                  <View style={[styles.medicationCard, isTaken && styles.medicationCardTaken]}>
                    <Text style={[styles.medicationName, isTaken && styles.medicationNameTaken]}>
                      {medication.name}
                    </Text>
                    {medication.dosage && (
                      <Text style={[styles.medicationDosage, isTaken && styles.medicationDosageTaken]}>
                        {medication.dosage}
                      </Text>
                    )}
                    {medication.notes && (
                      <Text style={[styles.medicationNotes, isTaken && styles.medicationNotesTaken]}>
                        {medication.notes}
                      </Text>
                    )}
                    
                    <View style={styles.statusContainer}>
                      {isTaken ? (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>✓ Tomado</Text>
                        </View>
                      ) : isPast ? (
                        <View style={[styles.statusBadge, styles.statusBadgeMissed]}>
                          <Text style={[styles.statusText, styles.statusTextMissed]}>Perdido</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBadge, styles.statusBadgePending]}>
                          <Text style={[styles.statusText, styles.statusTextPending]}>Pendente</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  calendarButton: {
    padding: 8,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  todayButton: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  todayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  timeline: {
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineTime: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeTextTaken: {
    color: '#34C759',
  },
  timelineLine: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: '#fff',
  },
  timelineDotTaken: {
    backgroundColor: '#34C759',
  },
  timelineDotMissed: {
    backgroundColor: '#FF3B30',
  },
  timelineConnector: {
    position: 'absolute',
    top: 12,
    width: 2,
    height: 40,
    backgroundColor: '#e9ecef',
  },
  medicationCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationCardTaken: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  medicationNameTaken: {
    color: '#666',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicationDosageTaken: {
    color: '#999',
  },
  medicationNotes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  medicationNotesTaken: {
    color: '#aaa',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#34C759',
  },
  statusBadgeMissed: {
    backgroundColor: '#FF3B30',
  },
  statusBadgePending: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statusTextMissed: {
    color: '#fff',
  },
  statusTextPending: {
    color: '#fff',
  },
});