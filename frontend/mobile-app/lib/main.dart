import 'package:flutter/material.dart';

import 'screens/login_screen.dart';
import 'screens/main_tabs.dart';
import 'screens/ocr_scanner_screen.dart';
import 'screens/weak_topic_screen.dart';

void main() {
  runApp(const LearnifyApp());
}

class LearnifyApp extends StatelessWidget {
  const LearnifyApp({super.key});

  @override
  Widget build(BuildContext context) {
    const Color seed = Color(0xFF4338ca);

    return MaterialApp(
      title: 'Learnify',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: seed),
        scaffoldBackgroundColor: const Color(0xFFeef2ff),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF4338ca),
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
          iconTheme: IconThemeData(color: Colors.white),
        ),
        cardTheme: CardTheme(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          margin: EdgeInsets.zero,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none),
          contentPadding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 18.0),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: seed,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        textTheme: ThemeData.light().textTheme.copyWith(
          bodyMedium: const TextStyle(color: Color(0xFF475569)),
          titleLarge: const TextStyle(fontWeight: FontWeight.w800, color: Color(0xFF111827)),
        ),
      ),
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (_) => const LoginScreen(),
        '/home': (_) => const MainTabs(),
        '/ocr': (_) => const OCRScannerScreen(),
        '/weak-topics': (_) => const WeakTopicScreen(),
      },
    );
  }
}
