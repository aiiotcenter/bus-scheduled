//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

import '../../controller/schedule/bus_schedule/bus_schedule_controller.dart';
import '../../service/localization/localization_service.dart';

import '../schedule/schedule_day_header.dart';
import '../schedule/schedule_trip_card.dart';

//========================================================
class DriverScheduleSection extends StatelessWidget {
  static const _burgundy = Color(0xFF59011A);

  final DriverBusScheduleController controller;
  final Color borderColor;
  final Set<String> expandedDays;
  final void Function(String dayKey, bool isExpanded) onToggleDay;

  const DriverScheduleSection({
    super.key,
    required this.controller,
    required this.borderColor,
    required this.expandedDays,
    required this.onToggleDay,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'driver_schedule_title'.translate,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
            color: cs.onBackground,
          ),
        ),
        const SizedBox(height: 20),
        if (controller.isLoading) ...[
          // loading indicator ------------------------------------------------
          Center(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 22),
              child: CircularProgressIndicator(color: _burgundy),
            ),
          ),
        ] else ...[
          // view error message if error occured or no schedule found ----------------------------------------------
          if (controller.errorMessage != null &&
              controller.errorMessage!.trim().isNotEmpty) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
              decoration: BoxDecoration(
                color: const Color(0x00FFFFFF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: Text(
                controller.errorMessage!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: cs.onBackground,
                ),
              ),
            ),
          ],
          // view schedule ---------------------------------------------------
          ...controller.days.expand(_buildDaySectionWidgets),
        ],
      ],
    );
  }

  Iterable<Widget> _buildDaySectionWidgets(dynamic day) {
    final dayKey = '${day.day}|${day.date}';
    final isExpanded = expandedDays.contains(dayKey);
    final details = day.scheduleDetails;

    return <Widget>[
      ScheduleDayHeader(
        day: day.day,
        date: day.date,
        isExpanded: isExpanded,
        onToggle: () => onToggleDay(dayKey, isExpanded),
      ),

      
      const SizedBox(height: 12),


      AnimatedSize(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeInOut,
        alignment: Alignment.topCenter,
        clipBehavior: Clip.hardEdge,
        child: Column(
          children: [
            if (isExpanded && details.isNotEmpty) ...[
              for (final trip in details) ...[
                ScheduleTripCard(
                  borderColor: borderColor,
                  time: trip.time,
                  busText: _busText(trip.busId, trip.busPlate),
                  routeName: trip.routeName,
                  routeColor: trip.routeColor,
                ),
                const SizedBox(height: 18),
              ],
            ]
          ],
        ),
      ),
      const SizedBox(height: 12),
    ];
  }

  // ========================================================================
  
  // function to get bus text 
  String _busText(String busId, String busPlate) {
    final id = busId.trim();
    final plate = busPlate.trim();
    if (id.isEmpty) return plate;
    if (plate.isEmpty) return id;
    return '$id  $plate';
  }
}
