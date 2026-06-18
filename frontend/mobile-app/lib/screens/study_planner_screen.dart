import 'package:flutter/material.dart';

class StudyPlannerScreen extends StatelessWidget {
  const StudyPlannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFeef2ff),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Study Planner', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF1f2937))),
              const SizedBox(height: 8),
              const Text('Build a daily study plan and keep your exam countdown on track.', style: TextStyle(fontSize: 16, color: Color(0xFF475569))),
              const SizedBox(height: 24),
              Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 14, offset: Offset(0, 8))]),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Exam Countdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text('45 Days Left', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
                        Text('WAEC 2025', style: TextStyle(color: Color(0xFF64748b))),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Today\'s Plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1f2937))),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  children: [
                    _buildPlannerItem('Algebra', '20 mins'),
                    _buildPlannerItem('Trigonometry', '15 mins'),
                    _buildPlannerItem('Probability', '10 mins'),
                    _buildPlannerItem('English Literature', '15 mins'),
                    _buildPlannerItem('Chemistry', '20 mins'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlannerItem(String title, String estimate) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 12, offset: Offset(0, 6))]),
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
          Text(estimate, style: const TextStyle(fontSize: 15, color: Color(0xFF475569))),
        ],
      ),
    );
  }
}
