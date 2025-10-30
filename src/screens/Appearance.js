import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemeContext } from "../context/ThemeContext";
import { lightTheme, darkTheme } from "../constants/ThemeColors";
import Appbar from "../components/Appbar";
import icons from "../constants/Icons";
import { Goback } from "../services/NavigationService";

const Appearance = () => {
  const { theme, mode, setThemeMode } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const colors = isDark ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
     <Appbar title={"Appearance"} icons={[{ source: icons.back, onPress: Goback }]} layout="left-icon" />

      <View style={[styles.dropdownContainer, { borderColor: colors.border }]}>
        <Picker
          selectedValue={mode}
          dropdownIconColor={colors.text}
          style={[styles.picker, { color: colors.text }]}
          onValueChange={(value) => setThemeMode(value)}
        >
          <Picker.Item label="Light" value="light" />
          <Picker.Item label="Dark" value="dark" />
          <Picker.Item label="System" value="system" />
        </Picker>
      </View>


    </View>
  );
};

export default Appearance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 10,
    backgroundColor: "transparent",
  },
  picker: {
    height: 50,
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  info: {
    fontSize: 16,
    marginTop: 8,
  },
});
