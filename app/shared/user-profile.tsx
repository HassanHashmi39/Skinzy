import { useRouter } from 'expo-router';
import { 
    ArrowLeft, Camera, LogOut, Mail, Settings, Shield, User, MapPin, 
    Calendar, Smartphone, Save, Activity, Heart, ShieldAlert, Thermometer, 
    UserSquare2, Clock, CreditCard, Check, Award, Sparkles, Bell, ToggleLeft, 
    ToggleRight, Info, CheckCircle2
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { 
    ActivityIndicator,
    Alert,
    Image, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    View,
    TextInput,
    Platform,
    Switch
} from 'react-native';
import * as api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const CONCERN_OPTIONS = [
    'Acne',
    'Pigmentation',
    'Dryness',
    'Oiliness',
    'Dark Circles',
    'Sensitivity',
    'Redness',
    'Fine Lines',
    'Sun Damage',
    'Eczema'
];

const SKIN_TYPES = [
    'Normal',
    'Oily',
    'Dry',
    'Combination',
    'Sensitive'
];

export default function UserProfile() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'medical' | 'settings'>('details');
    const [userData, setUserData] = useState<any>(null);
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        age: '',
        gender: '',
        skinType: '',
        allergies: '',
        chronicConditions: '',
        currentMedications: '',
        
        // Doctor Specific
        specialization: '',
        licenseNumber: '',
        experience: '',
        hospital: '',
        consultationFee: '',
    });
    
    const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
    const [shareData, setShareData] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await api.getCurrentUser();
            if (response && response.user) {
                const user = response.user;
                setUserData(user);
                
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    city: user.city || '',
                    age: user.age?.toString() || '',
                    gender: user.gender || '',
                    skinType: user.skinType || '',
                    allergies: user.allergies || '',
                    chronicConditions: user.chronicConditions || '',
                    currentMedications: user.currentMedications || '',
                    
                    specialization: user.specialization || '',
                    licenseNumber: user.licenseNumber || '',
                    experience: user.experience || '',
                    hospital: user.hospital || '',
                    consultationFee: user.consultationFee || '',
                });

                if (Array.isArray(user.mainConcerns)) {
                    setSelectedConcerns(user.mainConcerns);
                } else if (typeof user.mainConcerns === 'string' && user.mainConcerns.trim() !== '') {
                    setSelectedConcerns(user.mainConcerns.split(',').map((s: string) => s.trim()));
                } else {
                    setSelectedConcerns([]);
                }

                setShareData(user.shareDataWithDoctors !== false);
                setProfileImage(user.profileImage || null);

                if ((user.role || user.userType) === 'patient') {
                    try {
                        const analysesRes = await api.getAnalysisHistory();
                        if (analysesRes?.analyses && analysesRes.analyses.length > 0) {
                            setLatestAnalysis(analysesRes.analyses[0]);
                        } else {
                            setLatestAnalysis(null);
                        }
                    } catch (e) {
                        console.error('Profile analysis fetch error:', e);
                    }
                }
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Profile fetch error:', error);
            setIsLoading(false);
        }
    };

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

    const handleUpdateProfile = async () => {
        try {
            setIsUpdating(true);
            const updates = {
                ...formData,
                age: formData.age ? parseInt(formData.age) : undefined,
                mainConcerns: selectedConcerns,
                shareDataWithDoctors: shareData,
                profileImage,
            };
            const response = await api.updateProfile('me', updates);
            if (response && response.user) {
                setUserData(response.user);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully!');
            }
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            router.replace('/');
        } catch (err) {
            await AsyncStorage.removeItem('sessionToken');
            router.replace('/');
        }
    };

    const toggleConcern = (concern: string) => {
        setSelectedConcerns(prev => 
            prev.includes(concern) 
                ? prev.filter(c => c !== concern) 
                : [...prev, concern]
        );
    };

    if (isLoading && !userData) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    const isPatient = (userData?.role || userData?.userType) === 'patient';
    const initials = userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US';

    const getCalculatedScore = () => {
        if (!latestAnalysis || !latestAnalysis.results) return null;
        const issues = latestAnalysis.results.issues;
        if (issues) {
            const avg = ((issues.acne || 0) + (issues.pigmentation || 0) + (issues.dryness || 0) + (issues.oiliness || 0) + (issues.sensitivity || 0)) / 5;
            return Math.round(100 - avg);
        }
        return null;
    };
    const calculatedScore = getCalculatedScore();

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <ScrollView style={{ flex: 1 }} className="bg-gray-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
                {/* Top Navigation Row */}
                <View className="flex-row justify-between items-center mb-6 px-6 pt-6">
                    <TouchableOpacity 
                        onPress={() => isEditing ? setIsEditing(false) : router.replace(isPatient ? '/patient/dashboard' : '/doctor/dashboard' as any)}
                        className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-full items-center justify-center"
                    >
                        <ArrowLeft size={20} color="#1F2937" />
                    </TouchableOpacity>
                    
                    <Text className="text-gray-900 text-lg font-black tracking-tight">
                        {isEditing ? 'Edit Profile Settings' : 'My Health Profile'}
                    </Text>
                    
                    <TouchableOpacity 
                        onPress={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                        className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-full items-center justify-center"
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#7C3AED" />
                        ) : (
                            isEditing ? <Check size={20} color="#1F2937" /> : <Settings size={20} color="#1F2937" />
                        )}
                    </TouchableOpacity>
                </View>

                <View className="px-6">
                    {/* Professional Horizontal Profile Card */}
                    <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-row items-center gap-6 mb-6">
                        {/* Avatar Area with persistent camera button */}
                        <View className="relative shadow-sm">
                            <View className="w-24 h-24 bg-white rounded-full p-1 border border-gray-200 overflow-hidden">
                                <View className="w-full h-full bg-gray-50 rounded-full items-center justify-center overflow-hidden">
                                    {profileImage ? (
                                        <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <Text className="text-purple-600 font-extrabold text-2xl">{initials}</Text>
                                    )}
                                </View>
                            </View>
                            <TouchableOpacity 
                                onPress={() => {
                                    if (!isEditing) setIsEditing(true);
                                    pickImage();
                                }}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full items-center justify-center shadow-md border-2 border-white"
                            >
                                <Camera size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                        
                        {/* User Info Area */}
                        <View className="flex-1">
                            <Text className="text-gray-900 text-2xl font-black leading-tight mb-1">{userData?.name || 'User'}</Text>
                            <Text className="text-gray-500 text-xs font-medium mb-3">{userData?.email}</Text>
                            
                            <View className="self-start bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 flex-row items-center gap-1.5">
                                <Shield size={12} color="#6D28D9" />
                                <Text className="text-purple-700 font-extrabold text-[10px] uppercase tracking-widest">
                                    {userData?.role || userData?.userType || 'Patient'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Segmented Control / Tabs Switcher */}
                    <View className="bg-white rounded-2xl p-1 shadow-sm flex-row justify-between mb-6 border border-gray-100">
                        <TouchableOpacity 
                            onPress={() => setActiveTab('details')}
                            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'details' ? 'bg-purple-600 shadow-sm' : ''}`}
                        >
                            <Text className={`font-black text-xs uppercase tracking-wider ${activeTab === 'details' ? 'text-white' : 'text-gray-500'}`}>
                                👤 Details
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setActiveTab('medical')}
                            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'medical' ? 'bg-purple-600 shadow-sm' : ''}`}
                        >
                            <Text className={`font-black text-xs uppercase tracking-wider ${activeTab === 'medical' ? 'text-white' : 'text-gray-500'}`}>
                                {isPatient ? '🩺 Skin Profile' : '🎓 Professional'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={() => setActiveTab('settings')}
                            className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'settings' ? 'bg-purple-600 shadow-sm' : ''}`}
                        >
                            <Text className={`font-black text-xs uppercase tracking-wider ${activeTab === 'settings' ? 'text-white' : 'text-gray-500'}`}>
                                ⚙️ Preferences
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab 1: Personal Details */}
                    {activeTab === 'details' && (
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                            <View className="flex-row justify-between items-center mb-5 border-b border-gray-50 pb-3">
                                <Text className="text-gray-900 font-black text-lg">Personal Details</Text>
                                {!isEditing && (
                                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                                        <Text className="text-purple-600 font-bold text-xs uppercase">Edit</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            {isEditing ? (
                                <View className="gap-3.5">
                                    <EditField label="Full Name" icon={<User size={16} color="#7C3AED" />} value={formData.name} onChange={(val) => setFormData({...formData, name: val})} />
                                    <EditField label="Phone Number" icon={<Smartphone size={16} color="#7C3AED" />} value={formData.phone} onChange={(val) => setFormData({...formData, phone: val})} keyboardType="phone-pad" />
                                    <EditField label="Location/City" icon={<MapPin size={16} color="#7C3AED" />} value={formData.city} onChange={(val) => setFormData({...formData, city: val})} />
                                    
                                    {isPatient && (
                                        <View className="flex-row gap-4">
                                            <View className="flex-1">
                                                <EditField label="Age" icon={<Calendar size={16} color="#7C3AED" />} value={formData.age} onChange={(val) => setFormData({...formData, age: val})} keyboardType="numeric" />
                                            </View>
                                            <View className="flex-1">
                                                <EditField label="Gender" icon={<UserSquare2 size={16} color="#7C3AED" />} value={formData.gender} onChange={(val) => setFormData({...formData, gender: val})} placeholder="e.g. Male, Female" />
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View className="gap-4">
                                    <InfoRow icon={<Mail size={18} color="#7C3AED" />} label="Email Address" value={userData?.email || 'N/A'} />
                                    <InfoRow icon={<Smartphone size={18} color="#7C3AED" />} label="Phone Number" value={userData?.phone || 'Not provided'} />
                                    <InfoRow icon={<MapPin size={18} color="#7C3AED" />} label="City / Location" value={userData?.city || 'Pakistan'} />
                                    {isPatient && (
                                        <>
                                            <InfoRow icon={<Calendar size={18} color="#7C3AED" />} label="Age" value={userData?.age ? `${userData.age} years old` : 'Not provided'} />
                                            <InfoRow icon={<UserSquare2 size={18} color="#7C3AED" />} label="Gender" value={userData?.gender || 'Not specified'} />
                                        </>
                                    )}
                                    <InfoRow icon={<Clock size={18} color="#7C3AED" />} label="Member Since" value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : 'March 2025'} />
                                </View>
                            )}
                        </View>
                    )}

                    {/* Tab 2: Medical / Professional Details */}
                    {activeTab === 'medical' && (
                        isPatient ? (
                            /* Patient Skin & Medical details */
                            <View className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                                <View className="flex-row justify-between items-center mb-5 border-b border-gray-50 pb-3">
                                    <Text className="text-gray-900 font-black text-lg">Skin & Medical Profile</Text>
                                    {!isEditing && (
                                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                                            <Text className="text-purple-600 font-bold text-xs uppercase">Edit</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {isEditing ? (
                                    <View className="gap-4">
                                        {/* Skin Type selector */}
                                        <View className="mb-2">
                                            <View className="flex-row items-center gap-2 mb-2 ml-1">
                                                <Activity size={16} color="#7C3AED" />
                                                <Text className="text-gray-400 text-xs font-bold uppercase">Skin Type</Text>
                                            </View>
                                            <View className="flex-row flex-wrap gap-2">
                                                {SKIN_TYPES.map(type => (
                                                    <TouchableOpacity 
                                                        key={type}
                                                        onPress={() => setFormData({...formData, skinType: type})}
                                                        className={`px-4 py-2.5 rounded-2xl border ${formData.skinType === type ? 'bg-purple-600 border-purple-600' : 'bg-gray-50 border-gray-200'}`}
                                                    >
                                                        <Text className={`font-bold text-xs ${formData.skinType === type ? 'text-white' : 'text-gray-500'}`}>{type}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Interactive Concerns Selector */}
                                        <View className="mb-2">
                                            <View className="flex-row items-center gap-2 mb-2 ml-1">
                                                <Sparkles size={16} color="#7C3AED" />
                                                <Text className="text-gray-400 text-xs font-bold uppercase">Skin Concerns (Tap to select)</Text>
                                            </View>
                                            <View className="flex-row flex-wrap gap-2">
                                                {CONCERN_OPTIONS.map(concern => {
                                                    const isSelected = selectedConcerns.includes(concern);
                                                    return (
                                                        <TouchableOpacity 
                                                            key={concern}
                                                            onPress={() => toggleConcern(concern)}
                                                            className={`px-3.5 py-2 rounded-2xl border flex-row items-center gap-1.5 ${isSelected ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'}`}
                                                        >
                                                            {isSelected && <Check size={12} color="#7C3AED" />}
                                                            <Text className={`font-bold text-xs ${isSelected ? 'text-purple-700' : 'text-gray-500'}`}>{concern}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>

                                        <EditField label="Allergies" icon={<Heart size={16} color="#7C3AED" />} value={formData.allergies} onChange={(val) => setFormData({...formData, allergies: val})} placeholder="e.g. Penicillin, Citrus oils" />
                                        <EditField label="Chronic Conditions" icon={<ShieldAlert size={16} color="#7C3AED" />} value={formData.chronicConditions} onChange={(val) => setFormData({...formData, chronicConditions: val})} placeholder="e.g. Eczema flare-ups" />
                                        <EditField label="Current Medications" icon={<Thermometer size={16} color="#7C3AED" />} value={formData.currentMedications} onChange={(val) => setFormData({...formData, currentMedications: val})} placeholder="e.g. Salicylic toner, Retinol cream" />
                                    </View>
                                ) : (
                                    <View className="gap-5">
                                        {/* Skin Type Badge */}
                                        <View className="flex-row items-center justify-between bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                                            <View>
                                                <Text className="text-gray-400 text-xs font-bold uppercase mb-0.5">Assessed Skin Type</Text>
                                                <Text className="text-purple-900 font-extrabold text-lg">{latestAnalysis?.results?.skinType || userData?.skinType || 'Not Assessed'}</Text>
                                            </View>
                                            <View className="bg-purple-600 px-3.5 py-2 rounded-xl">
                                                <Text className="text-white font-black text-xs uppercase tracking-wider">Score: {calculatedScore !== null ? `${calculatedScore}%` : 'N/A'}</Text>
                                            </View>
                                        </View>

                                        {/* Active Concerns List */}
                                        <View>
                                            <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Tracked Skin Concerns</Text>
                                            <View className="flex-row flex-wrap gap-2">
                                                {selectedConcerns.length > 0 ? (
                                                    selectedConcerns.map(c => (
                                                        <View key={c} className="bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full">
                                                            <Text className="text-purple-700 font-extrabold text-xs uppercase">{c}</Text>
                                                        </View>
                                                    ))
                                                ) : (
                                                    <View className="p-4 bg-gray-50 rounded-2xl w-full border border-dashed border-gray-200">
                                                        <Text className="text-gray-400 text-xs italic">No active concerns registered. Update profile to add concerns.</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        <InfoRow icon={<Heart size={18} color="#7C3AED" />} label="Allergies" value={userData?.allergies || 'None recorded'} />
                                        <InfoRow icon={<ShieldAlert size={18} color="#7C3AED" />} label="Chronic Conditions" value={userData?.chronicConditions || 'None recorded'} />
                                        <InfoRow icon={<Thermometer size={18} color="#7C3AED" />} label="Current Medications" value={userData?.currentMedications || 'None'} />
                                    </View>
                                )}
                            </View>
                        ) : (
                            /* Doctor Professional details */
                            <View className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50">
                                <View className="flex-row justify-between items-center mb-5 border-b border-gray-50 pb-3">
                                    <Text className="text-gray-900 font-black text-lg">Professional Credentials</Text>
                                    {!isEditing && (
                                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                                            <Text className="text-purple-600 font-bold text-xs uppercase">Edit</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {isEditing ? (
                                    <View className="gap-3.5">
                                        <EditField label="Specialization" icon={<Activity size={16} color="#7C3AED" />} value={formData.specialization} onChange={(val) => setFormData({...formData, specialization: val})} />
                                        <EditField label="Medical License Number" icon={<Award size={16} color="#7C3AED" />} value={formData.licenseNumber} onChange={(val) => setFormData({...formData, licenseNumber: val})} />
                                        <EditField label="Years of Experience" icon={<Calendar size={16} color="#7C3AED" />} value={formData.experience} onChange={(val) => setFormData({...formData, experience: val})} keyboardType="numeric" />
                                        <EditField label="Affiliated Hospital" icon={<MapPin size={16} color="#7C3AED" />} value={formData.hospital} onChange={(val) => setFormData({...formData, hospital: val})} />
                                        <EditField label="Consultation Fee (PKR)" icon={<CreditCard size={16} color="#7C3AED" />} value={formData.consultationFee} onChange={(val) => setFormData({...formData, consultationFee: val})} keyboardType="numeric" />
                                    </View>
                                ) : (
                                    <View className="gap-4">
                                        <InfoRow icon={<Award size={18} color="#7C3AED" />} label="Field of Specialty" value={userData?.specialization || 'Clinical Dermatologist'} />
                                        <InfoRow icon={<Shield size={18} color="#7C3AED" />} label="Medical License" value={userData?.licenseNumber || 'Unverified'} />
                                        <InfoRow icon={<Clock size={18} color="#7C3AED" />} label="Professional Experience" value={userData?.experience ? `${userData.experience} years practice` : 'Not provided'} />
                                        <InfoRow icon={<MapPin size={18} color="#7C3AED" />} label="Primary Hospital" value={userData?.hospital || 'Private Clinic'} />
                                        <InfoRow icon={<CreditCard size={18} color="#7C3AED" />} label="Consultation Fee" value={userData?.consultationFee ? `PKR ${userData.consultationFee}` : 'PKR 2,500'} />
                                    </View>
                                )}
                            </View>
                        )
                    )}

                    {/* Tab 3: Settings & Preferences */}
                    {activeTab === 'settings' && (
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-purple-50 gap-6">
                            <View className="border-b border-gray-50 pb-3">
                                <Text className="text-gray-900 font-black text-lg">Preferences & Security</Text>
                            </View>

                            {/* Toggles List */}
                            <View className="gap-5">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-gray-900 font-bold text-sm">Skincare Routine Reminders</Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">Get notified for morning & evening skincare steps</Text>
                                    </View>
                                    <Switch 
                                        value={notificationsEnabled} 
                                        onValueChange={setNotificationsEnabled}
                                        trackColor={{ false: '#E5E7EB', true: '#C084FC' }}
                                        thumbColor={notificationsEnabled ? '#7C3AED' : '#F3F4F6'}
                                    />
                                </View>

                                {isPatient && (
                                    <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
                                        <View className="flex-1 mr-4">
                                            <Text className="text-gray-900 font-bold text-sm">Share Analysis History</Text>
                                            <Text className="text-gray-400 text-xs mt-0.5">Allow consulting dermatologists to review your AI scans</Text>
                                        </View>
                                        <Switch 
                                            value={shareData} 
                                            onValueChange={(val) => {
                                                setShareData(val);
                                                if (isEditing) {
                                                    // Immediately sync form state if in editing mode
                                                }
                                            }}
                                            trackColor={{ false: '#E5E7EB', true: '#C084FC' }}
                                            thumbColor={shareData ? '#7C3AED' : '#F3F4F6'}
                                        />
                                    </View>
                                )}
                            </View>

                            {/* Export Medical Records */}
                            {isPatient && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        Alert.alert('Report Exported', 'Your clinical summary report and skin analysis history has been successfully exported to your device cache.');
                                    }}
                                    className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex-row items-center justify-between mt-2"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <Activity size={20} color="#7C3AED" />
                                        <View>
                                            <Text className="text-purple-900 font-extrabold text-sm">Export Health Report</Text>
                                            <Text className="text-purple-600 text-[10px]">Download PDF summary of diagnostics</Text>
                                        </View>
                                    </View>
                                    <Text className="text-purple-600 font-bold text-xs uppercase">Export</Text>
                                </TouchableOpacity>
                            )}

                            {/* Sign Out Button */}
                            <TouchableOpacity 
                                onPress={handleLogout}
                                className="bg-red-50 border border-red-100 p-4 rounded-2xl flex-row items-center gap-3 mt-4"
                            >
                                <LogOut size={20} color="#EF4444" />
                                <View>
                                    <Text className="text-red-600 font-extrabold text-sm">Sign Out Account</Text>
                                    <Text className="text-red-400 text-[10px]">Safely log out of your current session</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Safe Edit Mode Action Buttons */}
                    {isEditing && (
                        <View className="mt-6 gap-3">
                            <TouchableOpacity 
                                onPress={handleUpdateProfile}
                                disabled={isUpdating}
                                className="bg-purple-600 p-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-purple-200"
                            >
                                {isUpdating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Save size={18} color="white" />
                                        <Text className="text-white font-black text-base">Save Profile Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={() => {
                                    setIsEditing(false);
                                    fetchProfile(); // Reset fields to initial state
                                }}
                                className="bg-white border border-gray-200 p-4 rounded-2xl flex-row items-center justify-center"
                            >
                                <Text className="text-gray-500 font-bold text-base">Cancel Edits</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function EditField({ label, value, onChange, icon, placeholder, keyboardType = 'default' }: { label: string, value: string, onChange: (val: string) => void, icon?: any, placeholder?: string, keyboardType?: any }) {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View className="mb-2">
            <View className="flex-row items-center gap-2 mb-1.5 ml-1">
                {icon}
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{label}</Text>
            </View>
            <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`bg-gray-50 p-4 rounded-2xl text-gray-900 font-bold text-sm border ${isFocused ? 'border-purple-500 bg-white' : 'border-gray-100'}`}
            />
        </View>
    );
}

function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <View className="flex-row items-center gap-4 py-1.5">
            <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center">
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">{label}</Text>
                <Text className="text-gray-900 font-extrabold text-sm mt-0.5" numberOfLines={1}>{value}</Text>
            </View>
        </View>
    );
}
