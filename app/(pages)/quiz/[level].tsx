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
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import HalfButton from "../../components/button/HalfButton";
import LayoutWrapper from "../../components/wrapper/LayoutWrapper";
import * as Speech from "expo-speech";
import { Platform } from "react-native";
import SoundHandleButton from "app/components/button/SoundHandleButton";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

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
    case "hsk3":
      return require("../../../assets/csv/HSK3_vocab.csv");
    case "hsk4":
      return require("../../../assets/csv/HSK4_vocab.csv");
    case "hsk5":
      return require("../../../assets/csv/HSK5_vocab.csv");
    case "hsk6":
      return require("../../../assets/csv/HSK6_vocab.csv");
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
  const [mute, setMute] = useState(false);

  // ★ 効果音プレイヤーを用意（ファイルは同じパスでOK）
  const correctPlayer = useAudioPlayer(
    require("../../../assets/sounds/correct.mp3")
  );
  const wrongPlayer = useAudioPlayer(
    require("../../../assets/sounds/wrong.mp3")
  );

  // iOSのサイレントでも鳴らしたい場合（不要なら削ってOK）
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
    }).catch(() => {});
  }, []);

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

  // 変更前（expo-speechはそのまま利用OK）
  const handleSelect = async (m: string) => {
    if (selected) return;
    setSelected(m);

    const isCorrect = m === current.meaning;
    if (isCorrect) setScore((s) => s + 1);

    // かぶり防止で読み上げ停止
    Speech.stop();

    // ★ 効果音を鳴らす
    await playEffect(isCorrect ? "ok" : "ng");
  };

  const handleNext = () => {
    if (!selected) return;
    Speech.stop(); // 次の読み上げに備え停止
    if (isLast) {
      router.push("/");
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  // 読み上げ関数
  const speakCurrent = React.useCallback(() => {
    if (!current || mute) return;
    Speech.stop(); // かぶり読み防止
    const text = current.word;
    Speech.speak(text, {
      language: "zh-CN",
      pitch: 1.0,
      rate: Platform.select({ ios: 0.5, android: 1.0, default: 1.0 }), // 速さ
      onDone: () => {},
      onStopped: () => {},
      onError: (e) => console.warn("Speech error:", e),
    });
  }, [current, mute]);

  // 問題が切り替わるたびに自動再生
  useEffect(() => {
    speakCurrent();
    return () => {
      // 画面離脱・次の問題へ移動時に止める
      Speech.stop();
    };
  }, [speakCurrent]);

  // ★ 効果音再生（ミュートなら鳴らさない）
  const playEffect = async (type: "ok" | "ng") => {
    if (mute) return;
    try {
      const p = type === "ok" ? correctPlayer : wrongPlayer;
      // expo-audio は再生後に位置が末尾で止まる → 頭出しして再生
      p.seekTo(0);
      p.play();
    } catch (e) {
      console.warn("playEffect error:", e);
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
              <View style={styles.soundHandleButtonContainer}>
                <SoundHandleButton
                  label={mute ? "🔇" : "🔊"}
                  accessibilityLabel={
                    mute ? "音声をオンにする" : "音声をオフにする"
                  }
                  onPress={() => setMute((m) => !m)}
                />

                <SoundHandleButton
                  label="🗣️"
                  accessibilityLabel="もう一度読み上げる"
                  onPress={() => {
                    Speech.stop();
                    speakCurrent();
                  }}
                  disabled={mute}
                />
              </View>
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
  soundHandleButtonContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-end",
    position: "absolute",
    right: -16,
    bottom: -6,
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
