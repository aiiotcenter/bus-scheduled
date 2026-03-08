//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

//========================================================
class DriverBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Color backgroundColor;
  final Color selectedItemColor;
  final Color unselectedItemColor;

  final String homeLabel;
  final String profileLabel;

  final VoidCallback onSelectHome;
  final VoidCallback onSelectProfile;

  const DriverBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.backgroundColor,
    required this.selectedItemColor,
    required this.unselectedItemColor,
    required this.homeLabel,
    required this.profileLabel,
    required this.onSelectHome,
    required this.onSelectProfile,
  });

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (i) {
        if (i == currentIndex) return;

        if (i == 0) {
          onSelectHome();
          return;
        }

        if (i == 1) {
          onSelectProfile();
          return;
        }
      },
      type: BottomNavigationBarType.fixed,
      backgroundColor: backgroundColor,
      selectedItemColor: selectedItemColor,
      unselectedItemColor: unselectedItemColor,
      showSelectedLabels: false,
      showUnselectedLabels: false,
      items: [
        BottomNavigationBarItem(
          icon: const Icon(Icons.home_outlined),
          label: homeLabel,
        ),
        BottomNavigationBarItem(
          icon: const Icon(Icons.person_outline),
          label: profileLabel,
        ),
      ],
    );
  }
}
