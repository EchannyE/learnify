import 'package:flutter/material.dart';

class OCRScannerScreen extends StatelessWidget {
  const OCRScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OCR Scanner'),
        backgroundColor: const Color(0xFF4338ca),
      ),
      backgroundColor: const Color(0xFFeef2ff),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Scan or Upload Notes', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
            const SizedBox(height: 12),
            const Text('Take a clear photo or upload an image of your notes to convert to searchable text.', style: TextStyle(fontSize: 16, color: Color(0xFF475569))),
            const SizedBox(height: 32),
            Expanded(
              child: Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: const Color(0xFFcbd5e1))),
                child: const Center(
                  child: Icon(Icons.document_scanner, size: 80, color: Color(0xFF4338ca)),
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4338ca),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () {},
              child: const Text('Choose Image', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFcbd5e1))),
              child: const Text('Supported formats: JPG, PNG, PDF', style: TextStyle(color: Color(0xFF475569), fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }
}
