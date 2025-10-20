import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Products() {
  const categories = [
    { name: "Cleanser", icon: "water-outline" },
    { name: "Serum", icon: "flask-outline" },
    { name: "Moisturizer", icon: "cube-outline" },
    { name: "Sunscreen", icon: "sunny-outline" },
    { name: "Toner", icon: "color-filter-outline" },
    { name: "Mask", icon: "leaf-outline" },
  ];

  // 🧴 Use reliable CDN image URLs (unsplash / cloudinary)
  const productsData = {
    Cleanser: [
      {
        id: 1,
        name: "CeraVe Foaming Cleanser",
        formula: "Ceramides + Niacinamide",
        useFor: "Removes oil & dirt without over-drying",
        link: "https://www.cerave.com/",
        image:
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: 2,
        name: "La Roche-Posay Purifying Gel",
        formula: "Zinc + Thermal Water",
        useFor: "Oily & acne-prone skin cleansing",
        link: "https://www.laroche-posay.us/",
        image:
          "https://images.unsplash.com/photo-1611930022073-b7a4ba5e9edb?auto=format&fit=crop&w=500&q=80",
      },
    ],
    Serum: [
      {
        id: 3,
        name: "The Ordinary Niacinamide 10% + Zinc 1%",
        formula: "Niacinamide + Zinc PCA",
        useFor: "Acne control & oil balance",
        link: "https://theordinary.com/",
        image:
          "https://images.unsplash.com/photo-1600180758890-6e85d3c37bfc?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: 4,
        name: "L'Oreal Revitalift Hyaluronic Serum",
        formula: "1.5% Hyaluronic Acid",
        useFor: "Hydration & plump skin texture",
        link: "https://www.lorealparisusa.com/",
        image:
          "https://images.unsplash.com/photo-1587019158091-a6c16d4388c2?auto=format&fit=crop&w=500&q=80",
      },
    ],
    Moisturizer: [
      {
        id: 5,
        name: "CeraVe Moisturizing Cream",
        formula: "Ceramides + Hyaluronic Acid",
        useFor: "Dry skin barrier repair",
        link: "https://www.cerave.com/",
        image:
          "https://images.unsplash.com/photo-1612815154858-60aa4cba6a7d?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: 6,
        name: "Neutrogena Hydro Boost Gel",
        formula: "Hyaluronic Acid + Glycerin",
        useFor: "Lightweight hydration for all skin types",
        link: "https://www.neutrogena.com/",
        image:
          "https://images.unsplash.com/photo-1617634667039-8d36a1ff5dc3?auto=format&fit=crop&w=500&q=80",
      },
    ],
    Sunscreen: [
      {
        id: 7,
        name: "La Shield SPF 40 Sunscreen Gel",
        formula: "Broad Spectrum UVA/UVB",
        useFor: "Sun protection for sensitive skin",
        link: "https://www.lashield.com/",
        image:
          "https://images.unsplash.com/photo-1618076481919-9b0de3aaae4f?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: 8,
        name: "Eucerin Oil Control SPF 50",
        formula: "L-Carnitine + Mattifying Particles",
        useFor: "Oil-free protection for oily skin",
        link: "https://www.eucerinus.com/",
        image:
          "https://images.unsplash.com/photo-1610381639021-f6fc9d4d9b65?auto=format&fit=crop&w=500&q=80",
      },
    ],
    Toner: [
      {
        id: 9,
        name: "Pixi Glow Tonic",
        formula: "5% Glycolic Acid",
        useFor: "Exfoliation & brightening dull skin",
        link: "https://www.pixibeauty.com/",
        image:
          "https://images.unsplash.com/photo-1611077543895-d44ccaf3b5f3?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: 10,
        name: "Thayers Witch Hazel Toner",
        formula: "Witch Hazel + Aloe Vera",
        useFor: "Soothing and tightening pores",
        link: "https://www.thayers.com/",
        image:
          "https://images.unsplash.com/photo-1586511934875-2a6fdb3c27aa?auto=format&fit=crop&w=500&q=80",
      },
    ],
    Mask: [
      {
        id: 11,
        name: "Innisfree Volcanic Clay Mask",
        formula: "Jeju Volcanic Clusters",
        useFor: "Deep pore cleansing & oil control",
        link: "https://www.innisfree.com/",
        image:
          "https://images.unsplash.com/photo-1629196910132-4e9646b6b51f?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: 12,
        name: "The Body Shop Tea Tree Mask",
        formula: "Tea Tree Oil",
        useFor: "Acne treatment & inflammation relief",
        link: "https://www.thebodyshop.com/",
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80",
      },
    ],
  };

  const [selectedCategory, setSelectedCategory] = useState("Cleanser");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skincare Products</Text>
      <Text style={styles.subtitle}>Choose a category to explore products</Text>

      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.name}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.name && styles.activeCategory,
            ]}
            onPress={() => setSelectedCategory(item.name)}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={selectedCategory === item.name ? "#fff" : "#000"}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.name && styles.activeCategoryText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView style={{ marginTop: 25 }}>
        {productsData[selectedCategory].map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image
              source={{
                uri: product.image || "https://via.placeholder.com/150",
              }}
              style={styles.productImage}
              resizeMode="cover"
            />

            <View style={styles.headerRow}>
              <MaterialCommunityIcons name="bottle-tonic" size={26} color="#000" />
              <Text style={styles.productName}>{product.name}</Text>
            </View>

            <Text style={styles.detail}>
              <Text style={styles.bold}>Formula:</Text> {product.formula}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>Use For:</Text> {product.useFor}
            </Text>

            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => Linking.openURL(product.link)}
            >
              <Ionicons name="cart-outline" size={16} color="#fff" />
              <Text style={styles.buyText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#000", textAlign: "center" },
  subtitle: { color: "#555", fontSize: 14, textAlign: "center", marginBottom: 20 },
  categoryList: { paddingVertical: 8 },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    gap: 6,
  },
  activeCategory: { backgroundColor: "#000" },
  categoryText: { color: "#000", fontWeight: "bold", fontSize: 14 },
  activeCategoryText: { color: "#fff" },
  productCard: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 15,
    padding: 18,
    marginBottom: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  productName: { fontSize: 16, fontWeight: "bold", color: "#000", flexShrink: 1 },
  detail: { color: "#333", fontSize: 13, marginBottom: 4 },
  bold: { fontWeight: "600" },
  buyBtn: {
    marginTop: 12,
    flexDirection: "row",
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buyText: { color: "#fff", fontWeight: "bold" },
});
