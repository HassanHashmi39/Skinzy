import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, PlusCircle, Package, HeartPulse, XCircle, Edit, Upload } from 'lucide-react-native';
import * as api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

type Product = {
  _id: string;
  name: string;
  description: string;
  type: 'remedy' | 'product';
  price: number;
  imageUrl: string;
  targetDiseases?: string[];
  isActive: boolean;
};

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'product' | 'remedy'>('product');

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'remedy' | 'product'>('product');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTargetDiseases, setNewTargetDiseases] = useState('');
  
  const [savingProduct, setSavingProduct] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setNewImageUrl(base64Image);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      const response = await fetch(`${api.API_BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
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
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setNewName('');
    setNewDescription('');
    setNewPrice('');
    setNewImageUrl('');
    setNewTargetDiseases('');
    setNewType(activeTab); // Default to current tab
    setAddModalVisible(true);
  };

  const openEditModal = (item: Product) => {
    setEditingId(item._id);
    setNewName(item.name);
    setNewDescription(item.description);
    setNewPrice(item.price ? item.price.toString() : '');
    setNewImageUrl(item.imageUrl || '');
    setNewTargetDiseases(item.targetDiseases ? item.targetDiseases.join(', ') : '');
    setNewType(item.type);
    setAddModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!newName.trim() || !newDescription.trim()) {
      Alert.alert('Error', 'Name and description are required.');
      return;
    }
    
    setSavingProduct(true);
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      const url = editingId 
        ? `${api.API_BASE_URL}/admin/products/${editingId}` 
        : `${api.API_BASE_URL}/admin/products`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          type: newType,
          price: newPrice ? parseFloat(newPrice) : 0,
          imageUrl: newImageUrl,
          targetDiseases: newTargetDiseases
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', `Item ${editingId ? 'updated' : 'added'} successfully`);
        setAddModalVisible(false);
        fetchProducts();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleRemoveProduct = async (id: string, name: string) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('sessionToken');
              const response = await fetch(`${api.API_BASE_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (response.ok) {
                Alert.alert('Success', 'Item removed successfully');
                fetchProducts();
              } else {
                const data = await response.json();
                Alert.alert('Error', data.message);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  const filteredItems = products.filter(p => p.type === activeTab);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-700 pt-12 pb-6 px-6 flex-row justify-between items-center rounded-b-3xl shadow-md z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-purple-600 rounded-full">
            <ArrowLeft color="white" size={20} />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Manage Inventory</Text>
            <Text className="text-purple-200">{products.length} total items</Text>
          </View>
        </View>
        <TouchableOpacity onPress={openAddModal} className="p-3 bg-purple-600 rounded-full shadow-sm flex-row items-center gap-2">
          <PlusCircle color="white" size={20} />
          <Text className="text-white font-bold hidden md:flex">Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row p-4 gap-4 bg-white border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => setActiveTab('product')}
          className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${activeTab === 'product' ? 'bg-purple-100' : 'bg-gray-50'}`}
        >
          <Package color={activeTab === 'product' ? '#9333EA' : '#9CA3AF'} size={20} />
          <Text className={`font-bold ${activeTab === 'product' ? 'text-purple-700' : 'text-gray-500'}`}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('remedy')}
          className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${activeTab === 'remedy' ? 'bg-purple-100' : 'bg-gray-50'}`}
        >
          <HeartPulse color={activeTab === 'remedy' ? '#9333EA' : '#9CA3AF'} size={20} />
          <Text className={`font-bold ${activeTab === 'remedy' ? 'text-purple-700' : 'text-gray-500'}`}>Remedies</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-4 pt-6">
        {filteredItems.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-lg">No {activeTab}s found.</Text>
            <Text className="text-gray-400 mt-2">Tap the + icon to add a new {activeTab}.</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item._id} className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-purple-50 justify-center items-center mr-4">
                {item.type === 'product' ? <Package color="#9333EA" size={24} /> : <HeartPulse color="#9333EA" size={24} />}
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
                <Text className="text-sm text-gray-500 mb-1" numberOfLines={2}>{item.description}</Text>
                <View className="flex-row gap-2 mt-1 flex-wrap">
                  {item.price > 0 && (
                    <View className="bg-green-100 px-2 py-1 rounded-md">
                      <Text className="text-xs text-green-700 font-bold">PKR {item.price}</Text>
                    </View>
                  )}
                  {item.targetDiseases && item.targetDiseases.length > 0 && (
                    <View className="bg-blue-50 px-2 py-1 rounded-md">
                      <Text className="text-xs text-blue-700 font-bold">{item.targetDiseases.length} target(s)</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => openEditModal(item)}
                  className="p-3 bg-blue-50 rounded-full"
                >
                  <Edit color="#3B82F6" size={20} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleRemoveProduct(item._id, item.name)}
                  className="p-3 bg-red-50 rounded-full"
                >
                  <Trash2 color="#EF4444" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Add/Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white rounded-t-3xl p-6 h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">{editingId ? 'Edit' : 'Add'} Item</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} className="p-2 bg-gray-100 rounded-full">
                <XCircle color="#374151" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">Item Type</Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity 
                    onPress={() => setNewType('product')}
                    className={`flex-1 py-3 rounded-xl border-2 items-center flex-row justify-center gap-2 ${newType === 'product' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'}`}
                  >
                    <Package color={newType === 'product' ? '#9333EA' : '#9CA3AF'} size={20} />
                    <Text className={`font-bold ${newType === 'product' ? 'text-purple-700' : 'text-gray-500'}`}>Product</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setNewType('remedy')}
                    className={`flex-1 py-3 rounded-xl border-2 items-center flex-row justify-center gap-2 ${newType === 'remedy' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white'}`}
                  >
                    <HeartPulse color={newType === 'remedy' ? '#9333EA' : '#9CA3AF'} size={20} />
                    <Text className={`font-bold ${newType === 'remedy' ? 'text-purple-700' : 'text-gray-500'}`}>Remedy</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">Name</Text>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="E.g., Aloe Vera Gel"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
                <TextInput
                  value={newDescription}
                  onChangeText={setNewDescription}
                  placeholder="Brief description of benefits..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 h-24"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">Target Diseases (Comma Separated)</Text>
                <TextInput
                  value={newTargetDiseases}
                  onChangeText={setNewTargetDiseases}
                  placeholder="e.g. acne_vulgaris, melasma, psoriasis"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">Image URL or Upload</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    value={newImageUrl}
                    onChangeText={setNewImageUrl}
                    placeholder="https://..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  />
                  <TouchableOpacity 
                    onPress={pickImage}
                    className="bg-purple-100 rounded-xl px-4 justify-center items-center flex-row gap-2"
                  >
                    <Upload color="#9333EA" size={20} />
                    <Text className="text-purple-700 font-bold">Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {newType === 'product' && (
                <View className="mb-6">
                  <Text className="text-sm font-bold text-gray-700 mb-2">Price (PKR)</Text>
                  <TextInput
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="E.g., 1500"
                    keyboardType="numeric"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  />
                </View>
              )}

              <TouchableOpacity 
                onPress={handleSaveProduct}
                disabled={savingProduct}
                className={`mt-4 w-full py-4 rounded-xl flex-row justify-center items-center gap-2 shadow-sm ${savingProduct ? 'bg-purple-400' : 'bg-purple-600'}`}
              >
                {savingProduct ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg">{editingId ? 'Update' : 'Save'} Item</Text>
                  </>
                )}
              </TouchableOpacity>
              <View className="h-10" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
