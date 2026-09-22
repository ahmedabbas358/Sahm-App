/// Sahm — Settings Screen
/// Theme toggle, language, sync status, and app info.
library;

import 'package:flutter/material.dart';

import '../../core/theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isDarkMode = false;
  bool _isArabic = true;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('الإعدادات'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(SahmSpacing.base),
        children: [
          // Profile section
          Container(
            padding: const EdgeInsets.all(SahmSpacing.base),
            decoration: BoxDecoration(
              color: isDark ? SahmColors.surfaceDark : SahmColors.surface,
              borderRadius: BorderRadius.circular(SahmRadius.lg),
              border: Border.all(
                color: isDark ? SahmColors.borderDark : SahmColors.border,
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: SahmColors.accent.withOpacity(0.2),
                  child: Text(
                    'أ',
                    style: SahmTypography.h3.copyWith(
                      color: SahmColors.accent,
                    ),
                  ),
                ),
                const SizedBox(width: SahmSpacing.base),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'أحمد عباس',
                        style: SahmTypography.label.copyWith(
                          color: isDark
                              ? SahmColors.textPrimaryDark
                              : SahmColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'مشغّل — قسم الامتحانات',
                        style: SahmTypography.bodySmall.copyWith(
                          color: isDark
                              ? SahmColors.textSecondaryDark
                              : SahmColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: SahmSpacing.xl),

          // Appearance
          _buildSectionTitle('المظهر', isDark),
          _buildSettingTile(
            icon: Icons.dark_mode_outlined,
            title: 'الوضع الداكن',
            trailing: Switch(
              value: _isDarkMode,
              onChanged: (v) => setState(() => _isDarkMode = v),
              activeColor: SahmColors.accent,
            ),
            isDark: isDark,
          ),
          _buildSettingTile(
            icon: Icons.language,
            title: 'العربية',
            trailing: Switch(
              value: _isArabic,
              onChanged: (v) => setState(() => _isArabic = v),
              activeColor: SahmColors.accent,
            ),
            isDark: isDark,
          ),

          const SizedBox(height: SahmSpacing.xl),

          // Sync
          _buildSectionTitle('المزامنة', isDark),
          _buildSettingTile(
            icon: Icons.sync,
            title: 'حالة المزامنة',
            subtitle: 'آخر مزامنة: قبل 5 دقائق',
            isDark: isDark,
          ),
          _buildSettingTile(
            icon: Icons.backup_outlined,
            title: 'النسخ الاحتياطي',
            subtitle: 'Google Drive',
            isDark: isDark,
          ),

          const SizedBox(height: SahmSpacing.xl),

          // App Info
          _buildSectionTitle('حول التطبيق', isDark),
          _buildSettingTile(
            icon: Icons.info_outline,
            title: 'الإصدار',
            subtitle: '0.1.0 (Phase 1)',
            isDark: isDark,
          ),
          _buildSettingTile(
            icon: Icons.description_outlined,
            title: 'التوثيق',
            isDark: isDark,
          ),

          const SizedBox(height: SahmSpacing.xxxl),

          // Logout
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.logout, color: SahmColors.error),
            label: Text(
              'تسجيل الخروج',
              style: SahmTypography.label.copyWith(color: SahmColors.error),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: SahmColors.error),
            ),
          ),
          const SizedBox(height: SahmSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SahmSpacing.sm),
      child: Text(
        title,
        style: SahmTypography.labelSmall.copyWith(
          color: isDark
              ? SahmColors.textTertiaryDark
              : SahmColors.textTertiary,
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    required bool isDark,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 1),
      child: ListTile(
        leading: Icon(
          icon,
          size: 22,
          color: isDark ? SahmColors.textSecondaryDark : SahmColors.textSecondary,
        ),
        title: Text(
          title,
          style: SahmTypography.body.copyWith(
            color: isDark
                ? SahmColors.textPrimaryDark
                : SahmColors.textPrimary,
          ),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle,
                style: SahmTypography.caption.copyWith(
                  color: isDark
                      ? SahmColors.textTertiaryDark
                      : SahmColors.textTertiary,
                ),
              )
            : null,
        trailing: trailing ??
            Icon(
              Icons.chevron_left,
              color: isDark
                  ? SahmColors.textTertiaryDark
                  : SahmColors.textTertiary,
            ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: SahmSpacing.base,
          vertical: SahmSpacing.xs,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SahmRadius.md),
        ),
      ),
    );
  }
}
