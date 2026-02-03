import { supabase } from './supabase';
import type { Database } from './supabase';

type Prescription = Database['public']['Tables']['prescriptions']['Row'];
type PrescriptionInsert = Database['public']['Tables']['prescriptions']['Insert'];

export const uploadPrescription = async (prescription: PrescriptionInsert) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert(prescription)
    .select()
    .single();
  
  return { data, error };
};

export const getPrescriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const uploadPrescriptionImage = async (uri: string, fileName: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const { data, error } = await supabase.storage
    .from('prescriptions')
    .upload(fileName, blob);
  
  if (error) return { data: null, error };
  
  const { data: { publicUrl } } = supabase.storage
    .from('prescriptions')
    .getPublicUrl(fileName);
  
  return { data: { path: data.path, publicUrl }, error: null };
};