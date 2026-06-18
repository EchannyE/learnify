import 'package:flutter/material.dart';

class WeakTopicScreen extends StatelessWidget {
  const WeakTopicScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Weak Topic Intelligence'),
        backgroundColor: const Color(0xFF4338ca),
      ),
      backgroundColor: const Color(0xFFeef2ff),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Weak Topic Intelligence', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
            const SizedBox(height: 12),
            const Text('Focus on the topics that need the most attention to improve your performance.', style: TextStyle(fontSize: 16, color: Color(0xFF475569))),
            const SizedBox(height: 24),
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 14, offset: Offset(0, 8))]),
              padding: const EdgeInsets.all(24),
              child: Column(
                children: const [
                  Text('Weak', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFFdc2626))),
                  SizedBox(height: 16),
                  Text('5 Topics', style: TextStyle(fontSize: 42, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                  SizedBox(height: 12),
                  Text('Focus on improving! We recommend you study these topics to improve your overall performance.', textAlign: TextAlign.center, style: TextStyle(fontSize: 15, color: Color(0xFF475569), height: 1.5)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView(
                children: [
                  _buildTopicItem('Quadratic Equations', 42),
                  _buildTopicItem('Trigonometry', 48),
                  _buildTopicItem('Probability', 36),
                  _buildTopicItem('Indices', 40),
                  _buildTopicItem('Logarithms', 45),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopicItem(String title, int score) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 12, offset: Offset(0, 6))]),
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
          Text('Score: $score%', style: const TextStyle(fontSize: 15, color: Color(0xFF475569))),
        ],
      ),
    );
  }
}
