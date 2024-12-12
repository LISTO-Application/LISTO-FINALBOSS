//USED FOR BUTTONS WITH DIFFERENT STYLES

import {
  Pressable,
  Text,
  type PressableProps,
  StyleSheet,
  DimensionValue,
} from "react-native";

export type ThemedButtonProps = PressableProps & {
  title?: string;
  type?: "default" | "red" | "white" | "blue" | "white-outline";
  height?: DimensionValue;
  width?: DimensionValue;
  paddingHorizontal?: DimensionValue;
  paddingVertical?: DimensionValue;
  marginHorizontal?: DimensionValue;
  marginVertical?: DimensionValue;
  onPress?: () => void;
};

export function ThemedButton({
  style,
  title,
  type = "default",
  height = 36,
  width = "100%",
  paddingHorizontal,
  paddingVertical,
  marginHorizontal,
  marginVertical,
  onPress,
  ...rest
}: ThemedButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        type === "default" ? styles.default : undefined,
        type === "red" ? styles.red : undefined,
        type === "white" ? styles.white : undefined,
        type === "blue" ? styles.blue : undefined,
        type === "white-outline" ? styles.whiteOutline : undefined,
        { height },
        { width },
        { paddingHorizontal },
        { paddingVertical },
        { marginHorizontal },
        { marginVertical },
      ]}
      {...rest}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    width: "100%",
    justifyContent: "center",
  },

  text: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },

  default: {
    backgroundColor: "#DA4B46",
    borderWidth: 2,
  },

  red: {
    color: "#DA4B46",
    backgroundColor: "#FFF",
  },

  white: {
    backgroundColor: "#FFF",
  },

  blue: {
    backgroundColor: "#115272",
  },

  whiteOutline: {
    backgroundColor: "transparent",
    borderColor: "#FFF",
    borderWidth: 3,
  },
});
