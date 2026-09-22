/// Sahm — Search Bar Widget
/// Central search bar for Universal Student Search.
library;

import 'package:flutter/material.dart';

import '../../core/theme.dart';

class SahmSearchBar extends StatelessWidget {
  final ValueChanged<String>? onChanged;
  final VoidCallback? onVoiceSearch;

  const SahmSearchBar({
    super.key,
    this.onChanged,
    this.onVoiceSearch,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? SahmColors.surfaceDark : SahmColors.surface,
        borderRadius: BorderRadius.circular(SahmRadius.lg),
        border: Border.all(
          color: isDark ? SahmColors.borderDark : SahmColors.border,
        ),
        boxShadow: SahmShadows.sm,
      ),
      child: TextField(
        onChanged: onChanged,
        decoration: InputDecoration(
          hintText: 'ابحث بالاسم أو الرقم الجامعي...',
          prefixIcon: Icon(
            Icons.search,
            color: isDark ? SahmColors.textTertiaryDark : SahmColors.textTertiary,
          ),
          suffixIcon: IconButton(
            icon: Icon(
              Icons.mic_outlined,
              color: isDark ? SahmColors.textTertiaryDark : SahmColors.textTertiary,
            ),
            onPressed: onVoiceSearch,
          ),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          filled: false,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: SahmSpacing.base,
            vertical: SahmSpacing.md,
          ),
        ),
      ),
    );
  }
}
