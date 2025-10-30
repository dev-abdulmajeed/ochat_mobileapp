import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Height, Width } from '../constants/size';
import { ThemeContext } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../constants/ThemeColors';

const Appbar = ({
  title,
  icons = [],
  layout = 'right-icon',
  showLogout = false,
  onLogout = () => {},
  logoutLoading = false,
}) => {
  const isIconLeft = layout === 'left-icon';
  const { theme } = React.useContext(ThemeContext);
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const mergedIcons = React.useMemo(() => {
    if (!showLogout) return icons;
    return [
      ...icons,
      {
        key: 'logout',
        render: () =>
          logoutLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <View style={[styles.logoutContainer, { backgroundColor: colors.card }]}>
              <MaterialIcons
                name="logout"
                size={20}
                color={colors.text}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
            </View>
          ),
        onPress: onLogout,
      },
    ];
  }, [icons, showLogout, onLogout, logoutLoading, colors]);

  const renderIcon = (iconItem, index) => {
    const key = iconItem.key || `icon-${index}`;

    return (
      <TouchableOpacity
        key={key}
        onPress={iconItem.onPress}
        activeOpacity={0.6}
        style={styles.touchArea}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {iconItem.render ? (
          iconItem.render(styles.icon)
        ) : (
          <Image
            source={iconItem.source}
            style={[styles.icon, iconItem.style, { tintColor: colors.text }]}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.background,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.container, isIconLeft && styles.leftAlignedContainer]}>
        <View style={styles.titleIconContainer}>
          {isIconLeft && mergedIcons.length > 0 && (
            <View style={styles.iconContainer}>{mergedIcons.map(renderIcon)}</View>
          )}

          <Text
            style={[styles.title, { color: colors.text }, isIconLeft && styles.leftTitle]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* ✅ Right-side icons */}
        {!isIconLeft && (
          <View style={styles.iconContainer}>{mergedIcons.map(renderIcon)}</View>
        )}
      </View>
    </View>
  );
};

export default Appbar;

/* ───────────────────────────── STYLES ───────────────────────────── */
const styles = StyleSheet.create({
  background: {
    width: Width,
    paddingHorizontal: 10,
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 15,
  },
  leftAlignedContainer: {
    justifyContent: 'flex-start',
  },
  titleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: Width * 0.6,
  },
  leftTitle: {
    marginLeft: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchArea: {
    padding: 8,
    marginRight: 6,
    borderRadius: 20,
  },
  icon: {
    width: 22,
    height: 22,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Height * 0.008,
    paddingHorizontal: Width * 0.03,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
