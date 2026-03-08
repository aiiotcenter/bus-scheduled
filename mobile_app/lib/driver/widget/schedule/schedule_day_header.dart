//========================================================
//? importing
//========================================================
import 'package:flutter/material.dart';

//========================================================

class ScheduleDayHeader extends StatelessWidget {
  final String day;
  final String date;
  final bool isExpanded;
  final VoidCallback? onToggle;

  const ScheduleDayHeader({
    super.key,
    required this.day,
    required this.date,
    required this.isExpanded,
    this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Material(
      color: cs.surfaceTint,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onToggle,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Expanded(
                // Day  --------------------------------
                child: Text(
                  day,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: cs.onSurface,
                  ),
                ),
              ),
              // Date  -------------------------------------------------
              Text(
                date,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: cs.onSurface,
                ),
              ),

              // view full day schedule --------------------------------
              if (onToggle != null) ...[
                const SizedBox(width: 10),
                Container(
                  width: 30,
                  height: 28,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: cs.secondary),
                    color: cs.surface,
                  ),
                  alignment: Alignment.center,
                  child: AnimatedRotation(
                    turns: isExpanded ? 0.5 : 0.0,
                    duration: const Duration(milliseconds: 180),
                    child: Icon(
                      Icons.keyboard_arrow_down_rounded,
                      size: 22,
                      color: cs.secondary,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
