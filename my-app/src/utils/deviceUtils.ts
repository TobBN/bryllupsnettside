/**
 * Device detection utilities for better cross-platform compatibility
 */

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isIOSSafari = (): boolean => {
  return isIOS() && isSafari();
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth <= 768;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const supportsBackgroundAttachmentFixed = (): boolean => {
  // iOS Safari has issues with background-attachment: fixed
  return !isIOSSafari();
};

export const getDeviceInfo = () => {
  return {
    isIOS: isIOS(),
    isSafari: isSafari(),
    isIOSSafari: isIOSSafari(),
    isMobile: isMobile(),
    isTouchDevice: isTouchDevice(),
    supportsBackgroundAttachmentFixed: supportsBackgroundAttachmentFixed(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    platform: typeof window !== 'undefined' ? navigator.platform : '',
    maxTouchPoints: typeof window !== 'undefined' ? navigator.maxTouchPoints : 0
  };
};