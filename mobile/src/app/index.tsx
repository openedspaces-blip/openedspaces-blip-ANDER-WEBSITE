import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { ThemedText } from '@/components/themed-text';

const ANDERGO_URL = 'https://andergo.online/';

function isAndergoPage(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'andergo.online' || host.endsWith('.andergo.online');
  } catch {
    return false;
  }
}

/** The website is the product surface and source of truth: no parallel course. */
export default function HomeScreen() {
  const webView = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const openExternalPage = (request: WebViewNavigation) => {
    if (isAndergoPage(request.url)) return true;
    Linking.openURL(request.url).catch(() => {});
    return false;
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <View style={styles.appBar}>
          <View>
            <ThemedText style={styles.brand}>ANDERGO</ThemedText>
            <ThemedText style={styles.brandMeta}>Language Academy</ThemedText>
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityLabel="Abrir mi cuenta" onPress={() => router.push('/account' as never)} style={styles.account}>
              <ThemedText style={styles.accountText}>👤</ThemedText>
            </Pressable>
            <Pressable accessibilityLabel="Recargar ANDERGO" onPress={() => { setFailed(false); setLoading(true); webView.current?.reload(); }} style={styles.reload}>
              <ThemedText style={styles.reloadText}>↻</ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <WebView
        ref={webView}
        source={{ uri: ANDERGO_URL }}
        style={styles.webview}
        originWhitelist={['https://*', 'http://*']}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        onShouldStartLoadWithRequest={openExternalPage}
        onLoadStart={() => { setLoading(true); setFailed(false); }}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setFailed(true); }}
      />

      {loading && !failed ? <View style={styles.loading} pointerEvents="none"><ActivityIndicator color="#2563EB" size="large" /><ThemedText style={styles.loadingText}>Abriendo tu academia…</ThemedText></View> : null}
      {failed ? <View style={styles.error}><ThemedText style={styles.errorTitle}>No pudimos abrir ANDERGO</ThemedText><ThemedText style={styles.errorText}>Revisa tu conexión y vuelve a intentarlo.</ThemedText><Pressable onPress={() => webView.current?.reload()} style={styles.retry}><ThemedText style={styles.retryText}>Reintentar</ThemedText></Pressable></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F7FC' }, safeTop: { backgroundColor: '#FFFFFF' },
  appBar: { minHeight: 54, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#E5EEF9', backgroundColor: '#FFFFFF' },
  brand: { color: '#173F91', fontSize: 15, fontWeight: '900', letterSpacing: 1.1 }, brandMeta: { color: '#64748B', fontSize: 9, fontWeight: '700', letterSpacing: .3 },
  actions: { flexDirection: 'row', gap: 8 }, account: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#173F91' }, accountText: { fontSize: 16 }, reload: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#EAF2FF' }, reloadText: { color: '#2563EB', fontSize: 22, fontWeight: '800' },
  webview: { flex: 1, backgroundColor: '#F4F7FC' }, loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(244,247,252,0.94)' }, loadingText: { color: '#173F91', fontSize: 14, fontWeight: '800' },
  error: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 30, backgroundColor: '#F4F7FC' }, errorTitle: { color: '#173F91', fontSize: 20, fontWeight: '900', textAlign: 'center' }, errorText: { color: '#64748B', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retry: { minHeight: 50, marginTop: 8, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#2563EB' }, retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
