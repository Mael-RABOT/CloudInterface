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

export const isSmallMobile = (): boolean => {
  return window.innerWidth <= 480;
};

export const isLargeMobile = (): boolean => {
  return window.innerWidth > 480 && window.innerWidth <= 768;
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobile()) return 'mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const getDetailedDeviceType = (): 'small-mobile' | 'large-mobile' | 'tablet' | 'desktop' => {
  if (isSmallMobile()) return 'small-mobile';
  if (isLargeMobile()) return 'large-mobile';
  if (isTablet()) return 'tablet';
  return 'desktop';
};

export const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = React.useState(getDeviceType());
  const [detailedDeviceType, setDetailedDeviceType] = React.useState(getDetailedDeviceType());

  React.useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
      setDetailedDeviceType(getDetailedDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isSmallMobile: detailedDeviceType === 'small-mobile',
    isLargeMobile: detailedDeviceType === 'large-mobile',
    deviceType,
    detailedDeviceType
  };
};

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
};

// Responsive utilities
export const getResponsiveValue = <T,>(
  mobile: T,
  tablet: T,
  desktop: T
): T => {
  if (isMobile()) return mobile;
  if (isTablet()) return tablet;
  return desktop;
};

export const getResponsiveSpacing = (mobile: number, tablet: number, desktop: number): number => {
  return getResponsiveValue(mobile, tablet, desktop);
};

export const getResponsiveFontSize = (mobile: number, tablet: number, desktop: number): number => {
  return getResponsiveValue(mobile, tablet, desktop);
};