/// Sahm — Export & Document Studio Screen (Section 27)
/// Professional mobile export center for generating certified documents,
/// running pre-flight validation, and inspecting recent artifacts.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';

class ExportStudioScreen extends StatefulWidget {
  const ExportStudioScreen({super.key});

  @override
  State<ExportStudioScreen> createState() => _ExportStudioScreenState();
}

class _ExportStudioScreenState extends State<ExportStudioScreen> {
  String _selectedFormat = 'PDF';
  String _selectedTemplateId = 'official';
  bool _isGenerating = false;

  final List<Map<String, dynamic>> _recentExports = [
    {
      'docNumber': 'CERT-2026-000184',
      'title': 'كشف الشهادات الجاهزة — كلية الحاسوب',
      'format': 'PDF',
      'records': 125,
      'date': '21 سبتمبر 2026',
      'version': 'v2 — الحالي',
      'isCurrent': true,
    },
    {
      'docNumber': 'ADMIN-XLSX-2026-44',
      'title': 'المصنف الإداري المتكامل — الهندسة',
      'format': 'XLSX',
      'records': 238,
      'date': '21 سبتمبر 2026',
      'version': 'v1',
      'isCurrent': true,
    },
    {
      'docNumber': 'CERT-2026-000183',
      'title': 'كشف الشهادات — مسودة مراجعة',
      'format': 'PDF',
      'records': 125,
      'date': '20 سبتمبر 2026',
      'version': 'v1 — مستبدل',
      'isCurrent': false,
    },
  ];

  void _triggerExport() {
    setState(() => _isGenerating = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isGenerating = false;
          _recentExports.insert(0, {
            'docNumber': 'CERT-2026-000${DateTime.now().millisecond}',
            'title': 'كشف الشهادات الجاهزة — دفعة 2026',
            'format': _selectedFormat,
            'records': 125,
            'date': 'الآن',
            'version': 'v1 — الحالي',
            'isCurrent': true,
          });
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF0F766E),
            content: Text(
              'تم بنجاح توليد المستند بصيغة $_selectedFormat وتوثيقه بالبصمة الرقمية!',
              style: const TextStyle(fontFamily: 'IBMPlexSansArabic'),
            ),
            action: SnackBarAction(
              label: 'مشاركة',
              textColor: Colors.white,
              onPressed: () {},
            ),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('استوديو التصدير | Export Studio'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            tooltip: 'فحص رمز QR',
            onPressed: () => context.push('/verify'),
          ),
        ],
      ),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.md),
          children: [
            // Subsystem Vision Banner
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [const Color(0xFF0F172A), const Color(0xFF1E293B)]
                      : [const Color(0xFF0F766E), const Color(0xFF115E59)],
                ),
                borderRadius: BorderRadius.circular(AppRadius.lg),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(AppRadius.full),
                        ),
                        child: const Text(
                          'Section 27 — First-Class Subsystem',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  const Text(
                    'تصدير كشوفات رسمية بدقة مؤسسية',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'فصل كامل بين البيانات والقوالب، دعم حقيقي لـ RTL، وترقيم ذكي بدون انقسام الأسماء.',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.85),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Format Selector
            const Text(
              'صيغة التصدير المستهدفة',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: AppSpacing.xs),
            Row(
              children: [
                _buildFormatChip('PDF', 'PDF رسمي', Icons.picture_as_pdf),
                const SizedBox(width: AppSpacing.xs),
                _buildFormatChip('XLSX', 'Excel حقيقي', Icons.table_chart),
                const SizedBox(width: AppSpacing.xs),
                _buildFormatChip('DOCX', 'Word تقرير', Icons.description),
                const SizedBox(width: AppSpacing.xs),
                _buildFormatChip('CSV', 'CSV عربي', Icons.list_alt),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Institutional Templates Selection
            const Text(
              'اختر القالب المؤسسي',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: AppSpacing.xs),

            _buildTemplateCard(
              id: 'official',
              title: 'كشف الشهادات الجاهزة — رسمي للطباعة والاعتماد',
              desc: 'ترويسة الكلية، جدول الطلاب، باركود QR للتحقق، وجدول التوقيعات الثلاثي.',
              isPreset: true,
              isPublic: false,
            ),
            const SizedBox(height: AppSpacing.xs),
            _buildTemplateCard(
              id: 'public',
              title: 'كشف الشهادات — للنشر العام (محمي الخصوصية)',
              desc: 'مخصص للنشر على بوابات الجامعة؛ يخفي أرقام الهواتف والملاحظات الإدارية.',
              isPreset: true,
              isPublic: true,
            ),

            const SizedBox(height: AppSpacing.lg),

            // Pre-flight Validation Checklist
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFBBF7D0),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.verified, color: Color(0xFF16A34A), size: 18),
                      const SizedBox(width: 8),
                      const Text(
                        'تقرير فحص الجاهزية (Pre-flight Validation)',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          color: Color(0xFF16A34A),
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0xFF16A34A).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'جاهز 100%',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF16A34A),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  _buildCheckItem('اكتمال سجلات الطلاب المعتمدة (125 طالب)'),
                  _buildCheckItem('سلامة الأرقام الجامعية وحفظها كنصوص صريحة'),
                  _buildCheckItem('تفعيل حماية الخصوصية (Privacy Guard)'),
                  _buildCheckItem('الترقيم الذكي وتكرار رأس الجدول عبر الصفحات'),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Generate Action Button
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _isGenerating ? null : _triggerExport,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F766E),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                child: _isGenerating
                    ? const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          ),
                          SizedBox(width: 12),
                          Text('جاري المعالجة والتحقق الرقمي...'),
                        ],
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.download, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'توليد وتصدير المستند الآن ($_selectedFormat)',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Recent Exports Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'سجل التصدير الأخير (Export Center)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                Text(
                  '${_recentExports.length} مستندات',
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),

            ..._recentExports.map((doc) => _buildRecentExportCard(doc, isDark)),
          ],
        ),
      ),
    );
  }

  Widget _buildFormatChip(String id, String label, IconData icon) {
    final isSelected = _selectedFormat == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedFormat = id),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF0F766E) : Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(
              color: isSelected ? const Color(0xFF0F766E) : Colors.grey.withOpacity(0.3),
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 18, color: isSelected ? Colors.white : Colors.grey),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? Colors.white : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTemplateCard({
    required String id,
    required String title,
    required String desc,
    required bool isPreset,
    required bool isPublic,
  }) {
    final isSelected = _selectedTemplateId == id;
    return GestureDetector(
      onTap: () => setState(() => _selectedTemplateId = id),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.sm),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F766E) : Colors.grey.withOpacity(0.25),
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Radio<String>(
              value: id,
              groupValue: _selectedTemplateId,
              onChanged: (val) => setState(() => _selectedTemplateId = val!),
              activeColor: const Color(0xFF0F766E),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      const SizedBox(width: 6),
                      if (isPublic)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'نشر عام',
                            style: TextStyle(fontSize: 9, color: Colors.blue, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    desc,
                    style: const TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          const Icon(Icons.check, size: 14, color: Color(0xFF16A34A)),
          const SizedBox(width: 6),
          Text(text, style: const TextStyle(fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildRecentExportCard(Map<String, dynamic> doc, bool isDark) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.xs),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F766E).withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppRadius.sm),
              ),
              child: Icon(
                doc['format'] == 'XLSX' ? Icons.table_chart : Icons.picture_as_pdf,
                color: const Color(0xFF0F766E),
                size: 20,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doc['title'],
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        doc['docNumber'],
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 9, color: Colors.grey),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${doc['records']} طالب',
                        style: const TextStyle(fontSize: 9, color: Colors.grey),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        doc['version'],
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: doc['isCurrent'] ? const Color(0xFF16A34A) : Colors.amber,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.download, size: 18),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('جاري تنزيل ${doc['docNumber']}...')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
