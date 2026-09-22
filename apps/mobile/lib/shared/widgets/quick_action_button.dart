/// Sahm — Quick Action Button Widget
/// Compact action buttons for the dashboard.
library;

import 'package:flutter/material.dart';

import '../../core/theme.dart';

class QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const QuickActionButton({
    super.key,
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(SahmRadius.lg),
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: SahmSpacing.base,
          horizontal: SahmSpacing.md,
        ),
        decoration: BoxDecoration(
          color: isDark ? SahmColors.surfaceDark : SahmColors.surface,
          borderRadius: BorderRadius.circular(SahmRadius.lg),
          border: Border.all(
            color: isDark ? SahmColors.borderDark : SahmColors.border,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(SahmRadius.md),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: SahmSpacing.sm),
            Text(
              label,
              style: SahmTypography.labelSmall.copyWith(
                color: isDark
                    ? SahmColors.textPrimaryDark
                    : SahmColors.textPrimary,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
