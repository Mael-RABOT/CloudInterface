import React from 'react';

export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

export const isTablet = (): boolean => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = (): boolean => {
  return window.innerWidth > 1024;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = React.useState(getDeviceType());

  React.useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    deviceType
  };
};