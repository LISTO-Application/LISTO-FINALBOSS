import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const phone = require("../../assets/images/phone-icon.png");
  const report = require("../../assets/images/report-icon.png");
  const person = require("../../assets/images/person-icon.png");
  const map = require("../../assets/images/map-icon.png");

  const icons = {
    emergency: (props: any) => (
      <Image style={{ width: 36, height: 36 }} source={phone} {...props} />
    ),
    report: (props: any) => (
      <Image style={{ width: 36, height: 36 }} source={report} {...props} />
    ),
    index: (props: any) => (
      <Image style={{ width: 36, height: 36 }} source={map} {...props} />
    ),
    "[id]": (props: any) => (
      <Image style={{ width: 36, height: 36 }} source={person} {...props} />
    ),
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            style={[styles.tabBarItem]}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {icons[route.name as keyof typeof icons]({}) as React.JSX.Element}

            <Text
              style={{
                opacity: isFocused ? 1 : 0.5,
                fontSize: 16,
                fontWeight: "bold",
                marginTop: "2.5%",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "10%",
    backgroundColor: "#FFF",
    borderTopWidth: 2,
    borderTopColor: "#115272",
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
});
