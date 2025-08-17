import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@theme/color";
import { FONT } from "@theme/font";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.base,
          display: "none",
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.black,
        headerStyle: {
          backgroundColor: COLORS.base,
        },
        headerTintColor: COLORS.black,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          headerTitleStyle: {
            fontFamily: FONT.yusei,
            fontSize: 20,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
