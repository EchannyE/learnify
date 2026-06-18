import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFeef2ff),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                height: 320,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF4338ca), Color(0xFF6366f1)],
                  ),
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(40),
                    bottomRight: Radius.circular(40),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: const [
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: Colors.white,
                            child: Icon(Icons.school, color: Color(0xFF4338ca), size: 28),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Learnify',
                              style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      const Text(
                        'Welcome back!',
                        style: TextStyle(fontSize: 34, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Sign in to continue your study streak and unlock smart learning.',
                        style: TextStyle(fontSize: 16, color: Colors.white70, height: 1.5),
                      ),
                    ],
                  ),
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -40),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: const [BoxShadow(color: Color(0x11000000), blurRadius: 20, offset: Offset(0, 12))],
                    ),
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('Sign in to Learnify', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
                        const SizedBox(height: 8),
                        const Text('Use your email or phone number to continue.', style: TextStyle(fontSize: 15, color: Color(0xFF475569))),
                        const SizedBox(height: 28),
                        _buildTextField(controller: emailController, label: 'Email or Phone', icon: Icons.person),
                        const SizedBox(height: 16),
                        _buildTextField(controller: passwordController, label: 'Password', icon: Icons.lock, obscureText: true),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pushReplacementNamed(context, '/home');
                          },
                          child: const Text('Login', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        ),
                        const SizedBox(height: 18),
                        const Center(child: Text('or continue with', style: TextStyle(color: Color(0xFF6b7280)))),
                        const SizedBox(height: 18),
                        Row(
                          children: [
                            _buildSocialButton(label: 'Google', icon: Icons.g_mobiledata),
                            const SizedBox(width: 16),
                            _buildSocialButton(label: 'Facebook', icon: Icons.facebook),
                          ],
                        ),
                        const SizedBox(height: 24),
                        TextButton(
                          onPressed: () {},
                          child: const Text('Don\'t have an account? Create one', style: TextStyle(color: Color(0xFF4338ca), fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({required TextEditingController controller, required String label, required IconData icon, bool obscureText = false}) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF4338ca)),
      ),
    );
  }

  Widget _buildSocialButton({required String label, required IconData icon}) {
    return Expanded(
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF4b5563),
          side: const BorderSide(color: Color(0xFFe5e7eb)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          padding: const EdgeInsets.symmetric(vertical: 14),
        ),
        icon: Icon(icon, size: 20),
        label: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
        onPressed: () {},
      ),
    );
  }
}
