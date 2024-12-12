import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Button,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
  Alert,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { styles } from "@/styles/styles";
import { utility } from "@/styles/utility";
import { router } from "expo-router";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";

import { ThemedInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { SpacerView } from "@/components/SpacerView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";
import { ThemedIcon } from "@/components/ThemedIcon";

export default function AdminAccount() {
  const { id } = useLocalSearchParams();
  const texture = require("../assets/images/texture.png");
  const image = require("../assets/images/user-icon.png");

  const [isEditing, setIsEditing] = useState(false); // To toggle between edit and view mode
  const [email, setEmail] = useState("johndoe@gmail.com"); // State for email
  const [name, setName] = useState("John Doe"); // State for name
  const [password, setPassword] = useState("********"); // State for password (display as asterisks)

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          // Implement logout functionality here
          console.log("User logged out");
          // You can navigate the user or perform any other action after logging out.
          router.replace("/"); // Example navigation
        },
      },
    ]);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing); // Toggle editing mode
  };

  const handleSave = () => {
    // Implement saving logic, e.g., update state or send changes to a server
    console.log("Saved:", { email, name, password });
    setIsEditing(false); // Exit editing mode after saving
  };

  return (
    <ThemedView style={[styles.mainContainer]}>
      <ScrollView>
        <ImageBackground source={texture} style={styles.header}>
          <SpacerView height={30} />
          <Image source={image} style={styles.profileImage} />
          <SpacerView height={20} />
          {/* Display User Name (id) */}
          <ThemedText lightColor="#FFF" darkColor="#FFF" type="title">
            {" "}
            {id}{" "}
          </ThemedText>
          <ThemedText lightColor="#FFF" darkColor="#FFF" type="title">
            {" "}
            ADMIN{" "}
          </ThemedText>
          <SpacerView height={10} />
          <SpacerView height={20} />
        </ImageBackground>

        <SpacerView height={20} />

        <ThemedView style={[styles.container]}>
          {/* Personal Information Section */}
          <SpacerView
            style={utility.row}
            borderBottomWidth={5}
            borderBottomColor="#115272"
            height={40}
            marginBottom={10}
          >
            <ThemedText
              lightColor="#115272"
              darkColor="#115272"
              type="subtitle"
            >
              Personal Information
            </ThemedText>
            <TouchableOpacity onPress={handleEditToggle}>
              <ThemedIcon name={isEditing ? "checkmark" : "pencil"} size={24} />
            </TouchableOpacity>
          </SpacerView>

          {/* Email Section */}
          <SpacerView
            height={65}
            borderBottomWidth={2}
            borderBottomColor="#C3D3DB"
            flexDirection="column"
            marginBottom={5}
          >
            <ThemedText
              lightColor="#115272"
              darkColor="#115272"
              type="subtitle"
              paddingVertical={2}
            >
              Email
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
              />
            ) : (
              <ThemedText
                lightColor="#115272"
                darkColor="#115272"
                type="body"
                paddingVertical={2}
              >
                {email}
              </ThemedText>
            )}
          </SpacerView>

          {/* Name Section */}
          <SpacerView
            height={65}
            borderBottomWidth={2}
            borderBottomColor="#C3D3DB"
            flexDirection="column"
            marginBottom={5}
          >
            <ThemedText
              lightColor="#115272"
              darkColor="#115272"
              type="subtitle"
              paddingVertical={2}
            >
              Name
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
              />
            ) : (
              <ThemedText
                lightColor="#115272"
                darkColor="#115272"
                type="body"
                paddingVertical={2}
              >
                {name}
              </ThemedText>
            )}
          </SpacerView>

          {/* Password Section */}
          <SpacerView
            height={60}
            borderBottomWidth={2}
            borderBottomColor="#C3D3DB"
            flexDirection="column"
          >
            <ThemedText
              lightColor="#115272"
              darkColor="#115272"
              type="subtitle"
              paddingVertical={2}
            >
              Password
            </ThemedText>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true} // Hide password input
              />
            ) : (
              <ThemedText
                lightColor="#115272"
                darkColor="#115272"
                type="body"
                paddingVertical={2}
              >
                ********
              </ThemedText>
            )}
          </SpacerView>

          <SpacerView height={50} />

          {/* Account Settings Section */}
          <SpacerView
            style={utility.row}
            borderBottomWidth={5}
            borderBottomColor="#115272"
            height={50}
            marginBottom={10}
          >
            <ThemedText
              lightColor="#115272"
              darkColor="#115272"
              type="subtitle"
            >
              Account Settings
            </ThemedText>
          </SpacerView>

          <SpacerView
            height={35}
            borderBottomWidth={3}
            borderBottomColor="#C3D3DB"
            flexDirection="column"
            marginBottom={5}
          >
            <ThemedText
              lightColor="#DA4B46"
              darkColor="#DA4B46"
              type="body"
              paddingVertical={2}
            >
              Request for Account Deletion
            </ThemedText>
          </SpacerView>

          <SpacerView
            height={35}
            borderBottomWidth={3}
            borderBottomColor="#C3D3DB"
            flexDirection="column"
            marginBottom={5}
          >
            <TouchableOpacity>
              <ThemedText
                lightColor="#DA4B46"
                darkColor="#DA4B46"
                type="body"
                paddingVertical={2}
                onPress={handleLogout}
              >
                Logout
              </ThemedText>
            </TouchableOpacity>
          </SpacerView>

          {/* Home Button */}
          <ThemedButton
            title="Home"
            onPress={() => {
              router.replace({
                pathname: "/changeUserInformation",
                params: {},
              });
            }}
          />
        </ThemedView>

        <SpacerView height={80} />
      </ScrollView>
    </ThemedView>
  );
}
