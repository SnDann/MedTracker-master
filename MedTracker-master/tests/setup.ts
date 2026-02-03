import '@testing-library/jest-native/extend-expect';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/supabase';

// Test database configuration
const TEST_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-test-project.supabase.co';
const TEST_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-test-anon-key';
const TEST_SUPABASE_SERVICE_ROLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'your-test-service-role-key';

// Create test client with service role for cleanup operations
export const testSupabaseAdmin = createClient<Database>(
  TEST_SUPABASE_URL,
  TEST_SUPABASE_SERVICE_ROLE_KEY
);

// Create test client with anon key for regular operations
export const testSupabase = createClient<Database>(
  TEST_SUPABASE_URL,
  TEST_SUPABASE_ANON_KEY
);

// Test data cleanup
export const cleanupTestData = async () => {
  // Delete all test data from medications table
  await testSupabaseAdmin
    .from('medications')
    .delete()
    .eq('user_id', 'test-user-id');

  // Delete all test data from prescriptions table
  await testSupabaseAdmin
    .from('prescriptions')
    .delete()
    .eq('user_id', 'test-user-id');
};

// Setup and teardown hooks
beforeAll(async () => {
  // Clean up any existing test data before running tests
  await cleanupTestData();
});

afterEach(async () => {
  // Clean up test data after each test
  await cleanupTestData();
});

afterAll(async () => {
  // Final cleanup after all tests
  await cleanupTestData();
}); 