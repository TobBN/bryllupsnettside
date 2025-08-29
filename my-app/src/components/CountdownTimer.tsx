import { CountdownCard } from './CountdownCard';
import { TimeLeft } from '@/types';

interface CountdownTimerProps {
  timeLeft: TimeLeft;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeLeft }) => {
  const countdownItems = [
    { label: 'Dager', value: timeLeft.days, color: 'from-[#E8B4B8]/75 to-[#F4A261]/75' },
    { label: 'Timer', value: timeLeft.hours, color: 'from-[#F4A261]/75 to-[#E76F51]/75' },
    { label: 'Minutter', value: timeLeft.minutes, color: 'from-[#E76F51]/75 to-[#4A2B5A]/75' },
    { label: 'Sekunder', value: timeLeft.seconds, color: 'from-[#4A2B5A]/75 to-[#E8B4B8]/75' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto" role="timer" aria-live="polite">
      {countdownItems.map((item, index) => (
        <CountdownCard
          key={item.label}
          label={item.label}
          value={item.value}
          gradient={item.color}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
};
