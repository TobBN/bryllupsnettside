import { render, screen } from '@testing-library/react';
import { CountdownTimer } from '../CountdownTimer';
import { TimeLeft } from '@/types';

describe('CountdownTimer', () => {
  const timeLeft: TimeLeft = { days: 12, hours: 3, minutes: 4, seconds: 5 };

  it('renders countdown items with correct labels and values', () => {
    render(<CountdownTimer timeLeft={timeLeft} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('04')).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();

    expect(screen.getByText('Dager')).toBeInTheDocument();
    expect(screen.getByText('Timer')).toBeInTheDocument();
    expect(screen.getByText('Minutter')).toBeInTheDocument();
    expect(screen.getByText('Sekunder')).toBeInTheDocument();
  });

  it('applies timer role', () => {
    render(<CountdownTimer timeLeft={timeLeft} />);
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });
});

