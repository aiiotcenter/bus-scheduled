//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

import '../../service/localization/localization_service.dart';

//========================================================
//? widget
//========================================================

// design welcoming card ( name - time, date, day )=========================================================================================
class WelcomeCard extends StatelessWidget {
  final Color borderColor;
  final String driverName;
  final String time;
  final String date;
  final String weekday;

  const WelcomeCard({
    super.key,
    required this.borderColor,
    required this.driverName,
    required this.time,
    required this.date,
    required this.weekday,
  });

  //----------------------------------------------------------------------------------------
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

      // build the first widget (welcoming box )====================================================================================================================
      child: Column(
        children: [
          // welcome driver and photo  ----------------------------------------------------------------
          Row(
            children: [
              Expanded(
                child: Text(
                  '${'driver_home_welcome_prefix'.translate} ${driverName.isEmpty ? '' : driverName}',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: cs.onBackground,
                  ),
                ),
              ),
            ],
          ),
          //----------------------------------------------------------------------------------------

          //-----------------------------
          const SizedBox(height: 12),

          // divider line----------------------------------------------------------------------------------------
          Container(height: 1, width: double.infinity, color: borderColor),

          //------------------------------
          const SizedBox(height: 12),

          // view (time, date, day) ----------------------------------------------------------------------------------------
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // TIME -------------------
              Text(
                time,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: cs.onBackground,
                ),
              ),

              // DATE -------------------
              Text(
                date,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: cs.onBackground,
                ),
              ),

              // DAY -------------------
              Text(
                weekday,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: cs.onBackground,
                ),
              ),
            ],
          ),
          //----------------------------------------------------------------------------------------
        ],
      ),
    );
  }
}
