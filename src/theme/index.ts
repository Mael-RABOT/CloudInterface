import type { ThemeConfig } from 'antd';

// Enhanced Retro Color Palette
const colors = {
  // Primary retro colors
  primary: {
    50: '#e6ffe6',
    100: '#b3ffb3',
    200: '#80ff80',
    300: '#4dff4d',
    400: '#1aff1a',
    500: '#00ff00', // Main green
    600: '#00cc00',
    700: '#009900',
    800: '#006600',
    900: '#003300',
  },
  // Secondary colors
  secondary: {
    cyan: '#00ffff',
    yellow: '#ffff00',
    magenta: '#ff00ff',
    red: '#ff0000',
    blue: '#0000ff',
    orange: '#ff8000',
  },
  // Neutral colors for retro theme
  neutral: {
    50: '#f0f0f0',
    100: '#e0e0e0',
    200: '#c0c0c0',
    300: '#a0a0a0',
    400: '#808080',
    500: '#606060',
    600: '#404040',
    700: '#303030',
    800: '#202020',
    900: '#101010',
  },
  // Dark theme colors
  dark: {
    background: '#000000',
    surface: '#001100',
    surfaceHover: '#002200',
    surfaceActive: '#003300',
    border: '#00ff00',
    borderSecondary: '#008800',
    text: '#00ff00',
    textSecondary: '#00cc00',
    textTertiary: '#008800',
    shadow: 'rgba(0, 255, 0, 0.1)',
    glow: 'rgba(0, 255, 0, 0.3)',
  },
  // Semantic colors
  success: '#00ff00',
  warning: '#ffff00',
  error: '#ff0000',
  info: '#00ffff',
  // Background colors
  background: {
    primary: '#000000',
    secondary: '#001100',
    tertiary: '#002200',
    elevated: '#003300',
    card: '#001100',
    modal: '#000000',
  },
  // Text colors
  text: {
    primary: '#00ff00',
    secondary: '#00cc00',
    tertiary: '#008800',
    inverse: '#000000',
    placeholder: '#006600',
  },
  // Border colors
  border: {
    light: '#008800',
    medium: '#00cc00',
    dark: '#00ff00',
    glow: 'rgba(0, 255, 0, 0.5)',
  },
};

// Enhanced Typography
const typography = {
  fontFamily: {
    primary: '"VT323", "Share Tech Mono", "Courier New", monospace',
    mono: '"VT323", "Share Tech Mono", "Courier New", monospace',
    display: '"VT323", "Share Tech Mono", monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 64,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Enhanced Spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
};

// Border radius for retro theme
const borderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

// Enhanced Shadows with glow effects
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 255, 0, 0.1)',
  base: '0 1px 3px 0 rgba(0, 255, 0, 0.15), 0 1px 2px -1px rgba(0, 255, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 255, 0, 0.2), 0 2px 4px -2px rgba(0, 255, 0, 0.15)',
  lg: '0 10px 15px -3px rgba(0, 255, 0, 0.25), 0 4px 6px -4px rgba(0, 255, 0, 0.2)',
  xl: '0 20px 25px -5px rgba(0, 255, 0, 0.3), 0 8px 10px -6px rgba(0, 255, 0, 0.25)',
  '2xl': '0 25px 50px -12px rgba(0, 255, 0, 0.4)',
  glow: '0 0 20px rgba(0, 255, 0, 0.5)',
  glowStrong: '0 0 30px rgba(0, 255, 0, 0.7)',
};

// Enhanced Ant Design theme configuration
export const theme: ThemeConfig = {
  token: {
    // Colors
    colorPrimary: colors.primary[500],
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,
    colorBgContainer: colors.background.primary,
    colorBgElevated: colors.background.elevated,
    colorBgLayout: colors.background.secondary,
    colorBgSpotlight: colors.background.tertiary,
    colorBgMask: 'rgba(0, 0, 0, 0.8)',
    colorBgBlur: 'rgba(0, 0, 0, 0.9)',

    // Text colors
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.tertiary,
    colorTextQuaternary: colors.text.tertiary,
    colorTextPlaceholder: colors.text.placeholder,

    // Border colors
    colorBorder: colors.border.medium,
    colorBorderSecondary: colors.border.light,

    // Typography
    fontFamily: typography.fontFamily.primary,
    fontFamilyCode: typography.fontFamily.mono,
    fontSize: typography.fontSize.base,
    fontSizeSM: typography.fontSize.sm,
    fontSizeLG: typography.fontSize.lg,
    fontSizeXL: typography.fontSize.xl,
    fontSizeHeading1: typography.fontSize['5xl'],
    fontSizeHeading2: typography.fontSize['4xl'],
    fontSizeHeading3: typography.fontSize['3xl'],
    fontSizeHeading4: typography.fontSize['2xl'],
    fontSizeHeading5: typography.fontSize.xl,

    // Spacing
    padding: spacing.md,
    paddingXS: spacing.xs,
    paddingSM: spacing.sm,
    paddingLG: spacing.lg,
    paddingXL: spacing.xl,
    paddingContentHorizontal: spacing.lg,
    paddingContentVertical: spacing.md,

    // Border radius
    borderRadius: borderRadius.base,
    borderRadiusLG: borderRadius.lg,
    borderRadiusSM: borderRadius.sm,
    borderRadiusXS: borderRadius.sm,

    // Control heights
    controlHeight: 44,
    controlHeightLG: 52,
    controlHeightSM: 36,
    controlHeightXS: 28,

    // Motion
    motionDurationFast: '0.15s',
    motionDurationMid: '0.25s',
    motionDurationSlow: '0.35s',
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',

    // Wireframe
    wireframe: false,
  },
  components: {
    // Layout components
    Layout: {
      headerBg: colors.background.primary,
      headerHeight: 72,
      headerPadding: `0 ${spacing.xl}px`,
      siderBg: colors.background.secondary,
      bodyBg: colors.background.tertiary,
      footerBg: colors.background.primary,
      footerPadding: `${spacing.md}px ${spacing.xl}px`,
    },

    // Button components
    Button: {
      borderRadius: borderRadius.base,
      controlHeight: 44,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      primaryShadow: shadows.glow,
      defaultShadow: shadows.base,
      dangerShadow: shadows.base,
      primaryColor: colors.text.inverse,
      defaultColor: colors.text.primary,
      dangerColor: colors.text.primary,
      defaultBorderColor: colors.border.medium,
      algorithm: true,
    },

    // Input components
    Input: {
      borderRadius: borderRadius.base,
      controlHeight: 44,
      fontSize: typography.fontSize.base,
      colorBgContainer: colors.background.secondary,
      colorBorder: colors.border.medium,
      colorText: colors.text.primary,
      colorTextPlaceholder: colors.text.placeholder,
      activeBorderColor: colors.primary[500],
      hoverBorderColor: colors.primary[400],
      algorithm: true,
    },

    // Table components
    Table: {
      borderRadius: borderRadius.base,
      headerBg: colors.background.secondary,
      headerColor: colors.text.primary,
      rowHoverBg: colors.background.elevated,
      colorBgContainer: colors.background.primary,
      colorText: colors.text.primary,
      colorTextHeading: colors.text.primary,
      algorithm: true,
    },

    // Card components
    Card: {
      borderRadius: borderRadius.base,
      headerBg: colors.background.secondary,
      colorBgContainer: colors.background.primary,
      colorText: colors.text.primary,
      colorTextHeading: colors.text.primary,
      algorithm: true,
    },

    // Modal components
    Modal: {
      borderRadius: borderRadius.base,
      headerBg: colors.background.secondary,
      colorBgElevated: colors.background.primary,
      colorText: colors.text.primary,
      colorTextHeading: colors.text.primary,
      algorithm: true,
    },

    // Tabs components
    Tabs: {
      borderRadius: borderRadius.base,
      itemSelectedColor: colors.primary[500],
      itemHoverColor: colors.primary[400],
      itemActiveColor: colors.primary[500],
      inkBarColor: colors.primary[500],
      algorithm: true,
    },

    // Menu components
    Menu: {
      borderRadius: borderRadius.base,
      itemBg: colors.background.primary,
      itemSelectedBg: colors.background.elevated,
      itemHoverBg: colors.background.secondary,
      itemSelectedColor: colors.primary[500],
      itemHoverColor: colors.primary[400],
      algorithm: true,
    },

    // Tree components
    Tree: {
      borderRadius: borderRadius.base,
      colorBgContainer: colors.background.primary,
      colorText: colors.text.primary,
      algorithm: true,
    },

    // Progress components
    Progress: {
      borderRadius: borderRadius.base,
      colorSuccess: colors.success,
      colorError: colors.error,
      colorWarning: colors.warning,
      colorInfo: colors.info,
      algorithm: true,
    },

    // Upload components
    Upload: {
      borderRadius: borderRadius.base,
      colorBgContainer: colors.background.secondary,
      colorBorder: colors.border.medium,
      colorText: colors.text.primary,
      algorithm: true,
    },

    // Form components
    Form: {
      labelColor: colors.text.primary,
      labelRequiredMarkColor: colors.error,
      algorithm: true,
    },

    // Message components
    Message: {
      borderRadius: borderRadius.base,
      algorithm: true,
    },

    // Notification components
    Notification: {
      borderRadius: borderRadius.base,
      algorithm: true,
    },

    // Tooltip components
    Tooltip: {
      borderRadius: borderRadius.base,
      colorBgSpotlight: colors.background.primary,
      colorTextLightSolid: colors.text.primary,
      algorithm: true,
    },

    // Popover components
    Popover: {
      borderRadius: borderRadius.base,
      colorBgElevated: colors.background.primary,
      colorText: colors.text.primary,
      algorithm: true,
    },

    // Dropdown components
    Dropdown: {
      borderRadius: borderRadius.base,
      colorBgElevated: colors.background.primary,
      colorText: colors.text.primary,
      algorithm: true,
    },

    // Select components
    Select: {
      borderRadius: borderRadius.base,
      colorBgContainer: colors.background.secondary,
      colorBorder: colors.border.medium,
      colorText: colors.text.primary,
      colorTextPlaceholder: colors.text.placeholder,
      algorithm: true,
    },

    // Switch components
    Switch: {
      borderRadius: borderRadius.full,
      colorPrimary: colors.primary[500],
      algorithm: true,
    },

    // Checkbox components
    Checkbox: {
      borderRadius: borderRadius.sm,
      colorPrimary: colors.primary[500],
      algorithm: true,
    },

    // Radio components
    Radio: {
      borderRadius: borderRadius.full,
      colorPrimary: colors.primary[500],
      algorithm: true,
    },

    // Slider components
    Slider: {
      borderRadius: borderRadius.full,
      colorPrimary: colors.primary[500],
      colorPrimaryBorder: colors.primary[500],
      algorithm: true,
    },

    // Rate components
    Rate: {
      colorPrimary: colors.primary[500],
      algorithm: true,
    },

    // Divider components
    Divider: {
      colorSplit: colors.border.light,
      algorithm: true,
    },

    // Typography components
    Typography: {
      colorText: colors.text.primary,
      colorTextHeading: colors.text.primary,
      colorTextDescription: colors.text.secondary,
      algorithm: true,
    },

    // Image components
    Image: {
      borderRadius: borderRadius.base,
      algorithm: true,
    },

    // Avatar components
    Avatar: {
      borderRadius: borderRadius.base,
      algorithm: true,
    },

    // Badge components
    Badge: {
      colorPrimary: colors.primary[500],
      colorError: colors.error,
      colorWarning: colors.warning,
      colorSuccess: colors.success,
      algorithm: true,
    },

    // Tag components
    Tag: {
      borderRadius: borderRadius.base,
      colorPrimary: colors.primary[500],
      colorError: colors.error,
      colorWarning: colors.warning,
      colorSuccess: colors.success,
      algorithm: true,
    },

    // Alert components
    Alert: {
      borderRadius: borderRadius.base,
      colorSuccess: colors.success,
      colorError: colors.error,
      colorWarning: colors.warning,
      colorInfo: colors.info,
      algorithm: true,
    },

    // Drawer components
    Drawer: {
      colorBgElevated: colors.background.primary,
      colorText: colors.text.primary,
      algorithm: true,
    },

    // Skeleton components
    Skeleton: {
      colorFillContent: colors.background.secondary,
      colorFill: colors.background.elevated,
      algorithm: true,
    },

    // Spin components
    Spin: {
      colorPrimary: colors.primary[500],
      algorithm: true,
    },

    // Anchor components
    Anchor: {
      colorPrimary: colors.primary[500],
      algorithm: true,
    },

    // Breadcrumb components
    Breadcrumb: {
      colorText: colors.text.primary,
      colorTextDescription: colors.text.secondary,
      algorithm: true,
    },

    // Pagination components
    Pagination: {
      colorPrimary: colors.primary[500],
      colorText: colors.text.primary,
      colorBgContainer: colors.background.primary,
      algorithm: true,
    },

    // Steps components
    Steps: {
      colorPrimary: colors.primary[500],
      colorText: colors.text.primary,
      colorTextDescription: colors.text.secondary,
      algorithm: true,
    },

    // Timeline components
    Timeline: {
      colorText: colors.text.primary,
      colorTextDescription: colors.text.secondary,
      algorithm: true,
    },
  },
};

// Export color constants for use in components
export { colors, typography, spacing, borderRadius, shadows };

// Export theme configuration
export default theme;