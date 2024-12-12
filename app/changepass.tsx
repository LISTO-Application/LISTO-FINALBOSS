import { StyleSheet, Text, View, Platform, Image } from "react-native";
import { SpacerView } from "@/components/SpacerView";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { utility } from "@/styles/utility";
import { router } from "expo-router";

const logo = require("../assets/images/logo.png");

const changepass = () => {
  if (Platform.OS === "android") {
  } else if (Platform.OS === "web") {
    return (
      <SpacerView
        height="100%"
        width="100%"
        style={[utility.blueBackground, { margin: 20 }]}
        flexDirection="column"
        alignItems="center"
      >
        <SpacerView height="10%" />
        <SpacerView
          style={[utility.blueBackground]}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="25%"
          width="25%"
        >
          <Image source={logo} style={{ width: 200, height: 200 }}></Image>

          <ThemedText lightColor="#FFF" darkColor="#FFF" type="subDisplay">
            L I S T O
          </ThemedText>
        </SpacerView>
        <SpacerView height="5%" />
        <SpacerView
          style={[
            utility.blueBackground,
            otpStyle.shadowBox,
            { borderRadius: 20 },
          ]}
          flexDirection="column"
          justifyContent="center"
          height="30%"
          width="30%"
        >
          <SpacerView
            height="100%"
            width="100%"
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
              Change Password
            </ThemedText>
            <ThemedInput
              width="75%"
              backgroundColor="#fff"
              type="blueOutline"
              marginVertical="2.5%"
              placeholderTextColor="#7CB7D8"
              placeholder="Type new password"
            />
            <ThemedInput
              width="75%"
              backgroundColor="#fff"
              type="blueOutline"
              marginVertical="2.5%"
              placeholderTextColor="#7CB7D8"
              placeholder="Confirm new password"
            />
            <SpacerView height="5%" />
            <ThemedButton
              width="25%"
              title="Submit"
              onPress={() =>
                router.replace({
                  pathname: "/",
                })
              }
            />
            <SpacerView height="2.5%" />
          </SpacerView>
        </SpacerView>
        <SpacerView height="10%" />
      </SpacerView>
    );
  }
};

export default changepass;

const otpStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
  },
  pinCodeContainer: {
    borderColor: "#7CB7D8",
    margin: 5,
  },
  pinCodeFocusContainer: {
    borderColor: "#115272",
  },
  stickFocus: {
    backgroundColor: "#115272",
  },
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
