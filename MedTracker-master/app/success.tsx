import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import { getProductById } from '@/src/stripe-config';
import { getUserSubscription, getUserOrders } from '@/src/lib/stripe';

export default function SuccessScreen() {
  const { product: productId } = useLocalSearchParams<{ product: string }>();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const product = productId ? getProductById(productId) : null;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [subscriptionData, ordersData] = await Promise.all([
          getUserSubscription(),
          getUserOrders(),
        ]);
        
        setSubscription(subscriptionData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Wait a bit for webhook to process
    const timer = setTimeout(loadUserData, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  const handleViewProducts = () => {
    router.replace('/(tabs)/products');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color="#34C759" />
        </View>
        
        <Text style={styles.title}>Pagamento Realizado!</Text>
        
        {product && (
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
          </View>
        )}
        
        <Text style={styles.message}>
          {product?.mode === 'subscription' 
            ? 'Sua assinatura foi ativada com sucesso. Você já pode aproveitar todos os benefícios!'
            : 'Sua compra foi processada com sucesso. Obrigado pela confiança!'
          }
        </Text>

        {loading && (
          <Text style={styles.loadingText}>
            Atualizando informações da conta...
          </Text>
        )}

        {!loading && subscription && subscription.subscription_status === 'active' && (
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionTitle}>Assinatura Ativa</Text>
            <Text style={styles.subscriptionText}>
              Sua assinatura está ativa e funcionando perfeitamente.
            </Text>
          </View>
        )}

        {!loading && orders.length > 0 && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderTitle}>Última Compra</Text>
            <Text style={styles.orderText}>
              Compra realizada em {new Date(orders[0].order_date).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continuar</Text>
            <ArrowRight size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewProducts}>
            <Text style={styles.secondaryButtonText}>Ver Produtos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  productInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  subscriptionInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a5a1a',
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: 14,
    color: '#2d5a2d',
    textAlign: 'center',
  },
  orderInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});