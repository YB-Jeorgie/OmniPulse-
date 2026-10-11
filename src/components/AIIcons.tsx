import React from 'react';

export const GeminiLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24Z" />
  </svg>
);

export const OpenAILogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.259 24a6.0557 6.0557 0 0 0 5.7718-4.2057 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7466-7.0731zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.1354a4.4708 4.4708 0 0 1-.5346-3.0037l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1401-1.6564zm-1.6377-9.571a4.4755 4.4755 0 0 1 2.3418-1.9628l-.0047.1611v5.5164a.7759.7759 0 0 0 .3927.6766l5.838 3.3685-2.02 1.1683a.0757.0757 0 0 1-.0615.0047l-4.835-2.7914a4.4992 4.4992 0 0 1-1.6513-6.1414zM16.51 11.238l-5.8428-3.3685 2.02-1.1683a.0757.0757 0 0 1 .0615-.0047l4.835 2.7914a4.4992 4.4992 0 0 1-.6741 8.1005v-5.6726a.79.79 0 0 0-.4-.6778zm4.3157-1.4764l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0L9.2773 10.2868V7.9544a.0804.0804 0 0 1 .0332-.0615l4.9818-2.8764a4.4992 4.4992 0 0 1 6.5334 4.7451zM8.7107 13.5678l-2.02-1.1683a.071.071 0 0 1-.038-.052V6.7649a4.504 4.504 0 0 1 7.3709-3.4539l-.142.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813zm1.677-2.1953l2.42-1.3963 2.42 1.3963v2.7925l-2.42 1.3964-2.42-1.3964z" />
  </svg>
);

export const MetaLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16.995 3.011c-1.986 0-3.774.885-5.006 2.274-1.232-1.389-3.02-2.274-5.006-2.274-3.834 0-6.983 3.125-6.983 6.983 0 5.434 5.922 10.589 11.231 10.976.241.018.475.027.758.027.283 0 .517-.009.758-.027 5.309-.387 11.231-5.542 11.231-10.976 0-3.858-3.149-6.983-6.983-6.983zm-10.012 3.125c1.681 0 3.23.821 4.195 2.194-1.23 1.954-2.894 4.197-4.498 6.079-1.921-1.636-3.21-3.708-3.21-5.717 0-1.411 1.102-2.556 2.513-2.556zm10.012 0c1.411 0 2.513 1.145 2.513 2.556 0 2.009-1.289 4.081-3.21 5.717-1.604-1.882-3.268-4.125-4.498-6.079.965-1.373 2.514-2.194 4.195-2.194z" />
  </svg>
);

export const GrokLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const MultiAILogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="grid grid-cols-2 gap-0.5">
      <div className="w-2 h-2 rounded-full bg-blue-400" />
      <div className="w-2 h-2 rounded-full bg-emerald-400" />
      <div className="w-2 h-2 rounded-full bg-sky-400" />
      <div className="w-2 h-2 rounded-full bg-amber-400" />
    </div>
  </div>
);

export function getPersonaIcon(persona: string, className = 'w-4 h-4') {
  switch (persona) {
    case 'gemini':
      return <GeminiLogo className={className} />;
    case 'chatgpt':
      return <OpenAILogo className={className} />;
    case 'meta':
      return <MetaLogo className={className} />;
    case 'grok':
      return <GrokLogo className={className} />;
    default:
      return <MultiAILogo className={className} />;
  }
}
