/// Sahm — Login Screen
/// Clean, professional login form with Arabic-first design.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    // TODO: Integrate with FastAPI auth endpoint
    await Future.delayed(const Duration(milliseconds: 800));

    if (mounted) {
      setState(() => _isLoading = false);
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(SahmSpacing.xl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: isDark ? SahmColors.accent : SahmColors.primary,
                      borderRadius: BorderRadius.circular(SahmRadius.lg),
                    ),
                    child: Center(
                      child: Text(
                        'س',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w700,
                          color: isDark ? SahmColors.primaryDark : Colors.white,
                          fontFamily: 'IBMPlexSansArabic',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: SahmSpacing.lg),

                  // Title
                  Text(
                    'تسجيل الدخول',
                    style: SahmTypography.h2.copyWith(
                      color: isDark
                          ? SahmColors.textPrimaryDark
                          : SahmColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: SahmSpacing.sm),
                  Text(
                    'ادخل بيانات حسابك للمتابعة',
                    style: SahmTypography.body.copyWith(
                      color: isDark
                          ? SahmColors.textSecondaryDark
                          : SahmColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: SahmSpacing.xxxl),

                  // Form
                  Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Email
                        Text(
                          'البريد الإلكتروني',
                          style: SahmTypography.label.copyWith(
                            color: isDark
                                ? SahmColors.textSecondaryDark
                                : SahmColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: SahmSpacing.sm),
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          textDirection: TextDirection.ltr,
                          decoration: const InputDecoration(
                            hintText: 'example@university.edu',
                            hintTextDirection: TextDirection.ltr,
                            prefixIcon: Icon(Icons.email_outlined, size: 20),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'يرجى إدخال البريد الإلكتروني';
                            }
                            if (!value.contains('@')) {
                              return 'يرجى إدخال بريد إلكتروني صحيح';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: SahmSpacing.lg),

                        // Password
                        Text(
                          'كلمة المرور',
                          style: SahmTypography.label.copyWith(
                            color: isDark
                                ? SahmColors.textSecondaryDark
                                : SahmColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: SahmSpacing.sm),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          textDirection: TextDirection.ltr,
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            hintTextDirection: TextDirection.ltr,
                            prefixIcon:
                                const Icon(Icons.lock_outlined, size: 20),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 20,
                              ),
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'يرجى إدخال كلمة المرور';
                            }
                            if (value.length < 6) {
                              return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: SahmSpacing.xxl),

                        // Login button
                        ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('دخول'),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: SahmSpacing.xxxl),

                  // Footer
                  Text(
                    'سهم v0.1.0',
                    style: SahmTypography.caption.copyWith(
                      color: isDark
                          ? SahmColors.textTertiaryDark
                          : SahmColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
