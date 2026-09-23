import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: 6,
  fontFamily: 'var(--font-sans)',
  fontFamilyMonospace: 'var(--font-mono)',
  
  colors: {
    blue: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    gray: ['#FAFAFA', '#F5F5F5', '#E5E5E5', '#D4D4D4', '#A3A3A3', '#737373', '#525252', '#404040', '#262626', '#171717'],
  },
  
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  radius: { xs: '4px', sm: '4px', md: '6px', lg: '8px', xl: '12px' },
  shadows: { xs: '0 1px 2px rgba(0,0,0,0.05)', sm: '0 1px 3px rgba(0,0,0,0.1)', md: '0 4px 6px rgba(0,0,0,0.1)', lg: '0 10px 15px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.1)' },
  
  components: {
    Button: { defaultProps: { size: 'md', radius: 'md' } },
    TextInput: { defaultProps: { size: 'md', radius: 'md' } },
    Paper: { defaultProps: { shadow: 'sm', radius: 'md', withBorder: true } },
    Table: { defaultProps: { highlightOnHover: true, striped: true } },
  },
  
  other: {
    sidebarWidth: '256px',
    sidebarCollapsedWidth: '64px',
  },
});

export default theme;
