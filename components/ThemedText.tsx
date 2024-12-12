//USED FOR TEXT WITH DIFFERENT STYLES

import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'display' | 'subDisplay' | 'title' | 'defaultSemiBold' | 'subtitle' | 'body' | 'link';
  textAlign?: 'center' | 'left' | 'right';
  paddingVertical?: number;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  textAlign,

  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

      // The component that is returned
  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'display' ? styles.display : undefined,
        type === 'subDisplay' ? styles.subDisplay : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'link' ? styles.link : undefined,
        {textAlign},
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  display: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 64,
  },
  
  subDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 48,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
