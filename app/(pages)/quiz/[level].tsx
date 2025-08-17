// app/quiz/[level].tsx
import { COLORS } from "@theme/color";
import { DIMENSIONS } from "@theme/dimensions";
import { FONT, FONT_SIZE } from "@theme/font";
import EmptyStateScreen from "app/components/common/EmptyStateScreen";
import LoadingScreen from "app/components/common/LoadingScreen";
import DottedLine from "app/components/ui/DottedLine";
import { Asset } from "expo-asset";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Papa from "papaparse";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import HalfButton from "../../components/button/HalfButton";
import LayoutWrapper from "../../components/wrapper/LayoutWrapper";

type Vocab = {
  word: string;
  pinyin: string;
  meaning: string;
};

function getCsvModule(level: string) {
  switch (level) {
    case "hsk1":
      return require("../../../assets/csv/HSK1_vocab.csv");
    case "hsk2":
      return require("../../../assets/csv/HSK2_vocab.csv");
    default:
      return require("../../../assets/csv/HSK1_vocab.csv"); // フォールバック
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizByLevel() {
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level: string }>();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Vocab[]>([]);
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<Vocab[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // CSV読込
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = getCsvModule(level ?? "hsk1");
        const asset = Asset.fromModule(mod);
        await asset.downloadAsync();
        const res = await fetch(asset.uri);
        const csvText = await res.text();

        const parsed = Papa.parse<Vocab>(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase(),
          transform: (v) => (typeof v === "string" ? v.trim() : v),
        });

        const rows = (parsed.data || []).filter(
          (r) => r.word && r.meaning // 最低限
        );

        if (mounted) {
          setList(shuffle(rows));
          setLoading(false);
          setIdx(0);
          setScore(0);
          setSelected(null);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [level]);

  const current = list[idx];

  // 選択肢を作る（正解1 + 他3）
  useEffect(() => {
    if (!current || list.length === 0) return;
    const others = shuffle(list.filter((v) => v.word !== current.word)).slice(
      0,
      3
    );
    const c = shuffle([current, ...others]);
    setChoices(c);
    setSelected(null);
  }, [current, list]);

  const isLast = useMemo(() => idx >= list.length - 1, [idx, list.length]);

  const handleSelect = (m: string) => {
    if (selected) return; // 一度選んだら固定
    setSelected(m);
    if (m === current.meaning) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (!selected) return;
    if (isLast) {
      router.push("/");
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "来学习吧！",
          headerStyle: {
            backgroundColor: COLORS.base,
          },
          headerTitleStyle: {
            fontFamily: FONT.yusei,
          },

          headerTintColor: COLORS.black,
        }}
      />
      {loading ? (
        <LoadingScreen />
      ) : !current ? (
        <EmptyStateScreen
          actionLabel="ホームに戻る"
          onActionPress={() => router.push("/")}
        />
      ) : (
        <LayoutWrapper>
          <View style={styles.upperContainer}>
            <View style={styles.headerContainer}>
              <Text
                style={[
                  styles.headerText,
                  styles.fontYousei,
                  styles.textColorBlack,
                ]}
              >
                {String(level).toUpperCase()}
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarOuter}>
                  <View
                    style={[
                      styles.progressBarInner,
                      { width: `${((idx + 1) / list.length) * 100}%` },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.progressBarText,
                    styles.fontYousei,
                    styles.textColorBlack,
                  ]}
                >
                  {idx + 1}／{list.length}問 ｜ 正解 {score}問
                </Text>
              </View>
            </View>
            <DottedLine />
            <View style={styles.questionContainer}>
              <Text
                style={[
                  styles.questionPinyin,
                  styles.fontYousei,
                  styles.textColorBlack,
                ]}
              >
                {current.pinyin}
              </Text>
              <Text
                style={[
                  styles.questionWord,
                  styles.fontYousei,
                  styles.textColorBlack,
                ]}
              >
                {current.word}
              </Text>
            </View>
            <DottedLine />
            <View style={styles.statementContainer}>
              <Text
                style={[
                  styles.statement,
                  styles.fontYousei,
                  styles.textColorBlack,
                ]}
              >
                意味を選んでください
              </Text>
            </View>
          </View>

          <View style={styles.lowerContainer}>
            <View style={styles.choiceContainer}>
              {choices.map((c) => {
                const isSelected = selected === c.meaning;
                const isCorrect = c.meaning === current.meaning;
                const bg =
                  selected == null
                    ? COLORS.white
                    : isCorrect
                    ? COLORS.green // 正解
                    : isSelected
                    ? COLORS.pink // 不正解
                    : COLORS.white;

                return (
                  <Pressable
                    key={c.meaning + c.word}
                    onPress={() => handleSelect(c.meaning)}
                    style={[styles.choice, { backgroundColor: bg }]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        styles.fontYousei,
                        styles.textColorBlack,
                      ]}
                    >
                      {c.meaning}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.footerContainer}>
              <HalfButton
                title={isLast ? "ホームに戻る" : "次へ"}
                onPress={handleNext}
                disabled={!selected}
              />
            </View>
          </View>
        </LayoutWrapper>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fontYousei: {
    fontFamily: FONT.yusei,
  },
  textColorBlack: {
    color: COLORS.black,
  },
  upperContainer: {
    flex: 5,
  },
  lowerContainer: {
    flex: 5,
  },
  headerContainer: {
    flex: 2,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: FONT_SIZE.sm,
  },
  progressBarContainer: {
    marginBottom: DIMENSIONS.spacing.sm,
  },
  progressBarOuter: {
    height: 10,
    backgroundColor: COLORS.base,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: DIMENSIONS.borderWidth.medium,
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: COLORS.black,
  },
  progressBarText: {
    fontSize: FONT_SIZE.sm,
    textAlign: "right",
    marginTop: DIMENSIONS.spacing.sm,
  },
  questionContainer: {
    flex: 3,
    justifyContent: "center",
    margin: 16,
  },
  questionPinyin: {
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
  questionWord: {
    fontSize: FONT_SIZE.xl,
    textAlign: "center",
  },
  statementContainer: {
    flex: 2,
    justifyContent: "center",
  },
  statement: {
    fontSize: FONT_SIZE.sm,
  },
  choiceContainer: {
    flex: 1,
    gap: DIMENSIONS.spacing.md,
  },
  choice: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    borderWidth: DIMENSIONS.borderWidth.medium,
    borderColor: COLORS.black,
  },
  choiceText: {
    fontSize: FONT_SIZE.md,
    fontWeight: "500",
  },
  footerContainer: {
    marginTop: DIMENSIONS.spacing.md,
  },
});
