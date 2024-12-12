//USED FOR SCROLL VIEWS WITH DIFFERENT STYLES

import { ScrollView, type ScrollViewProps, type StyleSheet } from "react-native";

export type ThemedScrollViewProps = ScrollViewProps & {
    height?: number;
  };
  
  export function ThemedScrollView({
    style,
    height,
    ...rest
  }: ThemedScrollViewProps) {
  
    // The component that is returned
    return (
      <ScrollView
        style={[
          {height},
          style,
        ]}
        {...rest}
      />
    );
  }
