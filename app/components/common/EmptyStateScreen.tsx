import { COLORS } from "@theme/color";
import { DIMENSIONS } from "@theme/dimensions";
import { FONT, FONT_SIZE } from "@theme/font";
import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import HalfButton from "../button/HalfButton";
import LayoutWrapper from "../wrapper/LayoutWrapper";

type Props = {
  message?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyStateScreen({
  message = "データがありません...\n没有数据( ;ㅿ; )",
  actionLabel,
  onActionPress,
  style,
}: Props) {
  return (
    <LayoutWrapper style={[styles.center, style]}>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onActionPress ? (
        <HalfButton title={actionLabel} onPress={onActionPress} />
      ) : null}
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  message: {
    color: COLORS.black,
    fontFamily: FONT.yusei,
    fontSize: FONT_SIZE.md,
    marginBottom: DIMENSIONS.spacing.md,
    textAlign: "center",
  },
});
