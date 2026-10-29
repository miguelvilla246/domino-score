import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function dominoPersistence() {
  return {
    name: 'domino-persistence',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/App.jsx')) return null

      const originalState = `export default function DominoScore() {
  const [lang, setLang] = useState("en");
  const [screen, setScreen] = useState("setup");
  const [themeIdx, setThemeIdx] = useState(0);
  const [winScore, setWinScore] = useState(200);
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(["Us", "Them", "Player 3", "Player 4"]);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [history, setHistory] = useState([]);
  const [inputs, setInputs] = useState(["", "", "", ""]);
  const [winner, setWinner] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [round, setRound] = useState(1);
  const [editingRound, setEditingRound] = useState(null);
  const [editInputs, setEditInputs] = useState(["", "", "", ""]);
  const [confirmReset, setConfirmReset] = useState(false);`

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

      if (!code.includes(originalState)) {
        this.warn('Domino persistence state block was not found; skipping persistence injection.')
        return null
      }

      let next = code.replace(originalState, persistedState)

      const effectAnchor = `  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.minHeight = "100vh";
  }, [themeIdx]);`

      const persistenceEffect = `${effectAnchor}

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

      next = next.replace(effectAnchor, persistenceEffect)
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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Dominós Score Keeper',
        short_name: 'Dominós',
        description: 'Track your domino game scores',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
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
