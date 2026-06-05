# Learnify Flutter App

A Flutter mobile app scaffold for Learnify, an intelligent learning companion designed for students preparing for WAEC, NECO, JAMB, and other exams.

## Project structure

- `lib/main.dart` - app entrypoint and navigation routes
- `lib/screens/login_screen.dart` - login UI flow
- `lib/screens/main_tabs.dart` - bottom navigation for core app screens
- `lib/screens/dashboard_screen.dart` - dashboard with progress and weak topic summary
- `lib/screens/ocr_scanner_screen.dart` - OCR scanner placeholder UI
- `lib/screens/ai_tutor_screen.dart` - AI tutor question/answer screen
- `lib/screens/quiz_generator_screen.dart` - quiz generator UI
- `lib/screens/study_planner_screen.dart` - study planner and exam countdown
- `lib/screens/profile_screen.dart` - student profile and navigation to weak topic analytics
- `lib/screens/weak_topic_screen.dart` - weak topic intelligence analytics

## Run the app

1. Ensure Flutter is installed and available:
   ```bash
   flutter --version
   ```
2. Get dependencies:
   ```bash
   flutter pub get
   ```
3. Run on a connected device or emulator:
   ```bash
   flutter run
   ```

## Next enhancements

- Add image OCR support for handwritten note scanning
- Integrate Gemini/OpenAI for curriculum-aware tutoring and quiz generation
- Add backend authentication and student progress persistence
- Implement real weak topic intelligence and adaptive study planning
