//React Imports
import {
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";
import React, { useEffect, useState } from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";


//Expo Imports
import { Redirect, router } from "expo-router";

// Firebase Imports
import { firebase, onAuthStateChanged } from "@react-native-firebase/auth";
import { authWeb } from ".";

//Stylesheet Imports
import { styles } from "@/styles/styles";
import { utility } from "@/styles/utility";

//Component Imports
import { ThemedInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { SpacerView } from "@/components/SpacerView";
import { ThemedButton } from "@/components/ThemedButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import TermsConditions from "@/components/TermsConditions";

// Hooks
import useResponsive from "@/hooks/useResponsive";

export default function Register() {
  const logo = require("../../assets/images/logo.png");

  const [toggleModal, setToggleModal] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const handleCheckboxPress = (isChecked: any) => {
    setIsCheckboxChecked(isChecked);
    setToggleModal(isChecked);
  };

  const handleSignUp = () => {
    if (isCheckboxChecked) {
      router.push({
        pathname: "/otp",
        params: {
          firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
          lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
          phone: phone,
          email: email,
          password: password,
        },
      });
    } else {
      alert("Please agree to the terms and conditions");
    }
  };

  const handlePhoneChange = (text: string) => {
    if (!text.startsWith("+639")) {
      text = "+639";
    }
    setPhone(text);
  };

  // States for form fields
  const fields = [0, 1, 2, 3, 4];

  // State for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldState, setFieldStates] = useState(fields.map(() => false));

  const [focus, setFocusField] = useState(fields.map(() => false));

  // Regex for form validation
  const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$^*.[\]{}()?"!@#%&/\\,><':;|_~])[A-Za-z\d$^*.[\]{}()?"!@#%&/\\,><':;|_~]{6,}$/; // Minimum eight characters, at least one letter and one number
  const phoneRegex = /^\+639\d{9}$/; // 11-digit phone number

  const handleInvalidField = (index: number) => {
    setFieldStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? true : state))
    );
  };

  const handleChangedField = (index: number) => {
    setFieldStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? false : state))
    );
  };

  const handleFocus = (index: number) => {
    setFocusField((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state))
    );
  };

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
        <SpacerView height={60} />
        <KeyboardAvoidingView
          behavior={"height"}
          style={[styles.container, utility.blueBackground]}
        >
          <ThemedText lightColor="#FFF" darkColor="#FFF" type="title">
            Sign up
          </ThemedText>

          <View style={registerStyle.inputField}>
            <TextInput
              style={[registerStyle.outline, focus[0] && registerStyle.focused]}
              placeholder="First Name"
              placeholderTextColor="#BBB"
              onChangeText={setFirstName}
              onChange={() => handleChangedField(0)}
              onFocus={() => handleFocus(0)}
              onBlur={() => handleFocus(0)}
              value={firstName}
            />
            {fieldState[0] && (
              <Text style={registerStyle.errorText}>
                {" "}
                Please enter a valid first name{" "}
              </Text>
            )}
          </View>

          <View style={registerStyle.inputField}>
            <TextInput
              style={[registerStyle.outline, focus[1] && registerStyle.focused]}
              placeholder="Last Name"
              placeholderTextColor="#BBB"
              onChangeText={setLastName}
              onChange={() => handleChangedField(1)}
              onFocus={() => handleFocus(1)}
              onBlur={() => handleFocus(1)}
              value={lastName}
            />
            {fieldState[1] && (
              <Text style={registerStyle.errorText}>
                {" "}
                Please enter a valid last name{" "}
              </Text>
            )}
          </View>

          <View style={registerStyle.inputField}>
            <TextInput
              style={[registerStyle.outline, focus[2] && registerStyle.focused]}
              placeholder="+63"
              placeholderTextColor="#BBB"
              onChangeText={handlePhoneChange}
              onChange={() => handleChangedField(2)}
              onFocus={() => {
                handlePhoneChange(phone);
                handleFocus(2);
              }}
              onBlur={() => handleFocus(2)}
              value={phone}
              inputMode="numeric"
            />
            {fieldState[2] && (
              <Text style={registerStyle.errorText}>
                {" "}
                Please enter a valid phone number{" "}
              </Text>
            )}
          </View>

          <View style={registerStyle.inputField}>
            <TextInput
              style={[registerStyle.outline, focus[3] && registerStyle.focused]}
              placeholder="Email"
              placeholderTextColor="#BBB"
              onChangeText={setEmail}
              onChange={() => handleChangedField(3)}
              onFocus={() => handleFocus(3)}
              onBlur={() => handleFocus(3)}
              value={email}
            />
            {fieldState[3] && (
              <Text style={registerStyle.errorText}>
                {" "}
                Please enter a valid email address{" "}
              </Text>
            )}
          </View>

          <View style={registerStyle.inputField}>
            <TextInput
              style={[registerStyle.outline, focus[4] && registerStyle.focused]}
              placeholder="********"
              placeholderTextColor="#BBB"
              onChangeText={setPassword}
              onChange={() => handleChangedField(4)}
              onFocus={() => handleFocus(4)}
              onBlur={() => handleFocus(4)}
              value={password}
              secureTextEntry
            />
            {fieldState[4] && (
              <Text style={registerStyle.errorText}>
                {" "}
                At least 1 uppercase, 1 lowercase, 1 special character, and 1
                number with a minimum of 8 characters
              </Text>
            )}
          </View>
          {/* Terms & Conditions Modal */}
          <Modal isVisible={toggleModal}>
            <TermsConditions setToggleModal={setToggleModal} />
          </Modal>

          <SpacerView height={20} />
          <BouncyCheckbox
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "center",
            }}
            size={25}
            fillColor="red"
            unFillColor="#115272"
            text="I have read and agree to the terms, conditions and data privacy policy"
            iconStyle={{ borderColor: "white", borderRadius: 20 }}
            innerIconStyle={{ borderWidth: 3, borderRadius: 10 }}
            textStyle={{
              textDecorationLine: "none",
              color: "white",
            }}
            onPress={handleCheckboxPress}
          />
          <SpacerView height={20} />
          <SpacerView height={40}>
            <ThemedButton
              title="Sign up"
              onPress={() => {
                if (
                  nameRegex.test(firstName) &&
                  nameRegex.test(lastName) &&
                  emailRegex.test(email) &&
                  passwordRegex.test(password) &&
                  phoneRegex.test(phone)
                ) {
                  handleSignUp();
                }
                if (!nameRegex.test(firstName)) {
                  handleInvalidField(0);
                }
                if (!nameRegex.test(lastName)) {
                  handleInvalidField(1);
                }
                if (!phoneRegex.test(phone)) {
                  handleInvalidField(2);
                }
                if (!emailRegex.test(email)) {
                  handleInvalidField(3);
                }
                if (!passwordRegex.test(password)) {
                  handleInvalidField(4);
                }
              }}
            />
          </SpacerView>
          <SpacerView height={55} marginTop={20}>
            <Pressable
              style={{
                width: "auto",
                height: "auto",
              }}
              onPress={() => {
                router.replace({
                  pathname: "/(auth)/login",
                });
              }}
            >
              <ThemedText lightColor="#FFF" darkColor="#FFF" type="body">
                Already have an account?{" "}
              </ThemedText>
            </Pressable>
          </SpacerView>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  } else if (Platform.OS === "web") {
    const [isPasswordVisible, setPasswordVisibility] = useState(false);

    const user = authWeb.currentUser;
    if (user != null) {
      return <Redirect href="/(tabs)/crimemap" />;
    }

    const {display, subDisplay, title, subtitle, body, small, tiny, height} = useResponsive();

    return (
      <SpacerView
        height="100%"
        width="100%"
        style={[utility.blueBackground]}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Modal
          isVisible={toggleModal}
          coverScreen={true}
          hasBackdrop={true}
          backdropOpacity={0.7}
          onBackdropPress={() => setToggleModal(false)} // Optional: Close modal on backdrop press
        >
          <TermsConditions setToggleModal={setToggleModal} />
        </Modal>
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
            style={[utility.whiteBackground, registerStyle.shadowBox]}
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
              Create an account
            </ThemedText>
            <SpacerView height="5%" />
            <SpacerView
              style={{
                alignSelf: "center",
                flexDirection: "row",
                width: "75%",
              }}
            >
              <View style={{ width: "50%", alignSelf: "center" }}>
                <ThemedInput
                  width="100%"
                  backgroundColor="#fff"
                  type="blueOutline"
                  marginVertical="2%"
                  placeholderTextColor="#7CB7D8"
                  placeholder="First Name"
                  onChangeText={setFirstName}
                  onChange={() => handleChangedField(0)}
                  onFocus={() => handleFocus(0)}
                  onBlur={() => handleFocus(0)}
                  value={firstName}
                />
                {fieldState[0] ? 
                  <Text style={registerStyle.errorText}>
                    {" "}
                    Please enter a valid first name{" "}
                  </Text> 
                  :
                  <Text style={registerStyle.errorText}>
                  {" "}
                  </Text> 
                }
              </View>
              <View style={{ width: "100%", alignSelf: "center" }}>
                <ThemedInput
                  width="50%"
                  backgroundColor="#fff"
                  type="blueOutline"
                  marginVertical="1%"
                  placeholderTextColor="#7CB7D8"
                  placeholder="Last Name"
                  onChangeText={setLastName}
                  onChange={() => handleChangedField(1)}
                  onFocus={() => handleFocus(1)}
                  onBlur={() => handleFocus(1)}
                  value={lastName}
                />
                {fieldState[1] ? 
                  <Text style={registerStyle.errorText}>
                    {" "}
                    Please enter a valid last name{" "}
                  </Text>
                  :
                  <Text style={registerStyle.errorText}>
                    {" "}
                  </Text> 
                }
              </View>
            </SpacerView>
            <ThemedInput
              width="75%"
              backgroundColor="#fff"
              type="blueOutline"
              marginVertical="1%"
              placeholderTextColor="#7CB7D8"
              placeholder="+63"
              onChangeText={handlePhoneChange}
              onChange={() => handleChangedField(2)}
              onFocus={() => {
                handlePhoneChange(phone);
                handleFocus(2);
              }}
              onBlur={() => handleFocus(2)}
              value={phone}
              inputMode="numeric"
            />
            {fieldState[2] ? 
              <Text style={[registerStyle.errorText, { width: "75%" }]}>
                Phone no. must be at least 11 digits
              </Text>
              :
              <Text style={registerStyle.errorText}>
                {" "}
              </Text> 
            }
            <ThemedInput
              width="75%"
              backgroundColor="#fff"
              type="blueOutline"
              marginVertical="1%"
              placeholderTextColor="#7CB7D8"
              placeholder="Email"
              onChangeText={setEmail}
              onChange={() => handleChangedField(3)}
              onFocus={() => handleFocus(3)}
              onBlur={() => handleFocus(3)}
              value={email}
            />
            {fieldState[3] ? 
              <Text style={[registerStyle.errorText, { width: "75%" }]}>
                Must be a valid email address. e.g: user@example.com
              </Text>
              :
              <Text style={registerStyle.errorText}>
                {" "}
              </Text> 
            }
            <View style = {{width: "75%", height: "7.5%", flexDirection: "row", justifyContent: "center", borderWidth: 2, borderRadius: 50, borderColor: "#115272"}}>
              <TextInput
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  width: "90%",
                  backgroundColor: "white",
                  borderRadius: 50,
                  padding: 10,
                  outline: "none",
                  borderColor: "#115272",
                  color: "#115272",
                }}
                placeholder="********"
                placeholderTextColor="#7CB7D8"
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
            <TouchableOpacity
              onPress={() => setPasswordVisibility(!isPasswordVisible)} style={{width: "auto", marginVertical: "auto", marginRight: "2.5%"}}>
              {isPasswordVisible ? 
              <Ionicons name =  "eye" size = {title} color = "#115272"/> 
              : 
              <Ionicons name = "eye-off" size = {title} color = "#115272"/>}
            </TouchableOpacity>
            </View>
            {fieldState[4] ? 
              <Text style={[registerStyle.errorText, { width: "75%" }]}>
                At least 1 uppercase, 1 lowercase, 1 special character, and 1
                number with a minimum of 8 characters
              </Text>
              :
              <Text style={registerStyle.errorText}>
                {" "}
              </Text> 
            }
            <SpacerView height="2%" />
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
              onPress={handleCheckboxPress}
            />
            <SpacerView height="2%" />
            <ThemedButton
              width="25%"
              title="Sign up"
              onPress={() => {
                if (isCheckboxChecked) {
                  console.log(firstName, lastName, email, password, phone);
                  if (
                    nameRegex.test(firstName) &&
                    nameRegex.test(lastName) &&
                    emailRegex.test(email) &&
                    passwordRegex.test(password) &&
                    phoneRegex.test(phone)
                  ) {
                    handleSignUp();
                  }
                  if (!nameRegex.test(firstName)) {
                    handleInvalidField(0);
                  }
                  if (!nameRegex.test(lastName)) {
                    handleInvalidField(1);
                  }
                  if (!phoneRegex.test(phone)) {
                    handleInvalidField(2);
                  }
                  if (!emailRegex.test(email)) {
                    handleInvalidField(3);
                  }
                  if (!passwordRegex.test(password)) {
                    handleInvalidField(4);
                  }
                } else {
                  alert("Please agree to the terms and conditions");
                }
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

const registerStyle = StyleSheet.create({
  shadowBox: {
    shadowColor: "#333333",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  errorText: {
    color: "#DA4B46",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 2,
    marginVertical: 0,
  },
  inputField: {
    flexDirection: "column",
    marginVertical: "5%",
  },
  outline: {
    height: 48,
    borderRadius: 50,
    backgroundColor: "transparent",
    padding: 10,
    borderColor: "#FFF",
    borderWidth: 3,
    paddingLeft: 20,
    color: "#FFF",
    fontWeight: "bold",
  },
  focused: {
    backgroundColor: "#FFF",
    color: "#115272",
  },
});
