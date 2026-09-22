/// Sahm — Stat Card Widget
/// Displays a metric with an icon, used in the dashboard overview.
library;

import 'package:flutter/material.dart';

import '../../core/theme.dart';

class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(SahmSpacing.base),
      decoration: BoxDecoration(
        color: isDark ? SahmColors.surfaceDark : SahmColors.surface,
        borderRadius: BorderRadius.circular(SahmRadius.lg),
        border: Border.all(
          color: isDark ? SahmColors.borderDark : SahmColors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: SahmTypography.labelSmall.copyWith(
                    color: isDark
                        ? SahmColors.textSecondaryDark
                        : SahmColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(SahmRadius.sm),
                ),
                child: Icon(icon, size: 18, color: color),
              ),
            ],
          ),
          Text(
            value,
            style: SahmTypography.number.copyWith(
              color: isDark
                  ? SahmColors.textPrimaryDark
                  : SahmColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
