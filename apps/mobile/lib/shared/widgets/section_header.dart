/// Sahm — Section Header Widget
library;

import 'package:flutter/material.dart';

import '../../core/theme.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final String? trailing;
  final VoidCallback? onTrailingTap;

  const SectionHeader({
    super.key,
    required this.title,
    this.trailing,
    this.onTrailingTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: SahmTypography.h4.copyWith(
            color: isDark
                ? SahmColors.textPrimaryDark
                : SahmColors.textPrimary,
          ),
        ),
        if (trailing != null)
          TextButton(
            onPressed: onTrailingTap,
            child: Text(
              trailing!,
              style: SahmTypography.labelSmall.copyWith(
                color: isDark ? SahmColors.accent : SahmColors.primary,
              ),
            ),
          ),
      ],
    );
  }
}
