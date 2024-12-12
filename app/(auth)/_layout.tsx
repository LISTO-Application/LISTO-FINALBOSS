// React Imports
import { useEffect } from "react";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

// Expo Imports
import { Redirect, Stack } from "expo-router";

//Hooks
import { useColorScheme } from "@/hooks/useColorScheme";

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  const isLoggedIn = true; // Replace with actual login state

  if (isLoggedIn) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{ headerShown: false, animation: "slide_from_left" }}
          />
          <Stack.Screen
            name="register"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="forgot"
            options={{ headerShown: false, animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="otp"
            options={{ headerShown: false, animation: "slide_from_right" }}
          />
        </Stack>
      </ThemeProvider>
    );
  } else {
    <Redirect href="../(tabs)" />;
  }
}
