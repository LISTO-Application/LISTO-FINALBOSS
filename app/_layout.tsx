// React Imports
import { useEffect, useState } from "react";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Expo Imports
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

//Portal Imports
import { PortalProvider } from "@gorhom/portal";

//Hooks
import { useColorScheme } from "@/hooks/useColorScheme";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { authWeb } from "./(auth)";
import { SessionProvider } from "@/auth";
import CrimeMap from "./(tabs)/crimemap";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authWeb, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isLoggedIn === null) {
    return null;
  }
  console.log(isLoggedIn);
  return (
    <SessionProvider>
      <GestureHandlerRootView>
        <PortalProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack initialRouteName={isLoggedIn ? "(tabs)" : "(auth)"}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="changeAdminInformation"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="changeUserInformation"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="changepass"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="+not-found"
                options={{ headerShown: false }}
              />
            </Stack>
          </ThemeProvider>
        </PortalProvider>
      </GestureHandlerRootView>
    </SessionProvider>
  );
}
