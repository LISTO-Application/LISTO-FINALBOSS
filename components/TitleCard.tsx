import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { webstyles } from "@/styles/webstyles";
import { useRoute } from "@react-navigation/native";

export default function TitleCard() {
  const route = useRoute();

  const titles: { [key: string]: string } = {
    validateReports: "Validate Reports",
    viewReports: "User Reports",
    newReports: "Create a Report",
    editReport: "Edit a Report",
    reportDetails: "Report Details",
    ViewAdminEmergencyList: "Listed Crimes",
    newAdminReports: "Add a Report",
    Default: "Default",
  };

  const title = titles[route.name] || titles.Default;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 10,
        paddingLeft: 20,
      }}
    >
      <Text style={[webstyles.headerText, { marginRight: 10 }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
