import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, Leaf, Shield, ShoppingCart, Star } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Image, Linking, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import * as api from '../../utils/api';
import { SkinAnalysisResult } from '../../utils/types';

const PRODUCT_IMAGE_MAPPING: { [key: string]: string } = {
  mandelac: 'https://theskinfit.com/cdn/shop/files/Jenpharm_MandelAC_Serum_20ml_2.png?v=1768385233&width=1920',
  spectrablock: 'https://jenpharm.com/cdn/shop/files/3_8.jpg?v=1767272401',
  vince_vitc: 'https://beautyvoc.com.pk/cdn/shop/files/VitaminCFacewash.jpg?v=1762189678',
  youth_serum: 'https://dermasation.com/cdn/shop/files/Retinol-face-serum_78d94f24-d199-4200-9223-71f5ff8b9d8e.jpg?v=1758120365',
  dermive: 'https://jenpharm.com/cdn/shop/files/Dermive-oil-free.png?v=1767271488',
  ordinary_cleanser: 'https://ashriskin.com/cdn/shop/files/3_Barcode_8802010947083_f75792b7-e6fe-4d55-b60c-0b17f81079db.jpg?v=1768568240',
  cerave_sa: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cet/cet88917/l/24.jpg',
  derma_shine: 'https://www.ameena.pk/cdn/shop/files/1000024973.webp?v=1763400571',
  niacinamide: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/mcl/mcl21268/l/8.jpg',
  'local product': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=600',
};

type ProductRecommendationsProps = {
  result: SkinAnalysisResult | null;
  onNavigate: (page: string) => void;
  isGuest: boolean;
  initialSearch?: string;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  price: string;
  priceUSD?: string;
  rating: number;
  reviews: number;
  isHalal: boolean;
  isOrganic: boolean;
  category: string;
  buyLinks: {
    daraz?: string;
    amazon?: string;
    local?: string;
  };
  benefits: string[];
  image: string;
  targetDiseases?: string[];
};

function ProductRecommendations({ result, onNavigate, isGuest, initialSearch }: ProductRecommendationsProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const skinType = result?.skinType || 'Normal';

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${api.API_BASE_URL}/inventory/products`);
        const data = await response.json();
        if (response.ok && data.products) {
          const mappedProducts = data.products.map((p: any) => {
            let cat = 'Recommended';
            const pName = p.name || '';
            if (pName.toLowerCase().includes('serum') || pName.toLowerCase().includes('niacinamide')) cat = 'Serum';
            else if (pName.toLowerCase().includes('cleanser') || pName.toLowerCase().includes('wash')) cat = 'Cleanser';
            else if (pName.toLowerCase().includes('moisturizer') || pName.toLowerCase().includes('cream')) cat = 'Moisturizer';
            else if (pName.toLowerCase().includes('spf') || pName.toLowerCase().includes('block')) cat = 'Sunscreen';

            return {
              id: p._id,
              name: p.name,
              brand: p.brand || (pName.includes('Jenpharm') || pName.includes('Vince') || pName.includes('Derma') ? 'Pakistani Brand' : 'Skinzy Verified'),
              price: p.price && typeof p.price === 'string' && p.price.includes('Rs') ? p.price : `PKR ${p.price || 0}`,
              rating: 4.8,
              reviews: 156,
              isHalal: true,
              isOrganic: true,
              category: p.category || cat,
              buyLinks: { daraz: 'https://daraz.pk' },
              benefits: p.description ? p.description.split(',').map((b: string) => b.trim()) : [p.condition || 'Skin Care'],
              image: p.imageUrl || 'local product',
              targetDiseases: p.targetDiseases || [p.condition].filter(Boolean),
            };
          });
          setDbProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [activeFilters, setActiveFilters] = useState<{
    halalOnly: boolean;
    organicOnly: boolean;
    underPKR3000: boolean;
    category: string | null;
  }>({
    halalOnly: false,
    organicOnly: false,
    underPKR3000: false,
    category: null,
  });

  const toggleFilter = (filter: 'halalOnly' | 'organicOnly' | 'underPKR3000') => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  const setCategory = (category: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      halalOnly: false,
      organicOnly: false,
      underPKR3000: false,
      category: null,
    });
  };

  const pakistaniProducts: Product[] = result?.recommendations
    ? result.recommendations.map((p, index) => ({
      id: `pk-${index}`,
      name: p.name || 'Serum',
      brand: p.brand || 'Dermatologist Recommended',
      price: p.price || 'Rs. 1,200',
      rating: 4.8,
      reviews: 156,
      isHalal: true,
      isOrganic: true,
      category: 'Recommended',
      buyLinks: { daraz: 'https://daraz.pk' },
      benefits: ['Dermatologist recommended for ' + (result?.detectedDisease || 'your skin')],
      image: 'local product',
    }))
    : [];

  const products: Product[] = [...pakistaniProducts, ...dbProducts];

  const [diseaseSearch, setDiseaseSearch] = useState(initialSearch || '');

  const filteredProducts = products.filter((product) => {
    if (activeFilters.halalOnly && !product.isHalal) return false;
    if (activeFilters.organicOnly && !product.isOrganic) return false;
    if (activeFilters.underPKR3000 && parseFloat(product.price.replace(/[^0-9.]/g, '')) > 3000) return false;
    if (activeFilters.category && product.category !== activeFilters.category) return false;
    
    // Filter by manual search OR detected disease
    if (diseaseSearch.trim() !== '') {
      const search = diseaseSearch.trim().toLowerCase();
      const targets = product.targetDiseases || [];
      const matchName = product.name.toLowerCase().includes(search) || (product.category && product.category.toLowerCase().includes(search));
      const matchDisease = targets.some(d => d.toLowerCase().includes(search));
      if (!matchName && !matchDisease) return false;
    } else {
      const detected = result?.detectedDisease;
      if (detected && product.targetDiseases && product.targetDiseases.length > 0) {
        if (!product.targetDiseases.includes(detected) && !product.targetDiseases.includes('normal')) {
          return false;
        }
      }
    }
    
    return true;
  });

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} className="bg-gray-50 pt-20 md:pt-4" contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
      <View className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <TouchableOpacity
          onPress={() => onNavigate('landing')}
          className="flex-row items-center gap-2 mb-8"
        >
          <ArrowLeft size={20} color="#4b5563" />
          <Text className="text-gray-600 font-medium ml-2">{isGuest ? 'Back to Home' : 'Back to Dashboard'}</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-3">
            <ShoppingCart size={32} color="#9333ea" />
            <Text className="text-3xl font-bold text-gray-900">Recommended Products</Text>
          </View>
          <Text className="text-gray-600">
            Halal-certified and affordable products curated for your {skinType.toLowerCase()} skin
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-purple-50">
          <View className="flex-row items-center justify-between mb-5 flex-wrap gap-3">
            <View>
              <Text className="text-gray-900 font-bold text-lg">Personalized Filters</Text>
              <Text className="text-gray-500 text-xs">Narrow down your perfect match</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('remedies')}
              className="flex-row items-center gap-2 px-5 py-2.5 bg-purple-600 rounded-full shadow-sm shadow-purple-200 transition-all hover:bg-purple-900"
            >
              <Leaf size={16} color="white" />
              <Text className="text-white font-bold ml-1">Try Natural Remedies</Text>
            </TouchableOpacity>
          </View>
          
          <View className="mb-4">
            <TextInput
              value={diseaseSearch}
              onChangeText={setDiseaseSearch}
              placeholder="Search by disease (e.g. acne, melasma...)"
              className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-800"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View className="flex-row flex-wrap gap-2">
            <FilterBadge label="All" active={activeFilters.category === null && !activeFilters.halalOnly && !activeFilters.organicOnly && !activeFilters.underPKR3000} onPress={clearFilters} />
            <FilterBadge label="Halal Only" active={activeFilters.halalOnly} onPress={() => toggleFilter('halalOnly')} />
            <FilterBadge label="Organic" active={activeFilters.organicOnly} onPress={() => toggleFilter('organicOnly')} />
            <FilterBadge label="Under 3k" active={activeFilters.underPKR3000} onPress={() => toggleFilter('underPKR3000')} />
            <View className="w-px h-8 bg-gray-200 mx-1 hidden md:flex" />
            <FilterBadge label="Cleansers" active={activeFilters.category === 'Cleanser'} onPress={() => setCategory('Cleanser')} />
            <FilterBadge label="Serums" active={activeFilters.category === 'Serum'} onPress={() => setCategory('Serum')} />
            <FilterBadge label="Moisturizers" active={activeFilters.category === 'Moisturizer'} onPress={() => setCategory('Moisturizer')} />
          </View>
        </View>

        <View className="flex-row flex-wrap gap-y-8 gap-x-[2.5%] mb-12">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <View key={product.id} className="w-full md:w-[48.75%] lg:w-[31.6%]">
                <ProductCard product={product} onOpenLink={handleOpenLink} />
              </View>
            ))
          ) : (
            <View className="w-full py-12 items-center">
              <Text className="text-gray-600 mb-4">No products match your filters</Text>
              <TouchableOpacity
                onPress={clearFilters}
                className="px-6 py-2 bg-purple-500 rounded-full"
              >
                <Text className="text-white font-medium">Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="bg-purple-500 rounded-3xl p-8 md:p-12 items-center">
          <Text className="text-2xl font-bold mb-4 text-white text-center">Ready to Start Your Routine?</Text>
          <Text className="mb-6 text-white text-center opacity-90">
            Save these products and create a personalized skincare routine with reminders
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate('routine')}
            className="px-8 py-4 bg-white rounded-full"
          >
            <Text className="text-purple-600 font-bold">Create My Routine</Text>
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}

function ProductCard({ product, onOpenLink }: { product: Product, onOpenLink: (url: string) => void }) {
  const imageUrl = PRODUCT_IMAGE_MAPPING[product.image] || product.image || null;

  return (
    <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-purple-200">
      <View className="h-48 md:h-52 lg:h-56 bg-purple-50 items-center justify-center relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center justify-center">
            <ShoppingCart size={40} color="#d8b4fe" />
            <Text className="text-purple-300 text-[10px] mt-2 font-bold uppercase tracking-widest">Skinzy Pick</Text>
          </View>
        )}

        <View className="absolute top-4 left-4 flex-row gap-2 flex-wrap">
          {product.isHalal && (
            <View className="flex-row items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
              <Shield size={10} color="#9333EA" />
              <Text className="text-purple-700 text-[10px] font-black uppercase ml-1">Halal</Text>
            </View>
          )}
        </View>
      </View>

      <View className="p-5 flex-1 flex-col">
        <View className="flex-1">
          <Text className="text-purple-600 text-[10px] font-black uppercase tracking-widest mb-1">{product.brand}</Text>
          <Text className="text-lg font-bold mb-2 text-gray-900 leading-6" numberOfLines={2}>{product.name}</Text>

          <View className="flex-row items-center gap-2 mb-3">
            <View className="flex-row items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} fill={s <= Math.floor(product.rating) ? "#facc15" : "transparent"} color="#facc15" />
              ))}
            </View>
            <Text className="text-gray-400 text-xs">({product.reviews})</Text>
          </View>

          <View className="mb-4 gap-1.5">
            {product.benefits.slice(0, 2).map((benefit, index) => (
              <View key={index} className="flex-row items-center gap-2 bg-gray-50 p-1.5 rounded-lg">
                <View className="w-1 h-1 bg-purple-400 rounded-full" />
                <Text className="text-gray-600 text-xs flex-1" numberOfLines={1}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-auto pt-4 border-t border-gray-50">
          <View className="flex-row items-end justify-between mb-4">
            <View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase">Price</Text>
              <Text className="text-xl font-black text-gray-900">{product.price}</Text>
            </View>
            {product.isOrganic && (
              <View className="px-2 py-1 bg-green-50 rounded-md">
                <Text className="text-green-700 text-[10px] font-bold uppercase">Organic</Text>
              </View>
            )}
          </View>

          {product.buyLinks.daraz && (
            <TouchableOpacity
              onPress={() => onOpenLink(product.buyLinks.daraz!)}
              className="flex-row items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-95"
            >
              <Text className="text-white font-black uppercase text-xs tracking-widest">Buy on Daraz</Text>
              <ExternalLink size={14} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function FilterBadge({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      className={`px-5 py-2 rounded-full transition-all ${active
        ? 'bg-purple-600 shadow-md shadow-purple-100'
        : 'bg-white border border-gray-200 hover:border-purple-200 hover:bg-purple-50'
        }`}
      onPress={onPress}
    >
      <Text className={`font-bold text-xs uppercase tracking-widest ${active ? 'text-white' : 'text-gray-500'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ProductRecommendationsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isGuest, setIsGuest] = useState(true);

  // Enforce Patient Role or Guest access
  useEffect(() => {
    const verifyRole = async () => {
      try {
        const userRes = await api.getCurrentUser();
        if (userRes && userRes.user) {
          setIsGuest(false);
          const role = userRes?.user?.role || userRes?.user?.userType || userRes?.role || userRes?.userType;
          if (role === 'doctor') {
            router.replace('/doctor/dashboard');
          }
        }
      } catch (err) {
        setIsGuest(true);
        console.log("Accessing products page as guest");
      }
    };
    verifyRole();
  }, []);

  const result: SkinAnalysisResult | null = params.result ? JSON.parse(params.result as string) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ProductRecommendations
        result={result}
        isGuest={isGuest}
        initialSearch={params.searchQuery as string}
        onNavigate={(page: string) => {
          if (page === 'results' || page === 'landing') {
            router.push(isGuest ? '/' : '/patient/dashboard');
          } else {
            router.push(`/patient/${page}` as any);
          }
        }}
      />
    </SafeAreaView>
  );
}
