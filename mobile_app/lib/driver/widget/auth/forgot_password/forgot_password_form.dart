//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

import '../../../service/localization/localization_service.dart';

//========================================================

class ForgotPasswordForm extends StatelessWidget {
  final TextEditingController emailController;
  final bool isLoading;
  final VoidCallback onSendResetLink;
  final String? errorMessage;
  final String? successMessage;

  final Color primaryColor;
  final Color backgroundColor;

  const ForgotPasswordForm({
    super.key,
    required this.emailController,
    required this.isLoading,
    required this.onSendResetLink,
    required this.errorMessage,
    required this.successMessage,
    required this.primaryColor,
    required this.backgroundColor,
  });

  //========================================================

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 22),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
                //-----------------------------------------------------
                const SizedBox(height: 50),

                //-----------------------------------------------------
                Text(
                  'driver_forgot_password_title'.translate,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: cs.onBackground,
                  ),
                ),

                //-----------------------------------------------------
                const SizedBox(height: 40),

                //-----------------------------------------------------
                Text(
                  'driver_forgot_password_description'.translate,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: cs.onBackground,
                  ),
                ),

                //-----------------------------------------------------
                const SizedBox(height: 40),

                //-----------------------------------------------------
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: 'driver_forgot_password_email_label'.translate,
                    border: OutlineInputBorder(),
                  ),
                ),

                //-----------------------------------------------------
                const SizedBox(height: 12),

                if (errorMessage != null && errorMessage!.trim().isNotEmpty)
                  Text(
                    errorMessage!,
                    style: TextStyle(
                      color: cs.error,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),

                if (successMessage != null && successMessage!.trim().isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(
                      successMessage!,
                      style: TextStyle(
                        color: cs.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),

                //-----------------------------------------------------
                const SizedBox(height: 50),

                //-----------------------------------------------------
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : onSendResetLink,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : Text(
                            'driver_forgot_password_send_link_button'.translate,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: backgroundColor,
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
}
