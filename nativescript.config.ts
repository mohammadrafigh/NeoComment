import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'com.mohammadrafigh.neocomment',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
    maxLogcatObjectSize: 2048,
  }
} as NativeScriptConfig;
