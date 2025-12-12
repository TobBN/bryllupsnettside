"use client";

import { useState } from 'react';
import { RSVPSectionProps } from '@/types';
import { DecorativeLine } from './DecorativeLine';

export const RSVPSection: React.FC<RSVPSectionProps> = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    allergies: ''
  });
  const [isAttending, setIsAttending] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        setFormData({ name: '', phone: '', allergies: '' });
        setIsAttending(null);
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
    setFormData({ name: '', phone: '', allergies: '' });
    setSubmitError(null);
  };

  return (
    <section id="rsvp" className="py-16 md:py-20 bg-[#FEFAE0] relative">
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 
            id="rsvp-heading"
            className="text-3xl md:text-5xl lg:text-6xl leading-tight text-[#2D1B3D] mb-6"
          >
            RSVP
          </h2>
          
          {/* Enhanced subtitle */}
          <p className="font-body text-base md:text-lg text-[#4A2B5A]/80 max-w-2xl mx-auto leading-relaxed">
            Vennligst svar om du kommer innen 1. mai 2026.
          </p>
          <p className="font-body text-base md:text-lg text-[#4A2B5A]/80 max-w-2xl mx-auto leading-relaxed">
            Vi gleder oss til å feire sammen med dere!
          </p>
        </div>

        {!isSubmitted ? (
          <div className="max-w-3xl mx-auto">
            {!showForm ? (
              <div className="text-center space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button
                    onClick={() => handleAttendanceChoice(true)}
                    className="bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-lg transition-colors"
                    aria-label="Jeg kommer til bryllupet"
                  >
                    <span className="text-lg md:text-xl">Jeg kommer</span>
                  </button>
                  
                  <button
                    onClick={() => handleAttendanceChoice(false)}
                    className="bg-gradient-to-r from-[#6B7280] to-[#9CA3AF] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-lg transition-colors"
                    aria-label="Jeg kan dessverre ikke komme"
                  >
                    <span className="text-lg md:text-xl">Jeg kan dessverre ikke</span>
                  </button>
                </div>
                
                {/* Additional info */}
                <p className="font-body text-[#4A2B5A]/80 leading-relaxed">
                  <strong>Svarfrist:</strong> 1. mai 2026. Spørsmål? Ta kontakt med oss direkte.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-[#E8B4B8]/30 shadow-2xl">
                  <h3 className="text-3xl md:text-4xl text-[#2D1B3D] mb-8 text-center">
                    {isAttending ? '🎉 Vi gleder oss til å se deg!' : '💝 Vi forstår, takk for svar'}
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block font-body font-medium text-[#4A2B5A] mb-3 text-lg">
                        Navn *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        autoComplete="name"
                        className="w-full px-6 py-4 border-2 border-[#E8B4B8]/30 rounded-2xl font-body text-[#2D1B3D] focus:outline-none focus:ring-4 focus:ring-[#E8B4B8]/20 focus:border-[#E8B4B8] transition-all duration-300 text-lg"
                        placeholder="Ditt navn"
                        aria-required="true"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block font-body font-medium text-[#4A2B5A] mb-3 text-lg">
                        Telefonnummer *
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
                        className="w-full px-6 py-4 border-2 border-[#E8B4B8]/30 rounded-2xl font-body text-[#2D1B3D] focus:outline-none focus:ring-4 focus:ring-[#E8B4B8]/20 focus:border-[#E8B4B8] transition-all duration-300 text-lg"
                        placeholder="Ditt telefonnummer"
                        aria-required="true"
                      />
                    </div>
                    
                    {isAttending && (
                      <div>
                        <label htmlFor="allergies" className="block font-body font-medium text-[#4A2B5A] mb-3 text-lg">
                          Mat-allergier
                        </label>
                        <textarea
                          id="allergies"
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-6 py-4 border-2 border-[#E8B4B8]/30 rounded-2xl font-body text-[#2D1B3D] focus:outline-none focus:ring-4 focus:ring-[#E8B4B8]/20 focus:border-[#E8B4B8] transition-all duration-300 text-lg resize-none"
                          placeholder="Har du noen mat-allergier vi bør vite om? (valgfritt)"
                          aria-describedby="allergies-help"
                        />
                        <p id="allergies-help" className="font-small text-[#6B7280] mt-2">
                          Dette hjelper oss å tilpasse menyen for alle gjester
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
                      className="flex-1 bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-velvet hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Sender...
                        </div>
                      ) : (
                        'Send svar'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setSubmitError(null);
                      }}
                      className="flex-1 bg-[#6B7280] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-velvet hover-lift transition-all duration-300 text-lg"
                    >
                      Tilbake
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 border border-[#E8B4B8]/30 shadow-2xl">
              <div className="text-8xl mb-8">🎉</div>
              <h3 className="text-3xl md:text-4xl text-[#2D1B3D] mb-6">
                Takk for svar!
              </h3>
              <p className="font-body text-xl text-[#4A2B5A] leading-relaxed mb-8">
                {isAttending 
                  ? 'Vi gleder oss til å feire sammen med deg! Du vil motta en bekreftelse på SMS snart.'
                  : 'Vi forstår og takker for svar. Vi håper å se deg snart!'
                }
              </p>
              <button
                onClick={resetForm}
                className="bg-gradient-to-r from-[#E8B4B8] to-[#F4A261] text-white font-body font-medium px-8 py-4 rounded-2xl shadow-velvet hover-lift transition-all duration-300 text-lg"
              >
                Send nytt svar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
