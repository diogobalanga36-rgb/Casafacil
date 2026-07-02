/* ========================================================================
   CASAFÁCIL — Configuração e inicialização do Firebase
   ------------------------------------------------------------------------
   1. Crie um projeto gratuito em https://console.firebase.google.com
   2. Ative no projeto: Authentication (método Email/Palavra-passe),
      Firestore Database (modo produção) e Storage.
   3. Em "Definições do projeto → Geral → As suas apps → Web", copie o
      objecto firebaseConfig e cole-o abaixo, substituindo os valores
      "SUBSTITUIR_...".
   4. Publique as regras de segurança sugeridas no ficheiro
      firestore.rules / storage.rules incluído neste pacote.
   Sem este passo, o site funciona (design, navegação, FAQ) mas o
   cadastro, a plataforma de imóveis e o CasaBot não guardam nem leem
   dados reais.
   ======================================================================== */
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBjLhKaLgLNWVYgrYgKV5eNUd3gfz3pga0",
    authDomain: "casafacil-2a55c.firebaseapp.com",
    projectId: "casafacil-2a55c",
    storageBucket: "casafacil-2a55c.firebasestorage.app",
    messagingSenderId: "1014904259983",
    appId: "1:1014904259983:web:c5ea16d3050ebea9de37fa"
  };

  const isConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith('SUBSTITUIR_'));
  window.CASAFACIL_FIREBASE_READY = false;

  if (!isConfigured) {
    console.warn('[CasaFácil] Firebase ainda não está configurado. Edite firebase-config.js com as credenciais do seu projeto.');
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    window.auth = firebase.auth();
    window.storage = firebase.storage();
    window.fbTimestamp = firebase.firestore.FieldValue.serverTimestamp;
    window.CASAFACIL_FIREBASE_READY = true;

    // Estado de sessão partilhado por todas as páginas (nav, formulários, etc.)
    window.auth.onAuthStateChanged(function (user) {
      window.CASAFACIL_CURRENT_USER = user || null;
      document.dispatchEvent(new CustomEvent('casafacil:auth-changed', { detail: { user: user || null } }));
    });
  } catch (err) {
    console.error('[CasaFácil] Erro ao inicializar o Firebase:', err);
    window.CASAFACIL_FIREBASE_READY = false;
  }
})();
