export const isWebAuthnSupported = () => {
  return typeof window !== 'undefined' && 
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function';
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}; 