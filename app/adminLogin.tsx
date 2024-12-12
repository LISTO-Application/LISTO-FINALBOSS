import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Button,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { styles } from "@/styles/styles";
import { utility } from "@/styles/utility";
import { router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import Modal from "react-native-modal";
import { ThemedInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { SpacerView } from "@/components/SpacerView";
import { ThemedButton } from "@/components/ThemedButton";
import { useState } from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";
export default function adminLogin() {
  const logo = require("../assets/images/logo.png");

  const [toggleModal, setToggleModal] = useState(false);

  if (Platform.OS === "android" || Platform.OS === "ios") {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={[styles.mainContainer, utility.blueBackground]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SpacerView height={80} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          style={[styles.container, utility.blueBackground]}
        >
          <ThemedText lightColor="#FFF" darkColor="#FFF" type="title">
            Admin Login
          </ThemedText>
          <ThemedInput type="outline" placeholder="Email" />

          <ThemedInput type="outline" placeholder="********" secureTextEntry />
          <TouchableOpacity onPress={() => router.push("/forgot")}>
            <ThemedText lightColor="#FFF" darkColor="#FFF" type="body">
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>
          <SpacerView height={40} />
          <SpacerView height={40}>
            <ThemedButton
              title="Login"
              onPress={() => {
                router.replace({
                  pathname: "/changeAdminInformation",
                  params: {},
                });
              }}
            />
          </SpacerView>
          <SpacerView height={55} marginTop={20}>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <ThemedText lightColor="#FFF" darkColor="#FFF" type="body">
                Don't have an account?{" "}
              </ThemedText>
            </TouchableOpacity>
          </SpacerView>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  } else if (Platform.OS === "web") {
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

          <SpacerView height="5%" />

          <ThemedText lightColor="#FFF" darkColor="#FFF" type="display">
            L I S T O
          </ThemedText>
        </SpacerView>

        <SpacerView
          style={[utility.blueBackground]}
          flexDirection="column"
          justifyContent="center"
          height="75%"
          width="50%"
        >
          <SpacerView
            height="100%"
            width="75%"
            style={[utility.whiteBackground]}
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
              Admin Login
            </ThemedText>
            <SpacerView height="5%" />

            <ThemedInput
              width="75%"
              backgroundColor="#fff"
              type="blueOutline"
              marginVertical="2.5%"
              placeholderTextColor="#7CB7D8"
              placeholder="Email"
            />
            <ThemedInput
              width="75%"
              backgroundColor="#fff"
              type="blueOutline"
              marginVertical="2.5%"
              placeholderTextColor="#7CB7D8"
              placeholder="********"
              secureTextEntry
            />
            <SpacerView height="2%" />
            <Modal isVisible={toggleModal}>
              <SpacerView
                style={{ height: "75%", width: "50%", alignSelf: "center" }}
              >
                <ThemedView
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    width: "50%",
                    height: "100%",
                    borderRadius: 20,
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 30,
                  }}
                >
                  <ThemedText type="title" darkColor="#115272">
                    Terms and Conditions:
                  </ThemedText>
                  <ThemedText
                    style={{
                      color: "black",
                      padding: 20,
                      textAlign: "justify",
                    }}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </ThemedText>
                  <ThemedText type="title" darkColor="#115272">
                    Data Privacy:
                  </ThemedText>
                  <ThemedText
                    style={{
                      color: "black",
                      padding: 20,
                      textAlign: "justify",
                    }}
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </ThemedText>
                  <SpacerView height="15%" />
                  <ThemedButton
                    title="Close"
                    width="25%"
                    style={{ justifyContent: "center" }}
                    onPress={() => setToggleModal(false)}
                  />
                </ThemedView>
              </SpacerView>
            </Modal>
            <BouncyCheckbox
              style={{
                flexDirection: "row",
                width: "75%",
                justifyContent: "center",
              }}
              size={25}
              fillColor="red"
              unFillColor="#FFFFFF"
              text="Click here to agree to the Terms and Conditions and Data Privacy"
              iconStyle={{ borderColor: "red", borderRadius: 10 }}
              innerIconStyle={{ borderWidth: 2, borderRadius: 10 }}
              textStyle={{
                textDecorationLine: "none",
                color: "black",
              }}
              onPress={(isChecked: boolean) => {
                console.log(isChecked, "checked");
                if (isChecked) {
                  setToggleModal(true);
                } else {
                  setToggleModal(false);
                }
              }}
            />
            <SpacerView height="2%" />
            <ThemedButton
              width="25%"
              title="Sign in"
              onPress={() => {
                router.replace({
                  pathname: "../(auth)/otp",
                });
              }}
            />
            <SpacerView height="2.5%" />
            <Pressable
              style={{
                width: "auto",
                height: "auto",
              }}
              onPress={() => {
                router.replace({
                  pathname: "/",
                });
              }}
            >
              <ThemedText lightColor="#115272" darkColor="#115272" type="body">
                Already have an account?{" "}
              </ThemedText>
            </Pressable>
          </SpacerView>
        </SpacerView>
      </SpacerView>
    );
  }
}
