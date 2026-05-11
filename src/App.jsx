import { useState, useEffect, useRef } from "react";

const WINNING_SCORES = [100, 150, 200, 300, 500];
const DOMINO_PIPS = ["⚀","⚁","⚂","⚃","⚄","⚅"];

const THEMES = [
  { name: "Ivory & Ebony", bg: "#1a1a1a", card: "#2a2a2a", accent: "#f5f0e8", accent2: "#c9a84c", text: "#f5f0e8", pip: "#f5f0e8" },
  { name: "Tropical Fiesta", bg: "#0d3b2e", card: "#1a5c46", accent: "#f4c430", accent2: "#e05c2a", text: "#fdf6e3", pip: "#f4c430" },
  { name: "Caribbean Night", bg: "#0a1628", card: "#162544", accent: "#00d4ff", accent2: "#7c3aed", text: "#e2e8f0", pip: "#00d4ff" },
  { name: "Sunset", bg: "#2d1b1b", card: "#3d2424", accent: "#ff6b6b", accent2: "#ffd93d", text: "#fff5f5", pip: "#ffd93d" },
];

function Pip({ filled, color }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: filled ? color : "transparent",
      border: `1px solid ${filled ? color : "rgba(255,255,255,0.1)"}`,
      transition: "all 0.2s"
    }} />
  );
}

function DominoTile({ value, color }) {
  const top = Math.min(value, 6);
  const bot = Math.max(0, value - 6);
  const pipRow = (n) => {
    const pips = Array(6).fill(false);
    if (n >= 1) pips[4] = true;
    if (n >= 2) pips[1] = true;
    if (n >= 3) pips[5] = true;
    if (n >= 4) pips[0] = true;
    if (n >= 5) pips[2] = true;
    if (n >= 6) pips[3] = true;
    return pips;
  };
  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center",
      background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "4px 3px",
      border: "1px solid rgba(255,255,255,0.15)", gap: 2
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 8px)", gap: 2 }}>
        {pipRow(top).map((f, i) => <Pip key={i} filled={f} color={color} />)}
      </div>
      <div style={{ width: "80%", height: 1, background: "rgba(255,255,255,0.2)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 8px)", gap: 2 }}>
        {pipRow(bot).map((f, i) => <Pip key={i} filled={f} color={color} />)}
      </div>
    </div>
  );
}

function Confetti({ active }) {
  const pieces = Array.from({ length: 30 }, (_, i) => i);
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map(i => {
        const x = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const dur = 2 + Math.random() * 2;
        const color = ["#f4c430","#e05c2a","#00d4ff","#ff6b6b","#7c3aed","#fff"][i % 6];
        return (
          <div key={i} style={{
            position: "absolute", left: `${x}%`, top: "-10px",
            width: 8, height: 14, background: color, borderRadius: 2,
            transform: `rotate(${Math.random()*360}deg)`,
            animation: `fall ${dur}s ${delay}s ease-in forwards`,
            opacity: 0.9
          }} />
        );
      })}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function DominoScore() {
  const [screen, setScreen] = useState("setup"); // setup | game | history | winner
  const [themeIdx, setThemeIdx] = useState(0);

  useEffect(() => {
    document.body.style.background = THEMES[themeIdx].bg;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, [themeIdx]);
  const [winScore, setWinScore] = useState(200);
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(["Team A", "Team B", "Player 3", "Player 4"]);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [history, setHistory] = useState([]); // [{scores: [], round: n}]
  const [inputs, setInputs] = useState(["", "", "", ""]);
  const [winner, setWinner] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [shake, setShake] = useState(null);
  const [round, setRound] = useState(1);
  const theme = THEMES[themeIdx];

  const startGame = () => {
    setScores(Array(numPlayers).fill(0));
    setHistory([]);
    setInputs(Array(numPlayers).fill(""));
    setWinner(null);
    setRound(1);
    setScreen("game");
  };

  const addScores = () => {
    const vals = inputs.map(v => parseInt(v) || 0);
    if (vals.every(v => v === 0)) { setShake("all"); setTimeout(() => setShake(null), 500); return; }
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

  const resetGame = () => {
    setScores(Array(numPlayers).fill(0));
    setHistory([]);
    setInputs(Array(numPlayers).fill(""));
    setWinner(null);
    setRound(1);
    setScreen("game");
  };

  const s = (base) => ({ ...base });

  const playerColors = ["#f4c430", "#00d4ff", "#ff6b6b", "#7c3aed"];

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
        @keyframes cardIn { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:none;} }
        .shake { animation: shake 0.4s; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 80%{transform:translateX(-4px)} }
        .score-pop { animation: pop 0.3s cubic-bezier(.4,0,.2,1); }
        @keyframes pop { 0%{transform:scale(1)} 50%{transform:scale(1.18)} 100%{transform:scale(1)} }
        input { background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.18); border-radius: 10px; color: inherit; font-size: 22px; text-align: center; padding: 10px; width: 100%; font-family: inherit; outline: none; transition: border 0.2s; }
        input:focus { border-color: ${theme.accent}; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 20px 8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 26 }}>🁣</span>
          <span style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 1, color: theme.accent }}>Dominós</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {THEMES.map((t, i) => (
            <button key={i} className="btn" onClick={() => setThemeIdx(i)} style={{
              width: 18, height: 18, borderRadius: "50%", background: t.accent,
              border: i === themeIdx ? `2px solid ${theme.text}` : "2px solid transparent",
              padding: 0
            }} />
          ))}
        </div>
      </div>

      {/* Nav tabs */}
      {screen !== "setup" && (
        <div style={{ display: "flex", gap: 4, padding: "0 20px", width: "100%", maxWidth: 480, marginBottom: 4 }}>
          {["game", "history"].map(tab => (
            <button key={tab} className="btn" onClick={() => setScreen(tab)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 13, fontWeight: "bold",
              background: screen === tab ? theme.accent : "rgba(255,255,255,0.07)",
              color: screen === tab ? theme.bg : theme.text, letterSpacing: 0.5,
              textTransform: "capitalize"
            }}>{tab === "game" ? "🎯 Score" : "📋 History"}</button>
          ))}
          <button className="btn" onClick={() => setScreen("setup")} style={{
            padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: "bold",
            background: "rgba(255,255,255,0.07)", color: theme.text
          }}>⚙️</button>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 480, padding: "0 16px" }}>

        {/* SETUP SCREEN */}
        {screen === "setup" && (
          <div className="card-in" style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
            <div style={{
              background: theme.card, borderRadius: 18, padding: 20,
              border: `1px solid rgba(255,255,255,0.1)`
            }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Players / Teams</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[2, 3, 4].map(n => (
                  <button key={n} className="btn" onClick={() => setNumPlayers(n)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, fontWeight: "bold", fontSize: 15,
                    background: numPlayers === n ? theme.accent : "rgba(255,255,255,0.08)",
                    color: numPlayers === n ? theme.bg : theme.text,
                    border: "none"
                  }}>{n} {n === 2 ? "Teams" : "Players"}</button>
                ))}
              </div>
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: playerColors[i], flexShrink: 0 }} />
                  <input
                    value={playerNames[i]}
                    onChange={e => setPlayerNames(p => { const n=[...p]; n[i]=e.target.value; return n; })}
                    placeholder={`Player ${i+1}`}
                    style={{ fontSize: 16, padding: 10 }}
                  />
                </div>
              ))}
            </div>

            <div style={{
              background: theme.card, borderRadius: 18, padding: 20,
              border: `1px solid rgba(255,255,255,0.1)`
            }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Winning Score</div>
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
            }}>
              Start Game 🎲
            </button>
          </div>
        )}

        {/* GAME SCREEN */}
        {screen === "game" && (
          <div className="card-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Scoreboard */}
            <div style={{
              background: theme.card, borderRadius: 18, padding: 16,
              border: `1px solid rgba(255,255,255,0.1)`
            }}>
              <div style={{ fontSize: 11, opacity: 0.5, textAlign: "center", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
                Round {round} · First to {winScore}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 8 }}>
                {Array.from({ length: numPlayers }).map((_, i) => {
                  const pct = Math.min((scores[i] / winScore) * 100, 100);
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 11, opacity: 0.7, fontWeight: "bold", letterSpacing: 0.5 }}>
                        {playerNames[i]}
                      </div>
                      <div style={{ fontSize: 32, fontWeight: "bold", color: playerColors[i], lineHeight: 1 }}>
                        {scores[i]}
                      </div>
                      {/* Progress bar */}
                      <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                        <div style={{
                          width: `${pct}%`, height: "100%", borderRadius: 3,
                          background: playerColors[i], transition: "width 0.5s ease"
                        }} />
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.45 }}>{winScore - scores[i]} to win</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score entry */}
            <div style={{
              background: theme.card, borderRadius: 18, padding: 16,
              border: `1px solid rgba(255,255,255,0.1)`
            }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
                Add Round Scores
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${numPlayers}, 1fr)`, gap: 10 }}>
                {Array.from({ length: numPlayers }).map((_, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4, textAlign: "center" }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: playerColors[i], marginRight: 4 }} />
                      {playerNames[i]}
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={inputs[i]}
                      onChange={e => setInputs(inp => { const n=[...inp]; n[i]=e.target.value; return n; })}
                      placeholder="0"
                      min="0"
                      style={{ fontSize: 24, fontWeight: "bold", color: playerColors[i] }}
                    />
                  </div>
                ))}
              </div>

              {/* Quick add buttons */}
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {[5, 10, 15, 20, 25, 30, 35, 40, 50].map(v => (
                  <button key={v} className="btn" onClick={() => {
                    // add to focused or first non-zero logic: just cycle through players
                    setInputs(inp => {
                      const n = [...inp];
                      // find first empty slot
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
                color: theme.bg, letterSpacing: 0.5,
                boxShadow: `0 4px 20px ${theme.accent}44`
              }}>
                Add Scores →
              </button>
            </div>

            <button className="btn" onClick={resetGame} style={{
              padding: "10px", borderRadius: 12, fontSize: 13,
              background: "transparent", color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>🔄 Reset Game</button>
          </div>
        )}

        {/* HISTORY SCREEN */}
        {screen === "history" && (
          <div className="card-in">
            <div style={{
              background: theme.card, borderRadius: 18, padding: 16,
              border: `1px solid rgba(255,255,255,0.1)`
            }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>
                Score History
              </div>
              {history.length === 0 ? (
                <div style={{ textAlign: "center", opacity: 0.4, padding: "30px 0", fontSize: 14 }}>
                  No rounds played yet
                </div>
              ) : (
                <>
                  {/* Header row */}
                  <div style={{ display: "grid", gridTemplateColumns: `40px repeat(${numPlayers}, 1fr)`, gap: 6, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, opacity: 0.4 }}>#</div>
                    {Array.from({ length: numPlayers }).map((_, i) => (
                      <div key={i} style={{ fontSize: 11, fontWeight: "bold", color: playerColors[i], textAlign: "center" }}>
                        {playerNames[i]}
                      </div>
                    ))}
                  </div>
                  <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    {history.map((h, idx) => (
                      <div key={idx} style={{
                        display: "grid", gridTemplateColumns: `40px repeat(${numPlayers}, 1fr)`, gap: 6,
                        background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 6px"
                      }}>
                        <div style={{ fontSize: 12, opacity: 0.4, display: "flex", alignItems: "center" }}>{h.round}</div>
                        {Array.from({ length: numPlayers }).map((_, i) => (
                          <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 13, color: playerColors[i], fontWeight: "bold" }}>
                              {h.totals[i]}
                            </div>
                            {h.added[i] > 0 && (
                              <div style={{ fontSize: 10, opacity: 0.5 }}>+{h.added[i]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* WINNER SCREEN */}
        {screen === "winner" && winner !== null && (
          <div className="card-in" style={{ textAlign: "center", paddingTop: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🏆</div>
            <div style={{
              fontSize: 32, fontWeight: "bold",
              color: playerColors[winner],
              marginBottom: 4, letterSpacing: 1
            }}>
              {playerNames[winner]}
            </div>
            <div style={{ fontSize: 18, opacity: 0.7, marginBottom: 4 }}>wins with</div>
            <div style={{ fontSize: 56, fontWeight: "bold", color: theme.accent, lineHeight: 1, marginBottom: 20 }}>
              {scores[winner]}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              {Array.from({ length: numPlayers }).map((_, i) => (
                <div key={i} style={{
                  background: theme.card, borderRadius: 14, padding: "12px 20px",
                  border: `1.5px solid ${i === winner ? playerColors[i] : "rgba(255,255,255,0.1)"}`
                }}>
                  <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>{playerNames[i]}</div>
                  <div style={{ fontSize: 26, fontWeight: "bold", color: playerColors[i] }}>{scores[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={resetGame} style={{
                flex: 1, padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: "bold",
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                color: theme.bg
              }}>🎲 Play Again</button>
              <button className="btn" onClick={() => setScreen("setup")} style={{
                flex: 1, padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: "bold",
                background: "rgba(255,255,255,0.1)", color: theme.text
              }}>⚙️ New Setup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}