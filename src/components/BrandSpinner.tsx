'use client'

interface BrandSpinnerProps {
  size?: number
  className?: string
}

export default function BrandSpinner({ size = 256, className = '' }: BrandSpinnerProps) {
  return (
    <>
      <img
        src="/images/logo.svg"
        alt="Loading"
        className={`brand-spinner ${className}`}
        style={{ width: `${size}px`, height: 'auto' }}
      />
      <style jsx>{`
        .brand-spinner {
          animation: brand-spinner-breathe 3s infinite ease-in-out;
          will-change: transform, filter;
        }

        @keyframes brand-spinner-breathe {
          0% {
            transform: scale(1);
            filter: drop-shadow(0 0 0px rgba(215, 152, 233, 0));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 15px rgba(215, 152, 233, 0.5));
          }
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 0px rgba(215, 152, 233, 0));
          }
        }
      `}</style>
    </>
  )
}
