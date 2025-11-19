import { NativeScriptConfig } from '@nativescript/core';

// TODO: Mohammad 11-19-2025: It would be different when we switch to Vite
const NS_ENV = process.env.NATIVESCRIPT_WEBPACK_ENV ?? '{}';
const isProduction = JSON.parse(NS_ENV).production;

export default {
  id: 'com.mohammadrafigh.neocomment',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
    maxLogcatObjectSize: isProduction ? 1024 : 2048,
    discardUncaughtJsExceptions: isProduction,
  }
} as NativeScriptConfig;
