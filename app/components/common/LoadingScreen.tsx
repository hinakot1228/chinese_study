// components/feedback/LoadingScreen.tsx
import { COLORS } from "@theme/color";
import { DIMENSIONS } from "@theme/dimensions";
import { FONT } from "@theme/font";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, ViewStyle } from "react-native";
import LayoutWrapper from "../../components/wrapper/LayoutWrapper";

type Props = {
  message?: string;
  color?: string;
  size?: "small" | "large";
  style?: ViewStyle;
};

export default function LoadingScreen({
  message = "読み込み中...\n等一下哦！",
  color = COLORS.primary,
  size = "large",
  style,
}: Props) {
  return (
    <LayoutWrapper style={[styles.center, style]}>
      <ActivityIndicator color={color} size={size} />
      <Text style={[styles.text]}>{message}</Text>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: DIMENSIONS.spacing.sm,
    color: COLORS.black,
    fontFamily: FONT.yusei,
    textAlign: "center",
  },
});
