import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

export default function SideBar() {
  const phone = require("../../assets/images/phone-icon.png");
  const report = require("../../assets/images/report-icon.png");
  const person = require("../../assets/images/person-icon.png");

  const icons = {
    emergency: (props: any) => (
      <Image style={{ width: 36, height: 45 }} source={phone} {...props} />
    ),
    index: (props: any) => (
      <Image style={{ width: 75, height: 75 }} source={report} {...props} />
    ),
    "[id]": (props: any) => (
      <Image style={{ width: 36, height: 45 }} source={person} {...props} />
    ),
  };

  return (
    <View>
      <Text>SideBar</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
