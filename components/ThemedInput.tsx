//USED FOR INPUTS WITH DIFFERENT STYLES

import {
  TextInput,
  type TextInputProps,
  type ViewProps,
  StyleSheet,
  DimensionValue,
} from "react-native";

export type ThemedInputProps = TextInputProps & {
  type?: "outline" | "solid" | "blueOutline";
  width?: number | DimensionValue | undefined;
  height?: number | DimensionValue | undefined;
  marginVertical?: number | DimensionValue | undefined;
  marginHorizontal?: number | DimensionValue | undefined;
  marginTop?: number | DimensionValue | undefined;
  marginBottom?: number | DimensionValue | undefined;
  marginLeft?: number | DimensionValue | undefined;
  marginRight?: number | DimensionValue | undefined;
  borderRadius?: number;
  placeholderTextColor?: string | undefined;
  backgroundColor?: string | undefined;
  textAlign?: "center" | "left" | "right";
  textAlignVertical?: "center" | "top" | "bottom";
  padding?: number;
};

export function ThemedInput({
  style,
  type = "outline",
  width,
  height = 48,
  marginVertical,
  marginHorizontal,
  borderRadius = 50,
  placeholderTextColor = "#BBB",
  backgroundColor,
  textAlign,
  textAlignVertical,
  padding = 10,
  ...rest
}: ThemedInputProps) {
  // The component that is returned
  return (
    <TextInput
      style={[
        type === "outline" ? styles.default : undefined,
        type === "outline" ? styles.outline : undefined,
        type === "solid" ? styles.solid : undefined,
        type === "blueOutline" ? styles.blueOutline : undefined,
        { width },
        { height },
        { marginVertical },
        { marginHorizontal },
        { borderRadius },
        { backgroundColor },
        { textAlign },
        { textAlignVertical },
        { padding },
        style,
      ]}
      cursorColor={"#FFF"}
      placeholderTextColor={placeholderTextColor}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    backgroundColor: "transparent",
    borderColor: "#FFF",
    borderWidth: 3,
    marginTop: "5%",
    marginBottom: "5%",
    paddingLeft: 20,
    color: "#FFF",
    fontWeight: "bold",
  },

  outline: {
    backgroundColor: "transparent",
    borderColor: "#FFF",
    borderWidth: 3,
    marginTop: "5%",
    marginBottom: "5%",
    paddingLeft: 20,
    color: "#FFF",
    fontWeight: "bold",
  },

  solid: {
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#FFF",
    marginTop: "5%",
    marginBottom: "5%",
    paddingLeft: 20,
    fontWeight: "bold",
  },

  blueOutline: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#115272",
    marginTop: "5%",
    marginBottom: "5%",
    paddingLeft: 20,
    fontWeight: "bold",
    color: "#115272",
  },
});
