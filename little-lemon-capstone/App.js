import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform,
  Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const GREEN = '#495E57';
const YELLOW = '#F4CE14';
const CREAM = '#EDEFEE';
const STORAGE_KEY = '@little_lemon_profile';

const MENU = [
  { id: '1', name: 'Greek Salad', category: 'Starters', price: '$12.99', description: 'Crisp greens, tomatoes, olives and feta.' },
  { id: '2', name: 'Bruschetta', category: 'Starters', price: '$7.99', description: 'Toasted bread with tomato and fresh basil.' },
  { id: '3', name: 'Grilled Fish', category: 'Mains', price: '$20.00', description: 'Seasonal vegetables with grilled fish.' },
  { id: '4', name: 'Lemon Pasta', category: 'Mains', price: '$16.50', description: 'Pasta tossed in a bright lemon sauce.' },
  { id: '5', name: 'Lemon Cake', category: 'Desserts', price: '$6.50', description: 'A soft cake with fresh lemon zest.' },
  { id: '6', name: 'Lemonade', category: 'Drinks', price: '$4.00', description: 'Freshly squeezed lemon and mint.' },
];

function Button({ title, onPress, disabled = false, secondary = false }) {
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled}
    style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabledButton]}>
    <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
  </Pressable>;
}

function Field({ label, value, onChangeText, keyboardType = 'default', autoCapitalize = 'words' }) {
  return <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText}
      keyboardType={keyboardType} autoCapitalize={autoCapitalize}
      style={styles.input} placeholder={label} placeholderTextColor="#7B817E" />
  </View>;
}

function BrandHeader({ navigation, showProfile = true }) {
  return <View style={styles.brandHeader}>
    <Text style={styles.brand}>LITTLE LEMON</Text>
    {showProfile && <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Profile')} style={styles.profileIcon}>
      <Text style={styles.profileIconText}>P</Text>
    </Pressable>}
  </View>;
}

function OnboardingScreen({ navigation, onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0 && validEmail;
  const submit = async () => {
    if (!canContinue) return;
    const profile = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), marketing: false };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    onComplete(profile);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.heroBrand}><Text style={styles.brandLight}>LITTLE LEMON</Text><Text style={styles.tagline}>Chicago · Mediterranean food</Text></View>
      <ScrollView contentContainerStyle={styles.onboardingContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Welcome to Little Lemon</Text>
        <Text style={styles.body}>Tell us a little about yourself to get started.</Text>
        <Field label="First name" value={firstName} onChangeText={setFirstName} />
        <Field label="Last name" value={lastName} onChangeText={setLastName} />
        <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title="Next" onPress={submit} disabled={!canContinue} />
        <Text style={styles.hint}>Enter your first name, last name and a valid email address.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];
  const items = MENU.filter(item => (category === 'All' || item.category === category)
    && (item.name + ' ' + item.description).toLowerCase().includes(search.toLowerCase()));
  return <SafeAreaView style={styles.safe}>
    <BrandHeader navigation={navigation} />
    <ScrollView contentContainerStyle={styles.homeContent} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Little Lemon</Text>
        <Text style={styles.heroSub}>Chicago</Text>
        <Text style={styles.heroDescription}>We are a family-owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.</Text>
        <TextInput accessibilityLabel="Search menu" placeholder="Search menu" placeholderTextColor="#EDEFEE"
          value={search} onChangeText={setSearch} style={styles.searchInput} />
      </View>
      <Text style={styles.sectionTitle}>ORDER FOR DELIVERY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categories.map(item => <Pressable key={item} onPress={() => setCategory(item)}
          style={[styles.categoryPill, category === item && styles.categoryPillSelected]}>
          <Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text>
        </Pressable>)}
      </ScrollView>
      <Text style={styles.sectionTitle}>MENU</Text>
      {items.length === 0 ? <Text style={styles.body}>No items found. Try another search.</Text> :
        items.map(item => <View key={item.id} style={styles.menuItem}>
          <View style={styles.menuText}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
            <Text style={styles.menuPrice}>{item.price}</Text>
          </View>
          <View style={styles.foodPlaceholder}><Text style={styles.foodEmoji}>🍋</Text></View>
        </View>)}
    </ScrollView>
  </SafeAreaView>;
}

function ProfileScreen({ navigation, profile, onSave, onLogout }) {
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setFirstName(profile?.firstName || '');
    setLastName(profile?.lastName || '');
    setEmail(profile?.email || '');
  }, [profile]);
  const save = async () => {
    if (!firstName.trim() || !lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Check your details', 'Enter a first name, last name and valid email address.');
      return;
    }
    await onSave({ ...profile, firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
 const logout = () => {
  if (Platform.OS === 'web') {
    if (window.confirm('Log out? Your saved profile will be cleared from this app.')) {
      onLogout();
    }
  } else {
    Alert.alert('Log out?', 'Your saved profile will be cleared from this app.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogout }
    ]);
  }
};
  return <SafeAreaView style={styles.safe}>
    <BrandHeader navigation={navigation} showProfile={false} />
    <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backLink}>
      <Text style={styles.backLinkText}>‹ Back to menu</Text>
    </Pressable>
    <ScrollView contentContainerStyle={styles.profileContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Personal information</Text>
      <Text style={styles.body}>Update your details below.</Text>
      <Field label="First name" value={firstName} onChangeText={setFirstName} />
      <Field label="Last name" value={lastName} onChangeText={setLastName} />
      <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Button title={saved ? 'Changes saved ✓' : 'Save changes'} onPress={save} />
      <View style={styles.spacer} />
      <Button title="Log out" onPress={logout} secondary />
    </ScrollView>
  </SafeAreaView>;
}

function AppNavigator() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setProfile(JSON.parse(stored));
      } catch (e) {
        console.warn('Could not load profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const saveProfile = async next => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
  };
  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  };
  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={GREEN} /></View>;
  return <NavigationContainer>
    <Stack.Navigator initialRouteName={profile ? 'Home' : 'Onboarding'} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding">
        {props => <OnboardingScreen {...props} onComplete={setProfile} />}
      </Stack.Screen>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile">
        {props => <ProfileScreen {...props} profile={profile} onSave={saveProfile} onLogout={async () => {
          await logout();
          props.navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
        }} />}
      </Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>;
}

export default function App() {
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  brandHeader: { minHeight: 64, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  brand: { color: GREEN, fontSize: 22, fontWeight: '900', letterSpacing: 1.2 },
  profileIcon: { position: 'absolute', right: 20, backgroundColor: CREAM, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  profileIconText: { color: GREEN, fontWeight: '800', fontSize: 17 },
  heroBrand: { backgroundColor: GREEN, padding: 20 },
  brandLight: { color: YELLOW, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  tagline: { color: '#FFFFFF', marginTop: 4 },
  onboardingContent: { padding: 24, gap: 10 },
  heading: { fontSize: 25, fontWeight: '800', color: '#202522', marginBottom: 4 },
  body: { fontSize: 15, lineHeight: 22, color: '#555F5A', marginBottom: 12 },
  fieldWrap: { marginBottom: 10 },
  label: { color: '#303A35', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#AAB4AE', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, fontSize: 16, color: '#202522', backgroundColor: '#FFFFFF' },
  button: { backgroundColor: YELLOW, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#202522', fontWeight: '800', fontSize: 16 },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: GREEN },
  secondaryButtonText: { color: GREEN },
  disabledButton: { opacity: 0.38 },
  hint: { color: '#6A736E', fontSize: 12, textAlign: 'center', marginTop: 8 },
  homeContent: { paddingBottom: 28 },
  hero: { backgroundColor: GREEN, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 22 },
  heroTitle: { color: YELLOW, fontSize: 31, fontWeight: '900' },
  heroSub: { color: '#FFFFFF', fontSize: 21, marginTop: 2 },
  heroDescription: { color: '#FFFFFF', fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 16 },
  searchInput: { backgroundColor: '#64766F', borderRadius: 10, color: '#FFFFFF', padding: 12, fontSize: 16 },
  sectionTitle: { color: '#202522', fontSize: 16, fontWeight: '900', letterSpacing: 0.7, marginHorizontal: 20, marginTop: 22, marginBottom: 12 },
  categories: { paddingHorizontal: 20, gap: 9, paddingBottom: 4 },
  categoryPill: { backgroundColor: CREAM, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 15 },
  categoryPillSelected: { backgroundColor: GREEN },
  categoryText: { color: GREEN, fontWeight: '700' },
  categoryTextSelected: { color: '#FFFFFF' },
  menuItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E0E5E1', gap: 14 },
  menuText: { flex: 1 },
  menuName: { fontSize: 17, fontWeight: '800', color: '#202522', marginBottom: 5 },
  menuDescription: { color: '#5E6762', fontSize: 14, lineHeight: 20 },
  menuPrice: { color: GREEN, fontWeight: '800', marginTop: 8 },
  foodPlaceholder: { width: 78, height: 78, backgroundColor: '#F7F2D5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  foodEmoji: { fontSize: 35 },
  profileContent: { padding: 24 },
  backLink: { paddingHorizontal: 22, paddingVertical: 10, alignSelf: 'flex-start' },
  backLinkText: { color: GREEN, fontWeight: '800', fontSize: 16 },
  spacer: { height: 18 },
});
