import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFeef2ff),
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate(
                  [
                    _buildHeader(context),
                    const SizedBox(height: 20),
                    _buildStatsRow(),
                    const SizedBox(height: 20),
                    _buildProgressOverview(),
                    const SizedBox(height: 20),
                    _buildQuickActions(context),
                    const SizedBox(height: 20),
                    _buildWeakTopicsCard(context),
                    const SizedBox(height: 20),
                    _buildStudyPlanCard(),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 28,
          backgroundColor: const Color(0xFF4338ca),
          child: const Icon(Icons.person, size: 32, color: Colors.white),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Hello, Aminu 👋', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
              SizedBox(height: 8),
              Text('Ready for today\'s session? Check your progress and stay on track.', style: TextStyle(fontSize: 15, color: Color(0xFF475569), height: 1.5)),
            ],
          ),
        ),
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.notifications_outlined, color: Color(0xFF1f2937)),
        ),
      ],
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(child: _buildStatCard('Streak', '7d', 'Keep going', const Color(0xFF4338ca))),
        const SizedBox(width: 16),
        Expanded(child: _buildStatCard('Focus', '72%', 'Weak topics', const Color(0xFF6366f1))),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, String subtitle, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 14, offset: Offset(0, 8))],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF475569))),
          const SizedBox(height: 14),
          Text(value, style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: color)),
          const SizedBox(height: 8),
          Text(subtitle, style: const TextStyle(fontSize: 14, color: Color(0xFF64748b))),
        ],
      ),
    );
  }

  Widget _buildProgressOverview() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 20, offset: Offset(0, 12))]),
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 122,
                height: 122,
                child: CircularProgressIndicator(
                  value: 0.72,
                  strokeWidth: 14,
                  color: const Color(0xFF4338ca),
                  backgroundColor: const Color(0xFFe0e7ff),
                ),
              ),
              const Text('72%', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
            ],
          ),
          const SizedBox(width: 22),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Weekly focus', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                SizedBox(height: 10),
                Text('You have completed 4 of 6 learning goals this week.', style: TextStyle(fontSize: 15, color: Color(0xFF475569), height: 1.5)),
                SizedBox(height: 16),
                Text('Next goal: Review weak topics for maths and biology.', style: TextStyle(fontSize: 15, color: Color(0xFF475569), height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _buildActionCard(context, Icons.camera_alt, 'Scan Notes', '/ocr', const Color(0xFF4338ca))),
            const SizedBox(width: 16),
            Expanded(child: _buildActionCard(context, Icons.school, 'AI Tutor', '/home', const Color(0xFF6366f1), subtitle: 'Ask a question')),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(BuildContext context, IconData icon, String title, String route, Color color, {String? subtitle}) {
    return GestureDetector(
      onTap: () {
        if (route == '/home') return;
        Navigator.pushNamed(context, route);
      },
      child: Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 14, offset: Offset(0, 8))]),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 44,
              width: 44,
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(14)),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 18),
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
            if (subtitle != null) const SizedBox(height: 6),
            if (subtitle != null) Text(subtitle, style: const TextStyle(fontSize: 14, color: Color(0xFF64748b))),
          ],
        ),
      ),
    );
  }

  Widget _buildWeakTopicsCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 20, offset: Offset(0, 12))]),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Weak Topics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
          const SizedBox(height: 16),
          _buildTopicRow('Quadratic Equations', 'Weak', const Color(0xFFdc2626)),
          const SizedBox(height: 12),
          _buildTopicRow('Trigonometry', 'At Risk', const Color(0xFFf59e0b)),
          const SizedBox(height: 12),
          _buildTopicRow('Probability', 'Weak', const Color(0xFFdc2626)),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/weak-topics');
              },
              style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 14),
                child: Text('View analytics', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopicRow(String title, String status, Color statusColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF111827)))),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(color: statusColor.withOpacity(0.18), borderRadius: BorderRadius.circular(12)),
          child: Text(status, style: TextStyle(color: statusColor, fontWeight: FontWeight.w700, fontSize: 13)),
        ),
      ],
    );
  }

  Widget _buildStudyPlanCard() {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 20, offset: Offset(0, 12))]),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Today\'s Study Plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
          const SizedBox(height: 18),
          _buildPlanRow('Algebra', '20 mins'),
          const SizedBox(height: 14),
          _buildPlanRow('Trigonometry', '15 mins'),
          const SizedBox(height: 14),
          _buildPlanRow('Probability', '10 mins'),
          const SizedBox(height: 22),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 14),
                child: Text('Start weak topics', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlanRow(String subject, String duration) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(subject, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
        Text(duration, style: const TextStyle(fontSize: 15, color: Color(0xFF475569))),
      ],
    );
  }
}
