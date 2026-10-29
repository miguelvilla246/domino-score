import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function dominoPersistence() {
  return {
    name: 'domino-persistence',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.includes('/src/App.jsx')) return null

      const statePattern = /export default function DominoScore\(\) \{[\s\S]*?const \[confirmReset, setConfirmReset\] = useState\(false\);/

      const persistedState = `const STORAGE_KEY = "domino-score-active-game-v1";

export default function DominoScore() {
  const [savedGame] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [lang, setLang] = useState(savedGame?.lang ?? "en");
  const [screen, setScreen] = useState(savedGame?.screen ?? "setup");
  const [themeIdx, setThemeIdx] = useState(savedGame?.themeIdx ?? 0);
  const [winScore, setWinScore] = useState(savedGame?.winScore ?? 200);
  const [numPlayers, setNumPlayers] = useState(savedGame?.numPlayers ?? 2);
  const [playerNames, setPlayerNames] = useState(savedGame?.playerNames ?? ["Us", "Them", "Player 3", "Player 4"]);
  const [scores, setScores] = useState(savedGame?.scores ?? [0, 0, 0, 0]);
  const [history, setHistory] = useState(savedGame?.history ?? []);
  const [inputs, setInputs] = useState(savedGame?.inputs ?? ["", "", "", ""]);
  const [winner, setWinner] = useState(savedGame?.winner ?? null);
  const [confetti, setConfetti] = useState(false);
  const [round, setRound] = useState(savedGame?.round ?? 1);
  const [editingRound, setEditingRound] = useState(null);
  const [editInputs, setEditInputs] = useState(["", "", "", ""]);
  const [confirmReset, setConfirmReset] = useState(false);`

      if (!statePattern.test(code)) {
        this.error('Domino persistence injection failed: state block not found in src/App.jsx')
      }

      let next = code.replace(statePattern, persistedState)

      const effectPattern = /  useEffect\(\(\) => \{\n    document\.body\.style\.background = theme\.bg;\n    document\.body\.style\.margin = "0";\n    document\.body\.style\.padding = "0";\n    document\.body\.style\.minHeight = "100vh";\n  \}, \[themeIdx\]\);/

      const persistenceEffect = `  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.minHeight = "100vh";
  }, [themeIdx]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lang,
        screen,
        themeIdx,
        winScore,
        numPlayers,
        playerNames,
        scores,
        history,
        inputs,
        winner,
        round,
      }));
    } catch {
      // Storage can be unavailable in private/restricted browser modes.
    }
  }, [lang, screen, themeIdx, winScore, numPlayers, playerNames, scores, history, inputs, winner, round]);`

      if (!effectPattern.test(next)) {
        this.error('Domino persistence injection failed: theme effect anchor not found in src/App.jsx')
      }

      next = next.replace(effectPattern, persistenceEffect)
      return { code: next, map: null }
    },
  }
}

export default defineConfig({
  plugins: [
    dominoPersistence(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Dominó Score Keeper',
        short_name: 'Dominó',
        description: 'Track domino game scores and resume active games.',
        theme_color: '#0e0e0f',
        background_color: '#0e0e0f',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
