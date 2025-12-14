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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    allergies: '',
    guest_count: 1
  });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guest_count' ? parseInt(value, 10) || 1 : value
    }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitError(null);

      const rsvpData = {
        ...formData,
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
        setFormData({ name: '', phone: '', allergies: '', guest_count: 1 });
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
    setFormData({ name: '', phone: '', allergies: '', guest_count: 1 });
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
                    <div>
                      <label htmlFor="name" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
                        {content?.form.nameLabel || 'Navn *'}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        autoComplete="name"
                        className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                        placeholder={content?.form.namePlaceholder || 'Ditt navn'}
                        aria-required="true"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
                        {content?.form.phoneLabel || 'Telefonnummer *'}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                        placeholder={content?.form.phonePlaceholder || 'Ditt telefonnummer'}
                        aria-required="true"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="guest_count" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
                        {content?.form.guestCountLabel || 'Antall personer *'}
                      </label>
                      <input
                        type="number"
                        id="guest_count"
                        name="guest_count"
                        value={formData.guest_count}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg"
                        placeholder={content?.form.guestCountPlaceholder || 'Antall personer'}
                        aria-required="true"
                      />
                    </div>
                    
                    {isAttending && (
                      <div>
                        <label htmlFor="allergies" className="block font-body font-medium text-white/95 mb-3 text-lg drop-shadow-sm">
                          {content?.form.allergiesLabel || 'Mat-allergier'}
                        </label>
                        <textarea
                          id="allergies"
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-6 py-4 border-2 border-white/30 rounded-2xl font-body text-[#2D1B3D] bg-white/95 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all duration-300 text-lg resize-none"
                          placeholder={content?.form.allergiesPlaceholder || 'Har du noen mat-allergier vi bør vite om? (valgfritt)'}
                          aria-describedby="allergies-help"
                        />
                        <p id="allergies-help" className="font-small text-white/80 mt-2 drop-shadow-sm">
                          {content?.form.allergiesHelpText || 'Dette hjelper oss å tilpasse menyen for alle gjester'}
                        </p>
                      </div>
                    )}
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
