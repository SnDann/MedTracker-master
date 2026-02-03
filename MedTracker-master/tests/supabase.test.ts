import { testSupabase, testSupabaseAdmin } from './setup';
import { Database } from '../lib/supabase';

describe('Supabase Integration Tests', () => {
  const testUserId = 'test-user-id';

  describe('Medications Table', () => {
    const testMedication: Database['public']['Tables']['medications']['Insert'] = {
      user_id: testUserId,
      name: 'Test Medication',
      dosage: '10mg',
      notes: 'Test notes',
      days: [1, 2, 3],
      times: ['08:00', '20:00'],
      taken: {}
    };

    let createdMedicationId: string;

    it('should insert a new medication', async () => {
      const { data, error } = await testSupabase
        .from('medications')
        .insert(testMedication)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe(testMedication.name);
      expect(data?.user_id).toBe(testUserId);
      
      if (data?.id) {
        createdMedicationId = data.id;
      }
    });

    it('should retrieve a medication by id', async () => {
      const { data, error } = await testSupabase
        .from('medications')
        .select()
        .eq('id', createdMedicationId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(createdMedicationId);
      expect(data?.name).toBe(testMedication.name);
    });

    it('should update a medication', async () => {
      const updatedName = 'Updated Test Medication';
      const { data, error } = await testSupabase
        .from('medications')
        .update({ name: updatedName })
        .eq('id', createdMedicationId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe(updatedName);
    });

    it('should delete a medication', async () => {
      const { error } = await testSupabase
        .from('medications')
        .delete()
        .eq('id', createdMedicationId);

      expect(error).toBeNull();

      // Verify deletion
      const { data, error: selectError } = await testSupabase
        .from('medications')
        .select()
        .eq('id', createdMedicationId)
        .single();

      expect(selectError).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('Prescriptions Table', () => {
    const testPrescription: Database['public']['Tables']['prescriptions']['Insert'] = {
      user_id: testUserId,
      image_url: 'https://example.com/prescription.jpg',
      extracted_text: 'Test prescription text',
      medications_identified: []
    };

    let createdPrescriptionId: string;

    it('should insert a new prescription', async () => {
      const { data, error } = await testSupabase
        .from('prescriptions')
        .insert(testPrescription)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.image_url).toBe(testPrescription.image_url);
      expect(data?.user_id).toBe(testUserId);

      if (data?.id) {
        createdPrescriptionId = data.id;
      }
    });

    it('should retrieve a prescription by id', async () => {
      const { data, error } = await testSupabase
        .from('prescriptions')
        .select()
        .eq('id', createdPrescriptionId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(createdPrescriptionId);
      expect(data?.image_url).toBe(testPrescription.image_url);
    });

    it('should update a prescription', async () => {
      const updatedText = 'Updated prescription text';
      const { data, error } = await testSupabase
        .from('prescriptions')
        .update({ extracted_text: updatedText })
        .eq('id', createdPrescriptionId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.extracted_text).toBe(updatedText);
    });

    it('should delete a prescription', async () => {
      const { error } = await testSupabase
        .from('prescriptions')
        .delete()
        .eq('id', createdPrescriptionId);

      expect(error).toBeNull();

      // Verify deletion
      const { data, error: selectError } = await testSupabase
        .from('prescriptions')
        .select()
        .eq('id', createdPrescriptionId)
        .single();

      expect(selectError).toBeDefined();
      expect(data).toBeNull();
    });
  });
}); 