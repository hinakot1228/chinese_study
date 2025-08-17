import { COLORS } from "@theme/color";
import { FONT } from "@theme/font";
import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type Props = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function HalfButton({
  title,
  onPress,
  disabled = false,
  style,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "50%",
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.black,
    alignSelf: "center",
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: FONT.yusei,
  },
});
