//React Imports
import {
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";

//Expo Imports
import { Redirect, router } from "expo-router";

//Stylesheet Imports
import { styles } from "@/styles/styles";
import { utility } from "@/styles/utility";

//Component Imports
import { ThemedInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { SpacerView } from "@/components/SpacerView";
import { ThemedButton } from "@/components/ThemedButton";
import { firebase } from "@react-native-firebase/firestore";
import { useState } from "react";
import { authWeb } from ".";
import { sendPasswordResetEmail } from "firebase/auth";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const logo = require("../../assets/images/logo.png");
  const keyboardBehavior: "padding" | "height" =
    Platform.OS === "ios" ? "padding" : "height";
  if (Platform.OS === "android") {
    const session = firebase.auth().currentUser;
    if (session != null) {
      return <Redirect href="../(tabs)" />;
    }
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={[styles.mainContainer, utility.blueBackground]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SpacerView height={100} />
        <KeyboardAvoidingView
          behavior="height"
          keyboardVerticalOffset={0}
          style={[styles.container, utility.blueBackground]}
        >
          <ThemedText lightColor="#FFF" darkColor="#FFF" type="title">
            Forgot your password?
          </ThemedText>
          <ThemedInput
            type="outline"
            placeholder="Email"
            onChangeText={setEmail}
          />
          <SpacerView height={40} />
          <SpacerView height={40}>
            {!loading && (
              <ThemedButton
                title="Submit"
                onPress={async () => {
                  setLoading(true);
                  if (emailRegex.test(email)) {
                    await firebase
                      .auth()
                      .sendPasswordResetEmail(email)
                      .then(() => {
                        Alert.alert(
                          "Email sent",
                          "A password reset link has been sent to the email if it exists."
                        );
                        setLoading(false);
                        router.replace("../(auth)/login");
                      })
                      .catch((error) => {
                        Alert.alert("Password reset failed", error);
                        setLoading(false);
                      });
                  } else if (email == "") {
                    Alert.alert(
                      "Invalid Email",
                      "Please enter an email address."
                    );
                  } else {
                    Alert.alert(
                      "Invalid Email",
                      "Please enter a valid email address."
                    );
                  }
                }}
              />
            )}

            {loading && (
              <Pressable
                style={{
                  backgroundColor: "#DA4B46",
                  height: 36,
                  width: "100%",
                  borderRadius: 50,
                  justifyContent: "center",
                  marginVertical: "5%",
                }}
              >
                <ActivityIndicator size="large" color="#FFF" />
              </Pressable>
            )}
          </SpacerView>
          <SpacerView height={55} />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  } else if (Platform.OS === "web") {
    const handlePasswordReset = async () => {
      setLoading(true);
      console.log(email);
      if (emailRegex.test(email)) {
        try {
          const auth = authWeb;
          await sendPasswordResetEmail(auth, email);
          alert(
            "Email Sent. A password reset link has been sent to the email if it exists."
          );
          setLoading(false);
          router.replace("../(auth)/login");
        } catch (error: any) {
          alert(`Password Reset Failed", ${error.message}`);
          setLoading(false);
        }
      } else if (email === "") {
        Alert.alert("Invalid Email", "Please enter an email address.");
        setLoading(false);
      } else {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        setLoading(false);
      }
    };
    return (
      <SpacerView
        height="100%"
        width="100%"
        style={[utility.blueBackground]}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <SpacerView
          style={[utility.blueBackground]}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
          width="50%"
        >
          <Image source={logo}></Image>

          <SpacerView height="1%" />

          <ThemedText lightColor="#FFF" darkColor="#FFF" type="display">
            L I S T O
          </ThemedText>
        </SpacerView>

        <SpacerView
          style={[utility.blueBackground]}
          flexDirection="column"
          justifyContent="center"
          height="50%"
          width="50%"
        >
          <SpacerView
            height="100%"
            width="75%"
            style={[utility.whiteBackground, forgetStyle.shadowBox]}
            borderRadius={20}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <ThemedText
              lightColor="#115272"
              darkColor="#115272"
              type="subDisplay"
            >
              Forgot Password?
            </ThemedText>
            <SpacerView height="2%" />
            <ThemedText lightColor="#115272" darkColor="#115272" type="default">
              An link will be sent to your email to change your password.
            </ThemedText>
            <ThemedInput
              width="75%"
              backgroundColor="white"
              type="blueOutline"
              marginVertical="2.5%"
              placeholderTextColor="#7CB7D8"
              placeholder="Email"
              onChangeText={setEmail}
              style={{ fontSize: 20, fontWeight: 400 }}
            />
            <SpacerView height="2%" />
            {!loading && (
              <ThemedButton
                width="75%"
                title="Submit"
                onPress={handlePasswordReset}
              />
            )}

            {loading && (
              <Pressable
                style={{
                  backgroundColor: "#DA4B46",
                  height: 36,
                  width: "75%",
                  borderRadius: 50,
                  justifyContent: "center",
                  marginVertical: "5%",
                }}
              >
                <ActivityIndicator size="large" color="#FFF" />
              </Pressable>
            )}
            <SpacerView height="2.5%" />
          </SpacerView>
        </SpacerView>
      </SpacerView>
    );
  }
}

const forgetStyle = StyleSheet.create({
  shadowBox: {
    shadowColor: "#333333",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
