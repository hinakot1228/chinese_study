// components/CustomButton.tsx
import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { COLORS } from "@theme/color";
import { DIMENSIONS } from "@theme/dimensions";
import { FONT, FONT_SIZE } from "@theme/font";

type Props = {
  label: string;
  accessibilityLabel: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
};

export default function SoundHandleButton({
  label,
  accessibilityLabel,
  onPress,
  disabled = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, disabled && styles.disabledButton]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: DIMENSIONS.borderWidth.thin,
    borderColor: COLORS.black,
    borderRadius: DIMENSIONS.radius.md,
  },
  disabledButton: {
    backgroundColor: COLORS.black,
    opacity: 0.8,
  },
  text: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
});
