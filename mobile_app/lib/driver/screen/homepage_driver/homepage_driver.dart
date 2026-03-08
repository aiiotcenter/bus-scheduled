//========================================================
//? importing
//========================================================
import 'dart:async';

import 'package:flutter/material.dart';

import '../driver_profile/driver_profile.dart';

import '../../controller/homepage/driver_homepage_header_controller.dart';
import '../../controller/schedule/bus_schedule/bus_schedule_controller.dart';
import '../../widget/homepage/welcome_card.dart';
import '../../widget/homepage/schedule_section.dart';
import '../../widget/driver_bottom_nav_bar.dart';
import '../../../common/pull_to_refresh.dart';

//========================================================
class HomepageDriver extends StatefulWidget {
  const HomepageDriver({super.key});

  @override
  State<HomepageDriver> createState() => _HomepageDriverState();
}

class _HomepageDriverState extends State<HomepageDriver> {
  static const _border = Color(0xFFC9A47A);


  int _bottomIndex = 0;



  // =========================================================================
  // controller
  final DriverHomepageHeaderController _headerController =
      DriverHomepageHeaderController();

  final DriverBusScheduleController _scheduleController =
      DriverBusScheduleController();

  final Set<String> _expandedDays = <String>{};

  Timer? _clockTimer;
  DateTime _now = DateTime.now();

  // ---------------------------------------------------
  @override
  void initState() {
    super.initState();

    _headerController.addListener(_onHeaderChanged);
    _headerController.fetch();

    _scheduleController.addListener(_onScheduleChanged);
    _scheduleController.fetch();

    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _now = DateTime.now();
      });
    });
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    _headerController.removeListener(_onHeaderChanged);
    _scheduleController.removeListener(_onScheduleChanged);
    super.dispose();
  }

  void _onHeaderChanged() {
    if (!mounted) return;
    setState(() {});
  }

  void _onScheduleChanged() {
    if (!mounted) return;
    setState(() {});
  }

  // ============================================================================================================
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    final time =
        '${_now.hour.toString().padLeft(2, '0')}:${_now.minute.toString().padLeft(2, '0')}';
    final date =
        '${_now.day.toString().padLeft(2, '0')}/${_now.month.toString().padLeft(2, '0')}/${_now.year}';
    final weekday = _weekdayLabel(_now.weekday);

    final driverName = _headerController.driverName;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,

      // app bar to view logo ---------------------------------------------------
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

      // ---------------------------------------------------
      body: SafeArea(
        child: PullToRefresh(
          onRefresh: () async {
            await _headerController.fetch();
            await _scheduleController.fetch();
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 14),
                WelcomeCard(
                  borderColor: _border,
                  driverName: driverName,
                  time: time,
                  date: date,
                  weekday: weekday,
                ),

                const SizedBox(height: 22),

                // schedule section ---------------------------------------------------
                DriverScheduleSection(
                  controller: _scheduleController,
                  borderColor: _border,
                  expandedDays: _expandedDays,
                  onToggleDay: (dayKey, isExpanded) {
                    setState(() {
                      if (isExpanded) {
                        _expandedDays.remove(dayKey);
                      } else {
                        _expandedDays.add(dayKey);
                      }
                    });
                  },
                ),


              ],
            ),
          ),
        ),
      ),

      // bottom navigation bar ---------------------------------------------------
      bottomNavigationBar: DriverBottomNavBar(
        currentIndex: _bottomIndex,
        backgroundColor: theme.bottomNavigationBarTheme.backgroundColor ??
            theme.appBarTheme.backgroundColor ??
            cs.primary,
        selectedItemColor:
            theme.bottomNavigationBarTheme.selectedItemColor ?? cs.secondary,
        unselectedItemColor:
            theme.bottomNavigationBarTheme.unselectedItemColor ?? cs.onPrimary,
        homeLabel: 'Home',
        profileLabel: 'Profile',
        onSelectHome: () {
          Navigator.of(context)
              .pushReplacement(_noAnimationRoute(const HomepageDriver()));
        },
        onSelectProfile: () {
          Navigator.of(context)
              .pushReplacement(_noAnimationRoute(const DriverProfile()));
        },
      ),
      //===========================================================================================
    );
  }

  //----------------------------------------------------------------------------------------
  String _weekdayLabel(int weekday) {
    switch (weekday) {
      case DateTime.monday:
        return 'Monday';
      case DateTime.tuesday:
        return 'Tuesday';
      case DateTime.wednesday:
        return 'Wednesday';
      case DateTime.thursday:
        return 'Thursday';
      case DateTime.friday:
        return 'Friday';
      case DateTime.saturday:
        return 'Saturday';
      case DateTime.sunday:
        return 'Sunday';
      default:
        return '';
    }
  }
}
//----------------------------------------------------------------------------------------

PageRoute<void> _noAnimationRoute(Widget page) {
  return PageRouteBuilder<void>(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionDuration: Duration.zero,
    reverseTransitionDuration: Duration.zero,
  );
}
