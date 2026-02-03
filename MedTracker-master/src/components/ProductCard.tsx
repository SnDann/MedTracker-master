import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ShoppingCart, Check } from 'lucide-react-native';
import type { StripeProduct } from '../stripe-config';
import { createCheckoutSession, formatPrice } from '../lib/stripe';

interface ProductCardProps {
  product: StripeProduct;
  onPurchaseStart?: () => void;
  onPurchaseComplete?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPurchaseStart,
  onPurchaseComplete,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      onPurchaseStart?.();

      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: product.mode,
        successUrl: `${window.location.origin}/success?product=${product.id}`,
        cancelUrl: `${window.location.origin}/products`,
      });

      if (url) {
        window.open(url, '_blank');
        onPurchaseComplete?.();
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível iniciar o checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{product.name}</Text>
        {product.price && (
          <Text style={styles.price}>
            {formatPrice(product.price, product.currency)}
          </Text>
        )}
      </View>
      
      <Text style={styles.description}>{product.description}</Text>
      
      <View style={styles.footer}>
        <View style={styles.modeContainer}>
          <Text style={styles.modeText}>
            {product.mode === 'subscription' ? 'Assinatura' : 'Pagamento único'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.purchaseButtonText}>Carregando...</Text>
          ) : (
            <>
              <ShoppingCart size={16} color="#fff" />
              <Text style={styles.purchaseButtonText}>
                {product.mode === 'subscription' ? 'Assinar' : 'Comprar'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeContainer: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});