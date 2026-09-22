/// Sahm — Recent Batch Card Widget
/// Shows a batch summary with progress and status.
library;

import 'package:flutter/material.dart';

import '../../core/theme.dart';

class RecentBatchCard extends StatelessWidget {
  final String name;
  final int recordCount;
  final String status;
  final double progress;

  const RecentBatchCard({
    super.key,
    required this.name,
    required this.recordCount,
    required this.status,
    required this.progress,
  });

  Color get _statusColor {
    switch (status) {
      case 'draft':
        return SahmColors.textTertiary;
      case 'reviewing':
        return SahmColors.warning;
      case 'approved':
        return SahmColors.success;
      case 'published':
        return SahmColors.info;
      default:
        return SahmColors.textTertiary;
    }
  }

  String get _statusLabel {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'reviewing':
        return 'قيد المراجعة';
      case 'approved':
        return 'معتمدة';
      case 'published':
        return 'منشورة';
      default:
        return status;
    }
  }

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
        children: [
          // Header row
          Row(
            children: [
              Expanded(
                child: Text(
                  name,
                  style: SahmTypography.label.copyWith(
                    color: isDark
                        ? SahmColors.textPrimaryDark
                        : SahmColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: SahmSpacing.sm),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: SahmSpacing.sm,
                  vertical: SahmSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: _statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(SahmRadius.full),
                ),
                child: Text(
                  _statusLabel,
                  style: SahmTypography.caption.copyWith(
                    color: _statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: SahmSpacing.md),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(SahmRadius.full),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 4,
              backgroundColor: isDark
                  ? SahmColors.surfaceSecondaryDark
                  : SahmColors.surfaceSecondary,
              valueColor: AlwaysStoppedAnimation<Color>(_statusColor),
            ),
          ),
          const SizedBox(height: SahmSpacing.sm),

          // Footer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '$recordCount سجل',
                style: SahmTypography.caption.copyWith(
                  color: isDark
                      ? SahmColors.textTertiaryDark
                      : SahmColors.textTertiary,
                ),
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: SahmTypography.caption.copyWith(
                  color: _statusColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
