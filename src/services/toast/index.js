import Toast from 'react-native-toast-message';

export const ToastDuration = {
  FASTEST: 250,
  FAST: 700,
  MEDIUM: 1500,
  LONG: 5000,
  LONGEST: 8000,
  ULTRA_LONG: 60000,
};

export const ToastType = {
  SUCCESS: 'success',
  DANGER: 'error',
  WARNING: 'warning',
  DEFAULT: 'info',
};

export const showToastMessage = ({
  text,
  type = ToastType.DEFAULT,
  image,
  duration = ToastDuration.MEDIUM,
  position = 'top',
  customAction,
  shouldHideToastOnPress,
  showInfo,
  infoAction,
}) => {
  Toast.hide();
  let textMessage = '';

  // add condition for object here if necessary
  if (typeof text === 'string') {
    textMessage = text;
  }

  if (!textMessage || textMessage.trim().length === 0) {
    return;
  }

  setTimeout(() => {
    Toast.show({
      type,
      text1: textMessage,
      visibilityTime: duration,
      position,
      props: {
        image,
        customAction,
        shouldHideToastOnPress,
        showInfo,
        infoAction,
      },
    });
  }, 250);
};

export const hideToastMessage = () => Toast.hide();
