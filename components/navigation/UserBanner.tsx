import {
  DrawerContentComponentProps,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useContext, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { authWeb } from "../../app/(auth)";

interface UserBannerProps extends DrawerContentComponentProps {}

const UserBanner: React.FC<UserBannerProps> = (props) => {
  const auth = authWeb;
  const currentUser = auth.currentUser;
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const id = "John Doe";
  const image = require("../../assets/images/texture.svg");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(authWeb, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUser(user); // Update context to reflect logged-in state
        setUsername(authWeb.currentUser?.displayName || "John Doe");
      } else {
        setIsLoggedIn(false); // Update context to reflect logged-out state
        router.replace("/login"); // Redirect to login page
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [setIsLoggedIn, router]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    signOut(authWeb);
    console.log(auth.currentUser);
  };

  return (
    <SafeAreaView>
      <View style={layoutStyles.drawer}>
        <ImageBackground
          source={image}
          resizeMode="cover"
          style={layoutStyles.image}>
            <TouchableOpacity style ={{justifyContent: "center", height: "100%", marginVertical: "2.5%", alignItems: "stretch"}} onPress={() => router.push("/account")}>
              <Image source={require("../../assets/images/user-icon.png")} style = {{marginHorizontal: "auto"}} />
              <Text style = {{fontSize: 18, fontWeight: "bold", color: "#FFF", marginVertical: "2.5%"}}>{username}</Text>
            </TouchableOpacity>
        </ImageBackground>
      </View>

      <DrawerItemList {...props} />

      <View style={layoutStyles.logoutContainer}>
        <TouchableOpacity
          onPress={handleLogout}
          style={layoutStyles.logoutButton}
        >
          <Text style={layoutStyles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const layoutStyles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    width: "100%",
  },
  drawer: {
    height: 200,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    borderBottomColor: "#f4f4f4",
    borderBottomWidth: 1,
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UserBanner;
