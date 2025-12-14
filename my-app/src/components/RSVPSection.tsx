"use client";

import { useState, useEffect } from 'react';
import { RSVPSectionProps } from '@/types';

interface RSVPContent {
  title: string;
  subtitle: string[];
  buttons: {
    attending: string;
    notAttending: string;
  };
  form: {
    nameLabel: string;
    phoneLabel: string;
    allergiesLabel: string;
    guestCountLabel: string;
    guestCountPlaceholder: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    allergiesPlaceholder: string;
    allergiesHelpText: string;
    submitButton: string;
    backButton: string;
    newResponseButton: string;
  };
  messages: {
    attending: string;
    notAttending: string;
  };
}

export const RSVPSection: React.FC<RSVPSectionProps> = () => {
  const [guests, setGuests] = useState<Array<{name: string, allergies: string}>>([
    { name: '', allergies: '' }
  ]);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [phone, setPhone] = useState<string>('');
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [content, setContent] = useState<RSVPContent | null>(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data.rsvp))
      .catch(err => console.error('Error loading RSVP content:', err));
  }, []);

  // Handle hash navigation for QR code direct access
  useEffect(() => {
    const handleHashNavigation = () => {
      if (window.location.hash === '#rsvp') {
        const rsvpElement = document.getElementById('rsvp');
        if (rsvpElement) {
          // Small delay to ensure page is fully loaded
          setTimeout(() => {
            rsvpElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    // Check on mount
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  // Handle guest count change
  const handleGuestCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCount = parseInt(e.target.value, 10);
    setGuestCount(newCount);
    
    // Update guests array to match new count
    const newGuests = [...guests];
    if (newCount > guests.length) {
      // Add empty guests
      for (let i = guests.length; i < newCount; i++) {
        newGuests.push({ name: '', allergies: '' });
      }
    } else if (newCount < guests.length) {
      // Remove excess guests
      newGuests.splice(newCount);
    }
    setGuests(newGuests);
  };

  // Handle guest name change
  const handleGuestNameChange = (index: number, value: string) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], name: value };
    setGuests(newGuests);
  };

  // Handle guest allergies change
  const handleGuestAllergiesChange = (index: number, value: string) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], allergies: value };
    setGuests(newGuests);
  };

  // Handle phone change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate all guest names are filled
      const invalidGuests = guests.filter(g => !g.name.trim() || g.name.trim().length < 2);
      if (invalidGuests.length > 0) {
        setSubmitError('Alle navn må være fylt ut og minst 2 tegn.');
        setIsSubmitting(false);
        return;
      }

      const rsvpData = {
        guests: guests.map(g => ({
          name: g.name.trim(),
          allergies: g.allergies.trim() || undefined
        })),
        phone: phone.trim(),
        isAttending,
        timestamp: new Date().toISOString()
      };

      try {
        const res = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rsvpData)
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Kunne ikke sende RSVP. Prøv igjen.');
        }

        setIsSubmitted(true);
        setGuests([{ name: '', allergies: '' }]);
        setGuestCount(1);
        setPhone('');
        // Keep isAttending to show correct heading after submission
        setShowForm(false);
        setSubmitError(null);
      } catch (error) {
        console.error(error);
        setSubmitError(error instanceof Error ? error.message : 'En uventet feil oppstod. Prøv igjen.');
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleAttendanceChoice = (attending: boolean) => {
    setIsAttending(attending);
    setShowForm(true);
    setSubmitError(null);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setIsAttending(null);
    setShowForm(false);
    setGuests([{ name: '', allergies: '' }]);
    setGuestCount(1);
    setPhone('');
    setSubmitError(null);
  };

  return (
    <section id="rsvp" className="py-16 md:py-20 relative">
      {/* Mørk overlay for kontrast */}
      <div className="absolute inset-0 bg-black/20 -z-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Overskrift og undertittel i glassmorphism-kort */}
        <div className="text-center mb-10">
          <div className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto mb-8">
            <h2 
              id="rsvp-heading"
              className="text-3xl md:text-5xl lg:text-6xl leading-tight text-white mb-6 drop-shadow-lg"
            >
              {content?.title || 'RSVP'}
            </h2>
            
            {/* Enhanced subtitle */}
            {content?.subtitle && content.subtitle.length > 0 && (
              <p className="font-body text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                {content.subtitle[0]}
              </p>
            )}
            {content?.subtitle && content.subtitle.length > 1 && (
              <p className="font-body text-base md:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                {content.subtitle[1]}
              </p>
            )}
          </div>
        </div>

        {!isSubmitted ? (
          <div className="max-w-3xl mx-auto">
            {!showForm ? (
              <div className="text-center space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button
                    onClick={() => handleAttendanceChoice(true)}
                    className="btn-interactive bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-lg relative overflow-hidden"
                    aria-label={content?.buttons.attending || 'Jeg kommer til bryllupet'}
                  >
                    <span className="relative z-10 text-lg md:text-xl">{content?.buttons.attending || 'Jeg kommer'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleAttendanceChoice(false)}
                    className="btn-interactive bg-gradient-to-r from-[#6B7280] to-[#9CA3AF] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-lg relative overflow-hidden"
                    aria-label={content?.buttons.notAttending || 'Jeg kan dessverre ikke komme'}
                  >
                    <span className="relative z-10 text-lg md:text-xl">{content?.buttons.notAttending || 'Jeg kan dessverre ikke'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass-card rounded-3xl p-8 md:p-10">
                  <div className="space-y-6">
                    {/* Antall personer */}
                    <div>
                      <label htmlFor="guest_count" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
                        {content?.form.guestCountLabel || 'Antall personer *'}
                      </label>
                      <select
                        id="guest_count"
                        value={guestCount}
                        onChange={handleGuestCountChange}
                        required
                        className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                        aria-required="true"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'person' : 'personer'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dynamiske navn-bokser */}
                    {guests.map((guest, index) => (
                      <div key={index} className="space-y-4 pb-6 border-b border-white/20 last:border-b-0">
                        <h3 className="font-body font-medium text-white/95 text-lg drop-shadow-sm">
                          Person {index + 1}
                        </h3>
                        <div>
                          <label htmlFor={`guest-name-${index}`} className="block font-body font-medium text-white/95 mb-3 text-base drop-shadow-sm">
                            {content?.form.nameLabel || 'Navn *'}
                          </label>
                          <input
                            type="text"
                            id={`guest-name-${index}`}
                            value={guest.name}
                            onChange={(e) => handleGuestNameChange(index, e.target.value)}
                            required
                            autoComplete="name"
                            className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                            placeholder={content?.form.namePlaceholder || `Navn på person ${index + 1}`}
                            aria-required="true"
                          />
                        </div>
                        {isAttending && (
                          <div>
                            <label htmlFor={`guest-allergies-${index}`} className="block font-body font-medium text-white/95 mb-3 text-base drop-shadow-sm">
                              {content?.form.allergiesLabel || 'Allergier'}
                            </label>
                            <textarea
                              id={`guest-allergies-${index}`}
                              value={guest.allergies}
                              onChange={(e) => handleGuestAllergiesChange(index, e.target.value)}
                              rows={2}
                              className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg resize-none"
                              placeholder={content?.form.allergiesPlaceholder || 'Har du noen mat-allergier vi bør vite om? (valgfritt)'}
                            />
                            {index === 0 && content?.form.allergiesHelpText && (
                              <p className="mt-2 text-sm text-white/80 italic drop-shadow-sm">
                                {content.form.allergiesHelpText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Telefonnummer (delt mellom alle) */}
                    <div>
                      <label htmlFor="phone" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
                        {content?.form.phoneLabel || 'Telefonnummer *'}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                        placeholder={content?.form.phonePlaceholder || 'Ditt telefonnummer'}
                        aria-required="true"
                      />
                    </div>
                    
                  </div>
                  
                  {submitError && (
                    <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                      <p className="font-body text-red-700 text-center">{submitError}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-10">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-interactive flex-1 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-velvet disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none text-lg relative overflow-hidden"
                    >
                      <span className="relative z-10">
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Sender...
                          </div>
                        ) : (
                          content?.form.submitButton || 'Send svar'
                        )}
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSubmitError(null);
                      }}
                      className="btn-interactive flex-1 bg-[#6B7280] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-velvet text-lg relative overflow-hidden"
                    >
                      <span className="relative z-10">{content?.form.backButton || 'Tilbake'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-3xl p-10">
              <h3 className="text-3xl md:text-4xl text-white mb-8 drop-shadow-lg">
                {isAttending 
                  ? (content?.messages.attending || '🎉 Vi gleder oss til å feire sammen med deg!')
                  : (content?.messages.notAttending || '💝 Vi forstår og takker for svar. Vi håper å se deg snart!')
                }
              </h3>
              <button
                onClick={resetForm}
                className="bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-velvet hover-lift transition-all duration-300 text-lg"
              >
                {content?.form.newResponseButton || 'Send nytt svar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
