import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const DeleteModal = ({ setModalDelete }: { setModalDelete: any }) => {
  const handleDelete = () => {
    setModalDelete(false);
    router.push({
      pathname: "/",
    });
  };
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalText}>
          Are you sure you want to delete your account?
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalDelete(false)}
          >
            Cancel
          </Pressable>
          <View style={{ width: 10 }} />
          <Pressable
            style={[styles.button, styles.buttonConfirm]}
            onPress={handleDelete}
          >
            Confirm
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default DeleteModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    width: 400,
    height: 200,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
    fontWeight: "bold",
    width: "75%",
    fontFamily: "sans-serif",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#115272",
    color: "white",
  },
  buttonConfirm: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#115272",
    color: "#115272",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    color: "#115272",
    fontSize: 20,
  },
});
