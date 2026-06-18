// Centralized helper for sending simulated SMS and confirmation receipts in the browser context.

export interface SmsMessage {
  id: string;
  sender: 'ANACIM' | 'CNAAS' | 'MicroFin' | 'Tontine-Sen' | 'GIE-Sénégal';
  body: string;
  timestamp: string;
  isNew: boolean;
}

export const getSimulatedSmsList = (): SmsMessage[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('microfin_sms_notifications');
  if (!stored) {
    // Populate with 2 default messages for immersive experience
    const defaults: SmsMessage[] = [
      {
        id: 'init_1',
        sender: 'MicroFin',
        body: 'Bienvenue sur MicroFin Sénégal. Vos accès mobiles hors-ligne par USSD (*221#) sont activés avec Orange & Free.',
        timestamp: 'Hier, à 14:15',
        isNew: false
      },
      {
        id: 'init_2',
        sender: 'ANACIM',
        body: 'ANACIM Bulletin Météo Niayes : Climatologie favorable pour la levée dʼoignons ce trimestre. Suivez nos conseils.',
        timestamp: 'Hier, à 09:30',
        isNew: false
      }
    ];
    localStorage.setItem('microfin_sms_notifications', JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(stored);
};

export const addSimulatedSms = (sender: SmsMessage['sender'], body: string): SmsMessage => {
  if (typeof window === 'undefined') {
    return { id: '', sender, body, timestamp: '', isNew: true };
  }
  
  const currentList = getSimulatedSmsList();
  
  // Format neat current timestamp (e.g. "Aujourd'hui, 18:42")
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const timestamp = `Aujourd'hui, ${timeStr}`;

  const newSms: SmsMessage = {
    id: 'SMS_' + Math.random().toString(36).substring(2, 9),
    sender,
    body,
    timestamp,
    isNew: true
  };

  const updated = [newSms, ...currentList];
  localStorage.setItem('microfin_sms_notifications', JSON.stringify(updated));

  // Dispatch custom event to notify listening elements
  window.dispatchEvent(new CustomEvent('microfin_new_sms', { detail: newSms }));

  // Optional subtle phone chime sound effect using AudioContext
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play dual tone (chime)
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime + start);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration);
      osc.start(audioCtx.currentTime + start);
      osc.stop(audioCtx.currentTime + start + duration);
    };

    playTone(987.77, 0, 0.12); // B5
    playTone(1318.51, 0.08, 0.18); // E6
  } catch (err) {
    // Ignore audio context permission errors
  }

  return newSms;
};

export const clearAllSms = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('microfin_sms_notifications', JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('microfin_new_sms'));
};
