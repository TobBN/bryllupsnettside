import { DecorativeLineProps } from '@/types';

export const DecorativeLine: React.FC<DecorativeLineProps> = ({ className = '' }) => {
  return (
    <div 
      className={`decorative-line w-48 mx-auto ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
};
