import 'package:flutter/material.dart';

class QuizGeneratorScreen extends StatefulWidget {
  const QuizGeneratorScreen({super.key});

  @override
  State<QuizGeneratorScreen> createState() => _QuizGeneratorScreenState();
}

class _QuizGeneratorScreenState extends State<QuizGeneratorScreen> {
  String quizSource = 'Uploaded Notes';
  String quizType = 'Multiple Choice';
  int questionCount = 10;

  final List<Map<String, dynamic>> sampleQuestions = [
    {
      'question': 'What is the chemical formula of water?',
      'options': ['H2O', 'CO2', 'NaCl', 'O2'],
    },
    {
      'question': 'Which organ pumps blood throughout the body?',
      'options': ['Kidney', 'Liver', 'Heart', 'Lung'],
    },
    {
      'question': 'What year did Nigeria gain independence?',
      'options': ['1957', '1960', '1963', '1970'],
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFeef2ff),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Quiz Generator', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
              const SizedBox(height: 10),
              const Text('Generate practice questions from notes, textbook topics, or your weak areas.', style: TextStyle(fontSize: 16, color: Color(0xFF475569), height: 1.4)),
              const SizedBox(height: 22),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 18, offset: Offset(0, 10))],
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildDropdown(label: 'Generate from', value: quizSource, items: [
                      'Uploaded Notes',
                      'Textbook',
                      'Weak Topics',
                      'Subject',
                    ], onChanged: (value) {
                      setState(() {
                        quizSource = value!;
                      });
                    }),
                    const SizedBox(height: 18),
                    _buildDropdown(label: 'Quiz type', value: quizType, items: ['Multiple Choice', 'True / False', 'Short Answer'], onChanged: (value) {
                      setState(() {
                        quizType = value!;
                      });
                    }),
                    const SizedBox(height: 18),
                    _buildQuestionCount(),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18))),
                      child: const Text('Generate Quiz', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Sample questions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
              const SizedBox(height: 16),
              ...sampleQuestions.map((item) => _buildQuestionCard(item)).toList(),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuestionCard(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 18, offset: Offset(0, 10))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Question', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF4338ca))),
            const SizedBox(height: 10),
            Text(item['question'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
            const SizedBox(height: 14),
            ...List<Widget>.from(item['options'].map((option) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      const Icon(Icons.circle, size: 8, color: Color(0xFF6366f1)),
                      const SizedBox(width: 10),
                      Expanded(child: Text(option, style: const TextStyle(fontSize: 15, color: Color(0xFF475569)))),
                    ],
                  ),
                ))),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown({required String label, required String value, required List<String> items, required ValueChanged<String?> onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF374151))),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFe5e7eb))),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: DropdownButton<String>(
            value: value,
            isExpanded: true,
            underline: const SizedBox.shrink(),
            icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF4338ca)),
            items: items.map((label) => DropdownMenuItem(value: label, child: Text(label))).toList(),
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionCount() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Number of questions', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF374151))),
        const SizedBox(height: 14),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [5, 10, 15, 20].map((value) {
            final selected = questionCount == value;
            return GestureDetector(
              onTap: () => setState(() => questionCount = value),
              child: Container(
                width: 72,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: selected ? const Color(0xFF4338ca) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFe5e7eb)),
                ),
                child: Center(
                  child: Text('$value', style: TextStyle(color: selected ? Colors.white : const Color(0xFF334155), fontWeight: FontWeight.w700, fontSize: 15)),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
