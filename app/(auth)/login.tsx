//React Imports
import {
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  View,
  Text,
} from "react-native";

//Expo Imports
import { Redirect, router } from "expo-router";

//Stylesheet Imports
import { styles } from "@/styles/styles";
import { utility } from "@/styles/utility";

//Firebase Imports
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import crashlytics from "@react-native-firebase/crashlytics";

//Auth Imports
import { useSession } from "@/auth";
import { authWeb } from ".";

// Hooks
import useResponsive from "@/hooks/useResponsive";

//Component Imports
import { ThemedText } from "@/components/ThemedText";
import { SpacerView } from "@/components/SpacerView";
import { ThemedButton } from "@/components/ThemedButton";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { set } from "date-fns";
import { firebase, FirebaseAuthTypes } from "@react-native-firebase/auth";
import { authenticateWeb } from "@/auth/webIndex";
import { Ionicons } from "@expo/vector-icons";

const logo = require("../../assets/images/logo.png");

export default function Login() {
  //Track whether authentication is initializing
  const [initializing, setInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);

  const [passwordError, setPasswordError] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

  if (Platform.OS === "android") {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const auth = useSession();
    useEffect(() => {
      const subscriber = firebase.auth().onAuthStateChanged((user) => {
        setUser(user);
        setInitializing(false);
      });
      return subscriber;
    }, []);

    if (initializing) return null;

    if (user != null) {
      return <Redirect href="/(tabs)/crimemap" />;
    }

    const handleLogin = async () => {
      if (email && password) {
        try {
          await auth.signIn(email, password);
        } catch (error) {
          console.error("Error signing in:", error);
        }
      } else {
        Alert.alert(
          "Input credentials",
          "Please enter your email and password."
        );
      }
    };

    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={[styles.mainContainer, utility.blueBackground]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SpacerView height={80} />
        <KeyboardAvoidingView
          behavior="height"
          keyboardVerticalOffset={0}
          style={[styles.container, utility.blueBackground]}
        >
          <ThemedText lightColor="#FFF" darkColor="#FFF" type="title">
            Login
          </ThemedText>
          <View style={loginStyle.inputField}>
            <TextInput
              style={loginStyle.textInput}
              placeholder="Email"
              placeholderTextColor="#BBB"
              onChangeText={setEmail}
              onChange={() => setEmailError(false)}
            />
            {emailError && (
              <Text style={loginStyle.errorText}>
                Please enter a valid email{" "}
              </Text>
            )}
          </View>
          <View style={loginStyle.inputField}>
            <TextInput
              style={loginStyle.textInput}
              placeholder="********"
              placeholderTextColor="#BBB"
              onChangeText={setPassword}
              onChange={() => setPasswordError(false)}
              secureTextEntry
            />
            {passwordError && (
              <Text style={loginStyle.errorText}>
                Please enter a valid password{" "}
              </Text>
            )}
          </View>
          <Pressable
            style={{
              width: "auto",
              height: "auto",
            }}
            onPress={() => {
              router.push({
                pathname: "/forgot",
                params: {},
              });
            }}
          >
            <ThemedText lightColor="#FFF" darkColor="#FFF" type="body">
              Forgot Password?
            </ThemedText>
          </Pressable>
          <SpacerView height={40} />
          <SpacerView height={40}>
            {!isLoading && (
              <ThemedButton
                title="Login"
                onPress={async () => {
                  setIsLoading(true);
                  if (emailRegex.test(email) && passwordRegex.test(password)) {
                    handleLogin();
                  }
                  if (emailRegex.test(email) == false) {
                    setEmailError(true);
                  }
                  if (passwordRegex.test(password) == false) {
                    setPasswordError(true);
                  }
                  setIsLoading(false);
                }}
              />
            )}

            {isLoading && (
              <Pressable
                style={{
                  backgroundColor: "#DA4B46",
                  height: 36,
                  width: "100%",
                  borderRadius: 50,
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color="#FFF" />
              </Pressable>
            )}
          </SpacerView>
          <SpacerView height={55} marginTop={20}>
            <Pressable
              style={{
                width: "auto",
                height: "auto",
              }}
              onPress={() => {
                router.push({
                  pathname: "/register",
                  params: {},
                });
              }}
            >
              <ThemedText lightColor="#FFF" darkColor="#FFF" type="body">
                Don't have an account?{" "}
              </ThemedText>
            </Pressable>
          </SpacerView>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  } else if (Platform.OS === "web") {

    const [user, setUser] = useState<User | null>(null);
    const [isPasswordVisible, setPasswordVisibility] = useState(false);
    const {display, subDisplay, title, subtitle, body, small, tiny, height} = useResponsive();

    // Auth State Listener
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(authWeb, (user) => {
        setUser(user);
        setInitializing(false);
      });
      return unsubscribe;
    }, []);

    if (initializing) return null;

    if (user != null) {
      return router.replace("../(tabs)");
    }

    const handleLogin = async (email: string, password: string) => {
      console.log(authWeb);
      console.log(authWeb.currentUser?.displayName);
      if (authWeb.currentUser == null) {
        try {
          const result = await authenticateWeb(email, password);
          if (result?.success) {
            console.log("Login Successful!", user);
            console.log("Redirecting to the home page...");
            router.replace("../(tabs)");
          }
        } catch (error) {
          console.error("Error signing in:", error);
          alert("Sign-in Error: " + getErrorMessage(error));
        }
      } else {
        // User is already logged in
        window.confirm("Sign in failed. User is already logged in!");
        router.replace("../(tabs)");
      }
    };

    const getErrorMessage = (error: any) => {
      console.error("Firebase Error Code:", error.code); // Log error code
      console.error("Firebase Error Message:", error.message); // Log error message
      switch (error.code) {
        case "auth/invalid-email":
          return "The email address is invalid.";
        case "auth/user-disabled":
          return "The user account has been disabled.";
        case "auth/user-not-found":
          return "No user found with this email address.";
        case "auth/wrong-password":
          return "Incorrect password. Please try again.";
        case "auth/invalid-credential":
          return "The provided credentials are invalid. Please check your email and password.";
        default:
          return "An unknown error occurred. Please try again.";
      }
    };

    return (
      <SpacerView
        height="100%"
        width="100%"
        style={[utility.blueBackground]}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center">

        <SpacerView
          style={[utility.blueBackground]}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          height="50%"
          width="50%">
          <Image source={logo} style={{ width: 200, height: 200 }}/>
          <SpacerView height="1%" />
          <ThemedText lightColor="#FFF" darkColor="#FFF" type="display">
            L I S T O
          </ThemedText>
        </SpacerView>

        <SpacerView
          style={utility.blueBackground}
          flexDirection="column"
          justifyContent="center"
          height="75%"
          width="50%">
          <SpacerView
            height="75%"
            width="75%"
            style={[utility.whiteBackground, loginStyle.shadowBox]}
            borderRadius={20}
            flexDirection="column"
            justifyContent="center"
            alignItems="center">
            <ThemedText lightColor="#115272" darkColor="#115272" type="display">
              Login
            </ThemedText>
            <SpacerView height="5%" />
            <TextInput
              style={{
                width: "75%",
                backgroundColor: "white",
                borderWidth: 2,
                borderRadius: 50,
                height: "9%",
                padding: 10,
                borderColor: "#115272",
                fontSize: 20,
                fontWeight: 400,
                color: "#115272",
              }}
              placeholderTextColor="#115272"
              placeholder="Email"
              onChangeText={setEmail}
              onChange={() => setEmailError(false)}
            />
            {emailError && (
              <Text style={loginStyle.errorText}>
                Please enter a valid email
              </Text>
            )}
            <SpacerView height="5%" />

            <View style = {{width: "75%", height: "9%", flexDirection: "row", justifyContent: "center", borderWidth: 2, borderRadius: 50, borderColor: "#115272"}}>
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
                placeholderTextColor="#155f84"
                onChangeText={setPassword}
                onChange={() => setPasswordError(false)}
                secureTextEntry={!isPasswordVisible}
              />
            <TouchableOpacity
              onPress={() => setPasswordVisibility(!isPasswordVisible)} style={{width: "100%", marginVertical: "auto"}}>
              {isPasswordVisible ? 
              <Ionicons name =  "eye" size = {title} color = "#115272"/> 
              : 
              <Ionicons name = "eye-off" size = {title} color = "#115272"/>}
            </TouchableOpacity>
            </View>

            {passwordError && (
              <Text style={loginStyle.errorText}>Password is incorrect.</Text>
            )}
            <Pressable
              style={{width: "75%", height: "auto", marginVertical: "2.5%"}}
              onPress={() => {
                router.replace({
                  pathname: "../(auth)/forgot",
                });
              }}
            >
              <Text style = {{fontSize: body, fontWeight: "bold", color: "#115272"}}>
                Forgot Password?
              </Text>
            </Pressable>

            <SpacerView height="5%" />
            {!isLoading && (
              <TouchableOpacity
                style={{
                  width: "100%",
                  backgroundColor: "#DA4B46",
                  borderRadius: 30,
                }}
                onPress={async () => {
                  console.log(email);
                  console.log(password);
                  setIsLoading(true);
                  if (emailRegex.test(email) && passwordRegex.test(password)) {
                    handleLogin(email, password);
                    console.log("");
                  }
                  if (emailRegex.test(email) == false) {
                    setEmailError(true);
                  }
                  if (passwordRegex.test(password) == false) {
                    setPasswordError(true);
                    console.log("true?");
                  }
                  setIsLoading(false);
                }}
              >
                {!isLoading ? (
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      paddingVertical: 10,
                      paddingHorizontal: 30,
                      fontWeight: "bold",
                    }}
                  >
                    Login
                  </Text>
                ) : (
                  <ActivityIndicator size="large" color="#ffffff" />
                )}
              </TouchableOpacity>
            )}

            {isLoading && (
              <Pressable
                style={{
                  backgroundColor: "#DA4B46",
                  height: 36,
                  width: "100%",
                  borderRadius: 50,
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color="#FFF" />
              </Pressable>
            )}
            <SpacerView height="5%" />
            <Pressable
              style={{
                width: "auto",
                height: "auto",
                margin: 0,
              }}
              onPress={() => {
                router.replace({
                  pathname: "../(auth)/register",
                });
              }}
            >
              <ThemedText
                lightColor="#115272"
                darkColor="#115272"
                type="body"
                style={{ fontWeight: "600" }} // Use string for fontWeight values
              >
                Don't have an account?
                <ThemedText style={{ color: "#DA4B46", fontWeight: "bold" }}>
                  {" "}
                  Sign Up
                </ThemedText>
              </ThemedText>
            </Pressable>
          </SpacerView>
        </SpacerView>
      </SpacerView>
    );
  }
}

const loginStyle = StyleSheet.create({
  textInput: {
    height: 48,
    backgroundColor: "transparent",
    borderRadius: 50,
    borderColor: "#FFF",
    borderWidth: 3,
    paddingLeft: 20,
    color: "#FFF",
    fontWeight: "bold",
    padding: 10,
  },
  errorText: {
    color: "#DA4B46",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 2,
  },
  inputField: {
    flexDirection: "column",
    marginVertical: "5%",
    height: "auto",
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
