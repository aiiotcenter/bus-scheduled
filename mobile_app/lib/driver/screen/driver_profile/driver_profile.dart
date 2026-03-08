//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

import '../homepage_driver/homepage_driver.dart';
import '../auth/login/login_page.dart';

import '../../controller/profile/driver_profile_controller.dart';
import '../../controller/auth/logout/logout_controller.dart';

import '../../service/localization/localization_service.dart';
import '../../service/user_preferences_service.dart';
import '../../../services/theme_service.dart';

import '../../widget/profile/section_card.dart';
import '../../widget/profile/settings_toggle.dart';
import '../../widget/profile/info_row.dart';
import '../../widget/profile/edit_phone_dialog.dart';
import '../../widget/auth/logout/logout_card.dart';
import '../../widget/auth/logout/confirm_logout_dialog.dart';
import '../../widget/driver_bottom_nav_bar.dart';


import '../../../common/pull_to_refresh.dart';

//========================================================

class DriverProfile extends StatefulWidget {
  const DriverProfile({super.key});

  @override
  State<DriverProfile> createState() => _DriverProfileState();
}

class _DriverProfileState extends State<DriverProfile> {
  static const _burgundy = Color(0xFF59011A);
  static const _border = Color(0xFFC9A47A);

  int _bottomIndex = 1;

  bool _turkishSelected = true;
  bool _darkSelected = false;

  // =========================================================================
  // controller
  final DriverProfileController _controller = DriverProfileController();
  final LogoutController _logoutController = LogoutController();
  final UserPreferencesService _prefs = UserPreferencesService();
  final ThemeService _themeService = ThemeService();

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onControllerChanged);
    _logoutController.addListener(_onLogoutControllerChanged);
    _controller.fetch();
    _loadPreferences();

    DriverLocalizationService().addListener(_onLanguageChanged);
    _themeService.addListener(_onThemeChanged);
  }

  // Load saved preferences
  Future<void> _loadPreferences() async {
    final turkishSelected = DriverLocalizationService().currentLanguage == 'tr';
    final darkSelected = !_themeService.isLight;
    
    if (mounted) {
      setState(() {
        _turkishSelected = turkishSelected;
        _darkSelected = darkSelected;
      });
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerChanged);
    _logoutController.removeListener(_onLogoutControllerChanged);
    DriverLocalizationService().removeListener(_onLanguageChanged);
    _themeService.removeListener(_onThemeChanged);
    super.dispose();
  }

  void _onControllerChanged() {
    if (!mounted) return;
    setState(() {});
  }

  void _onLanguageChanged() {
    if (!mounted) return;
    final isTurkish = DriverLocalizationService().currentLanguage == 'tr';
    if (_turkishSelected != isTurkish) {
      setState(() {
        _turkishSelected = isTurkish;
      });
    } else {
      setState(() {});
    }
  }

  void _onLogoutControllerChanged() {
    if (!mounted) return;
    setState(() {});
  }

  void _onThemeChanged() {
    if (!mounted) return;
    final isLight = _themeService.isLight;
    final isDarkSelected = !isLight;
    if (_darkSelected != isDarkSelected) {
      setState(() {
        _darkSelected = isDarkSelected;
      });
    } else {
      setState(() {});
    }
  }

  // =========================================================================
  // logout handler

  Future<void> _handleLogout() async {
    final confirmed = await showConfirmLogoutDialog(context: context);
    if (!confirmed) return;

    final success = await _logoutController.logout();

    if (!mounted) return;

    if (success) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    } else {
      final message = _logoutController.errorMessage ??
          'driver_profile_snackbar_logout_failed'.translate;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: _burgundy,
        ),
      );
    }
  }

  // =========================================================================
  // function to show the edit phone dialog
  Future<void> _showEditPhoneDialog({required String currentPhone}) async {
    final newPhone = await showEditPhoneDialog(
      context: context,
      currentPhone: currentPhone,
    );

    if (newPhone == null) return;

    final ok = await _controller.updatePhone(newPhone);

    if (!mounted) return;

    final message = ok
        ? 'driver_profile_snackbar_phone_updated'.translate
        : (_controller.errorMessage ?? 'driver_profile_snackbar_update_failed'.translate);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: ok ? Colors.green : _burgundy,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = _controller.profile;
    final name = profile?.name ?? '';
    final phone = profile?.phone ?? '';

    final theme = Theme.of(context);

    final cs = theme.colorScheme;

    

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,

      // app bar ================================================================================
      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0,
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

      // body ================================================================================
      body: SafeArea(
        child: PullToRefresh(
          onRefresh: () async {
            await _controller.fetch();
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'driver_profile_title'.translate,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                  ),
                ),

                //----------------------------------------------
                const SizedBox(height: 14),

                
                SectionCard(
                  borderColor: _border,
                  title: null,
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [

                            // driver name ----------------
                            Text(
                              name.isEmpty ? ' ' : name,
                              style:  TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: cs.onSurface,
                              ),
                            ),

                            const SizedBox(height: 4),

                            // driver phone ----------------
                            Text(
                              phone.isEmpty ? ' ' : phone,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: cs.onSurface,
                              ),
                            ),
                          ],
                        ),
                      ),
               
                    ],
                  ),
                ),

                //----------------------------------------------
                const SizedBox(height: 14),

                //----------------------------------------------
                SectionCard(
                  borderColor: _border,
                  title: 'driver_profile_contact_info'.translate,
                  child: Column(
                    children: [
                      // phone number ----------------
                      InfoRow(
                        label: 'driver_profile_phone_number'.translate,
                        value: phone.isEmpty ? ' ' : phone,
                        onEdit: profile == null
                            ? null
                            : () => _showEditPhoneDialog(currentPhone: phone),
                      ),
                      const SizedBox(height: 10),
                   
                      if (_controller.isLoading) ...[
                        const SizedBox(height: 10),
                        const LinearProgressIndicator(minHeight: 2),
                      ],
                      if (!_controller.isLoading && _controller.errorMessage != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          _controller.errorMessage!,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _burgundy,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                //----------------------------------------------
                const SizedBox(height: 14),

                //----------------------------------------------
                SectionCard(
                  borderColor: _border,
                  title: 'driver_profile_account_settings'.translate,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'driver_profile_language_preferences'.translate,
                        style:  TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: cs.onSurface ,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Center(
                        child: SettingsToggle(
                          selectedItemColor: _burgundy,
                          
                          leftText: 'driver_profile_language_english'.translate,
                          rightText: 'driver_profile_language_turkish'.translate,
                          selectedRight: _turkishSelected,
                          onChanged: (selectedRight) async {
                            setState(() {
                              _turkishSelected = selectedRight;
                            });
                            
                            // Save language preference
                            final languageCode = selectedRight ? 'tr' : 'en';
                            await _prefs.saveLanguage(languageCode);
                            
                            // Update localization service
                            await DriverLocalizationService().changeLanguage(languageCode);
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'driver_profile_appearance'.translate,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: cs.onSurface,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Center(
                        child: SettingsToggle(
                          selectedItemColor: _burgundy,
                          leftText: 'driver_profile_appearance_light'.translate,
                          rightText: 'driver_profile_appearance_dark'.translate,
                          selectedRight: _darkSelected,
                          onChanged: (selectedRight) async {
                            setState(() {
                              _darkSelected = selectedRight;
                            });
                            
                            // Save appearance preference
                            final appearance = selectedRight ? 'dark' : 'light';
                            await _prefs.saveAppearance(appearance);

                            // Apply theme
                            await _themeService.changeTheme(appearance);
                          },
                        ),
                      ),
                    ],
                  ),
                ),

                //----------------------------------------------
                const SizedBox(height: 14),

                //----------------------------------------------
                // Logout card
                LogoutCard(
                  borderColor: _border,
                  onTap: _handleLogout,
                ),
              ],
            ),
          ),
        ),
      ),
      //===========================================================================

      // bottom bar ===============================================================
      bottomNavigationBar: DriverBottomNavBar(
        currentIndex: _bottomIndex,
        backgroundColor: _burgundy,
        selectedItemColor: _border,
        unselectedItemColor: Colors.white,
        homeLabel: 'driver_profile_nav_home'.translate,
        profileLabel: 'driver_profile_nav_profile'.translate,
        onSelectHome: () {
          Navigator.of(context)
              .pushReplacement(_noAnimationRoute(const HomepageDriver()));
        },
        onSelectProfile: () {
          Navigator.of(context)
              .pushReplacement(_noAnimationRoute(const DriverProfile()));
        },
      ),

      //==============================================================================
    );
  }
}
//==============================================================================
// so we don't have animation bewteen surfing screens
PageRoute<void> _noAnimationRoute(Widget page) {
  return PageRouteBuilder<void>(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionDuration: Duration.zero,
    reverseTransitionDuration: Duration.zero,
  );
}
