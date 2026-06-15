import { useState, useEffect, useRef } from 'react';
import { LOGIN_KEY, LOGIN_PASS } from '../data/constants';

export default function LoginScreen({ onLogin }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem(LOGIN_KEY) === '1') { onLogin(); return; }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [onLogin]);

  function handleInput(e) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue(v);
    if (v.length === LOGIN_PASS.length) check(v);
  }

  function check(v = value) {
    if (v === LOGIN_PASS) {
      sessionStorage.setItem(LOGIN_KEY, '1');
      onLogin();
    } else {
      setError(true);
      setValue('');
      setTimeout(() => { setError(false); inputRef.current?.focus(); }, 1500);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--navy)' }}>
      <h1 className="font-display text-3xl" style={{ color: 'var(--goldl)' }}>✈ Europa 2027</h1>
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl w-64"
        style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>Ingresá el código de acceso</p>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={value}
          onChange={handleInput}
          onKeyDown={e => e.key === 'Enter' && check()}
          className="w-full text-center text-2xl tracking-widest rounded-lg px-4 py-2 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,.08)',
            border: `1.5px solid ${error ? '#e57373' : 'rgba(255,255,255,.15)'}`,
            color: '#fff',
            fontFamily: 'DM Mono, monospace',
          }}
          placeholder="••••"
        />
        {error && <p className="text-sm" style={{ color: '#e57373' }}>Código incorrecto</p>}
        <button
          onClick={() => check()}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all hover:brightness-110"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
          Entrar
        </button>
      </div>
    </div>
  );
}
