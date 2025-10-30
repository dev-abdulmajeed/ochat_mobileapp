
import * as React from 'react';
import {
  StackActions,
  createNavigationContainerRef,
  CommonActions
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigateservice(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

export function resetnav(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      })
    );
  }
}

export function softnav(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
export function Goback() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export const navigationReff = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}
