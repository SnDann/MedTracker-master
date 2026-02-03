import { supabase } from './supabase';
import type { Database } from './supabase';
import * as Notifications from 'expo-notifications';

type Medication = Database['public']['Tables']['medications']['Row'];
type MedicationInsert = Database['public']['Tables']['medications']['Insert'];
type MedicationUpdate = Database['public']['Tables']['medications']['Update'];

export const getMedications = async (userId: string) => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const addMedication = async (medication: MedicationInsert) => {
  const { data, error } = await supabase
    .from('medications')
    .insert(medication)
    .select()
    .single();
  if (data && !error) {
    await scheduleMedicationNotifications({ ...data, ...medication });
  }
  return { data, error };
};

export const updateMedication = async (id: string, updates: MedicationUpdate) => {
  const { data, error } = await supabase
    .from('medications')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (data && !error) {
    await cancelMedicationNotifications(id);
    await scheduleMedicationNotifications({ ...data, ...updates });
  }
  return { data, error };
};

export const deleteMedication = async (id: string) => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);
  await cancelMedicationNotifications(id);
  return { error };
};

export const markMedicationTaken = async (
  medicationId: string, 
  dateTime: string, 
  taken: Record<string, boolean>
) => {
  const { data, error } = await supabase
    .from('medications')
    .update({ 
      taken: { ...taken, [dateTime]: true },
      updated_at: new Date().toISOString()
    })
    .eq('id', medicationId)
    .select()
    .single();
  
  return { data, error };
};

// Função utilitária para cancelar todas as notificações agendadas de um medicamento
export const cancelMedicationNotifications = async (medicationId: string) => {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = all.filter(n => n.identifier.startsWith(`med_${medicationId}_`));
  for (const n of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
};

// Função utilitária para agendar notificações para um medicamento
export const scheduleMedicationNotifications = async (medication: any) => {
  // medication deve conter: id, name, days (array de números), times (array de strings 'HH:MM')
  if (!medication.id || !medication.days || !medication.times) return;
  for (const day of medication.days) {
    for (const time of medication.times) {
      const [hour, minute] = time.split(':').map(Number);
      // Agendar notificação semanal
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Hora do medicamento: ${medication.name}`,
          body: `Lembre-se de tomar seu medicamento agora.`,
          sound: true,
        },
        trigger: {
          weekday: day + 1, // JS: 0=Dom, Expo: 1=Dom
          hour,
          minute,
          repeats: true,
        },
        identifier: `med_${medication.id}_${day}_${time}`,
      });
    }
  }
};