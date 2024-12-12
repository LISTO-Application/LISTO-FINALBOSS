//USED FOR SPACING BETWEEN COMPONENTS OR COMBINING MULTIPLE COMPONENTS IN A SINGLE ROW OR COLUMN

import { View, type ViewProps, StyleSheet, DimensionValue } from 'react-native';

export type SpacerViewProps = ViewProps & {
  width?: DimensionValue;
  height?: DimensionValue;
  flexDirection?: 'row' | 'column';
  marginVertical?: number | DimensionValue | undefined;
  marginHorizontal?: number | DimensionValue | undefined;
  marginLeft?: number | DimensionValue | undefined;
  marginTop?: number | DimensionValue | undefined;
  marginRight?: number | DimensionValue | undefined;
  marginBottom?: number | DimensionValue | undefined;
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  textAlign?: 'center' | 'left' | 'right';
  backgroundColor?: string | undefined;
  borderWidth?: number | undefined;
  borderRadius?: number | undefined;
  borderBottomWidth?: number | undefined;
  borderBottomColor?: string | undefined;
  opacity?: number | undefined;
  padding?: DimensionValue | number | undefined;
  paddingTop?: DimensionValue | number | undefined;
  paddingLeft?: DimensionValue | number | undefined;
  paddingBottom?: DimensionValue | number | undefined;
  paddingRight?: DimensionValue | number | undefined;
  flex?: number | undefined;
  display?: 'none' | 'flex';
};

export function SpacerView({
  style,
  width,
  height = '10%',
  flexDirection = 'row',
  marginVertical = 0,
  marginHorizontal = 0,
  marginLeft = 0,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  backgroundColor,
  borderWidth,
  borderRadius,
  borderBottomWidth,
  borderBottomColor,
  opacity = 100,
  padding = 0,
  paddingTop = 0,
  paddingLeft = 0,
  paddingBottom = 0,
  paddingRight = 0,
  flex,
  display,
  ...rest
}: SpacerViewProps) {

      // The component that is returned
  return (
    <View
      style={[
        { width },
        { height },
        { flexDirection },
        { marginVertical },
        { marginHorizontal },
        { marginLeft },
        { marginTop },
        { marginRight },
        { marginBottom },
        { justifyContent },
        { alignItems },
        { backgroundColor },
        { borderWidth },
        { borderRadius },
        {borderBottomWidth},
        {borderBottomColor},
        {opacity},
        {padding},
        {paddingTop},
        {paddingLeft},
        {paddingBottom},
        {paddingRight},
        {flex},
        {display},
        style,
      ]}
      {...rest}
    />
  );
}
