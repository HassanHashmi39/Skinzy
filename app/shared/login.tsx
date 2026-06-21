import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    KeyboardAvoidingView, 
    Modal,
    Platform, 
    ScrollView, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import * as api from '../../utils/api';
import { isValidEmail } from '../../utils/validation';
import Toast from '../../components/Toast';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Forgot Password state
    const [forgotModalVisible, setForgotModalVisible] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotNewPassword, setForgotNewPassword] = useState('');
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [forgotOtp, setForgotOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Validation state
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    
    const showToast = (message: string, type: 'success' | 'error') => {
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    };

    const handleEmailChange = (val: string) => {
        setEmail(val);
        setLoginError('');
        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
    };

    const handlePasswordChange = (val: string) => {
        setPassword(val);
        setLoginError('');
        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
    };

    const handleLogin = async () => {
        const newErrors: Record<string, string> = {};
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email.trim())) {
            newErrors.email = 'Please enter a valid email address.';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.signIn(email.trim(), password);
            
            if (response && response.token) {
                const role = response.role || response.user?.role || response.user?.userType;
                
                if (!role) {
                    showToast("Account role is missing. Please contact support.", "error");
                    setIsLoading(false);
                    return;
                }

                showToast(role === 'doctor' ? "Doctor login successful" : role === 'admin' ? "Admin login successful" : "Patient login successful", "success");
                
                setTimeout(() => {
                    setIsLoading(false);
                    if (role === 'doctor') {
                        router.replace('/doctor/dashboard' as any);
                    } else if (role === 'admin') {
                        router.replace('/admin/dashboard' as any);
                    } else {
                        router.replace('/patient/dashboard' as any);
                    }
                }, 1000);
            } else {
                showToast(response?.message || 'Invalid credentials', "error");
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setLoginError(error.message || 'Unable to connect. Please try again later.');
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!forgotEmail.trim()) {
            if (Platform.OS === 'web') window.alert('Please enter your email address.');
            else Alert.alert('Error', 'Please enter your email address.');
            return;
        }
        if (!isValidEmail(forgotEmail.trim())) {
            if (Platform.OS === 'web') window.alert('Please enter a valid email address.');
            else Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        try {
            setIsSendingOtp(true);
            const response = await api.forgotPassword(forgotEmail.trim());
            showToast(response?.message || 'Verification code sent successfully', 'success');
            setOtpSent(true);
        } catch (error: any) {
            console.error('Send OTP error:', error);
            if (Platform.OS === 'web') window.alert(error.message || 'Failed to send verification code.');
            else Alert.alert('Error', error.message || 'Failed to send verification code.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleResetPassword = async () => {
        if (!forgotOtp.trim()) {
            if (Platform.OS === 'web') window.alert('Please enter the OTP verification code.');
            else Alert.alert('Error', 'Please enter the OTP verification code.');
            return;
        }
        if (!forgotNewPassword) {
            if (Platform.OS === 'web') window.alert('Please enter a new password.');
            else Alert.alert('Error', 'Please enter a new password.');
            return;
        }
        if (forgotNewPassword.length < 6) {
            if (Platform.OS === 'web') window.alert('Password must be at least 6 characters long.');
            else Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }
        if (forgotNewPassword !== forgotConfirmPassword) {
            if (Platform.OS === 'web') window.alert('Passwords do not match.');
            else Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            setIsResetting(true);
            const response = await api.resetPassword(forgotEmail.trim(), forgotOtp.trim(), forgotNewPassword);
            showToast(response?.message || 'Password has been reset successfully', 'success');
            if (Platform.OS === 'web') window.alert(response?.message || 'Password reset successful!');
            else Alert.alert('Success', response?.message || 'Password reset successful!');
            setForgotModalVisible(false);
            setForgotOtp('');
            setOtpSent(false);
            setForgotNewPassword('');
            setForgotConfirmPassword('');
            setEmail(forgotEmail);
            setPassword('');
        } catch (error: any) {
            console.error('Reset password error:', error);
            if (Platform.OS === 'web') window.alert(error.message || 'Failed to reset password. Please try again.');
            else Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <>
            <Toast
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
                onHide={() => setToastVisible(false)}
            />
            <View className="flex-1 bg-white">
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                        <View className="px-6 py-8">
                            {/* Back Button */}
                            <TouchableOpacity 
                                onPress={() => router.back()}
                                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mb-8"
                            >
                                <ArrowLeft size={20} color="#4B5563" />
                            </TouchableOpacity>

                            {/* Logo & Header */}
                            <View className="items-center mb-10">
                                <View className="w-16 h-16 bg-purple-600 rounded-3xl items-center justify-center mb-4 shadow-xl shadow-purple-200">
                                    <Sparkles size={32} color="white" />
                                </View>
                                <Text className="text-3xl font-black text-gray-900 mb-2 text-center">Welcome Back</Text>
                                <Text className="text-gray-500 text-center">Sign in to continue your skincare journey</Text>
                            </View>

                            {/* Spacer instead of User Type Selector */}
                            <View className="h-4" />

                            {/* Form */}
                            <View className="gap-5">
                                <View>
                                    <Text className="text-gray-700 font-bold mb-2 ml-1">Email Address <Text className="text-red-500">*</Text></Text>
                                    <View className={`flex-row items-center border rounded-2xl px-4 py-4 ${fieldErrors.email ? 'bg-white border-red-500' : 'bg-gray-50 border-gray-200'}`}>
                                        <Mail size={20} color="#9CA3AF" />
                                        <TextInput 
                                            className="flex-1 ml-3 text-gray-900 font-medium"
                                            placeholder="ayesha@example.com"
                                            placeholderTextColor="#9CA3AF"
                                            value={email}
                                            onChangeText={handleEmailChange}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                    {fieldErrors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</Text>}
                                </View>

                                <View>
                                    <Text className="text-gray-700 font-bold mb-2 ml-1">Password <Text className="text-red-500">*</Text></Text>
                                    <View className={`flex-row items-center border rounded-2xl px-4 py-4 ${fieldErrors.password ? 'bg-white border-red-500' : 'bg-gray-50 border-gray-200'}`}>
                                        <Lock size={20} color="#9CA3AF" />
                                        <TextInput 
                                            className="flex-1 ml-3 text-gray-900 font-medium"
                                            placeholder="••••••••"
                                            placeholderTextColor="#9CA3AF"
                                            value={password}
                                            onChangeText={handlePasswordChange}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                                        </TouchableOpacity>
                                    </View>
                                    {fieldErrors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</Text>}
                                    <TouchableOpacity 
                                        onPress={() => {
                                            setForgotEmail(email);
                                            setForgotOtp('');
                                            setOtpSent(false);
                                            setForgotNewPassword('');
                                            setForgotConfirmPassword('');
                                            setForgotModalVisible(true);
                                        }}
                                        className="self-end mt-2"
                                    >
                                        <Text className="text-purple-600 font-bold text-sm">Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>

                                {loginError ? (
                                    <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-2 flex-row items-center gap-3">
                                        <Text className="text-red-800 font-bold flex-1 text-sm">⚠️ {loginError}</Text>
                                    </View>
                                ) : null}

                                <TouchableOpacity 
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    className={`py-4 rounded-2xl items-center justify-center shadow-lg shadow-purple-200 mt-4 bg-purple-600 flex-row gap-2`}
                                >
                                    {isLoading ? (
                                        <>
                                            <ActivityIndicator color="white" size="small" />
                                            <Text className="text-white font-bold ml-2">Logging in...</Text>
                                        </>
                                    ) : (
                                        <Text className="text-white font-black text-lg">Sign In</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Footer */}
                            <View className="flex-row justify-center mt-10 mb-6">
                                <Text className="text-gray-500 font-medium">Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/shared/user-type-selection')}>
                                    <Text className="text-purple-600 font-bold">Register Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            {/* Forgot Password Modal */}
            <Modal
                visible={forgotModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setForgotModalVisible(false);
                    setForgotOtp('');
                    setOtpSent(false);
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400 }}>
                        <Text style={{ fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 8 }}>Reset Password</Text>
                        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>{!otpSent ? 'Enter your registered email to receive a password reset verification code.' : 'Enter the 6-digit code sent to your email and your new password.'}</Text>
                        
                        <View style={{ gap: 16 }}>
                            <View>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>Email Address</Text>
                                <TextInput
                                    style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: otpSent ? '#E5E7EB' : '#F9FAFB', color: otpSent ? '#6B7280' : '#111827' }}
                                    placeholder="ayesha@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={forgotEmail}
                                    onChangeText={setForgotEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!otpSent}
                                />
                            </View>

                            {otpSent && (
                                <>
                                    <View>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>Verification Code</Text>
                                        <TextInput
                                            style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' }}
                                            placeholder="123456"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="number-pad"
                                            value={forgotOtp}
                                            onChangeText={setForgotOtp}
                                        />
                                        <Text style={{ fontSize: 12, color: '#9333EA', marginTop: 4 }}>Note: OTP has been logged to the server console.</Text>
                                    </View>

                                    <View>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>New Password</Text>
                                        <TextInput
                                            style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' }}
                                            placeholder="••••••••"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry
                                            value={forgotNewPassword}
                                            onChangeText={setForgotNewPassword}
                                        />
                                    </View>

                                    <View>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 6 }}>Confirm New Password</Text>
                                        <TextInput
                                            style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#F9FAFB' }}
                                            placeholder="••••••••"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry
                                            value={forgotConfirmPassword}
                                            onChangeText={setForgotConfirmPassword}
                                        />
                                    </View>
                                </>
                            )}

                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setForgotModalVisible(false);
                                        setForgotOtp('');
                                        setOtpSent(false);
                                    }}
                                    style={{ flex: 1, borderWidth: 1, borderColor: '#D1D5DB', padding: 14, borderRadius: 12, alignItems: 'center' }}
                                >
                                    <Text style={{ color: '#4B5563', fontWeight: 'bold' }}>Cancel</Text>
                                </TouchableOpacity>

                                {!otpSent ? (
                                    <TouchableOpacity
                                        onPress={handleSendOtp}
                                        disabled={isSendingOtp}
                                        style={{ flex: 1, backgroundColor: '#9333EA', padding: 14, borderRadius: 12, alignItems: 'center' }}
                                    >
                                        {isSendingOtp ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Send OTP</Text>
                                        )}
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleResetPassword}
                                        disabled={isResetting}
                                        style={{ flex: 1, backgroundColor: '#9333EA', padding: 14, borderRadius: 12, alignItems: 'center' }}
                                    >
                                        {isResetting ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Reset Password</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
