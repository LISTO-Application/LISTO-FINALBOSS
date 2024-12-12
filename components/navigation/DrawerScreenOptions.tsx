import MyHeader from "./MyHeader";
import { Ionicons } from "@expo/vector-icons";

const DrawerScreenOptions = ({
  route,
  navigation,
}: {
  navigation: any;
  route: any;
}) => {
  return {
    drawerIcon: ({
      color,
      focused,
      size,
    }: {
      color: string;
      focused: boolean;
      size: number;
    }) => {
      let iconName: "megaphone" | "megaphone-outline" | "call" | "call-outline" | "person" | "person-outline" | "ticket" | "ticket-outline" | "bag-check" | "bag-check-outline" | "location" | "location-outline" | "document" | "document-outline" |undefined;
      if (route.name === "crimemap") {
        iconName = focused ? "location" : "location-outline";
      } else if (route.name === "emergency") {
        iconName = focused ? "call" : "call-outline";
      } else if (route.name === "account") {
        iconName = focused ? "person" : "person-outline";
      } else if (route.name === "report") {
        iconName = focused ? "megaphone" : "megaphone-outline";
      } else if (route.name === "Validate") {
        iconName = focused ? "bag-check" : "bag-check-outline";
      } else if (route.name === "genReport") {
        iconName = focused ? "document" : "document-outline";
      }
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    headerShown: !["(drawer)", "summary"].includes(route.name),
    header: () => <MyHeader navigation={navigation} />,
    drawerStyle: {
      backgroundColor: "#FFF",
      shadowColor: "#333333",
      shadowOffset: {
        width: 5,
        height: 5,
      },
      shadowRadius: 5,
      shadowOpacity: 0.5,
    },
    headerTintColor: "#fff",
    headerStyle: {
      backgroundColor: "#6200EE",
    },
    headerTransparent: true,
  };
};

export default DrawerScreenOptions;
