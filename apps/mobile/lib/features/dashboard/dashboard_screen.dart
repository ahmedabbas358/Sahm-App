/// Sahm — Dashboard Screen
/// The main screen showing search bar, quick actions, and status overview.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../shared/widgets/stat_card.dart';
import '../../shared/widgets/search_bar_widget.dart';
import '../../shared/widgets/quick_action_button.dart';
import '../../shared/widgets/section_header.dart';
import '../../shared/widgets/recent_batch_card.dart';


class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isDark ? SahmColors.accent : SahmColors.primary,
                borderRadius: BorderRadius.circular(SahmRadius.sm),
              ),
              child: Center(
                child: Text(
                  'س',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: isDark ? SahmColors.primaryDark : Colors.white,
                    fontFamily: 'IBMPlexSansArabic',
                  ),
                ),
              ),
            ),
            const SizedBox(width: SahmSpacing.sm),
            Text(
              'سهم',
              style: SahmTypography.h4.copyWith(
                color: isDark
                    ? SahmColors.textPrimaryDark
                    : SahmColors.textPrimary,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: Refresh dashboard data
          await Future.delayed(const Duration(seconds: 1));
        },
        child: ListView(
          padding: const EdgeInsets.all(SahmSpacing.base),
          children: [
            // Search Bar
            const SahmSearchBar(),
            const SizedBox(height: SahmSpacing.xl),

            // Quick Actions
            const SectionHeader(title: 'إجراءات سريعة'),
            const SizedBox(height: SahmSpacing.md),
            Row(
              children: [
                Expanded(
                  child: QuickActionButton(
                    icon: Icons.document_scanner_outlined,
                    label: 'فاحص الدفعات',
                    color: SahmColors.accent,
                    onTap: () => context.push('/batch-scanner'),
                  ),
                ),
                const SizedBox(width: SahmSpacing.sm),
                Expanded(
                  child: QuickActionButton(
                    icon: Icons.camera_alt_outlined,
                    label: 'مسح قائمة',
                    color: SahmColors.info,
                    onTap: () {},
                  ),
                ),
                const SizedBox(width: SahmSpacing.sm),
                Expanded(
                  child: QuickActionButton(
                    icon: Icons.print_outlined,
                    label: 'استوديو التصدير',
                    color: SahmColors.success,
                    onTap: () => context.push('/export-studio'),
                  ),
                ),
                const SizedBox(width: SahmSpacing.sm),
                Expanded(
                  child: QuickActionButton(
                    icon: Icons.qr_code_scanner,
                    label: 'تحقق QR',
                    color: const Color(0xFF6366F1),
                    onTap: () => context.push('/verify'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: SahmSpacing.xl),

            // Statistics
            const SectionHeader(title: 'نظرة عامة'),
            const SizedBox(height: SahmSpacing.md),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: SahmSpacing.md,
              mainAxisSpacing: SahmSpacing.md,
              childAspectRatio: 1.6,
              children: const [
                StatCard(
                  title: 'تنتظر المراجعة',
                  value: '47',
                  icon: Icons.pending_actions_outlined,
                  color: SahmColors.warning,
                ),
                StatCard(
                  title: 'شهادات جاهزة',
                  value: '312',
                  icon: Icons.check_circle_outline,
                  color: SahmColors.success,
                ),
                StatCard(
                  title: 'إجمالي السجلات',
                  value: '1,248',
                  icon: Icons.people_outline,
                  color: SahmColors.info,
                ),
                StatCard(
                  title: 'دفعات نشطة',
                  value: '8',
                  icon: Icons.folder_outlined,
                  color: SahmColors.accent,
                ),
              ],
            ),
            const SizedBox(height: SahmSpacing.xl),

            // Recent Batches
            const SectionHeader(
              title: 'آخر الدفعات',
              trailing: 'عرض الكل',
            ),
            const SizedBox(height: SahmSpacing.md),
            const RecentBatchCard(
              name: 'كلية الحاسوب — بكالوريوس 2024',
              recordCount: 156,
              status: 'reviewing',
              progress: 0.72,
            ),
            const SizedBox(height: SahmSpacing.sm),
            const RecentBatchCard(
              name: 'كلية الهندسة — ماجستير 2024',
              recordCount: 43,
              status: 'approved',
              progress: 1.0,
            ),
            const SizedBox(height: SahmSpacing.sm),
            const RecentBatchCard(
              name: 'كلية العلوم — بكالوريوس 2023',
              recordCount: 89,
              status: 'draft',
              progress: 0.0,
            ),
            const SizedBox(height: SahmSpacing.xxl),
          ],
        ),
      ),
    );
  }
}
