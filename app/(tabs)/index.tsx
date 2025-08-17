import { FONT, FONT_SIZE } from "@theme/font";
import { StyleSheet, Text } from "react-native";
import CardButton from "../components/button/CardButton";
import LayoutWrapper from "../components/wrapper/LayoutWrapper";

export default function Index() {
  return (
    <LayoutWrapper>
      <CardButton text="HSK 1級単語 1問1答" href="/quiz/hsk1" />
      <CardButton text="HSK 2級単語 1問1答" href="/quiz/hsk2" />
      <CardButton text="HSK 3級単語 1問1答" href="/quiz/hsk3" />
      <CardButton text="HSK 4級単語 1問1答" href="/quiz/hsk4" />
      <CardButton text="HSK 5級単語 1問1答" href="/quiz/hsk5" />
      <CardButton text="HSK 6級単語 1問1答" href="/quiz/hsk6" />
      <Text style={[styles.phraseLatin, { marginTop: 50 }]}>
        Qiānlǐ zhī xíng, shǐ yú zú xià
      </Text>
      <Text style={styles.phraseChinese}>＼　千里之行，始于足下　／</Text>
      <Text style={[styles.phraseLatin, { marginTop: 8 }]}>‎(•'-'•)و</Text>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  phraseLatin: {
    fontFamily: FONT.yusei,
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
  },
  phraseChinese: {
    fontFamily: FONT.yusei,
    fontSize: FONT_SIZE.lg,
    textAlign: "center",
    marginTop: 8,
  },
});
