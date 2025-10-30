import {Dimensions, PixelRatio} from 'react-native';

export const Height = Dimensions.get('screen').height;
export const Width = Dimensions.get('screen').width;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const diagonalInInches =
  Math.sqrt(screenWidth * 2 + screenHeight * 2) / PixelRatio.get();

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const SCALE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);
const BASE_WIDTH = 375;

const fontConfig = {
  phone: {
    small: {min: 0.85, max: 1},
    medium: {min: 0.9, max: 1.05},
    large: {min: 1, max: 1.15},
  },
  tablet: {
    small: {min: 1.1, max: 1.2},
    medium: {min: 1.2, max: 1.3},
    large: {min: 1.3, max: 1.4},
  },
};

export const getDeviceType = () => {
  if (SCREEN_WIDTH >= 600 || SCREEN_HEIGHT >= 1000) {
    return 'tablet';
  }
  return 'phone';
};

// Determine Screen Size Category
const getScreenSizeCategory = () => {
  if (SCALE < 350) return 'small';
  if (SCALE > 500) return 'large';
  return 'medium';
};

export const getResponsiveFont = size => {
  const deviceType = getDeviceType();
  const screenCategory = getScreenSizeCategory();
  const config = fontConfig[deviceType][screenCategory];

  const scaleFactor = SCALE / BASE_WIDTH;

  const clampedScaleFactor = Math.min(
    Math.max(scaleFactor, config.min),
    config.max,
  );

  let newSize = size * clampedScaleFactor;

  // Adjust for tablets
  if (deviceType === 'tablet') {
    newSize *= 1.1;
  }

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Adjust Font Config Dynamically
export const adjustFontConfig = (
  deviceType,
  sizeCategory,
  minScale,
  maxScale,
) => {
  if (fontConfig[deviceType] && fontConfig[deviceType][sizeCategory]) {
    fontConfig[deviceType][sizeCategory] = {
      min: minScale,
      max: maxScale,
    };
  }
};