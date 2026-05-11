import { useState, useEffect } from "react";

const WINNING_SCORES = [100, 150, 200, 300, 500];

const THEMES = [
  {
    name: "Onyx",
    bg: "#0e0e0f",
    bgGrad: "radial-gradient(ellipse at 20% 0%, #1e1a2e 0%, #0e0e0f 60%)",
    card: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(255,255,255,0.08)",
    accent: "#e8d5a3",
    accent2: "#c9a84c",
    glow: "#c9a84c",
    text: "#f0ece0",
    muted: "rgba(240,236,224,0.45)",
  },
  {
    name: "Jade",
    bg: "#050f0a",
    bgGrad: "radial-gradient(ellipse at 80% 20%, #0a2818 0%, #050f0a 65%)",
    card: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(100,220,120,0.12)",
    accent: "#4ade80",
    accent2: "#f59e0b",
    glow: "#4ade80",
    text: "#ecfdf5",
    muted: "rgba(236,253,245,0.45)",
  },
  {
    name: "Cobalt",
    bg: "#04080f",
    bgGrad: "radial-gradient(ellipse at 50% 0%, #0a1a3a 0%, #04080f 65%)",
    card: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(56,189,248,0.12)",
    accent: "#38bdf8",
    accent2: "#818cf8",
    glow: "#38bdf8",
    text: "#f0f9ff",
    muted: "rgba(240,249,255,0.45)",
  },
  {
    name: "Ember",
    bg: "#0c0604",
    bgGrad: "radial-gradient(ellipse at 30% 10%, #1f0a04 0%, #0c0604 65%)",
    card: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(251,113,60,0.12)",
    accent: "#fb713c",
    accent2: "#fbbf24",
    glow: "#fb713c",
    text: "#fff7ed",
    muted: "rgba(255,247,237,0.45)",
  },
];

const PLAYER_COLORS = ["#f4c430", "#34d399", "#f472b6", "#a78bfa"];

const T = {
  en: {
    appName: "DOMINÓS",
    tagline: "Score Keeper",
    playersTeams: "Players / Teams",
    teams: "Teams",
    players: "Players",
    winningScore: "First to",
    startGame: "Start Game",
    roundLabel: (r) => `ROUND ${r}`,
    firstTo: (w) => `FIRST TO ${w}`,
    toWin: "to win",
    addRoundScores: "This Round",
    addScores: "Add Scores",
    resetGame: "Reset Game",
    scoreHistory: "History",
    noRounds: "No rounds yet",
    editingRound: (r) => `Edit Round ${r}`,
    cancel: "Cancel",
    save: "Save",
    winsWith: "wins!",
    finalScore: "Final Score",
    playAgain: "Play Again",
    newSetup: "New Game",
    defaultNames: ["Us", "Them", "Player 3", "Player 4"],
    placeholders: ["Us", "Them", "Player 3", "Player 4"],
  },
  es: {
    appName: "DOMINÓS",
    tagline: "Marcador",
    playersTeams: "Jugadores / Equipos",
    teams: "Equipos",
    players: "Jugadores",
    winningScore: "Primero a",
    startGame: "Iniciar",
    roundLabel: (r) => `RONDA ${r}`,
    firstTo: (w) => `PRIMERO A ${w}`,
    toWin: "para ganar",
    addRoundScores: "Esta Ronda",
    addScores: "Agregar",
    resetGame: "Reiniciar",
    scoreHistory: "Historial",
    noRounds: "Sin rondas aún",
    editingRound: (r) => `Editar Ronda ${r}`,
    cancel: "Cancelar",
    save: "Guardar",
    winsWith: "¡gana!",
    finalScore: "Puntuación Final",
    playAgain: "Jugar de Nuevo",
    newSetup: "Nuevo Juego",
    defaultNames: ["Nosotros", "Ellos", "Jugador 3", "Jugador 4"],
    placeholders: ["Nosotros", "Ellos", "Jugador 3", "Jugador 4"],
  },
};

/* ── Domino pip layout ── */
function DominoPip({ lit, color }) {
  return (
    <div style={{
      width: 6, height: 6, borderRadius: "50%",
      background: lit ? color : "rgba(255,255,255,0.08)",
      boxShadow: lit ? `0 0 6px ${color}` : "none",
      transition: "all 0.3s",
    }} />
  );
}

function DominoTile({ topVal = 0, botVal = 0, color, size = 1 }) {
  const layout = (n) => {
    const p = Array(9).fill(false);
    if (n >= 1) p[4] = true;
    if (n >= 2) p[0] = true;
    if (n >= 3) p[8] = true;
    if (n >= 4) p[2] = true;
    if (n >= 5) p[6] = true;
    if (n >= 6) { p[3] = true; p[5] = true; }
    return p;
  };
  const w = 28 * size, gap = 3 * size, pip = 6 * size;
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center",
      background: "rgba(0,0,0,0.55)", borderRadius: 6 * size,
      padding: `${5 * size}px ${4 * size}px`,
      border: `1px solid rgba(255,255,255,0.12)`,
      boxShadow: `0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
      gap: gap,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(3, ${pip}px)`, gap: gap }}>
        {layout(topVal).map((lit, i) => <DominoPip key={i} lit={lit} color={color} />)}
      </div>
      <div style={{ width: "75%", height: 1, background: "rgba(255,255,255,0.15)" }} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(3, ${pip}px)`, gap: gap }}>
        {layout(botVal).map((lit, i) => <DominoPip key={i} lit={lit} color={color} />)}
      </div>
    </div>
  );
}

function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {Array.from({ length: 50 }, (_, i) => {
        const x = Math.random() * 100;
        const delay = Math.random() * 2;
        const dur = 2.5 + Math.random() * 2;
        const color = ["#f4c430","#fb713c","#38bdf8","#f472b6","#a78bfa","#34d399","#fff"][i % 7];
        const size = 6 + Math.random() * 8;
        return (
          <div key={i} style={{
            position: "absolute", left: `${x}%`, top: "-20px",
            width: size, height: size * 1.6, background: color,
            borderRadius: Math.random() > 0.5 ? "50%" : 2,
            animation: `confettiFall ${dur}s ${delay}s ease-in forwards`,
            opacity: 0.95
          }} />
        );
      })}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function DominoScore() {
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
  const [scorePop, setScorePop] = useState(null);

  const theme = THEMES[themeIdx];
  const tx = T[lang];

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.minHeight = "100vh";
  }, [themeIdx]);

  const switchLang = (newLang) => {
    const oldDefaults = T[lang].defaultNames;
    setPlayerNames(prev => prev.map((name, i) =>
      name === oldDefaults[i] ? T[newLang].defaultNames[i] : name
    ));
    setLang(newLang);
  };

  const startGame = () => {
    setScores(Array(numPlayers).fill(0));
    setHistory([]);
    setInputs(Array(numPlayers).fill(""));
    setWinner(null);
    setRound(1);
    setEditingRound(null);
    setScreen("game");
  };

  const addScores = () => {
    const vals = inputs.map(v => parseInt(v) || 0);
    if (vals.every(v => v === 0)) return;
    const newScores = scores.map((s, i) => s + vals[i]);
    setHistory(h => [...h, { round, added: vals, totals: newScores }]);
    setScores(newScores);
    setInputs(Array(numPlayers).fill(""));
    setRound(r => r + 1);
    setScorePop(Date.now());
    setTimeout(() => setScorePop(null), 400);
    const winnerIdx = newScores.findIndex(s => s >= winScore);
    if (winnerIdx !== -1) {
      setWinner(winnerIdx);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5000);
      setScreen("winner");
    }
  };

  const openEdit = (idx) => {
    setEditingRound(idx);
    setEditInputs(history[idx].added.map(String));
  };

  const saveEdit = () => {
    const newAdded = editInputs.map(v => parseInt(v) || 0);
    const newHistory = history.map((h, i) => i === editingRound ? { ...h, added: newAdded } : h);
    let running = Array(numPlayers).fill(0);
    const recalced = newHistory.map(h => {
      running = running.map((s, i) => s + h.added[i]);
      return { ...h, totals: [...running] };
    });
    setHistory(recalced);
    const finalTotals = recalced[recalced.length - 1]?.totals || Array(numPlayers).fill(0);
    setScores(finalTotals);
    setEditingRound(null);
    const winnerIdx = finalTotals.findIndex(s => s >= winScore);
    if (winnerIdx !== -1) {
      setWinner(winnerIdx);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5000);
      setScreen("winner");
    }
  };

  const deleteRound = (idx) => {
    const newHistory = history.filter((_, i) => i !== idx);
    let running = Array(numPlayers).fill(0);
    const recalced = newHistory.map(h => {
      running = running.map((s, i) => s + h.added[i]);
      return { ...h, totals: [...running] };
    });
    setHistory(recalced);
    const finalTotals = recalced.length > 0 ? recalced[recalced.length - 1].totals : Array(numPlayers).fill(0);
    setScores(finalTotals);
    setRound(r => r - 1);
    setEditingRound(null);
  };

  const resetGame = () => {
    setScores(Array(numPlayers).fill(0));
    setHistory([]);
    setInputs(Array(numPlayers).fill(""));
    setWinner(null);
    setRound(1);
    setEditingRound(null);
    setScreen("game");
  };

  const leadingPlayer = scores.indexOf(Math.max(...scores));

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bgGrad,
      color: theme.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingBottom: 48,
      position: "relative",
      overflow: "hidden",
    }}>
      <Confetti active={confetti} />

      {/* Background domino watermark */}
      <div style={{
        position: "fixed", bottom: -40, right: -20, opacity: 0.03,
        fontSize: 220, pointerEvents: "none", userSelect: "none",
        transform: "rotate(-15deg)", zIndex: 0,
      }}>🁣</div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        input::-webkit-inner-spin-button, input::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        .btn { cursor: pointer; border: none; transition: all 0.16s cubic-bezier(.4,0,.2,1); }
        .btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
        .btn:active { transform: translateY(0) scale(0.97); filter: brightness(0.9); }
        .screen-enter { animation: screenEnter 0.4s cubic-bezier(.4,0,.2,1) both; }
        @keyframes screenEnter { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        .score-pop { animation: scorePop 0.35s cubic-bezier(.4,0,.2,1); }
        @keyframes scorePop { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 100%{transform:scale(1)} }
        .glow-text { text-shadow: 0 0 30px var(--glow), 0 0 60px var(--glow-dim); }
        input {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          color: inherit;
          font-size: 28px;
          font-family: 'Bebas Neue', 'Georgia', serif;
          text-align: center;
          padding: 12px 8px;
          width: 100%;
          outline: none;
          transition: all 0.2s;
          letter-spacing: 2px;
        }
        input:focus {
          border-color: ${theme.accent};
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 0 3px ${theme.accent}22;
        }
        input::placeholder { color: rgba(255,255,255,0.2); font-size: 22px; }
        .edit-panel { animation: editSlide 0.2s ease both; }
        @keyframes editSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        .tab-active { position: relative; }
        .tab-active::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 20%; right: 20%;
          height: 2px;
          background: ${theme.accent};
          border-radius: 1px;
        }
        .quick-btn {
          padding: 8px 0; border-radius: 10px; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.06);
          color: ${theme.text};
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.15s;
          flex: 1;
        }
        .quick-btn:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
        .quick-btn:active { transform: scale(0.96); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        width: "100%", maxWidth: 480, zIndex: 10,
        padding: "20px 20px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{
            fontFamily: "'Bebas Neue', 'Georgia', serif",
            fontSize: 28, letterSpacing: 4,
            color: theme.accent,
            textShadow: `0 0 20px ${theme.glow}66`,
          }}>{tx.appName}</span>
          <span style={{ fontSize: 11, color: theme.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
            {tx.tagline}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Language toggle */}
          <div style={{ display: "flex", borderRadius: 20, overflow: "hidden", border: `1px solid rgba(255,255,255,0.12)` }}>
            {["en","es"].map(l => (
              <button key={l} className="btn" onClick={() => switchLang(l)} style={{
                padding: "4px 10px", fontSize: 10, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: 1,
                background: lang === l ? theme.accent : "transparent",
                color: lang === l ? "#000" : theme.muted,
                textTransform: "uppercase",
              }}>{l === "en" ? "EN" : "ES"}</button>
            ))}
          </div>
          {/* Theme dots */}
          <div style={{ display: "flex", gap: 6 }}>
            {THEMES.map((t, i) => (
              <button key={i} className="btn" onClick={() => setThemeIdx(i)} style={{
                width: 14, height: 14, borderRadius: "50%",
                background: t.accent,
                border: i === themeIdx ? `2px solid ${theme.text}` : "2px solid transparent",
                padding: 0, boxShadow: i === themeIdx ? `0 0 8px ${t.glow}88` : "none",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV TABS ── */}
      {screen !== "setup" && (
        <div style={{
          width: "100%", maxWidth: 480, zIndex: 10,
          padding: "14px 20px 0",
          display: "flex", gap: 0,
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
          marginBottom: 16,
        }}>
          {[
            { id: "game", label: lang === "en" ? "Score" : "Puntos" },
            { id: "history", label: lang === "en" ? "History" : "Historial" },
          ].map(tab => (
            <button key={tab.id} className={`btn ${screen === tab.id ? "tab-active" : ""}`}
              onClick={() => setScreen(tab.id)} style={{
                flex: 1, padding: "8px 0 12px", fontSize: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: screen === tab.id ? 700 : 400,
                background: "transparent",
                color: screen === tab.id ? theme.accent : theme.muted,
                letterSpacing: 1.5, textTransform: "uppercase",
                borderBottom: "none",
              }}>{tab.label}</button>
          ))}
          <button className="btn" onClick={() => setScreen("setup")} style={{
            padding: "8px 16px 12px", fontSize: 13,
            background: "transparent", color: theme.muted,
          }}>⚙️</button>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 480, padding: "0 16px", zIndex: 1, position: "relative" }}>

        {/* ══════════════ SETUP ══════════════ */}
        {screen === "setup" && (
          <div className="screen-enter" style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 20 }}>

            {/* Decorative domino tiles */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 4 }}>
              {[{t:3,b:4},{t:6,b:1},{t:2,b:5}].map((d,i) => (
                <DominoTile key={i} topVal={d.t} botVal={d.b} color={theme.accent} size={0.9} />
              ))}
            </div>

            {/* Players card */}
            <div style={{
              background: theme.card, borderRadius: 20,
              padding: 20, border: `1px solid ${theme.cardBorder}`,
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: 10, color: theme.muted, marginBottom: 14, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                {tx.playersTeams}
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {[2, 3, 4].map(n => (
                  <button key={n} className="btn" onClick={() => setNumPlayers(n)} style={{
                    flex: 1, padding: "11px 0", borderRadius: 12,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
                    background: numPlayers === n
                      ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`
                      : "rgba(255,255,255,0.05)",
                    color: numPlayers === n ? "#000" : theme.muted,
                    border: numPlayers === n ? "none" : `1px solid rgba(255,255,255,0.08)`,
                    boxShadow: numPlayers === n ? `0 4px 16px ${theme.glow}44` : "none",
                  }}>{n} {n === 2 ? tx.teams : tx.players}</button>
                ))}
              </div>
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 10, height: 32, borderRadius: 4,
                    background: PLAYER_COLORS[i],
                    boxShadow: `0 0 10px ${PLAYER_COLORS[i]}66`,
                    flexShrink: 0,
                  }} />
                  <input
                    value={playerNames[i]}
                    onChange={e => setPlayerNames(p => { const n=[...p]; n[i]=e.target.value; return n; })}
                    placeholder={tx.placeholders[i]}
                    style={{ fontSize: 18, letterSpacing: 1, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              ))}
            </div>

            {/* Winning score card */}
            <div style={{
              background: theme.card, borderRadius: 20,
              padding: 20, border: `1px solid ${theme.cardBorder}`,
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: 10, color: theme.muted, marginBottom: 14, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                {tx.winningScore}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WINNING_SCORES.map(s => (
                  <button key={s} className="btn" onClick={() => setWinScore(s)} style={{
                    padding: "10px 18px", borderRadius: 12,
                    fontFamily: "'Bebas Neue', serif", fontSize: 20, letterSpacing: 2,
                    background: winScore === s
                      ? `linear-gradient(135deg, ${theme.accent2}, ${theme.accent})`
                      : "rgba(255,255,255,0.05)",
                    color: winScore === s ? "#000" : theme.text,
                    border: winScore === s ? "none" : `1px solid rgba(255,255,255,0.08)`,
                    boxShadow: winScore === s ? `0 4px 20px ${theme.glow}55` : "none",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <button className="btn" onClick={startGame} style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: "#000", padding: "18px", borderRadius: 16,
              fontFamily: "'Bebas Neue', serif", fontSize: 22, letterSpacing: 3,
              boxShadow: `0 8px 32px ${theme.glow}55`,
              border: "none",
            }}>{tx.startGame} →</button>
          </div>
        )}

        {/* ══════════════ GAME ══════════════ */}
        {screen === "game" && (
          <div className="screen-enter" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Round / status bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px" }}>
              <span style={{ fontFamily: "'Bebas Neue', serif", fontSize: 15, letterSpacing: 3, color: theme.muted }}>
                {tx.roundLabel(round)}
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: theme.muted, letterSpacing: 1 }}>
                {tx.firstTo(winScore)}
              </span>
            </div>

            {/* Scoreboard */}
            <div style={{
              background: theme.card, borderRadius: 24,
              padding: "20px 16px", border: `1px solid ${theme.cardBorder}`,
              backdropFilter: "blur(10px)",
              boxShadow: `0 0 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 12 }}>
                {Array.from({ length: numPlayers }).map((_, i) => {
                  const pct = Math.min((scores[i] / winScore) * 100, 100);
                  const isLeading = i === leadingPlayer && scores[i] > 0;
                  return (
                    <div key={i} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      padding: "14px 8px", borderRadius: 16,
                      background: isLeading ? `${PLAYER_COLORS[i]}0e` : "transparent",
                      border: isLeading ? `1px solid ${PLAYER_COLORS[i]}30` : "1px solid transparent",
                      transition: "all 0.4s",
                    }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                        color: PLAYER_COLORS[i], textTransform: "uppercase",
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {playerNames[i]}
                      </div>
                      <div style={{
                        fontFamily: "'Bebas Neue', serif",
                        fontSize: numPlayers === 2 ? 64 : 48,
                        lineHeight: 1,
                        color: PLAYER_COLORS[i],
                        textShadow: isLeading ? `0 0 30px ${PLAYER_COLORS[i]}88` : "none",
                        transition: "text-shadow 0.4s",
                        className: scorePop ? "score-pop" : "",
                      }}>
                        {scores[i]}
                      </div>
                      {/* Arc progress */}
                      <div style={{ width: "90%", position: "relative" }}>
                        <div style={{
                          height: 3, borderRadius: 2,
                          background: "rgba(255,255,255,0.07)",
                        }}>
                          <div style={{
                            width: `${pct}%`, height: "100%", borderRadius: 2,
                            background: `linear-gradient(90deg, ${PLAYER_COLORS[i]}88, ${PLAYER_COLORS[i]})`,
                            boxShadow: `0 0 8px ${PLAYER_COLORS[i]}88`,
                            transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: theme.muted, fontFamily: "'DM Sans', sans-serif" }}>
                        {winScore - scores[i]} {tx.toWin}
                      </div>
                      {/* Small domino tile decorative */}
                      <DominoTile
                        topVal={Math.min(6, Math.floor(scores[i] / winScore * 6))}
                        botVal={Math.min(6, Math.floor((scores[i] % (winScore/6)) / (winScore/6) * 6 + 1))}
                        color={PLAYER_COLORS[i]}
                        size={0.7}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score entry */}
            <div style={{
              background: theme.card, borderRadius: 20,
              padding: "18px 16px", border: `1px solid ${theme.cardBorder}`,
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: 10, color: theme.muted, marginBottom: 14, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                {tx.addRoundScores}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 10, marginBottom: 14 }}>
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i}>
                    <div style={{
                      fontSize: 10, marginBottom: 6, textAlign: "center",
                      color: PLAYER_COLORS[i], fontWeight: 700, letterSpacing: 1,
                      fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                    }}>
                      {playerNames[i]}
                    </div>
                    <input
                      type="number" inputMode="numeric"
                      value={inputs[i]}
                      onChange={e => setInputs(inp => { const n=[...inp]; n[i]=e.target.value; return n; })}
                      placeholder="0" min="0"
                      style={{ color: PLAYER_COLORS[i], textShadow: `0 0 20px ${PLAYER_COLORS[i]}66` }}
                    />
                  </div>
                ))}
              </div>

              {/* Quick-add grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(v => (
                  <button key={v} className="quick-btn" onClick={() => {
                    setInputs(inp => {
                      const n = [...inp];
                      const idx = n.findIndex(x => x === "" || x === "0" || x === 0);
                      if (idx !== -1) n[idx] = String(v);
                      return n;
                    });
                  }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setInputs(Array(numPlayers).fill(""))} style={{
                padding: "16px 18px", borderRadius: 14,
                background: "rgba(255,255,255,0.06)", color: theme.muted,
                border: `1px solid rgba(255,255,255,0.08)`, fontSize: 16,
              }}>✕</button>
              <button className="btn" onClick={addScores} style={{
                flex: 1, padding: "16px", borderRadius: 14,
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                color: "#000",
                fontFamily: "'Bebas Neue', serif", fontSize: 20, letterSpacing: 2,
                boxShadow: `0 6px 24px ${theme.glow}55`,
                border: "none",
              }}>{tx.addScores}</button>
            </div>

            <button className="btn" onClick={resetGame} style={{
              padding: "11px", borderRadius: 12, fontSize: 12,
              background: "transparent", color: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.07)",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: 1,
            }}>{tx.resetGame}</button>
          </div>
        )}

        {/* ══════════════ HISTORY ══════════════ */}
        {screen === "history" && (
          <div className="screen-enter">
            <div style={{
              background: theme.card, borderRadius: 20,
              padding: 16, border: `1px solid ${theme.cardBorder}`,
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ fontSize: 10, color: theme.muted, marginBottom: 14, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                {tx.scoreHistory}
              </div>

              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🁣</div>
                  <div style={{ color: theme.muted, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{tx.noRounds}</div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `24px repeat(${numPlayers}, 1fr) 60px`,
                    gap: 6, marginBottom: 8, padding: "0 4px",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    <div style={{ fontSize: 10, color: theme.muted }}>#</div>
                    {Array.from({ length: numPlayers }).map((_, i) => (
                      <div key={i} style={{ fontSize: 10, fontWeight: 700, color: PLAYER_COLORS[i], textAlign: "center", letterSpacing: 1 }}>
                        {playerNames[i]}
                      </div>
                    ))}
                    <div />
                  </div>

                  <div style={{ maxHeight: 450, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                    {history.map((h, idx) => (
                      <div key={idx}>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: `24px repeat(${numPlayers}, 1fr) 60px`,
                          gap: 6, alignItems: "center",
                          background: editingRound === idx ? `${theme.accent}12` : "rgba(255,255,255,0.03)",
                          borderRadius: 12, padding: "10px 6px",
                          border: editingRound === idx ? `1px solid ${theme.accent}35` : "1px solid transparent",
                          transition: "all 0.2s",
                        }}>
                          <div style={{ fontSize: 10, color: theme.muted, fontFamily: "'DM Sans', sans-serif" }}>{h.round}</div>
                          {Array.from({ length: numPlayers }).map((_, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                              <div style={{ fontFamily: "'Bebas Neue', serif", fontSize: 18, color: PLAYER_COLORS[i], letterSpacing: 1 }}>
                                {h.totals[i]}
                              </div>
                              {h.added[i] > 0 && (
                                <div style={{ fontSize: 9, color: PLAYER_COLORS[i], opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}>
                                  +{h.added[i]}
                                </div>
                              )}
                            </div>
                          ))}
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <button className="btn" onClick={() => editingRound === idx ? setEditingRound(null) : openEdit(idx)} style={{
                              padding: "5px 7px", borderRadius: 8, fontSize: 12,
                              background: editingRound === idx ? theme.accent : "rgba(255,255,255,0.08)",
                              color: editingRound === idx ? "#000" : theme.muted,
                              border: "none",
                            }}>✏️</button>
                            <button className="btn" onClick={() => deleteRound(idx)} style={{
                              padding: "5px 7px", borderRadius: 8, fontSize: 12,
                              background: "rgba(255,60,60,0.12)", color: "#ff6b6b",
                              border: "none",
                            }}>🗑</button>
                          </div>
                        </div>

                        {editingRound === idx && (
                          <div className="edit-panel" style={{
                            background: `${theme.accent}0a`, borderRadius: 14,
                            padding: "14px 12px", marginTop: 4,
                            border: `1px solid ${theme.accent}25`,
                          }}>
                            <div style={{ fontSize: 10, color: theme.muted, marginBottom: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
                              {tx.editingRound(h.round)}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 8, marginBottom: 12 }}>
                              {Array.from({ length: numPlayers }).map((_, i) => (
                                <div key={i}>
                                  <div style={{ fontSize: 9, color: PLAYER_COLORS[i], marginBottom: 4, textAlign: "center", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1 }}>
                                    {playerNames[i]}
                                  </div>
                                  <input
                                    type="number" inputMode="numeric"
                                    value={editInputs[i]}
                                    onChange={e => setEditInputs(inp => { const n=[...inp]; n[i]=e.target.value; return n; })}
                                    style={{ color: PLAYER_COLORS[i], fontSize: 24, padding: 10 }}
                                  />
                                </div>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn" onClick={() => setEditingRound(null)} style={{
                                flex: 1, padding: "11px", borderRadius: 10,
                                background: "rgba(255,255,255,0.06)", color: theme.muted,
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, border: `1px solid rgba(255,255,255,0.08)`,
                              }}>{tx.cancel}</button>
                              <button className="btn" onClick={saveEdit} style={{
                                flex: 2, padding: "11px", borderRadius: 10,
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                                color: "#000",
                                fontFamily: "'Bebas Neue', serif", fontSize: 17, letterSpacing: 2,
                                border: "none",
                              }}>{tx.save}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ WINNER ══════════════ */}
        {screen === "winner" && winner !== null && (
          <div className="screen-enter" style={{ textAlign: "center", paddingTop: 16 }}>
            {/* Glow burst */}
            <div style={{
              width: 160, height: 160, borderRadius: "50%",
              background: `radial-gradient(circle, ${PLAYER_COLORS[winner]}33 0%, transparent 70%)`,
              margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse 2s ease-in-out infinite",
            }}>
              <div style={{ fontSize: 72 }}>🏆</div>
            </div>
            <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}`}</style>

            <div style={{
              fontFamily: "'Bebas Neue', serif",
              fontSize: 48, letterSpacing: 4,
              color: PLAYER_COLORS[winner],
              textShadow: `0 0 40px ${PLAYER_COLORS[winner]}99`,
              marginBottom: 4,
            }}>
              {playerNames[winner]}
            </div>
            <div style={{ fontSize: 14, color: theme.muted, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2, textTransform: "uppercase" }}>
              {tx.winsWith}
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', serif",
              fontSize: 96, lineHeight: 1,
              color: theme.accent,
              textShadow: `0 0 60px ${theme.glow}88`,
              marginBottom: 24,
            }}>
              {scores[winner]}
            </div>

            {/* Final scores */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} style={{
                  background: theme.card, borderRadius: 16, padding: "14px 22px",
                  border: `1.5px solid ${i === winner ? PLAYER_COLORS[i] : "rgba(255,255,255,0.07)"}`,
                  boxShadow: i === winner ? `0 0 24px ${PLAYER_COLORS[i]}44` : "none",
                }}>
                  <div style={{ fontSize: 10, color: theme.muted, marginBottom: 4, fontFamily: "'DM Sans', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
                    {playerNames[i]}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', serif", fontSize: 32, color: PLAYER_COLORS[i], letterSpacing: 2 }}>
                    {scores[i]}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={resetGame} style={{
                flex: 1, padding: "16px", borderRadius: 14,
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                color: "#000",
                fontFamily: "'Bebas Neue', serif", fontSize: 18, letterSpacing: 2,
                boxShadow: `0 6px 28px ${theme.glow}55`, border: "none",
              }}>{tx.playAgain}</button>
              <button className="btn" onClick={() => setScreen("setup")} style={{
                flex: 1, padding: "16px", borderRadius: 14,
                background: "rgba(255,255,255,0.06)", color: theme.text,
                fontFamily: "'Bebas Neue', serif", fontSize: 18, letterSpacing: 2,
                border: `1px solid rgba(255,255,255,0.1)`,
              }}>{tx.newSetup}</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}