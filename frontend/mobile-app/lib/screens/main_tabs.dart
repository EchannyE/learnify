import 'package:flutter/material.dart';

import 'dashboard_screen.dart';
import 'ai_tutor_screen.dart';
import 'quiz_generator_screen.dart';
import 'study_planner_screen.dart';
import 'profile_screen.dart';

class MainTabs extends StatefulWidget {
  const MainTabs({super.key});

  @override
  State<MainTabs> createState() => _MainTabsState();
}

class _MainTabsState extends State<MainTabs> {
  int selectedIndex = 0;

  static final List<Widget> pages = <Widget>[
    const DashboardScreen(),
    const AITutorScreen(),
    const QuizGeneratorScreen(),
    const StudyPlannerScreen(),
    const ProfileScreen(),
  ];

  void onItemTapped(int index) {
    setState(() {
      selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: pages[selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: onItemTapped,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.school), label: 'AI Tutor'),
          NavigationDestination(icon: Icon(Icons.quiz), label: 'Quiz'),
          NavigationDestination(icon: Icon(Icons.calendar_today), label: 'Planner'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
