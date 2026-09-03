import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth';

const API = 'https://andergo.online';
const AVATARS = ['🙂', '🧑‍🎓', '📚', '🌍', '🎧', '🚀'];
type Provider = 'google' | 'facebook';
type Usage = { used?: number; remaining?: number; limit?: number };
type Subscription = { plan?: { slug?: string; name?: string }; status?: string; isPremium?: boolean; expiresAt?: string; usage?: { tutorQuery?: Usage; translatorQuery?: Usage } };

export default function Account() {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [sub, setSub] = useState<Subscription | null>(null);

  const request = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${auth.session?.access_token || ''}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'No pudimos completar la solicitud.');
    return body;
  };

  const loadPlan = async () => {
    if (!auth.session) return;
    try { setSub(await request('/api/subscription')); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos cargar tu plan.'); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- the session token is the subscription refresh boundary.
  useEffect(() => { void loadPlan(); }, [auth.session?.access_token]);

  const enter = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'signup') {
        const result = await auth.signUp(name.trim(), email.trim(), password);
        if (result === 'confirmation-required') {
          setNotice('Revisa tu correo para confirmar la cuenta; luego inicia sesión.');
          return;
        }
      } else await auth.signIn(email.trim(), password);
      router.replace('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos iniciar sesión.');
    } finally { setBusy(false); }
  };

  const socialSignIn = async (provider: Provider) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const signedIn = await auth.signInWithProvider(provider);
      if (signedIn) router.replace('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `No pudimos iniciar sesión con ${provider}.`);
    } finally { setBusy(false); }
  };

  const buy = async (cycle: 'monthly' | 'quarterly') => {
    setBusy(true); setError(''); setNotice('');
    try {
      const checkout = await request('/api/billing/paypal/checkout', { method: 'POST', body: JSON.stringify({ billingCycle: cycle }) });
      await WebBrowser.openBrowserAsync(checkout.approvalUrl);
      await request('/api/billing/paypal/activate', { method: 'POST', body: JSON.stringify({ subscriptionId: checkout.subscriptionId }) });
      await loadPlan();
      setNotice('Premium está activo. Tus beneficios ampliados ya están sincronizados.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos abrir PayPal.');
    } finally { setBusy(false); }
  };

  const chooseAvatar = async (emoji: string) => {
    setBusy(true); setError('');
    try { await auth.updateAvatarEmoji(emoji); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos guardar el avatar.'); }
    finally { setBusy(false); }
  };

  const premium = Boolean(sub?.isPremium || sub?.plan?.slug === 'premium');
  const socialButtons = (
    <View style={s.socialArea}>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => socialSignIn('google')} style={s.socialButton}>
        <ThemedText style={s.socialText}>G  Continuar con Google</ThemedText>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => socialSignIn('facebook')} style={s.socialButton}>
        <ThemedText style={s.socialText}>f  Continuar con Facebook</ThemedText>
      </Pressable>
      <ThemedText style={s.or}>o usa tu correo y contraseña</ThemedText>
    </View>
  );

  return <ThemedView style={s.screen}><SafeAreaView style={s.safe}>
    <Pressable accessibilityLabel="Volver" onPress={() => router.back()}><ThemedText style={s.back}>‹</ThemedText></Pressable>
    <ScrollView contentContainerStyle={s.card} keyboardShouldPersistTaps="handled">
      <ThemedText style={s.kicker}>ANDERGO LANGUAGE ACADEMY</ThemedText>
      <ThemedText style={s.title}>{auth.session ? `Hola, ${auth.session.displayName}` : 'Inicia sesión en ANDERGO'}</ThemedText>
      {auth.session ? <>
        <View style={s.profileRow}><View style={s.avatar}><ThemedText style={s.avatarEmoji}>{auth.session.avatarEmoji}</ThemedText></View><View style={s.profileCopy}><ThemedText style={s.profileName}>{auth.session.displayName}</ThemedText><ThemedText style={s.profileEmail}>{auth.session.email}</ThemedText></View></View>
        <View style={s.avatarChoices}>{AVATARS.map((emoji) => <Pressable key={emoji} disabled={busy} onPress={() => chooseAvatar(emoji)} style={[s.avatarChoice, auth.session?.avatarEmoji === emoji && s.avatarChoiceActive]}><ThemedText style={s.avatarChoiceText}>{emoji}</ThemedText></Pressable>)}</View>
        <View style={[s.plan, premium ? s.planPremium : null]}>
          <ThemedText style={s.planLabel}>{premium ? 'PREMIUM ACTIVO' : 'PLAN GRATUITO'}</ThemedText>
          <ThemedText style={s.planTitle}>{premium ? 'Beneficios Premium activos' : 'Todo el aprendizaje está disponible'}</ThemedText>
          <ThemedText style={s.planDetail}>{premium ? 'Experiencia sin anuncios y 500 consultas mensuales para Tutor I.A. y Traductor.' : 'Todos los idiomas, niveles y habilidades están abiertos. Free incluye 15 consultas mensuales para Tutor I.A. y Traductor, con anuncios discretos entre actividades.'}</ThemedText>
        </View>
        <View style={s.usage}><ThemedText style={s.usageTitle}>CONSULTAS DEL MES</ThemedText><ThemedText style={s.usageText}>Tutor I.A.: {sub?.usage?.tutorQuery?.remaining ?? (premium ? 500 : 15)} de {sub?.usage?.tutorQuery?.limit ?? (premium ? 500 : 15)} disponibles</ThemedText><ThemedText style={s.usageText}>Traductor: {sub?.usage?.translatorQuery?.remaining ?? (premium ? 500 : 15)} de {sub?.usage?.translatorQuery?.limit ?? (premium ? 500 : 15)} disponibles</ThemedText></View>
        {!premium ? <>
          <ThemedText style={s.section}>Desbloquea ANDERGO Premium</ThemedText>
          <ThemedText style={s.body}>Sin anuncios de terceros y 500 consultas mensuales tanto para Tutor I.A. como para Traductor. El pago se procesa de forma segura en PayPal.</ThemedText>
          <Pressable disabled={busy} onPress={() => buy('monthly')} style={s.primary}><ThemedText style={s.primaryText}>{busy ? 'Preparando pago…' : 'Premium mensual · PayPal'}</ThemedText></Pressable>
          <Pressable disabled={busy} onPress={() => buy('quarterly')} style={s.secondary}><ThemedText style={s.secondaryText}>Premium trimestral · Ahorras más</ThemedText></Pressable>
        </> : null}
        <Pressable onPress={() => auth.signOut()} style={s.signout}><ThemedText style={s.signoutText}>Cerrar sesión</ThemedText></Pressable>
      </> : <>
        <ThemedText style={s.body}>Accede con tu cuenta para entrar a ANDERGO. El plan se identifica al iniciar sesión: Free ofrece 15 consultas mensuales en Tutor I.A. y Traductor; Premium, 500 en cada herramienta.</ThemedText>
        {socialButtons}
        {mode === 'signup' ? <TextInput value={name} onChangeText={setName} autoCapitalize="words" placeholder="Nombre de usuario" style={s.input} /> : null}
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Correo electrónico" style={s.input} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Contraseña (mínimo 6 caracteres)" style={s.input} />
        <Pressable disabled={busy || !email || !password || (mode === 'signup' && !name)} onPress={enter} style={s.primary}><ThemedText style={s.primaryText}>{busy ? 'Preparando…' : mode === 'signup' ? 'Crear mi cuenta' : 'Iniciar sesión'}</ThemedText></Pressable>
        <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }}><ThemedText style={s.switch}>{mode === 'signin' ? '¿Primera vez? Crea tu cuenta' : '¿Ya tienes cuenta? Inicia sesión'}</ThemedText></Pressable>
      </>}
      {notice ? <ThemedText style={s.notice}>{notice}</ThemedText> : null}
      {error ? <ThemedText style={s.error}>{error}</ThemedText> : null}
    </ScrollView>
  </SafeAreaView></ThemedView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F8FC' }, safe: { flex: 1, paddingHorizontal: 22 }, back: { fontSize: 42, color: '#2563EB' },
  card: { gap: 14, maxWidth: 460, width: '100%', alignSelf: 'center', paddingBottom: 36 }, kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#2563EB' },
  title: { fontSize: 32, fontWeight: '900', color: '#173F91' }, section: { fontSize: 19, fontWeight: '900', color: '#173F91', marginTop: 8 }, body: { fontSize: 16, lineHeight: 23, color: '#64748B' },
  input: { height: 58, borderRadius: 16, paddingHorizontal: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', fontSize: 16 },
  primary: { minHeight: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB', paddingHorizontal: 16 }, primaryText: { fontWeight: '900', fontSize: 16, color: '#FFF', textAlign: 'center' },
  secondary: { minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF2FF', paddingHorizontal: 16 }, secondaryText: { fontWeight: '900', color: '#1D4ED8', textAlign: 'center' },
  socialArea: { gap: 9 }, socialButton: { minHeight: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#FFF' }, socialText: { fontWeight: '900', color: '#1E3A8A', fontSize: 16 }, or: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 2 },
  switch: { fontWeight: '800', color: '#2563EB', textAlign: 'center', paddingVertical: 5 }, plan: { padding: 20, borderRadius: 22, backgroundColor: '#EAF2FF', gap: 5 }, planPremium: { backgroundColor: '#173F91' },
  planLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, color: '#2563EB' }, planTitle: { fontSize: 20, fontWeight: '900', color: '#173F91' }, planDetail: { fontSize: 14, lineHeight: 20, color: '#52647C' },
  profileRow:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderRadius:20,backgroundColor:'#FFF',borderWidth:1,borderColor:'#E2E8F0'},avatar:{height:54,width:54,borderRadius:18,alignItems:'center',justifyContent:'center',backgroundColor:'#EAF2FF'},avatarEmoji:{fontSize:29},profileCopy:{flex:1},profileName:{fontSize:17,fontWeight:'900',color:'#173F91'},profileEmail:{fontSize:12,color:'#64748B',marginTop:2},avatarChoices:{flexDirection:'row',gap:8,flexWrap:'wrap'},avatarChoice:{height:40,width:40,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#FFF',borderWidth:1,borderColor:'#DCE6F7'},avatarChoiceActive:{borderColor:'#2563EB',backgroundColor:'#EAF2FF'},avatarChoiceText:{fontSize:20},usage:{padding:14,borderRadius:16,backgroundColor:'#F1F5F9',gap:4},usageTitle:{fontSize:10,fontWeight:'900',letterSpacing:.8,color:'#2563EB'},usageText:{fontSize:12,fontWeight:'800',color:'#475569'}, signout: { paddingVertical: 12 }, signoutText: { fontWeight: '800', color: '#BE123C' }, notice: { padding: 14, borderRadius: 14, backgroundColor: '#DCFCE7', color: '#166534', fontWeight: '700' }, error: { padding: 14, borderRadius: 14, backgroundColor: '#FFE4E6', color: '#BE123C', fontWeight: '700' },
});
