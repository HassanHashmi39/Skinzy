import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, CheckCircle, XCircle } from 'lucide-react-native';
import * as api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

type Doctor = {
  _id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  experience: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'blocked';
  reportCount?: number;
  verificationDocuments?: {
    license?: string;
    cnicFront?: string;
    cnicBack?: string;
    certificate?: string;
  };
};

type PatientInfo = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
};

type FeedbackInfo = {
  _id: string;
  rating: number;
  comment: string;
  patient: PatientInfo;
  createdAt: string;
};

type ReportInfo = {
  _id: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  patient: { name: string; email: string };
  createdAt: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorPatients, setDoctorPatients] = useState<PatientInfo[]>([]);
  const [doctorFeedbacks, setDoctorFeedbacks] = useState<FeedbackInfo[]>([]);
  const [doctorReports, setDoctorReports] = useState<ReportInfo[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [viewDocument, setViewDocument] = useState<{ url: string; title: string } | null>(null);

  // ─── Convert a data: URI to a Blob URL for reliable browser opening ───
  const dataURItoBlob = (dataURI: string): string => {
    const [header, base64] = dataURI.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const byteChars = atob(base64);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
    const blob = new Blob([byteArr], { type: mime });
    return URL.createObjectURL(blob);
  };

  const handleOpenDocument = async (url: string, title: string) => {
    const isPDF = url.startsWith('data:application/pdf') || 
                  url.includes('.pdf') || 
                  (url.startsWith('data:') && url.includes('base64,JVBER'));

    if (isPDF) {
      try {
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        if (Platform.OS === 'web') {
          const blobUrl = url.startsWith('data:') ? dataURItoBlob(url) : url;
          const link = document.createElement('a');
          link.href = blobUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const destPath = `${FileSystem.cacheDirectory}${fileName}`;
          if (url.startsWith('data:')) {
            const base64 = url.split(',')[1];
            await FileSystem.writeAsStringAsync(destPath, base64, { encoding: FileSystem.EncodingType.Base64 });
          } else {
            // @ts-ignore
            await FileSystem.downloadAsync(url, destPath);
          }
          await Sharing.shareAsync(destPath);
        }
      } catch (err) {
        console.error('Failed to open PDF:', err);
        Alert.alert('Error', 'Failed to open PDF document');
      }
    } else {
      // It's an image, open the modal viewer
      setViewDocument({ url, title });
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      const response = await fetch(`${api.API_BASE_URL}/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors || []);
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
    fetchDoctors();
  }, []);

  const fetchDoctorExtraDetails = async (doctorId: string) => {
    setDetailsLoading(true);
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      const response = await fetch(`${api.API_BASE_URL}/admin/doctors/${doctorId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDoctorPatients(data.patients || []);
        setDoctorFeedbacks(data.feedbacks || []);
        setDoctorReports(data.reports || []);
        if (data.doctor) setSelectedDoctor(data.doctor);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleVerify = async (doctorId: string, status: 'verified' | 'rejected') => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      const response = await fetch(`${api.API_BASE_URL}/admin/doctors/${doctorId}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', `Doctor status updated successfully`);
        setSelectedDoctor(null);
        fetchDoctors(); // Refresh list
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    router.replace('/shared/login');
  };

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
      <View className="bg-purple-700 pt-12 pb-6 px-6 rounded-b-3xl shadow-md">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
            <Text className="text-purple-200">System Management</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity 
            className="flex-1 bg-purple-600 py-3 rounded-xl flex-row justify-center items-center gap-2 border border-purple-500"
          >
            <CheckCircle color="white" size={18} />
            <Text className="text-white font-bold">Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/admin/products')}
            className="flex-1 bg-purple-800 py-3 rounded-xl flex-row justify-center items-center gap-2 border border-purple-600"
          >
            <Text className="text-white font-bold">Items & Remedies</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> router.push('/admin/reports')} className="flex-1 bg-red-600 py-3 rounded-xl flex-row justify-center items-center gap-2 border border-red-500 shadow-sm">
            <Text className="text-white font-bold">Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-xl font-bold text-gray-800 mb-4 px-2">Pending Approvals</Text>
        {doctors.filter(d => d.verificationStatus === 'pending').length === 0 ? (
          <Text className="text-gray-500 italic px-2 mb-6">No pending doctors for approval.</Text>
        ) : (
          doctors.filter(d => d.verificationStatus === 'pending').map(doc => (
            <TouchableOpacity 
              key={doc._id} 
              onPress={() => {
                setSelectedDoctor(doc);
                fetchDoctorExtraDetails(doc._id);
              }}
              className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-purple-200 mx-1 relative overflow-hidden"
            >
              <View className="absolute top-0 right-0 bg-purple-100 px-3 py-1 rounded-bl-xl">
                <Text className="text-purple-700 text-xs font-bold">Tap to view documents</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900 mt-1">{doc.name}</Text>
              <Text className="text-purple-600 mb-2 font-medium">{doc.specialization} • {doc.experience} years</Text>
              
              <View className="bg-purple-50 p-4 rounded-xl mb-4 border border-purple-100">
                <Text className="text-sm text-gray-700 mb-1"><Text className="font-bold">Email:</Text> {doc.email}</Text>
                <Text className="text-sm text-gray-700 mb-1"><Text className="font-bold">License:</Text> {doc.licenseNumber || 'N/A'}</Text>
                <Text className="text-sm text-gray-700"><Text className="font-bold">Hospital:</Text> {doc.hospital || 'N/A'}</Text>
              </View>
              
              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity 
                  onPress={(e) => { e.stopPropagation(); handleVerify(doc._id, 'verified'); }}
                  className="flex-1 bg-green-500 py-3 rounded-xl flex-row justify-center items-center gap-2 shadow-sm"
                >
                  <CheckCircle color="white" size={18} />
                  <Text className="text-white font-bold text-base">Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={(e) => { e.stopPropagation(); handleVerify(doc._id, 'rejected'); }}
                  className="flex-1 bg-red-500 py-3 rounded-xl flex-row justify-center items-center gap-2 shadow-sm"
                >
                  <XCircle color="white" size={18} />
                  <Text className="text-white font-bold text-base">Reject</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text className="text-xl font-bold text-gray-800 mt-6 mb-4 px-2">All Doctors</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-1 mb-8 overflow-hidden">
          {doctors.map((doc, index) => (
            <TouchableOpacity 
              key={doc._id} 
              onPress={() => {
                setSelectedDoctor(doc);
                fetchDoctorExtraDetails(doc._id);
              }}
              className={`p-4 flex-row justify-between items-center ${index !== doctors.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <View className="flex-1 mr-2">
                <Text className="text-base font-bold text-gray-900">{doc.name}</Text>
                <Text className="text-sm text-gray-500">{doc.specialization}</Text>
                {doc.reportCount && doc.reportCount > 0 ? (
                  <View className="mt-1 flex-row items-center">
                    <View className="bg-red-100 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                      <Text className="text-xs font-bold text-red-700">⚠️ {doc.reportCount} Report(s)</Text>
                    </View>
                  </View>
                ) : null}
              </View>
              <View className={`px-3 py-1.5 rounded-full ${
                doc.verificationStatus === 'verified' ? 'bg-green-100' : 
                doc.verificationStatus === 'rejected' ? 'bg-red-100' : 
                doc.verificationStatus === 'blocked' ? 'bg-gray-200' : 'bg-yellow-100'
              }`}>
                <Text className={`text-[10px] tracking-wider font-bold ${
                  doc.verificationStatus === 'verified' ? 'text-green-700' : 
                  doc.verificationStatus === 'rejected' ? 'text-red-700' : 
                  doc.verificationStatus === 'blocked' ? 'text-gray-700' : 'text-yellow-700'
                }`}>{doc.verificationStatus.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {doctors.length === 0 && (
            <View className="p-6 items-center justify-center">
              <Text className="text-gray-400">No doctors found.</Text>
            </View>
          )}
        </View>
        <View className="h-10" />
      </ScrollView>

      {/* Doctor Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedDoctor}
        onRequestClose={() => setSelectedDoctor(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">Doctor Details</Text>
              <TouchableOpacity onPress={() => setSelectedDoctor(null)} className="p-2 bg-gray-100 rounded-full">
                <XCircle color="#374151" size={24} />
              </TouchableOpacity>
            </View>

            {selectedDoctor && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-6">
                  <View className="w-24 h-24 bg-purple-100 rounded-full items-center justify-center mb-3 border-4 border-purple-50">
                    <Text className="text-3xl font-bold text-purple-700">{selectedDoctor.name.charAt(0)}</Text>
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 text-center">{selectedDoctor.name}</Text>
                  <Text className="text-base text-purple-600 font-medium">{selectedDoctor.specialization}</Text>
                  <View className={`mt-3 px-4 py-1.5 rounded-full ${
                    selectedDoctor.verificationStatus === 'verified' ? 'bg-green-100' : 
                    selectedDoctor.verificationStatus === 'rejected' ? 'bg-red-100' : 
                    selectedDoctor.verificationStatus === 'blocked' ? 'bg-gray-200' : 'bg-yellow-100'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      selectedDoctor.verificationStatus === 'verified' ? 'text-green-700' : 
                      selectedDoctor.verificationStatus === 'rejected' ? 'text-red-700' : 
                      selectedDoctor.verificationStatus === 'blocked' ? 'text-gray-700' : 'text-yellow-700'
                    }`}>{selectedDoctor.verificationStatus.toUpperCase()}</Text>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                  <Text className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Professional Info</Text>
                  
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1">Email Address</Text>
                    <Text className="text-base text-gray-900 font-medium">{selectedDoctor.email}</Text>
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1">Experience</Text>
                    <Text className="text-base text-gray-900 font-medium">{selectedDoctor.experience} Years</Text>
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1">Hospital/Clinic</Text>
                    <Text className="text-base text-gray-900 font-medium">{selectedDoctor.hospital || 'Not Specified'}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-sm text-gray-500 mb-1">License Number</Text>
                    <Text className="text-base text-gray-900 font-medium">{selectedDoctor.licenseNumber || 'Not Specified'}</Text>
                  </View>
                </View>

                {/* Documents Section */}
                {selectedDoctor.verificationDocuments && Object.values(selectedDoctor.verificationDocuments).some(v => v) && (
                  <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Verification Documents</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 pb-2">
                      {selectedDoctor.verificationDocuments.license && (
                        <TouchableOpacity 
                          onPress={() => handleOpenDocument(selectedDoctor.verificationDocuments!.license!, 'Medical_License')}
                          className="bg-purple-50 px-4 py-3 rounded-xl border border-purple-100 flex-row items-center gap-2"
                        >
                          <Text className="text-purple-700 font-bold">📄 License</Text>
                        </TouchableOpacity>
                      )}
                      {selectedDoctor.verificationDocuments.cnicFront && (
                        <TouchableOpacity 
                          onPress={() => handleOpenDocument(selectedDoctor.verificationDocuments!.cnicFront!, 'CNIC_Front')}
                          className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 flex-row items-center gap-2"
                        >
                          <Text className="text-blue-700 font-bold">🪪 CNIC Front</Text>
                        </TouchableOpacity>
                      )}
                      {selectedDoctor.verificationDocuments.cnicBack && (
                        <TouchableOpacity 
                          onPress={() => handleOpenDocument(selectedDoctor.verificationDocuments!.cnicBack!, 'CNIC_Back')}
                          className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 flex-row items-center gap-2"
                        >
                          <Text className="text-blue-700 font-bold">🪪 CNIC Back</Text>
                        </TouchableOpacity>
                      )}
                      {selectedDoctor.verificationDocuments.certificate && (
                        <TouchableOpacity 
                          onPress={() => handleOpenDocument(selectedDoctor.verificationDocuments!.certificate!, 'Certificate')}
                          className="bg-green-50 px-4 py-3 rounded-xl border border-green-100 flex-row items-center gap-2"
                        >
                          <Text className="text-green-700 font-bold">🎓 Certificate</Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Patients Section */}
                <View className="mb-6">
                  <Text className="text-xl font-bold text-gray-900 mb-4">Patients ({doctorPatients.length})</Text>
                  {detailsLoading ? (
                    <ActivityIndicator size="small" color="#9333EA" />
                  ) : doctorPatients.length === 0 ? (
                    <Text className="text-gray-500 italic">No patients yet.</Text>
                  ) : (
                    <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      {doctorPatients.map((p, index) => (
                        <View key={p._id} className={`p-4 flex-row items-center ${index !== doctorPatients.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                            <Text className="font-bold text-purple-700">{p.name.charAt(0)}</Text>
                          </View>
                          <View>
                            <Text className="text-base font-bold text-gray-900">{p.name}</Text>
                            <Text className="text-sm text-gray-500">{p.email}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Feedback Section */}
                <View className="mb-6">
                  <Text className="text-xl font-bold text-gray-900 mb-4">Feedback ({doctorFeedbacks.length})</Text>
                  {detailsLoading ? (
                    <ActivityIndicator size="small" color="#9333EA" />
                  ) : doctorFeedbacks.length === 0 ? (
                    <Text className="text-gray-500 italic">No feedback yet.</Text>
                  ) : (
                    <View className="gap-3">
                      {doctorFeedbacks.map((f) => (
                        <View key={f._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                          <View className="flex-row justify-between mb-2 items-center">
                            <Text className="font-bold text-gray-900">{f.patient?.name || 'Unknown Patient'}</Text>
                            <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-md">
                              <Text className="text-yellow-700 font-bold text-xs">{f.rating} ★</Text>
                            </View>
                          </View>
                          {f.comment ? (
                            <Text className="text-gray-700">{f.comment}</Text>
                          ) : (
                            <Text className="text-gray-400 italic">No written comment</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Reports Section */}
                <View className="mb-6">
                  <Text className="text-xl font-bold text-red-600 mb-4">Reports Against Doctor ({doctorReports.length})</Text>
                  {detailsLoading ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : doctorReports.length === 0 ? (
                    <Text className="text-gray-500 italic">No reports filed.</Text>
                  ) : (
                    <View className="gap-3">
                      {doctorReports.map((r) => (
                        <View key={r._id} className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
                          <View className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                          <View className="flex-row justify-between mb-2 items-center pl-2">
                            <Text className="font-bold text-gray-900">{r.patient?.name || 'Unknown Patient'}</Text>
                            <Text className="text-xs font-bold text-red-700 uppercase">{r.reason}</Text>
                          </View>
                          <Text className="text-gray-700 italic pl-2">"{r.description}"</Text>
                          <Text className="text-xs text-gray-400 mt-2 pl-2">{new Date(r.createdAt).toLocaleDateString()}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="mt-2 mb-8 gap-3">
                  {selectedDoctor.verificationStatus === 'pending' && (
                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        onPress={() => handleVerify(selectedDoctor._id, 'verified')}
                        className="flex-1 bg-green-500 py-4 rounded-xl flex-row justify-center items-center gap-2 shadow-sm"
                      >
                        <CheckCircle color="white" size={20} />
                        <Text className="text-white font-bold text-lg">Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleVerify(selectedDoctor._id, 'rejected')}
                        className="flex-1 bg-red-500 py-4 rounded-xl flex-row justify-center items-center gap-2 shadow-sm"
                      >
                        <XCircle color="white" size={20} />
                        <Text className="text-white font-bold text-lg">Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {selectedDoctor.verificationStatus === 'verified' && (
                    <TouchableOpacity 
                      onPress={() => handleVerify(selectedDoctor._id, 'blocked')}
                      className="w-full bg-gray-800 py-4 rounded-xl flex-row justify-center items-center gap-2 shadow-sm"
                    >
                      <XCircle color="white" size={20} />
                      <Text className="text-white font-bold text-lg">Block Doctor</Text>
                    </TouchableOpacity>
                  )}

                  {(selectedDoctor.verificationStatus === 'blocked' || selectedDoctor.verificationStatus === 'rejected') && (
                    <TouchableOpacity 
                      onPress={() => handleVerify(selectedDoctor._id, 'verified')}
                      className="w-full bg-green-500 py-4 rounded-xl flex-row justify-center items-center gap-2 shadow-sm"
                    >
                      <CheckCircle color="white" size={20} />
                      <Text className="text-white font-bold text-lg">Unblock & Approve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal visible={!!viewDocument} transparent={true} animationType="fade" onRequestClose={() => setViewDocument(null)}>
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity onPress={() => setViewDocument(null)} className="absolute top-12 right-6 p-2 bg-white/20 rounded-full z-10">
            <XCircle color="white" size={32} />
          </TouchableOpacity>
          {viewDocument && (
            <View className="w-full h-[80%] items-center justify-center p-4">
              <Text className="text-white text-xl font-bold mb-4">{viewDocument.title}</Text>
              <View className="w-full flex-1">
                 <Image source={{ uri: viewDocument.url }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} accessibilityLabel={viewDocument.title} />
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
