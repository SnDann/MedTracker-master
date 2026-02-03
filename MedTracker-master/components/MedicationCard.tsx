import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Clock, Check, Edit, Trash2 } from 'lucide-react-native';
import type { Database } from '@/lib/supabase';

type Medication = Database['public']['Tables']['medications']['Row'];

interface MedicationCardProps {
  medication: Medication;
  time: string;
  onTaken: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isTaken: boolean;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  time,
  onTaken,
  onEdit,
  onDelete,
  isTaken,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Excluir Medicamento',
      'Tem certeza que deseja excluir este medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={[styles.card, isTaken && styles.takenCard]}>
      <View style={styles.header}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        <View style={styles.timeContainer}>
          <Clock size={16} color="#666" />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
      
      {medication.dosage && (
        <Text style={styles.dosage}>Dosagem: {medication.dosage}</Text>
      )}
      
      {medication.notes && (
        <Text style={styles.notes}>{medication.notes}</Text>
      )}
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.takenButton, isTaken && styles.takenButtonDisabled]}
          onPress={onTaken}
          disabled={isTaken}
        >
          <Check size={16} color={isTaken ? "#999" : "#fff"} />
          <Text style={[styles.actionText, isTaken && styles.takenText]}>
            {isTaken ? 'Tomado' : 'Marcar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
          <Edit size={16} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Trash2 size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  takenCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  takenButton: {
    backgroundColor: '#34C759',
    flex: 1,
  },
  takenButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  editButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  takenText: {
    color: '#999',
  },
});