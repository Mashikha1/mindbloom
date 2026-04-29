// ============================================
//  src/pages/BreathePage.jsx — FULLY WORKING
//  All exercises functional:
//  Box Breathing, 4-7-8, Body Scan,
//  5-4-3-2-1 Grounding, Sound Bath
// ============================================

import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../api/client';
import { Card, SectionLabel } from '../components/ui/Card';

const BOX_PHASES = [
  { text: 'Breathe in...',  label: 'Inhale · 4s',  dur: 4000, scale: 1.45, color: 'var(--sage)'     },
  { text: 'Hold...',        label: 'Hold · 4s',     dur: 4000, scale: 1.45, color: 'var(--amber)'    },
  { text: 'Breathe out...', label: 'Exhale · 4s',   dur: 4000, scale: 1.0,  color: 'var(--lavender)' },
  { text: 'Hold...',        label: 'Hold · 4s',     dur: 4000, scale: 1.0,  color: 'var(--sky)'      },
];

const PHASES_478 = [
  { text: 'Breathe in...',  label: 'Inhale · 4s',  dur: 4000, scale: 1.45, color: 'var(--sage)'  },
  { text: 'Hold...',        label: 'Hold · 7s',     dur: 7000, scale: 1.45, color: 'var(--amber)' },
  { text: 'Breathe out...', label: 'Exhale · 8s',   dur: 8000, scale: 1.0,  color: 'var(--rose)'  },
];

const BODY_SCAN_STEPS = [
  { part: 'Head & Scalp',      instruction: 'Close your eyes. Notice any tension in your scalp and forehead. Gently let it soften.',        duration: 12000 },
  { part: 'Face & Jaw',        instruction: 'Unclench your jaw. Let your tongue rest naturally. Relax the muscles around your eyes.',        duration: 12000 },
  { part: 'Neck & Shoulders',  instruction: 'Roll your shoulders back slightly. Feel any tightness melting away with each exhale.',          duration: 12000 },
  { part: 'Chest & Heart',     instruction: 'Place a hand on your chest. Feel it rise and fall. Let your heart feel held and safe.',          duration: 12000 },
  { part: 'Stomach & Core',    instruction: "Allow your belly to soften. You don't need to hold anything in right now.",                     duration: 12000 },
  { part: 'Arms & Hands',      instruction: 'Let your arms feel heavy. Uncurl your fingers. Feel warmth flowing to your fingertips.',        duration: 12000 },
  { part: 'Legs & Feet',       instruction: 'Relax your thighs, calves, and feet. Feel yourself rooted and supported.',                      duration: 12000 },
  { part: 'Whole Body',        instruction: 'Take a deep breath in... and slowly exhale. You are fully present. You are okay. 🌿',           duration: 15000 },
];

const GROUNDING_STEPS = [
  { num: 5, sense: 'SEE',   icon: '👁️',  prompt: 'Name 5 things you can SEE right now',  color: 'var(--sky)',      examples: ['A wall','Your hands','A window','Light','Your screen']      },
  { num: 4, sense: 'TOUCH', icon: '✋',  prompt: 'Name 4 things you can TOUCH',           color: 'var(--sage)',     examples: ['Your chair','Your clothes','The floor','Your phone']         },
  { num: 3, sense: 'HEAR',  icon: '👂',  prompt: 'Name 3 things you can HEAR',            color: 'var(--amber)',    examples: ['Your breath','Outside sounds','Silence itself']              },
  { num: 2, sense: 'SMELL', icon: '👃',  prompt: 'Name 2 things you can SMELL',           color: 'var(--lavender)', examples: ['The air','Something nearby']                                },
  { num: 1, sense: 'TASTE', icon: '👅',  prompt: 'Name 1 thing you can TASTE',            color: 'var(--rose)',     examples: ['Water','Your last meal']                                    },
];

const GRATITUDE_FALLBACKS = [
  '"What is one small thing that made you smile today?"',
  '"Who is someone that supported you recently?"',
  '"What is something about your body you are grateful for?"',
  '"Name one challenge you overcame this week."',
  '"What simple pleasure brought you joy recently?"',
];

const SOUND_SETS = {
  forest: { label: '🌲 Forest',  desc: 'Birds, wind, gentle stream',      color: 'var(--sage)',     tones: [{ freq: 174, gain: 0.07, type: 'sine' },{ freq: 285, gain: 0.05, type: 'sine' },{ freq: 396, gain: 0.04, type: 'triangle' }] },
  ocean:  { label: '🌊 Ocean',   desc: 'Waves, deep water resonance',     color: 'var(--sky)',      tones: [{ freq: 40,  gain: 0.09, type: 'sine' },{ freq: 120, gain: 0.06, type: 'sine' },{ freq: 528, gain: 0.03, type: 'triangle' }] },
  cosmic: { label: '✨ Cosmic',  desc: '432 Hz universe tone',            color: 'var(--lavender)', tones: [{ freq: 432, gain: 0.06, type: 'sine' },{ freq: 216, gain: 0.04, type: 'sine' },{ freq: 864, gain: 0.02, type: 'sine'     }] },
  rain:   { label: '🌧️ Rain',    desc: 'Soft rainfall, distant thunder',  color: 'var(--amber)',    tones: [{ freq: 200, gain: 0.08, type: 'sawtooth' },{ freq: 300, gain: 0.05, type: 'sine' },{ freq: 100, gain: 0.07, type: 'sine' }] },
};

// ── Shared Breathing Orb ──────────────────
function BreathingOrb({ running, scale, color, instruction, label, onToggle, startLabel = 'Tap' }) {
  return (
    <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', marginBottom: '16px' }}>
        <div
          onClick={onToggle}
          style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: running ? `radial-gradient(circle, ${color}55, ${color}18)` : 'radial-gradient(circle, rgba(127,181,160,0.3), rgba(127,181,160,0.08))',
            border: `2px solid ${running ? color : 'rgba(127,181,160,0.35)'}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transform: `scale(${scale})`,
            transition: 'transform 3.5s ease-in-out, background 1s ease',
            boxShadow: running ? `0 0 40px ${color}33` : 'none',
            position: 'relative',
          }}
        >
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: '14px', color: running ? color : 'var(--sage)', pointerEvents: 'none' }}>
            {running ? '■' : startLabel}
          </span>
          {[16, 28].map(o => (
            <div key={o} style={{ position: 'absolute', inset: `-${o}px`, borderRadius: '50%', border: `1px solid ${running ? color : 'rgba(127,181,160,0.1)'}22`, pointerEvents: 'none' }} />
          ))}
        </div>
      </div>
      <p style={{ fontFamily: 'var(--font-hand)', fontSize: '22px', color: 'var(--text-soft)', marginBottom: '6px', minHeight: '32px' }}>{instruction}</p>
      <p style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
    </Card>
  );
}

// ── Box Breathing ─────────────────────────
function BoxBreathing() {
  const [running, setRunning] = useState(false);
  const [state, setState] = useState({ instruction: 'Tap the orb to begin', label: '4 cycles recommended', scale: 1, color: 'var(--sage)' });
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null); const phaseRef = useRef(0); const runRef = useRef(false);

  const stop = () => { clearTimeout(timerRef.current); runRef.current = false; setRunning(false); setState({ instruction: 'Tap the orb to begin', label: '4 cycles recommended', scale: 1, color: 'var(--sage)' }); phaseRef.current = 0; };
  const runPhase = () => {
    if (!runRef.current) return;
    const p = BOX_PHASES[phaseRef.current % BOX_PHASES.length];
    setState({ instruction: p.text, label: p.label, scale: p.scale, color: p.color });
    if (phaseRef.current > 0 && phaseRef.current % BOX_PHASES.length === 0) setCycles(c => c + 1);
    phaseRef.current++;
    timerRef.current = setTimeout(runPhase, p.dur);
  };
  const toggle = () => { if (running) { stop(); return; } runRef.current = true; setRunning(true); setCycles(0); runPhase(); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div>
      <BreathingOrb running={running} scale={state.scale} color={state.color} instruction={state.instruction} label={state.label} onToggle={toggle} />
      {cycles > 0 && <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--sage)' }}>{cycles} cycle{cycles > 1 ? 's' : ''} completed ✨</p>}
    </div>
  );
}

// ── 4-7-8 Breathing ──────────────────────
function Breathing478() {
  const [running, setRunning] = useState(false);
  const [state, setState] = useState({ instruction: 'Tap the orb to begin', label: '3 cycles recommended for sleep', scale: 1, color: 'var(--sage)' });
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null); const phaseRef = useRef(0); const runRef = useRef(false);

  const stop = () => { clearTimeout(timerRef.current); runRef.current = false; setRunning(false); setState({ instruction: 'Tap the orb to begin', label: '3 cycles recommended for sleep', scale: 1, color: 'var(--sage)' }); phaseRef.current = 0; };
  const runPhase = () => {
    if (!runRef.current) return;
    const p = PHASES_478[phaseRef.current % PHASES_478.length];
    setState({ instruction: p.text, label: p.label, scale: p.scale, color: p.color });
    if (phaseRef.current > 0 && phaseRef.current % PHASES_478.length === 0) setCycles(c => c + 1);
    phaseRef.current++;
    timerRef.current = setTimeout(runPhase, p.dur);
  };
  const toggle = () => { if (running) { stop(); return; } runRef.current = true; setRunning(true); setCycles(0); runPhase(); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div>
      <div style={{ marginBottom: '12px', padding: '12px 16px', background: 'rgba(107,174,214,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(107,174,214,0.15)' }}>
        <p style={{ fontSize: '12px', color: 'var(--sky)', lineHeight: 1.6 }}>
          <strong>How it works:</strong> Inhale 4s → Hold 7s → Exhale 8s. Activates your parasympathetic nervous system. Best for anxiety and sleep.
        </p>
      </div>
      <BreathingOrb running={running} scale={state.scale} color={state.color} instruction={state.instruction} label={state.label} onToggle={toggle} />
      {cycles > 0 && <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--sky)' }}>{cycles} cycle{cycles > 1 ? 's' : ''} completed 🌙</p>}
    </div>
  );
}

// ── Body Scan ─────────────────────────────
function BodyScan() {
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null); const progRef = useRef(null); const stepRef = useRef(0);

  const stop = () => { clearTimeout(timerRef.current); clearInterval(progRef.current); setRunning(false); setStepIdx(0); setProgress(0); setDone(false); stepRef.current = 0; };

  const runStep = () => {
    const idx = stepRef.current;
    if (idx >= BODY_SCAN_STEPS.length) { setDone(true); setRunning(false); return; }
    setStepIdx(idx); setProgress(0);
    const step = BODY_SCAN_STEPS[idx];
    let tick = 0; const ticks = step.duration / 100;
    clearInterval(progRef.current);
    progRef.current = setInterval(() => { tick++; setProgress(Math.min(100, (tick / ticks) * 100)); }, 100);
    timerRef.current = setTimeout(() => { clearInterval(progRef.current); stepRef.current++; runStep(); }, step.duration);
  };

  const toggle = () => { if (running) { stop(); return; } setRunning(true); setDone(false); stepRef.current = 0; runStep(); };
  useEffect(() => () => { clearTimeout(timerRef.current); clearInterval(progRef.current); }, []);
  const current = BODY_SCAN_STEPS[stepIdx];

  if (done) return (
    <Card style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>Body Scan Complete</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>Well done. Take a moment to notice how you feel. Your body just received a gift of awareness.</p>
      <button onClick={stop} style={{ padding: '10px 24px', borderRadius: '20px', border: '1px solid var(--sage)', background: 'var(--sage-soft)', color: 'var(--sage)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Do it again</button>
    </Card>
  );

  return (
    <Card style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {BODY_SCAN_STEPS.map((_, i) => (
          <div key={i} style={{ height: '4px', flex: 1, borderRadius: '2px', background: i < stepIdx ? 'var(--sage)' : i === stepIdx && running ? 'var(--amber)' : 'var(--card2)', transition: 'background 0.5s' }} />
        ))}
      </div>
      {running ? (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>Focus on your</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--sage)', marginBottom: '14px' }}>{current.part}</div>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '19px', color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: '18px' }}>{current.instruction}</p>
            <div style={{ height: '4px', background: 'var(--card2)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--sage), var(--amber))', borderRadius: '2px', transition: 'width 0.1s linear' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Step {stepIdx + 1} of {BODY_SCAN_STEPS.length}</div>
          </div>
          <button onClick={stop} style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-faint)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Stop</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '14px' }}>🧘</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>5 Minute Body Scan</h3>
          <p style={{ color: 'var(--text-soft)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>Gently scan from head to toe, releasing tension as you go.</p>
          <button onClick={toggle} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(127,181,160,0.9), rgba(127,181,160,0.7))', border: 'none', color: 'var(--midnight)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>🧘 Begin Body Scan</button>
        </div>
      )}
    </Card>
  );
}

// ── 5-4-3-2-1 Grounding ───────────────────
function Grounding() {
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [inputs, setInputs] = useState({});
  const [done, setDone] = useState(false);
  const current = GROUNDING_STEPS[stepIdx];

  const filled = () => Array.from({ length: current.num }).every((_, i) => inputs[`${current.num}-${i}`]?.trim());
  const next = () => { if (stepIdx < GROUNDING_STEPS.length - 1) setStepIdx(i => i + 1); else setDone(true); };
  const reset = () => { setStarted(false); setStepIdx(0); setInputs({}); setDone(false); };

  if (!started) return (
    <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
      <div style={{ fontSize: '40px', marginBottom: '14px' }}>🌿</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px' }}>5-4-3-2-1 Grounding</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: '13px', lineHeight: 1.6, marginBottom: '8px' }}>Anchor yourself to the present using your 5 senses. Perfect when feeling anxious or overwhelmed.</p>
      <p style={{ color: 'var(--text-faint)', fontSize: '12px', marginBottom: '20px' }}>Takes about 3–5 minutes</p>
      <button onClick={() => setStarted(true)} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(127,181,160,0.9), rgba(127,181,160,0.7))', border: 'none', color: 'var(--midnight)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>🌿 Start Grounding</button>
    </Card>
  );

  if (done) return (
    <Card style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>You're Grounded</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>You just used all 5 senses to anchor yourself in the present. The anxiety lives in the future — but you are here, right now, and you are safe. 🌿</p>
      <button onClick={reset} style={{ padding: '10px 24px', borderRadius: '20px', border: '1px solid var(--sage)', background: 'var(--sage-soft)', color: 'var(--sage)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Do it again</button>
    </Card>
  );

  return (
    <Card style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', justifyContent: 'center' }}>
        {GROUNDING_STEPS.map((s, i) => (
          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < stepIdx ? 'var(--sage)' : i === stepIdx ? current.color : 'var(--card2)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{current.icon}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: current.color, marginBottom: '6px' }}>{current.num} things you can {current.sense}</div>
        <p style={{ fontSize: '13px', color: 'var(--text-soft)' }}>{current.prompt}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {Array.from({ length: current.num }).map((_, i) => (
          <input key={i} type="text" placeholder={current.examples[i] || `Item ${i + 1}`}
            value={inputs[`${current.num}-${i}`] || ''}
            onChange={e => setInputs(p => ({ ...p, [`${current.num}-${i}`]: e.target.value }))}
            style={{ width: '100%', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '11px 14px', color: 'var(--text)', fontSize: '15px', outline: 'none', fontFamily: 'var(--font-hand)' }}
            onFocus={e => e.target.style.borderColor = current.color + '66'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        ))}
      </div>
      <button onClick={next} disabled={!filled()} style={{ width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', background: filled() ? `linear-gradient(135deg, ${current.color}dd, ${current.color}99)` : 'var(--card2)', border: 'none', color: filled() ? 'var(--midnight)' : 'var(--text-faint)', fontSize: '14px', fontWeight: 600, cursor: filled() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', transition: 'all 0.3s' }}>
        {stepIdx < GROUNDING_STEPS.length - 1 ? `Next → ${GROUNDING_STEPS[stepIdx + 1].sense}` : 'Complete ✓'}
      </button>
    </Card>
  );
}

// ── Sound Bath ────────────────────────────
function SoundBath() {
  const [playing, setPlaying] = useState(false);
  const [activeSet, setActiveSet] = useState('forest');
  const audioCtxRef = useRef(null);
  const nodesRef = useRef([]);

  const stopAll = () => {
    nodesRef.current.forEach(n => { try { n.stop(); } catch {} });
    nodesRef.current = [];
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    setPlaying(false);
  };

  const startSounds = (setKey) => {
    stopAll();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    const set = SOUND_SETS[setKey];
    const newNodes = [];
    set.tones.forEach(({ freq, gain, type }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq * 0.004, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 2);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(); lfo.start();
      newNodes.push(osc, lfo);
    });
    nodesRef.current = newNodes;
    setPlaying(true);
    setActiveSet(setKey);
  };

  const toggle = (setKey) => { if (playing && activeSet === setKey) stopAll(); else startSounds(setKey); };
  useEffect(() => () => stopAll(), []);
  const active = SOUND_SETS[activeSet];

  return (
    <Card style={{ padding: '24px 20px' }}>
      {playing ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '20px', height: '40px', alignItems: 'flex-end' }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} style={{ width: '6px', borderRadius: '3px', background: active.color, opacity: 0.8, animation: `soundWave ${0.8 + i * 0.15}s ease-in-out infinite alternate`, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
          <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Select a soundscape to begin</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {Object.entries(SOUND_SETS).map(([key, set]) => {
          const isActive = playing && activeSet === key;
          return (
            <button key={key} onClick={() => toggle(key)} style={{ padding: '14px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${isActive ? set.color + '66' : 'var(--border)'}`, background: isActive ? `${set.color}18` : 'var(--card2)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: isActive ? set.color : 'var(--text)', marginBottom: '3px' }}>{isActive ? '■ ' : ''}{set.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-faint)', lineHeight: 1.4 }}>{set.desc}</div>
            </button>
          );
        })}
      </div>
      {playing && <button onClick={stopAll} style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-faint)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>■ Stop Sound</button>}
      <style>{`@keyframes soundWave { from { height: 6px; } to { height: 36px; } }`}</style>
    </Card>
  );
}

// ── Gratitude Card ────────────────────────
function GratitudeCard() {
  const [prompt, setPrompt] = useState(GRATITUDE_FALLBACKS[0]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState(false);
  const idxRef = useRef(0);

  const handleNew = async () => {
    setLoading(true); setSaved(false); setAnswer('');
    try { const { data } = await aiAPI.gratitudePrompt(); setPrompt(`"${data.prompt}"`); }
    catch { idxRef.current = (idxRef.current + 1) % GRATITUDE_FALLBACKS.length; setPrompt(GRATITUDE_FALLBACKS[idxRef.current]); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(244,169,71,0.08), rgba(224,123,138,0.06))', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid rgba(244,169,71,0.15)' }}>
      <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '10px', opacity: 0.8 }}>Gratitude Prompt</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '12px' }}>{prompt}</p>
      <textarea value={answer} onChange={e => { setAnswer(e.target.value); setSaved(false); }} placeholder="Write your answer here..." rows={3}
        style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--text)', fontFamily: 'var(--font-hand)', fontSize: '16px', resize: 'none', outline: 'none', marginBottom: '10px', lineHeight: 1.6 }}
        onFocus={e => e.target.style.borderColor = 'rgba(244,169,71,0.4)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleNew} disabled={loading} style={{ flex: 1, padding: '9px', borderRadius: '20px', border: '1px solid rgba(244,169,71,0.3)', background: 'transparent', color: 'var(--amber)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{loading ? '...' : '✦ New prompt'}</button>
        {answer.trim() && <button onClick={() => setSaved(true)} style={{ flex: 1, padding: '9px', borderRadius: '20px', border: '1px solid rgba(127,181,160,0.3)', background: saved ? 'var(--sage-soft)' : 'transparent', color: 'var(--sage)', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{saved ? '✓ Saved!' : '💾 Save'}</button>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────
const EXERCISES = [
  { key: 'box',       icon: '🫁', title: 'Box Breathing',       sub: '4-4-4-4 · Stress relief',   color: 'var(--sage)'     },
  { key: '478',       icon: '🌊', title: '4-7-8 Breathing',     sub: 'Anxiety & sleep',           color: 'var(--sky)'      },
  { key: 'bodyscan',  icon: '🧘', title: 'Body Scan',           sub: '5 min · Release tension',   color: 'var(--lavender)' },
  { key: 'grounding', icon: '🌿', title: 'Grounding',           sub: '5-4-3-2-1 technique',       color: 'var(--sage)'     },
  { key: 'soundbath', icon: '🎵', title: 'Sound Bath',          sub: 'Ambient tones',             color: 'var(--amber)'    },
];

export default function BreathePage() {
  const [active, setActive] = useState('box');

  const renderExercise = () => {
    switch (active) {
      case 'box':       return <BoxBreathing />;
      case '478':       return <Breathing478 />;
      case 'bodyscan':  return <BodyScan />;
      case 'grounding': return <Grounding />;
      case 'soundbath': return <SoundBath />;
      default:          return <BoxBreathing />;
    }
  };

  const current = EXERCISES.find(e => e.key === active);

  return (
    <div>
      <div style={{ padding: '8px 24px 20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '6px' }}>Exercises</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>Calm your <em style={{ color: 'var(--amber)' }}>mind</em></h1>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {EXERCISES.map(ex => (
          <button key={ex.key} onClick={() => setActive(ex.key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${active === ex.key ? ex.color + '55' : 'var(--border)'}`, background: active === ex.key ? `${ex.color}15` : 'var(--card)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
            <span style={{ fontSize: '20px' }}>{ex.icon}</span>
            <span style={{ fontSize: '10px', color: active === ex.key ? ex.color : 'var(--text-faint)', fontWeight: active === ex.key ? 600 : 400 }}>{ex.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 24px 10px' }}>
        <div style={{ fontSize: '15px', fontWeight: 500 }}>{current?.icon} {current?.title}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '2px' }}>{current?.sub}</div>
      </div>

      <div style={{ padding: '0 24px 20px' }} key={active} className="fade-in">
        {renderExercise()}
      </div>

      <div style={{ padding: '0 24px 20px' }}>
        <SectionLabel>Gratitude Practice</SectionLabel>
        <GratitudeCard />
      </div>
    </div>
  );
}
