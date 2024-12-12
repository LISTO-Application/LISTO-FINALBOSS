//React Imports
import {
  Image,
  Platform,
  ScrollView,
  ImageBackground,
  Pressable,
  Modal,
  Text,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

//Expo Imports

//Stylesheet Imports
import { styles } from "@/styles/styles";
import { utility } from "@/styles/utility";

//Component Imports
import { ThemedText } from "@/components/ThemedText";
import { SpacerView } from "@/components/SpacerView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import { ThemedIcon } from "@/components/ThemedIcon";
import React, { useEffect, useState } from "react";
import { firebase } from "@react-native-firebase/firestore";
import { useSession } from "@/auth";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import useResponsive from "@/hooks/useResponsive";
import { LoadingScreen } from "@/components/navigation/LoadingScreen";
import { Skeleton } from "moti/skeleton";
import { router, Redirect } from "expo-router";
import {
  onAuthStateChanged,
  signOut,
  updateEmail,
  updatePassword,
  User,
} from "firebase/auth";
import { authWeb, dbWeb, functionWeb } from "../(auth)";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import ReauthModal from "@/components/modal/ReauthModal";

export default function Account() {
  const texture = require("@/assets/images/texture.svg");
  const image = require("@/assets/images/user-icon.png");
  const exit = require("@/assets/images/exit-button.png");

  //Track whether authentication is initializing
  const auth = useSession();
  const [reauthenticating, setReauthenticating] = useState(false);

  //User Details Display
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");

  //Re-authentication
  const [isLoading, setIsLoading] = useState(false);
  const [emailReauth, setEmailReauth] = useState("");
  const [password, setPassword] = useState("");

  //Edit Information
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  //Account Functions
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //EDITABLE FIELDS
  const fields = [0, 1];

  const [fieldState, setFieldStates] = useState(fields.map(() => false));
  const handleFieldPress = (index: number) => {
    setFieldStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state))
    );
  };

  if (Platform.OS === "android") {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const { display, subDisplay, title, subtitle, body, small } =
      useResponsive();
    const session = firebase.auth().currentUser;
    if (session == null) {
      router.replace("../(auth)/login");
    }

    // Handle user state changes
    useEffect(() => {
      const subscriber = firebase.auth().onAuthStateChanged((user) => {
        setUser(user);
        setInitializing(false);
      });
      return subscriber;
    }, []);
    useEffect(() => {
      const fetchUserData = async () => {
        firebase
          .firestore()
          .collection("users")
          .doc(user?.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              setEmail(user?.email ?? "");
              const data = doc.data();
              if (data) {
                setFname(data.fname);
                setLname(data.lname);
                setPhone(data.pnumber);
              }
            }
          })
          .then(() => {
            setLoading(false);
          })
          .catch((error) => {
            if (error.code === "firestore/permission-denied") {
              if (user != null) {
                Alert.alert(
                  "User not found",
                  "Account does not exist; please sign up again."
                );
                user?.delete().catch((error) => {
                  if (error.code === "auth/requires-recent-login") {
                    firebase
                      .app()
                      .functions("asia-east1")
                      .useEmulator("localhost", 5001);
                    firebase
                      .app()
                      .functions("asia-east1")
                      .httpsCallable("deleteUser")({ uid: user?.uid });
                  }
                });
              }
            }
          });
      };
      if (user != null) {
        setTimeout(() => {
          fetchUserData();
        }, 5000);
      }
    }, [user]);

    if (initializing) return <LoadingScreen />;

    if (!user) {
      return <Redirect href="../(auth)/login" />;
    }
    function deleteAccount(email: string, phone: string, uid: string) {
      Alert.alert(
        "Are you sure you want to delete your account?",
        "This action cannot be undone, you will not be able to create a new account with your current phone number and email address for 1 month.",
        [
          { text: "Cancel" },
          {
            text: "Delete",
            onPress: async () => {
              session?.delete().catch((error) => {
                if (error.code === "auth/requires-recent-login") {
                  Alert.alert(
                    "Re-authentication required",
                    "Enter your credentials to proceed with account deletion",
                    [
                      { text: "Cancel" },
                      {
                        text: "OK",
                        onPress: () => {
                          setReauthenticating(true);
                          setDeleting(true);
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }
                console.error(error);
              });
            },
          },
        ]
      );
    }
    async function updateDetails(userDetails: {
      email: string | null;
      password: string | null;
    }) {
      console.log("Updating user details...");
      // Create an update object dynamically
      console.log("Checking for email...");
      if (userDetails.email != null) {
        console.log("Updating email...");
        await session?.updateEmail(userDetails.email).catch((error) => {
          if (error.code === "auth/invalid-email") {
            Alert.alert(
              "Invalid email",
              "Please enter a valid email address.",
              [{ text: "OK" }],
              { cancelable: true }
            );
          }
          if (error.code === "auth/email-already-in-use") {
            Alert.alert(
              "Email in use",
              "The email address is already in use.",
              [{ text: "OK" }],
              { cancelable: true }
            );
          }
          if (error.code === "auth/requires-recent-login") {
            console.log("Re-authentication required");
            Alert.alert(
              "Re-authentication required",
              "Please sign in again to update email.",
              [
                { text: "Cancel" },
                {
                  text: "OK",
                  onPress: () => {
                    setReauthenticating(true);
                    setUpdating(true);
                  },
                },
              ],
              { cancelable: true }
            );
          }
        });
      }
      if (userDetails.password != null) {
        console.log("Updating password...");
        await firebase
          .auth()
          .currentUser?.updatePassword(userDetails.password)
          .catch((error) => {
            if (error.code === "auth/weak-password") {
              Alert.alert(
                "Weak password",
                "Password must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 numeric character.",
                [{ text: "OK" }],
                { cancelable: true }
              );
            }
            if (error.code === "auth/requires-recent-login") {
              Alert.alert(
                "Re-authentication required",
                "Please sign in again to update email.",
                [
                  { text: "Cancel" },
                  {
                    text: "OK",
                    onPress: () => {
                      setReauthenticating(true);
                      setUpdating(true);
                    },
                  },
                ]
              );
            }
          });
      }
    }

    return (
      <ThemedView style={[styles.mainContainer]}>
        <ScrollView>
          <ImageBackground source={texture} style={styles.header}>
            <SpacerView height={30} />
            <Image source={image}></Image>
            <SpacerView height={20} />
            {!loading ? (
              <Text
                style={{
                  width: "100%",
                  fontSize: title,
                  color: "#FFF",
                  textAlign: "center",
                }}
              >
                {fname} {lname}
              </Text>
            ) : (
              <View style={{ opacity: 0.1 }}>
                <Skeleton
                  colorMode="light"
                  width={320}
                  height={36}
                  show={loading}
                  radius={20}
                />
              </View>
            )}
            <SpacerView height={20} />
          </ImageBackground>

          <SpacerView height={20} />

          <ThemedView style={[styles.container]}>
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
            </SpacerView>

            {reauthenticating && (
              <Modal animationType="fade" transparent={true}>
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
                        <Image
                          style={{ width: 36, height: 36 }}
                          source={exit}
                        />
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
                        onPress={() => {
                          var credentials =
                            firebase.auth.EmailAuthProvider.credential(
                              emailReauth,
                              password
                            );
                          session
                            ?.reauthenticateWithCredential(credentials)
                            .then((result) => {
                              if (deleting) {
                                result.user
                                  .delete()
                                  .then(() => {
                                    setReauthenticating(false);
                                    setDeleting(false);
                                    router.replace("../(auth)/login");
                                  })
                                  .catch((error) => {
                                    console.error(error);
                                  });
                              } else if (updating) {
                                updateDetails({
                                  email: editEmail,
                                  password: editPassword,
                                })
                                  .then(() => {
                                    setReauthenticating(false);
                                    setUpdating(false);
                                    router.replace("../(tabs)/account");
                                  })
                                  .catch((error) => {
                                    console.error(error);
                                  });
                              }
                            })
                            .catch((error) => {
                              if (error.code === "auth/too-many-requests") {
                                Alert.alert(
                                  "Too many requests",
                                  "Too many subsequent login attempts, please try again in a few seconds!",
                                  [{ text: "OK" }],
                                  { cancelable: true }
                                );
                              }

                              if (error.code === "auth/invalid-credential") {
                                Alert.alert(
                                  "Incorrect credentials",
                                  "The email or password is incorrect.",
                                  [{ text: "OK" }],
                                  { cancelable: true }
                                );
                              }

                              if (
                                error.code === "auth/network-request-failed"
                              ) {
                                Alert.alert(
                                  "Poor connection",
                                  "Connection error, please try again later.",
                                  [{ text: "OK" }],
                                  { cancelable: true }
                                );
                              }
                              console.error(error);
                            });
                        }}
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
              </Modal>
            )}

            <SpacerView
              height="auto"
              borderBottomWidth={3}
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
                First Name
              </ThemedText>
              <View style={utility.row}>
                {!loading ? (
                  <ThemedText style={accountStyle.info}>{fname}</ThemedText>
                ) : (
                  <View style={{ marginBottom: 6 }}>
                    <Skeleton
                      colorMode="light"
                      width={240}
                      height={24}
                      show={loading}
                      radius={20}
                    />
                  </View>
                )}
              </View>
            </SpacerView>

            <SpacerView
              height="auto"
              borderBottomWidth={3}
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
                Last Name
              </ThemedText>
              {!loading ? (
                <ThemedText style={accountStyle.info}>{lname}</ThemedText>
              ) : (
                <View style={{ marginBottom: 6 }}>
                  <Skeleton
                    colorMode="light"
                    width={240}
                    height={24}
                    show={loading}
                    radius={20}
                  />
                </View>
              )}
            </SpacerView>

            <SpacerView
              height="auto"
              borderBottomWidth={3}
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
              <View style={[utility.row, { justifyContent: "space-between" }]}>
                {loading && (
                  <View style={{ marginBottom: 6 }}>
                    <Skeleton
                      colorMode="light"
                      width={240}
                      height={24}
                      show={loading}
                      radius={20}
                    />
                  </View>
                )}
                {!fieldState[0] && !loading && (
                  <ThemedText style={accountStyle.info}>{email}</ThemedText>
                )}
                {fieldState[0] && !loading && (
                  <TextInput
                    style={accountStyle.editInfo}
                    placeholder={email}
                    placeholderTextColor="#BBB"
                    onChangeText={setEditEmail}
                  />
                )}
                {!fieldState[0] && !loading && (
                  <ThemedIcon
                    name="pencil"
                    color="#115272"
                    style={accountStyle.editIcon}
                    onPress={() => {
                      handleFieldPress(0);
                    }}
                  />
                )}
                {fieldState[0] && !loading && (
                  <ThemedIcon
                    name="close"
                    color="#115272"
                    style={accountStyle.editIcon}
                    onPress={() => {
                      handleFieldPress(0);
                    }}
                  />
                )}
              </View>
            </SpacerView>

            <SpacerView
              height="auto"
              borderBottomWidth={3}
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
                Password
              </ThemedText>
              <View style={[utility.row, { justifyContent: "space-between" }]}>
                {loading && (
                  <View style={{ marginBottom: 6 }}>
                    <Skeleton
                      colorMode="light"
                      width={240}
                      height={24}
                      show={loading}
                      radius={20}
                    />
                  </View>
                )}
                {!fieldState[1] && !loading && (
                  <ThemedText style={accountStyle.info}>**********</ThemedText>
                )}
                {fieldState[1] && !loading && (
                  <TextInput
                    style={accountStyle.editInfo}
                    placeholder="**********"
                    placeholderTextColor="#BBB"
                    onChangeText={setEditPassword}
                    secureTextEntry
                  />
                )}
                {!fieldState[1] && !loading && (
                  <ThemedIcon
                    name="pencil"
                    color="#115272"
                    style={accountStyle.editIcon}
                    onPress={() => {
                      handleFieldPress(1);
                    }}
                  />
                )}
                {fieldState[1] && !loading && (
                  <ThemedIcon
                    name="close"
                    color="#115272"
                    style={accountStyle.editIcon}
                    onPress={() => {
                      handleFieldPress(1);
                    }}
                  />
                )}
              </View>
            </SpacerView>

            <SpacerView
              height="auto"
              borderBottomWidth={3}
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
                Phone Number
              </ThemedText>
              {!loading ? (
                <ThemedText
                  lightColor="#115272"
                  darkColor="#115272"
                  type="body"
                  paddingVertical={2}
                >
                  {phone}
                </ThemedText>
              ) : (
                <View style={{ marginBottom: 6 }}>
                  <Skeleton
                    colorMode="light"
                    width={240}
                    height={24}
                    show={true}
                    radius={20}
                  />
                </View>
              )}
            </SpacerView>

            <SpacerView height={50} />

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
              {!loading ? (
                <Pressable
                  style={{
                    width: "auto",
                    height: "auto",
                  }}
                  onPress={() => {
                    if (email && phone && user?.uid) {
                      deleteAccount(email, phone, user?.uid);
                    } else {
                      Alert.alert("Error", "Missing user information.");
                    }
                  }}
                >
                  <ThemedText
                    lightColor="#DA4B46"
                    darkColor="#DA4B46"
                    type="body"
                    paddingVertical={2}
                  >
                    Delete Account
                  </ThemedText>
                </Pressable>
              ) : (
                <View style={{ marginBottom: 6 }}>
                  <Skeleton
                    colorMode="light"
                    width={240}
                    height={24}
                    show={loading}
                    radius={20}
                  />
                </View>
              )}
            </SpacerView>

            <SpacerView
              height={35}
              borderBottomWidth={3}
              borderBottomColor="#C3D3DB"
              flexDirection="column"
              marginBottom={5}
            >
              {!loading ? (
                <Pressable
                  style={{
                    width: "auto",
                    height: "auto",
                  }}
                  onPress={() => {
                    auth.signOut();
                    console.log(session);
                  }}
                >
                  <ThemedText
                    lightColor="#DA4B46"
                    darkColor="#DA4B46"
                    type="body"
                    paddingVertical={2}
                  >
                    {" "}
                    Logout{" "}
                  </ThemedText>
                </Pressable>
              ) : (
                <View style={{ marginBottom: 6 }}>
                  <Skeleton
                    colorMode="light"
                    width={240}
                    height={24}
                    show={loading}
                    radius={20}
                  />
                </View>
              )}
            </SpacerView>

            {(fieldState[0] || fieldState[1]) &&
              (editEmail || editPassword) && (
                <ThemedButton
                  title="Update"
                  width="50%"
                  height="auto"
                  type="blue"
                  paddingVertical="2.5%"
                  marginHorizontal="auto"
                  marginVertical="5%"
                  onPress={() => {
                    updateDetails({ email: editEmail, password: editPassword });
                  }}
                />
              )}
          </ThemedView>

          <SpacerView height={80} />
        </ScrollView>
      </ThemedView>
    );
  } else if (Platform.OS === "web") {
    const [user, setUser] = useState<User | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [modalDelete, setModalDelete] = useState(false);
    const [modalLogout, setModalLogout] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    const handleModalDelete = () => {
      setModalDelete(true);
    };

    const handleModalLogout = () => {
      setModalLogout(true);
    };

    const handleEdit = () => {
      setIsEditable((prev) => !prev);
    };

    useEffect(() => {
      const subscriber = onAuthStateChanged(authWeb, (user) => {
        setUser(user);
        setInitializing(false);
      });
      return subscriber;
    }, [authWeb]);

    useEffect(() => {
      const fetchUserData = async (user: any) => {
        if (!user || !user.uid) return;

        const db = dbWeb;
        const userDocRef = doc(db, "users", user.uid);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setEmail(user.email || "");
            const data = docSnap.data();
            if (data) {
              setFname(data.fname || "");
              setLname(data.lname || "");
              setPhone(data.pnumber || "");
            }
          } else {
            Alert.alert("Error", "User data not found.");
          }
          setLoading(false);
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          if (error.code === "permission-denied") {
            handlePermissionDenied(user);
          }
        } finally {
          setLoading(false);
        }
      };

      if (user) {
        fetchUserData(user);
      }
    }, [user, dbWeb]);

    if (initializing) return <LoadingScreen />;

    if (!user) {
      return <Redirect href="../(auth)/login" />;
    }

    const handlePermissionDenied = async (
      user: { uid: string | null } | null
    ) => {
      if (!user || !user.uid) return;

      Alert.alert(
        "User not found",
        "Account does not exist; please sign up again."
      );

      try {
        const auth = authWeb;
        const currentUser = auth.currentUser;
        if (currentUser) {
          await currentUser.delete();
        }
      } catch (error: any) {
        console.error("Error deleting user:", error);
        if (error.code === "auth/requires-recent-login") {
          const functions = functionWeb;
          const deleteUserFunction = httpsCallable(functions, "deleteUser");
          await deleteUserFunction({ uid: user.uid });
        }
      }
    };
    const auth = authWeb;

    function deleteAccount(email: string, phone: string, uid: string) {
      const confirmDeletion = window.confirm(
        `Are you sure you want to delete your account?,
        This action cannot be undone, you will not be able to create a new account with your current phone number and email address for 1 month.`
      );

      if (confirmDeletion) {
        auth.currentUser?.delete().catch((error) => {
          if (error.code === "auth/requires-recent-login") {
            // Create a custom confirmation dialog for the web
            const confirmDeletion = window.confirm(
              "Re-authentication required. Enter your credentials to proceed with account deletion"
            );

            if (confirmDeletion) {
              setReauthenticating(true);
              setDeleting(true);
            }
          }
          console.error(error);
        });
      }
    }

    async function updateDetails(userDetails: {
      email: string | null;
      password: string | null;
    }) {
      console.log("Updating user details...");
      const auth = authWeb;
      const currentUser: User | null = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "No authenticated user found.");
        return;
      }
      if (userDetails.email) {
        console.log("Checking for email...");
        try {
          console.log("Updating email...");
          await updateEmail(currentUser, userDetails.email);
          Alert.alert("Success", "Email updated successfully!");
        } catch (error: any) {
          console.error("Error updating email:", error);
          if (error.code === "auth/invalid-email") {
            Alert.alert("Invalid email", "Please enter a valid email address.");
          } else if (error.code === "auth/email-already-in-use") {
            Alert.alert("Email in use", "The email address is already in use.");
          } else if (error.code === "auth/requires-recent-login") {
            Alert.alert(
              "Re-authentication required",
              "Please sign in again to update email.",
              [
                { text: "Cancel" },
                {
                  text: "OK",
                  onPress: () => {
                    console.log("Re-authentication flow triggered");
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              "Error",
              "Failed to update email. Please try again later."
            );
          }
        }
      }
      if (userDetails.password) {
        console.log("Checking for password...");
        try {
          console.log("Updating password...");
          await updatePassword(currentUser, userDetails.password);
          window.confirm("Success. Password updated successfully!");
        } catch (error: any) {
          console.error("Error updating password:", error);
          if (error.code === "auth/weak-password") {
            window.confirm(
              "Weak password. Password must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 numeric character."
            );
          } else if (error.code === "auth/requires-recent-login") {
            const reauthConfirm = window.confirm(
              "Reauthentication Required. Please sign in again to update password."
            );
            if (reauthConfirm) {
              console.log("Re-authentication flow triggered");
            }
          } else {
            Alert.alert(
              "Error",
              "Failed to update password. Please try again later."
            );
          }
        }
      }
    }

    return (
      <ThemedView style={[styles.mainContainer, utility.blueBackground]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* MAIN CONTAINER */}
          <SpacerView
            flex={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            {/* MIDDLE COLUMN */}
            <SpacerView
              flex={1}
              height="100%"
              width="75%"
              flexDirection="column"
              justifyContent="space-evenly"
            >
              <SpacerView
                backgroundColor="#FFF"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                width="100%"
                borderRadius={20}
                height="auto"
                paddingTop="2%"
                paddingBottom="2%"
              >
                <Image
                  source={texture}
                  style={{
                    width: "90%", // Cover full width
                    height: 100, // Adjust based on your texture image size
                    resizeMode: "cover",
                    borderTopLeftRadius: 20, // Ensure the top is rounded
                    borderTopRightRadius: 20,
                  }}
                />
                <Image
                  source={image}
                  style={{
                    width: 80, // Adjust size of the circular image
                    height: 80,
                    borderRadius: 40, // Make the image circular
                    position: "absolute", // Position it on top of the texture
                    top: 30, // Adjust this based on how much you want it to overlap
                    zIndex: 1, // Ensure it's above the texture
                    borderColor: "#FFF", // Add white border around the image
                    borderWidth: 3, // Adjust the thickness of the border
                    marginTop: 30,
                  }}
                />

                <ThemedText
                  lightColor="#115272"
                  darkColor="#115272"
                  type="title"
                  paddingVertical={2}
                  style={{ marginTop: 30 }}
                >
                  {fname} {lname}
                </ThemedText>
              </SpacerView>

              <SpacerView height="auto" justifyContent="space-between">
                <SpacerView
                  backgroundColor="#FFF"
                  height="auto"
                  width="45%"
                  flexDirection="column"
                  justifyContent="center"
                  paddingLeft="2%"
                  paddingRight="2%"
                  paddingTop="1%"
                  paddingBottom="1%"
                  borderRadius={20}
                >
                  <SpacerView
                    borderBottomWidth={5}
                    borderBottomColor="#115272"
                    height="auto"
                    marginTop="5%"
                    marginBottom="5%"
                  >
                    <ThemedText
                      lightColor="#115272"
                      darkColor="#115272"
                      type="subtitle"
                    >
                      Personal Information
                    </ThemedText>
                  </SpacerView>

                  {reauthenticating && (
                    <Modal
                      animationType="fade"
                      transparent={true}
                      visible={reauthenticating}
                      onRequestClose={() => setReauthenticating(false)}
                    >
                      <ReauthModal
                        setReauthenticating={setReauthenticating}
                        deleting={deleting}
                        setDeleting={setDeleting}
                        updating={updating}
                        setUpdating={setUpdating}
                        editEmail={editEmail}
                        editPassword={editPassword}
                        updateDetails={updateDetails}
                        accountStyle={accountStyle}
                        exitIcon={exit}
                      />
                    </Modal>
                  )}

                  <SpacerView
                    flex={1}
                    justifyContent="space-between"
                    height="auto"
                  >
                    <SpacerView
                      height="auto"
                      width="45%"
                      flexDirection="column"
                    >
                      <ThemedText
                        lightColor="#115272"
                        darkColor="#115272"
                        type="subtitle"
                      >
                        {" "}
                        First Name{" "}
                      </ThemedText>
                      <View style={utility.row}>
                        {!loading ? (
                          <ThemedText style={accountStyle.info}>
                            {fname}
                          </ThemedText>
                        ) : (
                          <View style={{ marginBottom: 6 }}>
                            <Skeleton
                              colorMode="light"
                              width={240}
                              height={24}
                              show={loading}
                              radius={20}
                            />
                          </View>
                        )}
                      </View>
                    </SpacerView>

                    <SpacerView
                      height="auto"
                      width="45%"
                      flexDirection="column"
                    >
                      <ThemedText
                        lightColor="#115272"
                        darkColor="#115272"
                        type="subtitle"
                        paddingVertical={2}
                      >
                        {" "}
                        Last Name{" "}
                      </ThemedText>
                      {!loading ? (
                        <ThemedText style={accountStyle.info}>
                          {lname}
                        </ThemedText>
                      ) : (
                        <View style={{ marginBottom: 6 }}>
                          <Skeleton
                            colorMode="light"
                            width={240}
                            height={24}
                            show={loading}
                            radius={20}
                          />
                        </View>
                      )}
                    </SpacerView>
                  </SpacerView>

                  <SpacerView flexDirection="column" height="auto">
                    <ThemedText
                      lightColor="#115272"
                      darkColor="#115272"
                      type="subtitle"
                    >
                      Email
                    </ThemedText>
                    <View
                      style={[utility.row, { justifyContent: "space-between" }]}
                    >
                      {loading && (
                        <View style={{ marginBottom: 6 }}>
                          <Skeleton
                            colorMode="light"
                            width={240}
                            height={24}
                            show={loading}
                            radius={20}
                          />
                        </View>
                      )}
                      {!fieldState[0] && !loading && (
                        <ThemedText style={accountStyle.info}>
                          {email}
                        </ThemedText>
                      )}
                      {fieldState[0] && !loading && (
                        <TextInput
                          style={accountStyle.editInfo}
                          placeholder={email}
                          placeholderTextColor="#BBB"
                          onChangeText={setEditEmail}
                        />
                      )}
                      {!fieldState[0] && !loading && (
                        <ThemedIcon
                          name="pencil"
                          color="#115272"
                          style={accountStyle.editIcon}
                          onPress={() => {
                            handleFieldPress(0);
                          }}
                        />
                      )}
                      {fieldState[0] && !loading && (
                        <ThemedIcon
                          name="close"
                          color="#115272"
                          style={accountStyle.editIcon}
                          onPress={() => {
                            handleFieldPress(0);
                          }}
                        />
                      )}
                    </View>
                  </SpacerView>
                  <SpacerView flexDirection="column" height="auto">
                    <ThemedText
                      lightColor="#115272"
                      darkColor="#115272"
                      type="subtitle"
                    >
                      Password
                    </ThemedText>
                    <View
                      style={[utility.row, { justifyContent: "space-between" }]}
                    >
                      {loading && (
                        <View style={{ marginBottom: 6 }}>
                          <Skeleton
                            colorMode="light"
                            width={240}
                            height={24}
                            show={loading}
                            radius={20}
                          />
                        </View>
                      )}
                      {!fieldState[1] && !loading && (
                        <ThemedText style={accountStyle.info}>
                          ************
                        </ThemedText>
                      )}
                      {fieldState[1] && !loading && (
                        <TextInput
                          style={accountStyle.editInfo}
                          placeholder="********"
                          placeholderTextColor="#BBB"
                          onChangeText={setEditPassword}
                        />
                      )}
                      {!fieldState[1] && !loading && (
                        <ThemedIcon
                          name="pencil"
                          color="#115272"
                          style={accountStyle.editIcon}
                          onPress={() => {
                            handleFieldPress(1);
                          }}
                        />
                      )}
                      {fieldState[1] && !loading && (
                        <ThemedIcon
                          name="close"
                          color="#115272"
                          style={accountStyle.editIcon}
                          onPress={() => {
                            handleFieldPress(1);
                          }}
                        />
                      )}
                    </View>
                  </SpacerView>
                  <ThemedText
                    lightColor="#115272"
                    darkColor="#115272"
                    type="subtitle"
                  >
                    {" "}
                    Phone Number{" "}
                  </ThemedText>
                  {!loading ? (
                    <ThemedText
                      lightColor="#115272"
                      darkColor="#115272"
                      type="body"
                      paddingVertical={2}
                    >
                      {phone}
                    </ThemedText>
                  ) : (
                    <View style={{ marginBottom: 6 }}>
                      <Skeleton
                        colorMode="light"
                        width={240}
                        height={24}
                        show={true}
                        radius={20}
                      />
                    </View>
                  )}
                  {(fieldState[0] || fieldState[1]) &&
                    (editEmail || editPassword) && (
                      <ThemedButton
                        title="Update"
                        width="50%"
                        height="auto"
                        type="blue"
                        paddingVertical="2.5%"
                        marginHorizontal="auto"
                        marginVertical="5%"
                        onPress={() => {
                          updateDetails({
                            email: editEmail,
                            password: editPassword,
                          });
                        }}
                      />
                    )}
                </SpacerView>

                <SpacerView
                  backgroundColor="#FFF"
                  height="50%"
                  width="45%"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={20}
                >
                  <SpacerView
                    borderBottomWidth={5}
                    borderBottomColor="#115272"
                    height="auto"
                    marginTop="5%"
                    width="90%"
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
                    flex={1}
                    flexDirection="column"
                    justifyContent="space-evenly"
                    alignItems="center"
                    height="auto"
                    width="100%"
                  >
                    {!loading ? (
                      <TouchableOpacity
                        style={{
                          width: "auto",
                          height: "auto",
                          borderWidth: 2,
                          padding: 5,
                          borderRadius: 20,
                          backgroundColor: "red",
                          paddingHorizontal: 30,
                        }}
                        onPress={() => {
                          if (email && phone && user?.uid) {
                            deleteAccount(email, phone, user?.uid);
                          } else {
                            window.confirm("Error. Missing user information.");
                          }
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "white",
                          }}
                        >
                          Delete Account
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ marginBottom: 6 }}>
                        <Skeleton
                          colorMode="light"
                          width={240}
                          height={24}
                          show={loading}
                          radius={20}
                        />
                      </View>
                    )}

                    {!loading ? (
                      <Pressable
                        style={{
                          width: "auto",
                          height: "auto",
                          borderWidth: 2,
                          padding: 5,
                          borderRadius: 20,
                          backgroundColor: "red",
                          paddingHorizontal: 30,
                        }}
                        onPress={() => {
                          signOut(authWeb);
                          console.log(auth.currentUser);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "white",
                          }}
                        >
                          {" "}
                          Logout{" "}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={{ marginBottom: 6 }}>
                        <Skeleton
                          colorMode="light"
                          width={240}
                          height={24}
                          show={loading}
                          radius={20}
                        />
                      </View>
                    )}
                  </SpacerView>
                </SpacerView>
              </SpacerView>
            </SpacerView>
          </SpacerView>
        </ScrollView>
      </ThemedView>
    );
  }
}

const accountStyle = StyleSheet.create({
  modal: {
    width: "80%",
    marginHorizontal: "auto",
    marginVertical: "auto",
    backgroundColor: "#115272",
    paddingHorizontal: "2.5%",
    paddingVertical: "2.5%",
    borderRadius: 20,
  },
  textInput: {
    width: "80%",
    height: 48,
    alignSelf: "center",
    backgroundColor: "transparent",
    borderRadius: 50,
    borderColor: "#FFF",
    borderWidth: 3,
    marginTop: "5%",
    marginBottom: "5%",
    paddingLeft: 20,
    color: "#FFF",
    fontWeight: "bold",
    padding: 10,
  },
  info: {
    fontSize: 16,
    fontWeight: "bold",
    width: "90%",
    backgroundColor: "transparent",
    color: "#115272",
    paddingVertical: 2,
  },
  editInfo: {
    height: 32,
    width: "90%",
    padding: 0,
    backgroundColor: "transparent",
    color: "#115272",
    fontSize: 16,
    fontWeight: "bold",
  },
  editIcon: {
    marginHorizontal: "auto",
  },
});
