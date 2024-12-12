//React Imports
import { Platform } from "react-native";
import { useEffect, useState } from "react";

//Expo Imports
import {
  useRouter,
  Tabs,
  useFocusEffect,
  useNavigation,
  router,
} from "expo-router";
import { Drawer } from "expo-router/drawer";

// Auth Imports
import { authWeb } from "../(auth)";

//Component Imports
import { TabBar } from "@/components/navigation/TabBar";
import UserBanner from "../../components/navigation/UserBanner";
import DrawerScreenOptions from "../../components/navigation/DrawerScreenOptions";

// Image Imports
const report = require("../../assets/images/report-icon.png");

const auth = authWeb;
const authID = auth.currentUser;
// const token = await authID?.getIdTokenResult()
// const role = token?.claims.admin == true ? 1 : 0;

export default function TabLayout() {
  const router = useRouter();

  if (Platform.OS === "web") {
    
    return (
      <Drawer
        initialRouteName="crimemap"
        screenOptions={({ route, navigation }) =>
          DrawerScreenOptions({ route, navigation })
        }
        drawerContent={(props) => {
          return <UserBanner {...props} />;
        }}
      >
        <Drawer.Screen name="crimemap" options={{ title: "Crime Map" }} />
        <Drawer.Screen name = "report" options = {{ title: "Report" }} />
        <Drawer.Screen name = "emergency" options = {{ title: "Emergency" }} />
        <Drawer.Screen name="account" options={{ title: "Account" }} />
        <Drawer.Screen name = "genReport" options = {{ title: " Summary" }}/>
      </Drawer>
    );
  } else if (Platform.OS === "android") {
    return (
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="emergency"
          options={{
            tabBarShowLabel: false,
            title: "Emergency",
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            tabBarShowLabel: false,
            title: "Crime Map",
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            tabBarShowLabel: false,
            title: "Report",
          }}
        />

        <Tabs.Screen
          name="[id]"
          options={{
            tabBarShowLabel: false,
            title: "Account",
          }}
        />
      </Tabs>
    );
  } else {
    console.log("User is not logged in");
    router.replace({
      pathname: "/",
    });
  }
}
