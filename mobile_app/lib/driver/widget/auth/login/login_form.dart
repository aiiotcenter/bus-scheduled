//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

import '../../../service/localization/localization_service.dart';

//========================================================

class LoginForm extends StatelessWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final String? loginErrorMessage;
  final bool isLoading;
  final VoidCallback onLogin;
  final VoidCallback onForgotPassword;
  final Color primaryColor;
  final Color backgroundColor;

  const LoginForm({
    super.key,
    required this.emailController,
    required this.passwordController,
    this.loginErrorMessage,
    required this.isLoading,
    required this.onLogin,
    required this.onForgotPassword,
    required this.primaryColor,
    required this.backgroundColor,
  });

  // ====================================================================
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 45, vertical: 22),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,

        children: [
            const SizedBox(height: 26),

            // Email Slot ============================================
            TextField(
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'driver_login_email_label'.translate,
                border: OutlineInputBorder(
                  borderSide: BorderSide(color: cs.secondary),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: cs.secondary),
                  borderRadius: BorderRadius.circular(10),

                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: cs.primary, width: 2),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Password Slot ============================================
            TextField(
              controller: passwordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'driver_login_password_label'.translate,
                border: OutlineInputBorder(
                  borderSide: BorderSide(color: cs.secondary),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: cs.secondary),
                  borderRadius: BorderRadius.circular(12),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: cs.primary, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),

            // Error Message Slot ============================================
            if (loginErrorMessage != null &&
                loginErrorMessage!.trim().isNotEmpty) ...[
              const SizedBox(height: 10),

              Padding(
                padding: const EdgeInsets.only(left: 4),
                child: Text(
                  loginErrorMessage!,
                  style: TextStyle(
                    color: cs.error,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

              const SizedBox(height: 10),
            ] else ...[
              const SizedBox(height: 20),
            ],

            // Login Button  ============================================
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: isLoading ? null : onLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),

                child: isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            backgroundColor,
                          ),
                        ),
                      )
                    : Text(
                        'driver_login_button'.translate,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: backgroundColor,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 12),

            // Forgot Password button ============================================
            Align(
              alignment: Alignment.center,
              child: TextButton(
                onPressed: onForgotPassword,
                child: Text(
                  'driver_login_forgot_password'.translate,
                  style: TextStyle(
                    color: cs.onSurface,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            // =====================================================
          ],
      ),
    );
  }
}
