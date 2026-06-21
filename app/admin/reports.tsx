import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertOctagon, CheckCircle, Clock } from 'lucide-react-native';
import * as api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Report = {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
  doctor: {
    _id: string;
    name: string;
    email: string;
    specialization: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
};

export default function AdminReports() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      const response = await fetch(`${api.API_BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setReports(data.reports || []);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-700 pt-12 pb-6 px-6 flex-row items-center rounded-b-3xl shadow-md z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-purple-600 rounded-full mr-4">
          <ArrowLeft color="white" size={20} />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-bold">Doctor Reports</Text>
          <Text className="text-purple-200">{reports.length} total reports filed</Text>
        </View>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4 pt-6">
        {reports.length === 0 ? (
          <View className="items-center justify-center py-20">
            <AlertOctagon color="#D1D5DB" size={64} />
            <Text className="text-gray-400 text-lg mt-4 font-bold">No reports found.</Text>
            <Text className="text-gray-400 mt-2 text-center">There are currently no reports filed against any doctors.</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report._id} className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-red-100 relative overflow-hidden">
              <View className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              
              <View className="flex-row justify-between items-start mb-3 pl-2">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-red-600 mb-1 tracking-wider uppercase">{report.reason}</Text>
                  <Text className="text-lg font-bold text-gray-900">Against: {report.doctor?.name}</Text>
                </View>
                <View className={`flex-row items-center gap-1 px-2 py-1 rounded-md ${
                  report.status === 'resolved' ? 'bg-green-100' :
                  report.status === 'reviewed' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {report.status === 'resolved' ? <CheckCircle size={14} color="#15803D" /> : <Clock size={14} color="#A16207" />}
                  <Text className={`text-xs font-bold ${
                    report.status === 'resolved' ? 'text-green-800' :
                    report.status === 'reviewed' ? 'text-blue-800' : 'text-yellow-800'
                  }`}>{report.status.toUpperCase()}</Text>
                </View>
              </View>

              <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 ml-2">
                <Text className="text-gray-700 italic">"{report.description}"</Text>
              </View>

              <View className="ml-2 flex-row justify-between items-end">
                <View>
                  <Text className="text-xs text-gray-500 mb-1">Reported by</Text>
                  <Text className="text-sm font-bold text-gray-900">{report.patient?.name}</Text>
                  <Text className="text-xs text-gray-500">{report.patient?.email}</Text>
                </View>
                <Text className="text-xs font-medium text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
