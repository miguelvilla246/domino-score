import { useState, useEffect } from "react";

const WINNING_SCORES = [100, 150, 200, 300, 500];

const THEMES = [
  { name: "Ivory & Ebony",    bg: "#1a1a1a", card: "#2a2a2a", accent: "#f5f0e8", accent2: "#c9a84c", text: "#f5f0e8" },
  { name: "Tropical Fiesta",  bg: "#0d3b2e", card: "#1a5c46", accent: "#f4c430", accent2: "#e05c2a", text: "#fdf6e3" },
  { name: "Caribbean Night",  bg: "#0a1628", card: "#162544", accent: "#00d4ff", accent2: "#7c3aed", text: "#e2e8f0" },
  { name: "Sunset",           bg: "#2d1b1b", card: "#3d2424", accent: "#ff6b6b", accent2: "#ffd93d", text: "#fff5f5" },
];

const PLAYER_COLORS = ["#f4c430", "#00d4ff", "#ff6b6b", "#7c3aed"];

const T = {
  en: {
    appName: "Dominós",
    playersTeams: "Players / Teams",
    teams: "Teams",
    players: "Players",
    winningScore: "Winning Score",
    startGame: "Start Game 🎲",
    roundLabel: (r, w) => `Round ${r} · First to ${w}`,
    toWin: "to win",
    addRoundScores: "Add Round Scores",
    addScores: "Add Scores →",
    resetGame: "🔄 Reset Game",
    scoreHistory: "Score History",
    noRounds: "No rounds played yet",
    editingRound: (r) => `✏️ Editing Round ${r}`,
    cancel: "Cancel",
    save: "Save ✓",
    winsWith: "wins with",
    playAgain: "🎲 Play Again",
    newSetup: "⚙️ New Setup",
    defaultNames: ["Us", "Them", "Player 3", "Player 4"],
    placeholders: ["Us", "Them", "Player 3", "Player 4"],
  },
  es: {
    appName: "Dominós",
    playersTeams: "Jugadores / Equipos",
    teams: "Equipos",
    players: "Jugadores",
    winningScore: "Puntos para ganar",
    startGame: "Iniciar Juego 🎲",
    roundLabel: (r, w) => `Ronda ${r} · Primero a ${w}`,
    toWin: "para ganar",
    addRoundScores: "Agregar Puntos",
    addScores: "Agregar →",
    resetGame: "🔄 Reiniciar",
    scoreHistory: "Historial",
    noRounds: "Sin rondas jugadas",
    editingRound: (r) => `✏️ Editando Ronda ${r}`,
    cancel: "Cancelar",
    save: "Guardar ✓",
    winsWith: "gana con",
    playAgain: "🎲 Jugar de Nuevo",
    newSetup: "⚙️ Nueva Partida",
    defaultNames: ["Nosotros", "Ellos", "Jugador 3", "Jugador 4"],
    placeholders: ["Nosotros", "Ellos", "Jugador 3", "Jugador 4"],
  },
};

function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {Array.from({ length: 36 }, (_, i) => {
        const x = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const dur = 2 + Math.random() * 2;
        const color = ["#f4c430","#e05c2a","#00d4ff","#ff6b6b","#7c3aed","#fff"][i % 6];
        return (
          <div key={i} style={{
            position: "absolute", left: `${x}%`, top: "-10px",
            width: 8, height: 14, background: color, borderRadius: 2,
            transform: `rotate(${Math.random()*360}deg)`,
            animation: `fall ${dur}s ${delay}s ease-in forwards`, opacity: 0.9
          }} />
        );
      })}
      <style>{`@keyframes fall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
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

  const theme = THEMES[themeIdx];
  const tx = T[lang];

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, [themeIdx]);

  // When language changes, update default player names only if they're still the defaults
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
    const winnerIdx = newScores.findIndex(s => s >= winScore);
    if (winnerIdx !== -1) {
      setWinner(winnerIdx);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 4000);
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
      setTimeout(() => setConfetti(false), 4000);
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

  return (
    <div style={{
      minHeight: "100vh", background: theme.bg, color: theme.text,
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingBottom: 40
    }}>
      <Confetti active={confetti} />
      <style>{`
        * { box-sizing: border-box; }
        input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        .btn { cursor: pointer; border: none; transition: all 0.18s; }
        .btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .btn:active { transform: translateY(0); filter: brightness(0.95); }
        .card-in { animation: cardIn 0.35s cubic-bezier(.4,0,.2,1) both; }
        @keyframes cardIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        input { background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.18); border-radius: 10px; color: inherit; font-size: 22px; text-align: center; padding: 10px; width: 100%; font-family: inherit; outline: none; transition: border 0.2s; }
        input:focus { border-color: ${theme.accent}; }
        .edit-panel { animation: slideIn 0.22s ease both; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 20px 8px"
      }}>
        {/* Logo + Language toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🁣</span>
          <span style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 1, color: theme.accent }}>{tx.appName}</span>
          {/* Language pill */}
          <div style={{
            display: "flex", borderRadius: 20, overflow: "hidden",
            border: `1px solid rgba(255,255,255,0.15)`, marginLeft: 4
          }}>
            {["en", "es"].map(l => (
              <button key={l} className="btn" onClick={() => switchLang(l)} style={{
                padding: "4px 10px", fontSize: 11, fontWeight: "bold", letterSpacing: 0.5,
                background: lang === l ? theme.accent : "transparent",
                color: lang === l ? theme.bg : theme.text,
                textTransform: "uppercase"
              }}>{l === "en" ? "🇺🇸 EN" : "🇩🇴 ES"}</button>
            ))}
          </div>
        </div>
        {/* Theme dots */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {THEMES.map((t, i) => (
            <button key={i} className="btn" onClick={() => setThemeIdx(i)} style={{
              width: 18, height: 18, borderRadius: "50%", background: t.accent,
              border: i === themeIdx ? `2px solid ${theme.text}` : "2px solid transparent", padding: 0
            }} />
          ))}
        </div>
      </div>

      {/* ── Nav tabs ── */}
      {screen !== "setup" && (
        <div style={{ display: "flex", gap: 4, padding: "0 20px", width: "100%", maxWidth: 480, marginBottom: 4 }}>
          {["game", "history"].map(tab => (
            <button key={tab} className="btn" onClick={() => setScreen(tab)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 13, fontWeight: "bold",
              background: screen === tab ? theme.accent : "rgba(255,255,255,0.07)",
              color: screen === tab ? theme.bg : theme.text, letterSpacing: 0.5
            }}>{tab === "game" ? `🎯 ${lang === "en" ? "Score" : "Puntos"}` : `📋 ${lang === "en" ? "History" : "Historial"}`}</button>
          ))}
          <button className="btn" onClick={() => setScreen("setup")} style={{
            padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: "bold",
            background: "rgba(255,255,255,0.07)", color: theme.text
          }}>⚙️</button>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 480, padding: "0 16px" }}>

        {/* ── SETUP ── */}
        {screen === "setup" && (
          <div className="card-in" style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
            <div style={{ background: theme.card, borderRadius: 18, padding: 20, border: `1px solid rgba(255,255,255,0.1)` }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                {tx.playersTeams}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[2, 3, 4].map(n => (
                  <button key={n} className="btn" onClick={() => setNumPlayers(n)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, fontWeight: "bold", fontSize: 15,
                    background: numPlayers === n ? theme.accent : "rgba(255,255,255,0.08)",
                    color: numPlayers === n ? theme.bg : theme.text, border: "none"
                  }}>{n} {n === 2 ? tx.teams : tx.players}</button>
                ))}
              </div>
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: PLAYER_COLORS[i], flexShrink: 0 }} />
                  <input
                    value={playerNames[i]}
                    onChange={e => setPlayerNames(p => { const n=[...p]; n[i]=e.target.value; return n; })}
                    placeholder={tx.placeholders[i]}
                    style={{ fontSize: 16, padding: 10 }}
                  />
                </div>
              ))}
            </div>

            <div style={{ background: theme.card, borderRadius: 18, padding: 20, border: `1px solid rgba(255,255,255,0.1)` }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                {tx.winningScore}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WINNING_SCORES.map(s => (
                  <button key={s} className="btn" onClick={() => setWinScore(s)} style={{
                    padding: "10px 16px", borderRadius: 10, fontWeight: "bold", fontSize: 15,
                    background: winScore === s ? theme.accent2 : "rgba(255,255,255,0.08)",
                    color: winScore === s ? "#fff" : theme.text, border: "none"
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <button className="btn" onClick={startGame} style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: theme.bg, padding: "16px", borderRadius: 16,
              fontSize: 18, fontWeight: "bold", letterSpacing: 1,
              boxShadow: `0 4px 24px ${theme.accent}44`
            }}>{tx.startGame}</button>
          </div>
        )}

        {/* ── GAME ── */}
        {screen === "game" && (
          <div className="card-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: theme.card, borderRadius: 18, padding: 16, border: `1px solid rgba(255,255,255,0.1)` }}>
              <div style={{ fontSize: 11, opacity: 0.5, textAlign: "center", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                {tx.roundLabel(round, winScore)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 8 }}>
                {Array.from({ length: numPlayers }).map((_, i) => {
                  const pct = Math.min((scores[i] / winScore) * 100, 100);
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: "bold", letterSpacing: 0.5, color: PLAYER_COLORS[i] }}>
                        {playerNames[i]}
                      </div>
                      <div style={{ fontSize: 40, fontWeight: "bold", color: PLAYER_COLORS[i], lineHeight: 1 }}>
                        {scores[i]}
                      </div>
                      <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: PLAYER_COLORS[i], transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.45 }}>{winScore - scores[i]} {tx.toWin}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: theme.card, borderRadius: 18, padding: 16, border: `1px solid rgba(255,255,255,0.1)` }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                {tx.addRoundScores}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 10 }}>
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, textAlign: "center" }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: PLAYER_COLORS[i], marginRight: 4 }} />
                      {playerNames[i]}
                    </div>
                    <input
                      type="number" inputMode="numeric"
                      value={inputs[i]}
                      onChange={e => setInputs(inp => { const n=[...inp]; n[i]=e.target.value; return n; })}
                      placeholder="0" min="0"
                      style={{ fontSize: 28, fontWeight: "bold", color: PLAYER_COLORS[i] }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {[5, 10, 15, 20, 25, 30, 35, 40, 50].map(v => (
                  <button key={v} className="btn" onClick={() => {
                    setInputs(inp => {
                      const n = [...inp];
                      const idx = n.findIndex(x => x === "" || x === "0" || x === 0);
                      if (idx !== -1) n[idx] = String(v);
                      return n;
                    });
                  }} style={{
                    padding: "6px 10px", borderRadius: 8, fontSize: 13, fontWeight: "bold",
                    background: "rgba(255,255,255,0.08)", color: theme.text, border: `1px solid rgba(255,255,255,0.12)`
                  }}>{v}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setInputs(Array(numPlayers).fill(""))} style={{
                flex: 0, padding: "14px 18px", borderRadius: 14, fontSize: 15,
                background: "rgba(255,255,255,0.08)", color: theme.text
              }}>✕</button>
              <button className="btn" onClick={addScores} style={{
                flex: 1, padding: "14px", borderRadius: 14, fontSize: 17, fontWeight: "bold",
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                color: theme.bg, letterSpacing: 0.5, boxShadow: `0 4px 20px ${theme.accent}44`
              }}>{tx.addScores}</button>
            </div>

            <button className="btn" onClick={resetGame} style={{
              padding: "10px", borderRadius: 12, fontSize: 13,
              background: "transparent", color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>{tx.resetGame}</button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {screen === "history" && (
          <div className="card-in">
            <div style={{ background: theme.card, borderRadius: 18, padding: 16, border: `1px solid rgba(255,255,255,0.1)` }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>
                {tx.scoreHistory}
              </div>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", opacity: 0.4, padding: "30px 0", fontSize: 14 }}>{tx.noRounds}</div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: `28px repeat(${numPlayers}, 1fr) 64px`, gap: 6, marginBottom: 8, padding: "0 4px" }}>
                    <div style={{ fontSize: 10, opacity: 0.4 }}>#</div>
                    {Array.from({ length: numPlayers }).map((_, i) => (
                      <div key={i} style={{ fontSize: 11, fontWeight: "bold", color: PLAYER_COLORS[i], textAlign: "center" }}>
                        {playerNames[i]}
                      </div>
                    ))}
                    <div />
                  </div>

                  <div style={{ maxHeight: 440, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                    {history.map((h, idx) => (
                      <div key={idx}>
                        <div style={{
                          display: "grid", gridTemplateColumns: `28px repeat(${numPlayers}, 1fr) 64px`,
                          gap: 6, alignItems: "center",
                          background: editingRound === idx ? `${theme.accent}15` : "rgba(255,255,255,0.04)",
                          borderRadius: 10, padding: "8px 4px",
                          border: editingRound === idx ? `1px solid ${theme.accent}40` : "1px solid transparent",
                          transition: "all 0.2s"
                        }}>
                          <div style={{ fontSize: 11, opacity: 0.4 }}>{h.round}</div>
                          {Array.from({ length: numPlayers }).map((_, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 14, color: PLAYER_COLORS[i], fontWeight: "bold" }}>{h.totals[i]}</div>
                              {h.added[i] > 0 && <div style={{ fontSize: 10, opacity: 0.45 }}>+{h.added[i]}</div>}
                            </div>
                          ))}
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <button className="btn" onClick={() => editingRound === idx ? setEditingRound(null) : openEdit(idx)} style={{
                              padding: "5px 8px", borderRadius: 8, fontSize: 12,
                              background: editingRound === idx ? theme.accent : "rgba(255,255,255,0.1)",
                              color: editingRound === idx ? theme.bg : theme.text
                            }}>✏️</button>
                            <button className="btn" onClick={() => deleteRound(idx)} style={{
                              padding: "5px 8px", borderRadius: 8, fontSize: 12,
                              background: "rgba(255,80,80,0.15)", color: "#ff6b6b"
                            }}>🗑</button>
                          </div>
                        </div>

                        {editingRound === idx && (
                          <div className="edit-panel" style={{
                            background: `${theme.accent}0d`, borderRadius: 12,
                            padding: "14px 12px", marginTop: 4,
                            border: `1px solid ${theme.accent}30`
                          }}>
                            <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                              {tx.editingRound(h.round)}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 8, marginBottom: 12 }}>
                              {Array.from({ length: numPlayers }).map((_, i) => (
                                <div key={i}>
                                  <div style={{ fontSize: 10, color: PLAYER_COLORS[i], marginBottom: 4, textAlign: "center", fontWeight: "bold" }}>
                                    {playerNames[i]}
                                  </div>
                                  <input
                                    type="number" inputMode="numeric"
                                    value={editInputs[i]}
                                    onChange={e => setEditInputs(inp => { const n=[...inp]; n[i]=e.target.value; return n; })}
                                    style={{ fontSize: 22, fontWeight: "bold", color: PLAYER_COLORS[i], padding: 8 }}
                                  />
                                </div>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn" onClick={() => setEditingRound(null)} style={{
                                flex: 1, padding: "10px", borderRadius: 10, fontSize: 13,
                                background: "rgba(255,255,255,0.08)", color: theme.text
                              }}>{tx.cancel}</button>
                              <button className="btn" onClick={saveEdit} style={{
                                flex: 2, padding: "10px", borderRadius: 10, fontSize: 14, fontWeight: "bold",
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                                color: theme.bg
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

        {/* ── WINNER ── */}
        {screen === "winner" && winner !== null && (
          <div className="card-in" style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 36, fontWeight: "bold", color: PLAYER_COLORS[winner], marginBottom: 4, letterSpacing: 1 }}>
              {playerNames[winner]}
            </div>
            <div style={{ fontSize: 18, opacity: 0.7, marginBottom: 4 }}>{tx.winsWith}</div>
            <div style={{ fontSize: 60, fontWeight: "bold", color: theme.accent, lineHeight: 1, marginBottom: 24 }}>
              {scores[winner]}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} style={{
                  background: theme.card, borderRadius: 14, padding: "12px 20px",
                  border: `1.5px solid ${i === winner ? PLAYER_COLORS[i] : "rgba(255,255,255,0.1)"}`
                }}>
                  <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>{playerNames[i]}</div>
                  <div style={{ fontSize: 28, fontWeight: "bold", color: PLAYER_COLORS[i] }}>{scores[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={resetGame} style={{
                flex: 1, padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: "bold",
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: theme.bg
              }}>{tx.playAgain}</button>
              <button className="btn" onClick={() => setScreen("setup")} style={{
                flex: 1, padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: "bold",
                background: "rgba(255,255,255,0.1)", color: theme.text
              }}>{tx.newSetup}</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}