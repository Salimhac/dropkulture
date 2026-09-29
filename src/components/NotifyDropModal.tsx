import React, { useState } from 'react';
import { X, Bell, Check, Smartphone, Mail, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotifyDropModal: React.FC = () => {
  const { notifyDrop, setNotifyDrop, toggleDropNotification, isDropNotified } = useApp();
  const [channel, setChannel] = useState<'SMS' | 'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!notifyDrop) return null;

  const isAlreadyNotified = isDropNotified(notifyDrop.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    toggleDropNotification(notifyDrop.id, `${channel}: ${contact}`);
    setSubmitted(true);
    setTimeout(() => {
      setNotifyDrop(null);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-black border border-[#2B2B2B] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-6 space-y-5">
        <button
          onClick={() => setNotifyDrop(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#1A1A1A] text-[#8E8E93] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#2B2B2B] flex items-center justify-center text-white">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono-tech uppercase text-[#C0C0C0] font-semibold tracking-wider">
              VIP DROP ACCESS
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              {notifyDrop.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-[#8E8E93] leading-relaxed">
          Drops on DROPKULTURE are strictly limited and rarely restocked. Get a 10-minute early access code via WhatsApp, SMS, or Email before public launch.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-[#141414] border border-white/20 text-center space-y-2">
            <Check className="w-8 h-8 text-white mx-auto" />
            <h4 className="font-bold text-white text-sm">Alert Registered</h4>
            <p className="text-xs text-[#D9D9D9]">
              You will receive an instant priority notification the minute this drop goes live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex rounded-lg bg-[#111111] p-1 border border-[#222222]">
              <button
                type="button"
                onClick={() => setChannel('WHATSAPP')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  channel === 'WHATSAPP' ? 'bg-white text-black font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  channel === 'SMS' ? 'bg-white text-black font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                SMS
              </button>
              <button
                type="button"
                onClick={() => setChannel('EMAIL')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  channel === 'EMAIL' ? 'bg-white text-black font-bold' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Email
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono-tech uppercase text-[#C0C0C0] mb-1">
                {channel === 'EMAIL' ? 'Email Address' : 'Phone Number (e.g. 07XXXXXXXX)'}
              </label>
              <input
                type={channel === 'EMAIL' ? 'email' : 'tel'}
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={channel === 'EMAIL' ? 'collector@dropkulture.com' : '0712 345 678'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#333333] focus:border-[#C0C0C0] text-white text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D9D9D9] via-white to-[#C0C0C0] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {isAlreadyNotified ? 'Update Alert Preferences' : 'Notify Me Before Drop'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
