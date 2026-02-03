import { addMedication, updateMedication, deleteMedication, getMedications } from '../lib/medications';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: '1', name: 'Teste' }, error: null }),
    })),
  },
}));

describe('medications utils', () => {
  it('deve adicionar um medicamento', async () => {
    const { data, error } = await addMedication({ name: 'Teste', user_id: 'user1', days: [1], times: ['08:00'] });
    expect(error).toBeNull();
    expect(data).toHaveProperty('name', 'Teste');
  });

  it('deve atualizar um medicamento', async () => {
    const { data, error } = await updateMedication('1', { name: 'Atualizado' });
    expect(error).toBeNull();
    expect(data).toHaveProperty('name', 'Teste');
  });

  it('deve deletar um medicamento', async () => {
    const { error } = await deleteMedication('1');
    expect(error).toBeNull();
  });

  it('deve listar medicamentos', async () => {
    const { data, error } = await getMedications('user1');
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
}); 