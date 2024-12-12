//USED FOR INPUTS WITH DIFFERENT STYLES

import { ImageBackground, type ImageBackgroundProps, StyleSheet, DimensionValue } from "react-native";

export type ThemedImageBackgroundProps = ImageBackgroundProps & {
    justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    width?: DimensionValue | number | string | undefined
    
  };
  
  export function ThemedImageBackground({
    style,
    justifyContent,
    width,
    ...rest
  }: ThemedImageBackgroundProps) {
  
    // The component that is returned
    return (
      <ImageBackground
        style={[
            { justifyContent },
            { width },
          style,
        ]}
        {...rest}
      />
    );
  }
  