export default {
  expo: {
    name: "SwiftMapper",
    slug: "SwiftMapper",
    version: "1.0.0",
    scheme: "swiftmapper",
    main: "expo-router/entry",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      package: "com.shavs.swiftmapper",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-router", "expo-status-bar"],
    extra: {
      eas: {
        projectId: "a549bd93-a4cc-43be-81cc-90b849c146a1",
      },
    },
  },
};
