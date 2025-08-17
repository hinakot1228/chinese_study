import { COLORS } from "@theme/color";
import { DIMENSIONS } from "@theme/dimensions";
import { FONT, FONT_SIZE } from "@theme/font";
import { LinkProps, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  text: string;
  href: LinkProps["href"];
};

export default function CardButton({ text, href }: Props) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(href)} style={styles.card}>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 60,
    backgroundColor: COLORS.base,
    borderWidth: DIMENSIONS.borderWidth.medium,
    borderColor: COLORS.black,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: DIMENSIONS.spacing.md,
  },
  text: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    fontFamily: FONT.yusei,
  },
});
