import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "firebase/auth";
import { useRouter } from "expo-router";
import { ThemedText } from "../ThemedText";
import { ThemedButton } from "../ThemedButton";

type AuthModalProps = {
  setReauthenticating: any;
  deleting: any;
  setDeleting: any;
  updating: any;
  setUpdating: any;
  editEmail: any;
  editPassword: any;
  updateDetails: any;
  accountStyle: any;
  exitIcon: any;
};

const ReauthModal = ({
  setReauthenticating,
  deleting,
  setDeleting,
  updating,
  setUpdating,
  editEmail,
  editPassword,
  updateDetails,
  accountStyle,
  exitIcon,
}: AuthModalProps) => {
  const [emailReauth, setEmailReauth] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleReauthSubmit = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert("Error", "No authenticated user found.");
      return;
    }

    const credentials = EmailAuthProvider.credential(emailReauth, password);

    setIsLoading(true);

    try {
      const result = await reauthenticateWithCredential(
        currentUser,
        credentials
      );

      if (deleting) {
        await deleteUser(result.user);
        setReauthenticating(false);
        setDeleting(false);
        router.replace("../(auth)/login");
      } else if (updating) {
        await updateDetails({ email: editEmail, password: editPassword });
        setReauthenticating(false);
        setUpdating(false);
        router.replace("../(tabs)/account");
      }
    } catch (error: any) {
      console.error("Re-authentication error:", error);

      switch (error.code) {
        case "auth/too-many-requests":
          Alert.alert(
            "Too many requests",
            "Too many subsequent login attempts, please try again in a few seconds!"
          );
          break;

        case "auth/invalid-credential":
          Alert.alert(
            "Incorrect credentials",
            "The email or password is incorrect."
          );
          break;

        case "auth/network-request-failed":
          Alert.alert(
            "Poor connection",
            "Connection error, please try again later."
          );
          break;

        default:
          Alert.alert(
            "Error",
            "An unexpected error occurred. Please try again."
          );
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0, 0.5)",
        width: "100%",
        height: "100%",
      }}
    >
      <View style={accountStyle.modal}>
        <TouchableOpacity
          style={{
            width: "auto",
            alignSelf: "flex-start",
            justifyContent: "center",
            borderRadius: 50,
            backgroundColor: "#FFF",
          }}
        >
          <Pressable
            onPress={() => {
              setReauthenticating(false);
              setDeleting(false);
              setUpdating(false);
            }}
          >
            <Image style={{ width: 36, height: 36 }} source={exitIcon} />
          </Pressable>
        </TouchableOpacity>
        {deleting && (
          <ThemedText
            style={{ marginVertical: "5%", alignSelf: "center" }}
            lightColor="#FFF"
            darkColor="#FFF"
            type="title"
          >
            Confirm Deletion
          </ThemedText>
        )}
        {updating && (
          <ThemedText
            style={{ marginVertical: "5%", alignSelf: "center" }}
            lightColor="#FFF"
            darkColor="#FFF"
            type="title"
          >
            Confirm Update
          </ThemedText>
        )}
        <TextInput
          style={accountStyle.textInput}
          placeholder="Email"
          placeholderTextColor="#BBB"
          onChangeText={setEmailReauth}
        />
        <TextInput
          style={accountStyle.textInput}
          placeholder="Password"
          placeholderTextColor="#BBB"
          onChangeText={setPassword}
          secureTextEntry
        />
        {!isLoading && (
          <ThemedButton
            title="Submit"
            width="75%"
            marginHorizontal="auto"
            marginVertical="2.5%"
            onPress={handleReauthSubmit}
          />
        )}
        {isLoading && (
          <Pressable
            style={{
              backgroundColor: "#DA4B46",
              height: 36,
              width: "75%",
              borderRadius: 50,
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#FFF" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ReauthModal;
