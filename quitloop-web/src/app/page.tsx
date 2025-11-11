'use client';

import { useEffect, useRef, useState } from 'react';

function cls(...a: any[]) { return a.filter(Boolean).join(' '); }

export default function Page() {
  // Waitlist
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  // Urge flow
  type Step = 'idle' | 'notice' | 'breathe' | 'label' | 'choose' | 'intention' | 'timer' | 'followup' | 'done';
  const [step, setStep] = useState<Step>('idle');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [action, setAction] = useState<string>('');
  const [t, setT] = useState<number>(0);
  const timerRef = useRef<any>(null);

  const STEPS: Record<Step, { dur?: number; prompt?: string }> = {
    idle:      { prompt: 'A 60-second wave ride + one tiny action.' },
    notice:    { dur: 10, prompt: 'Where do you feel the urge? Name two sensations.' },
    breathe:   { dur: 20, prompt: 'Box breathe 4-4-4-4. Watch the wave rise and fall.' },
    label:     { dur: 15, prompt: 'Rate the urge 0–10.' },
    choose:    { prompt: 'Pick one tiny action for ~2 minutes.' },
    intention: { prompt: 'Confirm your 2-minute plan.' },
    timer:     { dur: 120, prompt: 'Doing your tiny action…' },
    followup:  { prompt: 'How’s the urge now (0–10)? One thing that helped?' },
    done:      { prompt: 'Saved locally. Nice work.' }
  };

  // Auto-advance for timed steps
  useEffect(() => {
    const d = STEPS[step]?.dur;
    if (!d) return;
    setT(d);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setT(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          advance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  function startFlow() { setStep('notice'); }
  function advance() {
    const order: Step[] = ['idle','notice','breathe','label','choose','intention','timer','followup','done'];
    const i = order.indexOf(step);
    setStep(order[Math.min(i + 1, order.length - 1)]);
  }
  async function finish() {
    const log = JSON.parse(localStorage.getItem('ql_events') || '[]');
    log.push({ type: 'urge', at: new Date().toISOString(), intensity, action });
    localStorage.setItem('ql_events', JSON.stringify(log));
    setStep('done');
  }

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!r.ok) throw new Error('fail');
      setStatus('ok'); setEmail('');
    } catch { setStatus('err'); }
  }

  return (
    <>
      {/* Top Nav */}
      <header className="nav">
        <a className="brand" href="/">
          <span className="logo" aria-hidden="true" />
          <span className="brand-text">QuitLoop</span>
        </a>
        <div className="nav-cta">
          <a className="btn-ghost" href="#how">How it works</a>
          <a className="btn" href="#waitlist">Get early access</a>
        </div>
      </header>

      {/* Content */}
      <main className="container">
        {/* Hero */}
        <section className="hero">
          <div className="kicker">Private • Evidence-based • Practical</div>
          <h1 className="h1">The micro-coach that helps you interrupt the habit loop.</h1>
          <p className="sub">
            QuitLoop is a non-judgmental tool that guides you through 60-second urge interventions, maps your patterns,
            and helps you recover quickly after lapses. No surveillance. No screenshots. No browsing logs.
          </p>
          <form id="waitlist" onSubmit={joinWaitlist} className="form" aria-label="Join waitlist form">
            <input
              className="input"
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button className="btn" type="submit">Join the waitlist</button>
          </form>
          {status === 'ok' && <div className="notice">Thanks — you’re on the list.</div>}
          {status === 'err' && <div className="notice">Couldn’t save your email. Please try again.</div>}
        </section>

        {/* How it works */}
        <section id="how" className="section">
          <div className="grid">
            <div className="card col-4">
              <h3>Urge Save</h3>
              <p>One-tap 60-second intervention plus a tiny replacement action.</p>
            </div>
            <div className="card col-4">
              <h3>Trigger Map</h3>
              <p>See when and where urges spike. Set simple guardrails that fit your life.</p>
            </div>
            <div className="card col-4">
              <h3>Lapse Reset</h3>
              <p>Three-minute debrief. One learning and one adjustment for the next 24 hours.</p>
            </div>
          </div>
        </section>

        {/* Live demo (in-browser, private) */}
        <section className="section">
          <div className="card col-12">
            <div className="flow-wrap">
              <div className="flow-top">
                <h3 className="flow-title">Try the Urge Save</h3>
                {step === 'idle' && <button className="btn" onClick={startFlow}>Start</button>}
              </div>

              {step !== 'idle' && step !== 'done' && (
                <>
                  <div className="flow-prompt">{STEPS[step].prompt}</div>

                  {step === 'notice' && (
                    <div className="tiles">
                      {['tight chest', 'warmth', 'tingle', 'restless', 'pressure', 'other'].map((opt) => (
                        <span key={opt} className="tile">{opt}</span>
                      ))}
                    </div>
                  )}

                  {step === 'breathe' && <div className="notice">Breathing… {t}s</div>}

                  {step === 'label' && (
                    <div className="scale">
                      {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                        <button
                          key={n}
                          onClick={() => setIntensity(n)}
                          className={cls(n === intensity && 'active')}
                          aria-label={`Intensity ${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 'choose' && (
                    <div className="tiles" style={{ display: 'grid', gap: 8 }}>
                      {['10 pushups', '2-min walk', 'cold water', 'text a friend', 'stretch'].map((opt) => (
                        <div
                          key={opt}
                          onClick={() => setAction(opt)}
                          className={cls('tile', action === opt && 'active')}
                          role="button"
                          aria-pressed={action === opt}
                        >
                          {opt}
                        </div>
                      ))}
                      <input
                        className="input"
                        placeholder="Custom action…"
                        onChange={(e) => setAction(e.target.value)}
                        aria-label="Custom action"
                      />
                    </div>
                  )}

                  {step === 'intention' && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div>
                        If I feel a strong urge, then I will <b>{action || 'choose an action'}</b> for 2 minutes.
                      </div>
                      <button className="btn" onClick={() => setStep('timer')}>Start 2-minute timer</button>
                    </div>
                  )}

                  {step === 'timer' && <div className="notice">Timer: {t}s</div>}

                  {step === 'followup' && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <div className="flow-prompt">How’s the urge now (0–10)? One thing that helped?</div>
                      <button className="btn" onClick={finish}>Finish</button>
                    </div>
                  )}
                </>
              )}

              {step === 'done' && (
                <div className="notice">
                  Session saved locally in your browser. Nothing is uploaded.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} QuitLoop · Private by design · No screenshots · No URL logs
      </footer>
    </>
  );
}
