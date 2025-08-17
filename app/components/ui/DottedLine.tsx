import { COLORS } from "@theme/color";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function DottedLine() {
  return <View style={styles.dotted} />;
}

const styles = StyleSheet.create({
  dotted: {
    borderBottomWidth: 2,
    borderColor: COLORS.black,
    borderStyle: "dotted",
    width: "100%",
  },
});
