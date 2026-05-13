import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Social Studio',
  webDir: 'www',
  android: {
    allowMixedContent: true   // permite llamadas HTTP desde el APK
  },
  // ── Live-reload (solo desarrollo) ──────────────────────────
  // Descomenta estas líneas para probar en celular sin compilar APK:
  // server: {
  //   url: 'http://20.20.1.119:8100',
  //   cleartext: true
  // }
};

export default config;
