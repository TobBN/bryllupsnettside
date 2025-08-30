import { CountdownCardProps } from '@/types';

export const CountdownCard: React.FC<CountdownCardProps> = ({ value, label, gradient, animationDelay }) => {
  const delayClasses: Record<number, string> = {
    0: '',
    1: 'animate-delay-100',
    2: 'animate-delay-200',
    3: 'animate-delay-300',
  };
  const delayClass = delayClasses[Math.round(animationDelay * 10)] || '';

  return (
    <div
      className={`relative bg-gradient-to-br ${gradient} text-white/95 rounded-2xl p-4 md:p-6 shadow-2xl hover-lift transition-all duration-500 transform hover:scale-105 opacity-90 ${delayClass}`}
    >
      <div className="absolute inset-0 bg-white/10 rounded-2xl mix-blend-overlay pointer-events-none"></div>
      <div className="text-center relative">
        <div className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
          {value.toString().padStart(2, '0')}
        </div>
        <div className="font-body text-base md:text-lg text-white/90 font-medium uppercase tracking-wider">
          {label}
        </div>
      </div>
      
      {/* Decorative corner elements */}
      <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
    </div>
  );
};
