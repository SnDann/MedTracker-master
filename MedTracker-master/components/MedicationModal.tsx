import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Plus, Minus } from 'lucide-react-native';
import type { Database } from '@/lib/supabase';

type Medication = Database['public']['Tables']['medications']['Row'];

interface MedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (medication: any) => void;
  medication?: Medication | null;
  selectedDay?: number;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MedicationModal: React.FC<MedicationModalProps> = ({
  visible,
  onClose,
  onSave,
  medication,
  selectedDay,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [times, setTimes] = useState<string[]>(['']);

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage || '');
      setNotes(medication.notes || '');
      setSelectedDays(medication.days);
      setTimes(medication.times.length > 0 ? medication.times : ['']);
    } else {
      setName('');
      setDosage('');
      setNotes('');
      setSelectedDays(selectedDay !== undefined ? [selectedDay] : []);
      setTimes(['']);
    }
  }, [medication, selectedDay, visible]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const addTimeSlot = () => {
    setTimes(prev => [...prev, '']);
  };

  const removeTimeSlot = (index: number) => {
    if (times.length > 1) {
      setTimes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateTime = (index: number, time: string) => {
    setTimes(prev => prev.map((t, i) => i === index ? time : t));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do medicamento é obrigatório');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana');
      return;
    }

    const validTimes = times.filter(t => t.trim() !== '');
    if (validTimes.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um horário');
      return;
    }

    const medicationData = {
      name: name.trim(),
      dosage: dosage.trim() || null,
      notes: notes.trim() || null,
      days: selectedDays,
      times: validTimes,
      taken: medication?.taken || {},
    };

    onSave(medicationData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {medication ? 'Editar Medicamento' : 'Adicionar Medicamento'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Nome do medicamento *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Losartana"
              maxLength={90}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Dosagem</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="Ex: 50mg"
              maxLength={50}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ex: Tomar após o café da manhã"
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Dias da semana</Text>
            <View style={styles.daysContainer}>
              {WEEK_DAYS.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(index) && styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(index) && styles.dayTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.timesHeader}>
              <Text style={styles.label}>Horários</Text>
              <TouchableOpacity onPress={addTimeSlot} style={styles.addTimeButton}>
                <Plus size={16} color="#007AFF" />
                <Text style={styles.addTimeText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
            
            {times.map((time, index) => (
              <View key={index} style={styles.timeRow}>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  value={time}
                  onChangeText={(text) => updateTime(index, text)}
                  placeholder="HH:MM"
                  maxLength={5}
                />
                {times.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeTimeSlot(index)}
                    style={styles.removeTimeButton}
                  >
                    <Minus size={16} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {medication ? 'Atualizar' : 'Salvar'} Medicamento
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  dayTextSelected: {
    color: '#fff',
  },
  timesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addTimeText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
  },
  removeTimeButton: {
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});