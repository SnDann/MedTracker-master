import { Alert, StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Download,
  Upload,
} from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { getMedications, addMedication } from '@/lib/medications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Platform.OS !== 'web') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Permissão de Notificação', 'Permissão para notificações não concedida. Você pode ativá-las nas configurações do seu dispositivo.');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    console.log('Notificações não disponíveis na web.');
  }

  return token;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      const { data, error } = await getMedications(user.id);
      if (error || !data) throw new Error('Erro ao obter medicamentos');
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'medicamentos_export.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar medicamentos',
        UTI: 'public.json',
      });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível exportar os dados.');
    }
  };

  const handleImportData = async () => {
    if (!user) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.canceled || !result.assets || !result.assets[0].uri) return;
      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const imported = JSON.parse(content);
      if (!Array.isArray(imported)) throw new Error('Arquivo inválido');
      let count = 0;
      for (const med of imported) {
        // Evitar duplicatas simples por nome e horários
        await addMedication({ ...med, user_id: user.id });
        count++;
      }
      Alert.alert('Importação concluída', `${count} medicamentos importados com sucesso!`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível importar os dados. Certifique-se de que o arquivo é válido.');
    }
  };

  const handleNotificationSettings = async () => {
    await registerForPushNotificationsAsync();
    
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Notificações',
        'Permissão solicitada! Tentando agendar uma notificação de teste em 5 segundos...',
        [{ text: 'OK' }]
      );
      
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Teste de Notificação!",
          body: 'Esta é uma notificação de teste do MedTracker.',
        },
        trigger: { seconds: 5 },
      });
    } else {
      Alert.alert('Notificações', 'As notificações não estão disponíveis na versão web do aplicativo.');
    }
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacidade',
      'Suas informações de saúde são protegidas e criptografadas. Nunca compartilhamos seus dados pessoais.',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Ajuda',
      'Para suporte, entre em contato conosco através do e-mail: suporte@medtracker.com',
      [{ text: 'OK' }]
    );
  };

  const settingsOptions = [
    {
      icon: Bell,
      title: 'Notificações',
      subtitle: 'Configurar lembretes e alertas',
      onPress: handleNotificationSettings,
    },
    {
      icon: Download,
      title: 'Exportar Dados',
      subtitle: 'Fazer backup dos seus medicamentos',
      onPress: handleExportData,
    },
    {
      icon: Upload,
      title: 'Importar Dados',
      subtitle: 'Importar de outros aplicativos',
      onPress: handleImportData,
    },
    {
      icon: Shield,
      title: 'Privacidade',
      subtitle: 'Segurança dos seus dados',
      onPress: handlePrivacySettings,
    },
    {
      icon: HelpCircle,
      title: 'Ajuda',
      subtitle: 'Suporte e documentação',
      onPress: handleHelp,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={32} color="#007AFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Usuário</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <View style={styles.settingIcon}>
                <option.icon size={20} color="#007AFF" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.signOutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MedTracker v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Desenvolvido para ajudar você a cuidar da sua saúde
          </Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  profileSection: {
    padding: 20,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subscriptionBadge: {
    backgroundColor: '#34C759',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  subscriptionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dangerSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
});