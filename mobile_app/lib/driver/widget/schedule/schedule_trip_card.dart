//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

//========================================================

class ScheduleTripCard extends StatelessWidget {
  final Color borderColor;
  final String time;
  final String busText;
  final String routeName;
  final Color routeColor;

  const ScheduleTripCard({
    super.key,
    required this.borderColor,
    required this.time,
    required this.busText,
    required this.routeName,
    required this.routeColor,
  });

  // ===========================================================
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0x00FFFFFF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(

                // time -------------------------------------------------------------
                child: Text(
                  time,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                  ),
                ),
              ),

              // Bus data---------------------------------------------------
              Text(
                busText,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: cs.onSurface,
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          // Route name  ---------------------------------------------------------------
          Container(
            height: 36,
            width: double.infinity,
            decoration: BoxDecoration(
              color: routeColor,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.centerLeft,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              routeName,
              style: TextStyle(
                color: _textColorFor(routeColor),
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _textColorFor(Color bg) {
    final brightness = ThemeData.estimateBrightnessForColor(bg);
    return brightness == Brightness.dark ? Colors.white : Colors.black;
  }
}
