import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Save, LogOut, Check, Info } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';
import * as api from '../../utils/api';

type DoctorInfo = {
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews: number;
  patients: number;
  consultationFee: string;
};

type DoctorSettingsProps = {
  doctorInfo: DoctorInfo;
  onBack: () => void;
  onLogout: () => void;
};

export function DoctorSettings({ doctorInfo, onBack, onLogout }: DoctorSettingsProps) {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: doctorInfo.name,
    email: 'ayesha.khan@example.com',
    phone: '+92 300 1234567',
    specialization: doctorInfo.specialization,
    licenseNumber: 'PMC-67890',
    experience: doctorInfo.experience.toString(),
    hospital: 'Aga Khan University Hospital',
    consultationFee: doctorInfo.consultationFee.replace('PKR ', ''),
    bio: 'Experienced dermatologist specializing in acne treatment, pigmentation, and anti-aging solutions. Dedicated to helping patients achieve healthy, glowing skin.',
  });

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        const response = await api.getCurrentUser();
        if (response?.user?.profileImage) {
          setProfileImage(response.user.profileImage);
        }
        if (response?.user) {
          const user = response.user;
          setFormData(prev => ({
            ...prev,
            fullName: user.name || prev.fullName,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
            hospital: user.hospital || prev.hospital,
            consultationFee: user.consultationFee || prev.consultationFee,
            bio: user.bio || prev.bio,
          }));

          if (user.availability && Array.isArray(user.availability) && user.availability.length > 0) {
            const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const loadedAvailability = DAYS_ORDER.map(dayName => {
              const saved = user.availability.find((a: any) => 
                a.day && a.day.toLowerCase() === dayName.toLowerCase()
              );
              return {
                day: dayName,
                from: saved?.startTime || (dayName === 'Saturday' || dayName === 'Sunday' ? '10:00' : '09:00'),
                to: saved?.endTime || (dayName === 'Saturday' || dayName === 'Sunday' ? '14:00' : '17:00'),
                enabled: saved ? (saved.isActive !== undefined ? saved.isActive : true) : (dayName !== 'Sunday'),
              };
            });
            setAvailability(loadedAvailability);
          }
        }
      } catch (e) {
        console.error("Error fetching full doctor data:", e);
      }
    };
    fetchFullData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const DEFAULT_AVAILABILITY = [
    { day: 'Monday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Tuesday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Wednesday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Thursday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Friday', from: '09:00', to: '17:00', enabled: true },
    { day: 'Saturday', from: '10:00', to: '14:00', enabled: true },
    { day: 'Sunday', from: '10:00', to: '14:00', enabled: false },
  ];
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAvailabilityToggle = (index: number, val: boolean) => {
    const updated = [...availability];
    updated[index].enabled = val;
    setAvailability(updated);
  };

  const handleTimeChange = (index: number, field: 'from' | 'to', value: string) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const updates = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        hospital: formData.hospital,
        consultationFee: formData.consultationFee,
        bio: formData.bio,
        profileImage: profileImage,
      };
      await api.updateProfile("me", updates);

      const availabilityPayload = availability.map(item => ({
        day: item.day,
        startTime: item.from,
        endTime: item.to,
        isActive: item.enabled,
      }));
      await api.updateDoctorAvailability(availabilityPayload);

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      Alert.alert("Success", "Profile and availability saved successfully!");
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
      {/* Top Header Section */}
      <View className="bg-white pt-6 pb-8 px-6 rounded-b-[32px] shadow-sm border-b border-gray-100 mb-6">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            onPress={onBack}
            className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-full items-center justify-center hover:bg-gray-100"
          >
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-black tracking-tight">Profile Settings</Text>
          <View className="w-10 h-10" /> {/* Spacer for centering */}
        </View>

        {/* Horizontal Profile Card */}
        <View className="flex-row items-center gap-5">
          <View className="relative shadow-sm">
            <View className="w-24 h-24 bg-white rounded-full p-1 border border-gray-200 overflow-hidden">
              <View className="w-full h-full bg-gray-50 rounded-full items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Text className="text-purple-600 font-extrabold text-2xl">{formData.fullName.charAt(0)}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              onPress={pickImage}
              className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full items-center justify-center shadow-md border-2 border-white"
            >
              <Camera size={14} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-1">
            <Text className="text-gray-900 text-2xl font-black leading-tight mb-1">{formData.fullName}</Text>
            <Text className="text-gray-500 text-xs font-medium mb-2">{formData.email}</Text>
            <View className="self-start bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              <Text className="text-purple-700 font-bold text-[10px] uppercase tracking-widest">{formData.specialization}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 gap-6 pb-12">
        {/* Information Cards Row (Side-by-Side) */}
        <View className="flex-row flex-wrap gap-6">
          {/* Personal Information */}
          <View className="flex-1 min-w-[300px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-black text-gray-900 mb-5 border-b border-gray-50 pb-3">Personal Information</Text>
            <View className="gap-4">
              <View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Full Name</Text>
                <TextInput
                  value={formData.fullName}
                  onChangeText={(text) => handleInputChange('fullName', text)}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm"
                />
              </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Email Address</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm"
                  keyboardType="email-address"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Phone Number</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

              <View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Bio</Text>
                <TextInput
                  value={formData.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-gray-900 font-medium text-sm min-h-[80px]"
                  multiline
                  textAlignVertical="top"
                  placeholder="Tell patients about yourself..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Professional Information */}
          <View className="flex-1 min-w-[300px] bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-black text-gray-900 mb-4 border-b border-gray-50 pb-3">Professional Information</Text>
            
            <View className="bg-purple-50 p-3 rounded-xl mb-5 flex-row items-start gap-2 border border-purple-100">
              <Info size={16} color="#7C3AED" className="mt-0.5" />
              <Text className="text-purple-800 text-xs flex-1 font-medium leading-relaxed">
                Verified details cannot be edited. Contact support if you need to update them.
              </Text>
            </View>

            <View className="gap-4">
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Specialization</Text>
                  <TextInput value={formData.specialization} editable={false} className="w-full px-4 py-3 border border-transparent rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">License Number</Text>
                  <TextInput value={formData.licenseNumber} editable={false} className="w-full px-4 py-3 border border-transparent rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm" />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Experience (Yrs)</Text>
                  <TextInput value={formData.experience} editable={false} className="w-full px-4 py-3 border border-transparent rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Hospital / Clinic</Text>
                  <TextInput value={formData.hospital} onChangeText={(text) => handleInputChange('hospital', text)} className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm" />
                </View>
              </View>

              <View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1">Consultation Fee (PKR)</Text>
                <TextInput value={formData.consultationFee} onChangeText={(text) => handleInputChange('consultationFee', text)} keyboardType="numeric" className="w-full px-4 py-3 border border-gray-100 rounded-2xl bg-gray-50 text-gray-900 font-bold text-sm" />
              </View>
            </View>
          </View>
        </View>

        {/* Availability Schedule */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-black text-gray-900 mb-5 border-b border-gray-50 pb-3">Weekly Availability</Text>
          <View className="gap-3">
            {availability.map((schedule, index) => (
              <View key={schedule.day} className={`p-4 rounded-2xl border ${schedule.enabled ? 'border-purple-200 bg-purple-50/50' : 'border-gray-100 bg-gray-50'} flex-row items-center justify-between`}>
                <View className="flex-row items-center gap-3 w-32">
                  <Switch 
                    value={schedule.enabled} 
                    onValueChange={(val) => handleAvailabilityToggle(index, val)}
                    trackColor={{ false: '#E5E7EB', true: '#C084FC' }}
                    thumbColor={schedule.enabled ? '#7C3AED' : '#F3F4F6'}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                  <Text className={`font-bold text-sm ${schedule.enabled ? 'text-purple-900' : 'text-gray-400'}`}>{schedule.day}</Text>
                </View>

                {schedule.enabled ? (
                  <View className="flex-row items-center gap-2 flex-1 justify-end">
                    <TextInput value={schedule.from} onChangeText={(text) => handleTimeChange(index, 'from', text)} className="px-3 py-2 border border-purple-100 rounded-xl bg-white text-purple-900 font-bold text-xs min-w-[70px] text-center" placeholder="09:00" />
                    <Text className="text-purple-400 font-medium text-xs">to</Text>
                    <TextInput value={schedule.to} onChangeText={(text) => handleTimeChange(index, 'to', text)} className="px-3 py-2 border border-purple-100 rounded-xl bg-white text-purple-900 font-bold text-xs min-w-[70px] text-center" placeholder="17:00" />
                  </View>
                ) : (
                  <Text className="text-gray-400 font-bold text-xs flex-1 text-right pr-2">Not Available</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-2">
          {showSaveSuccess && (
            <View className="bg-green-50 p-4 rounded-2xl border border-green-200 flex-row items-center gap-3 mb-2">
              <Check size={18} color="#16A34A" />
              <Text className="text-green-800 font-bold text-sm">Profile settings saved successfully!</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleSaveChanges} disabled={isSaving} className="bg-purple-600 p-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-purple-200">
            {isSaving ? <ActivityIndicator color="white" /> : (
              <>
                <Save size={18} color="white" />
                <Text className="text-white font-black text-base">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack} className="bg-white border border-gray-200 p-4 rounded-2xl flex-row items-center justify-center">
            <Text className="text-gray-500 font-bold text-base">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity onPress={onLogout} activeOpacity={0.8} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex-row items-center justify-center gap-3 mt-6 mb-4">
          <LogOut size={18} color="#EF4444" />
          <Text className="text-red-600 font-extrabold text-base">Logout from Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function DoctorSettingsPage() {
  const router = useRouter();

  const doctorInfo = {
    name: 'Dr. Ayesha Khan',
    specialization: 'Dermatologist',
    experience: 8,
    rating: 4.8,
    reviews: 124,
    patients: 1500,
    consultationFee: 'PKR 3,000'
  };

  return (
    <View className="flex-1 bg-gray-50">
      <DoctorSettings
        doctorInfo={doctorInfo}
        onBack={() => router.back()}
        onLogout={async () => {
          await api.logout();
          router.replace('/shared/login');
        }}
      />
    </View>
  );
}
