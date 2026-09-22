/// Sahm — Batch Review Screen for Mobile (Prompt 17)
/// Allows mobile field operators to review exceptions, duplicates,
/// and candidates before final synchronization to central servers.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';

class MobileCertificateItem {
  final int sequence;
  final String studentName;
  final String universityId;
  final String certNumber;
  final double qualityScore;
  final String status; // 'completed', 'needs_review', 'duplicate'
  final String? warningReason;

  MobileCertificateItem({
    required this.sequence,
    required this.studentName,
    required this.universityId,
    required this.certNumber,
    required this.qualityScore,
    required this.status,
    this.warningReason,
  });
}

class BatchReviewScreen extends StatefulWidget {
  const BatchReviewScreen({super.key});

  @override
  State<BatchReviewScreen> createState() => _BatchReviewScreenState();
}

class _BatchReviewScreenState extends State<BatchReviewScreen> {
  String _selectedFilter = 'all';

  final List<MobileCertificateItem> _items = [
    MobileCertificateItem(
      sequence: 1,
      studentName: 'أحمد محمد عبد الله الشامي',
      universityId: '2022101045',
      certNumber: 'CERT-2026-0045',
      qualityScore: 94.5,
      status: 'completed',
    ),
    MobileCertificateItem(
      sequence: 2,
      studentName: 'سارة طارق إبراهيم الصالح',
      universityId: '2022101089',
      certNumber: 'CERT-2026-0089',
      qualityScore: 68.0,
      status: 'needs_review',
      warningReason: 'سنة التخرج المستخرجة 2025 تخالف دفعة 2026',
    ),
    MobileCertificateItem(
      sequence: 3,
      studentName: 'خالد وليد منصور العريقي',
      universityId: '2022101112',
      certNumber: 'CERT-2026-0112',
      qualityScore: 89.0,
      status: 'duplicate',
      warningReason: 'تطابق إدراكي بصري dHash مع الشهادة #1',
    ),
    MobileCertificateItem(
      sequence: 4,
      studentName: 'مروان عبد الحكيم قاسم',
      universityId: '2022101999',
      certNumber: 'CERT-2026-0999',
      qualityScore: 85.0,
      status: 'needs_review',
      warningReason: 'طالب مرشح غير موجود بالقاعدة (Missing Student)',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filtered = _items.where((i) {
      if (_selectedFilter == 'all') return true;
      if (_selectedFilter == 'needs_review') return i.status == 'needs_review';
      if (_selectedFilter == 'duplicate') return i.status == 'duplicate';
      if (_selectedFilter == 'completed') return i.status == 'completed';
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('مراجعة وتدقيق الدفعة'),
        actions: [
          IconButton(
            icon: const Icon(Icons.cloud_upload_outlined),
            tooltip: 'مزامنة مع السيرفر',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('تمت مزامنة بيانات الدفعة بنجاح مع خادم سهم المركزي'),
                  backgroundColor: SahmColors.success,
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                _buildFilterChip('all', 'الكل (${_items.length})'),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'needs_review',
                  'تدقيق معلق (${_items.where((i) => i.status == 'needs_review').length})',
                  color: Colors.amber,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'duplicate',
                  'تكرارات (${_items.where((i) => i.status == 'duplicate').length})',
                  color: Colors.redAccent,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'completed',
                  'معتمد (${_items.where((i) => i.status == 'completed').length})',
                  color: SahmColors.success,
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Items List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = filtered[index];
                return _buildCertificateCard(context, item, isDark);
              },
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? SahmColors.surfaceDark : SahmColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: ElevatedButton.icon(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('تم إرسال الدفعة للاعتماد الرسمي وتوليد تقرير المراجعة'),
              ),
            );
            context.pop();
          },
          icon: const Icon(Icons.check_circle_outline),
          label: const Text('اعتماد ومزامنة الدفعة بالكامل'),
          style: ElevatedButton.styleFrom(
            backgroundColor: SahmColors.accent,
            foregroundColor: SahmColors.primaryDark,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(String key, String label, {Color? color}) {
    final isSelected = _selectedFilter == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: (color ?? SahmColors.accent).withOpacity(0.2),
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        color: isSelected ? (color ?? SahmColors.accent) : null,
      ),
      onSelected: (_) {
        setState(() {
          _selectedFilter = key;
        });
      },
    );
  }

  Widget _buildCertificateCard(BuildContext context, MobileCertificateItem item, bool isDark) {
    final isCompleted = item.status == 'completed';
    final isDuplicate = item.status == 'duplicate';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? SahmColors.surfaceDark : SahmColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isCompleted
              ? SahmColors.success.withOpacity(0.3)
              : isDuplicate
                  ? Colors.redAccent.withOpacity(0.3)
                  : Colors.amber.withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '#${item.sequence}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  item.studentName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(
                isCompleted
                    ? Icons.check_circle
                    : isDuplicate
                        ? Icons.copy_rounded
                        : Icons.warning_amber_rounded,
                color: isCompleted
                    ? SahmColors.success
                    : isDuplicate
                        ? Colors.redAccent
                        : Colors.amber,
                size: 18,
              ),
            ],
          ),

          const SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'الرقم: ${item.universityId}',
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? SahmColors.textSecondaryDark : SahmColors.textSecondary,
                ),
              ),
              Text(
                'الشهادة: ${item.certNumber}',
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? SahmColors.textSecondaryDark : SahmColors.textSecondary,
                ),
              ),
              Text(
                'الجودة: ${item.qualityScore.toInt()}%',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: item.qualityScore >= 80 ? SahmColors.success : Colors.amber,
                ),
              ),
            ],
          ),

          if (item.warningReason != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 14, color: Colors.amber),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      item.warningReason!,
                      style: const TextStyle(fontSize: 11, color: Colors.amber),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
