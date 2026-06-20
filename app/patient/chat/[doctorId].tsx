import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { PatientChatScreen } from './index';
import * as api from '../../../utils/api';

export default function ChatWithDoctorPage() {
  const router = useRouter();
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();

  // Enforce Patient Role
  useEffect(() => {
    const verifyRole = async () => {
      try {
        const userRes = await api.getCurrentUser();
        const role = userRes?.user?.role || userRes?.user?.userType || userRes?.role || userRes?.userType;
        if (role !== 'patient') {
          router.replace('/shared/login');
        }
      } catch (err) {
        router.replace('/shared/login');
      }
    };
    verifyRole();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <PatientChatScreen
        initialDoctorId={doctorId}
        onBack={() => router.push('/patient/dashboard')}
      />
    </SafeAreaView>
  );
}
