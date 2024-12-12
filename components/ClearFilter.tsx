import { Pressable, View, Text } from "react-native";

export default function ClearFilter({
  handleClearFilter,
}: {
  handleClearFilter: any;
}) {
  return (
    <Pressable
      onPress={handleClearFilter}
      style={{
        height: 50,
        width: "25%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderRadius: 10,
      }}
    >
      <View
        style={{
          backgroundColor: "#dc3545",
          width: "100%",
          flex: 1,
          justifyContent: "center",
          height: "100%",
          borderRadius: 10,
        }}
      >
        {" "}
        <Text
          style={{
            alignSelf: "center",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Clear Filter
        </Text>
      </View>
    </Pressable>
  );
}
