//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';
import '../../../controller/auth/forgot_password/forgot_password_controller.dart';
import '../../../widget/auth/forgot_password/forgot_password_form.dart';
//========================================================

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

//========================================================

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final ForgotPasswordController _controller = ForgotPasswordController();

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onControllerChanged);
  }

  void _onControllerChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    _controller.dispose();
    super.dispose();
  }

  Future<void> _sendResetLink() async {
    final ok = await _controller.sendResetLink();
    if (!mounted) return;

    if (!ok) return;

    await Future<void>.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,

      // Upper part (Logo) -------------------------------------
      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0, // no shadow
        toolbarHeight: 100,
        centerTitle: true,

        iconTheme: theme.appBarTheme.iconTheme,
        title: Image.asset(
          'assets/BusLogoWhite.png',
          width: 70,
          height: 70,
          fit: BoxFit.contain,
        ),
      ),

      //------------------------------------------------------------------
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: ForgotPasswordForm(
                  emailController: _controller.emailController,
                  isLoading: _controller.isLoading,
                  onSendResetLink: _sendResetLink,
                  errorMessage: _controller.inlineErrorMessage,
                  successMessage: _controller.inlineSuccessMessage,
                  primaryColor: cs.primary,
                  backgroundColor: cs.onPrimary,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
