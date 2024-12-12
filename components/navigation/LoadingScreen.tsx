import { ActivityIndicator, Modal, View } from "react-native";

export function LoadingScreen() {
  return (
    <Modal animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "#115272",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    </Modal>
  );
}
