# منصة سهم | Sahm — وثيقة التأسيس والـ Master Prompt

> **الرؤية**: من القوائم المكتوبة بخط اليد إلى منظومة ذكية للبحث والتوثيق والنشر  
> **الهدف**: إدارة دورة حياة الشهادات الجامعية في كبرى الجامعات، مع استخراج ذكي للبيانات، مراجعة دقيقة، وبناء كشوفات وتصدير رسمي عالي الاحترافية.

---

## المبادئ الأساسية للمنظومة

1. **فصل البيانات عن العرض (Data ≠ Presentation)**:  
   قاعدة البيانات المركزية تحتوي على سجلات الطلاب المعتمدة وتاريخها التوثيقي. طريقة العرض (سواء كانت كشفاً رسمياً للطباعة والتوقيع، أو ملف Excel للعمل الإداري الداخلي، أو وثيقة PDF للنشر العام، أو تقريراً إحصائياً) تتحدد بالكامل عبر قوالب مرنة ومستقلة دون المساس بالسجلات الأصلية أو تكرار إدخالها.

2. **المنظومة الفرعية للتصدير ليست مجرد زر (Subsystem, Not a Button)**:  
   التصدير في سهم هو منظومة متكاملة تسمى **Export & Document Studio**، تخضع لدورة حياة كاملة:  
   `Choose Dataset → Choose Template → Customize Layout → Preview → Validate → Export → Version & Archive`.

3. **سلامة اللغة العربية والاتجاه (True RTL & Bidi Integrity)**:  
   احترام كامل للاتجاه من اليمين لليسار، تشكيل الحروف العربية، ومنع تشويه الأرقام الجامعية (حفظها كنصوص صريحة لمنع التدوير أو التحويل لرموز علمية في برامج الجداول).

4. **الأمان والخصوصية (Privacy Guard & Safe QR Verification)**:  
   الرموز الشريطية ورموز الاستجابة السريعة (QR) تحتوي على معرّفات تحقق عشوائية ومحمية تقود لصفحة استعلام مؤسسية معتمدة، ولا تحتوي مباشرة على بيانات الطلاب الحساسة.

---

# 27. EXPORT & DOCUMENT STUDIO

The export system must be treated as a first-class product subsystem, not as a simple file-download feature.

Build a professional **Export & Document Studio** that separates structured data from presentation and allows authorized users to create, customize, validate, preview, version, and export professional documents.

## Supported formats

Support, where technically appropriate:

* PDF
* XLSX
* CSV
* DOCX
* HTML
* JSON
* XML
* TXT
* PNG/JPG for controlled visual exports
* Native printing / print-ready output

Each format must have an appropriate renderer rather than relying on naive format conversion.

## Template Designer

Implement a visual template designer supporting:

* Drag and drop layout.
* Header.
* Footer.
* Logo.
* Text blocks.
* Dynamic fields.
* Tables.
* Images.
* QR codes.
* Signature blocks.
* Notes.
* Page numbers.
* Dates.
* Metadata.
* Section headings.

Allow users to configure:

* Page size.
* Orientation.
* Margins.
* Typography.
* Font size.
* Font weight.
* Alignment.
* Spacing.
* Borders.
* Backgrounds.
* Element dimensions.
* Element position.
* RTL/LTR behavior.
* Visibility.
* Conditional visibility.
* Locked elements.

Provide alignment guides and grid snapping.

## Dynamic Template Fields

Support safe dynamic fields such as:

{{ university.name }}
{{ college.name }}
{{ department.name }}
{{ program.name }}
{{ batch.year }}
{{ report.title }}
{{ records.count }}
{{ page.number }}
{{ page.total }}
{{ generated_at }}
{{ approved_by }}

Do not permit arbitrary code execution inside templates.

Use a controlled template expression system.

## Table Designer

Allow authorized users to:

* Select columns.
* Reorder columns.
* Resize columns.
* Configure alignment.
* Configure wrapping.
* Configure row height.
* Configure header style.
* Configure borders.
* Configure sorting.
* Configure grouping.
* Configure numbering.
* Configure repeated table headers.
* Configure page breaks.
* Configure subtotal and summary rows.

Support very large tables without loading all rendered rows into mobile memory.

## Smart Pagination

The PDF/document renderer must:

* Prevent unintended row splitting.
* Repeat table headers.
* Preserve section headings where possible.
* Support explicit page breaks.
* Support page numbering.
* Support dynamic page totals.
* Respect margins.
* Detect overflow.
* Prevent clipped content.
* Handle Arabic RTL correctly.
* Handle mixed Arabic/English content correctly.
* Preserve university IDs without bidi corruption.

## Grouping

Support hierarchical grouping such as:

College
→ Department
→ Program
→ Student Records

Allow each group to:

* Start on a new page.
* Display a heading.
* Display record counts.
* Display summaries.
* Continue naturally across pages.

## Conditional Formatting

Allow rule-based presentation such as:

* Certificate status.
* Missing fields.
* Review status.
* College.
* Department.
* Academic year.

Conditional formatting must never modify the underlying official data.

## Export Profiles

Allow users to save reusable export profiles.

Example:

Certificate Ready — Public

* PDF
* Public template
* Approved records only
* Name
* University ID
* Program
* No private fields

Certificate Ready — Internal

* XLSX
* Internal template
* Additional administrative fields

## Preview

Every complex export must support a preview before final generation.

Provide:

* Page thumbnails.
* Zoom.
* Page navigation.
* Search.
* Full-screen preview.
* Validation status.

Do not allow a consequential public publication to bypass required validation and approval.

## Export Validation

Before final generation, validate:

Data:

* Required fields.
* Duplicate identifiers.
* Missing values.
* Approved-state requirements.

Layout:

* Overflow.
* Clipping.
* Invalid page dimensions.
* Missing fonts.
* Image quality.
* Overlapping elements.

Privacy:

* Restricted fields.
* Public/private template rules.
* User authorization.

Pagination:

* Missing records.
* Broken rows.
* Unexpected blank pages.
* Repeated headers.

Return a structured validation report.

## XLSX Renderer

Generate real XLSX workbooks, not renamed CSV files.

Support:

* Multiple worksheets.
* Real Excel tables where appropriate.
* Filters.
* Freeze panes.
* Column widths.
* Wrapping.
* RTL where supported.
* Print areas.
* Page setup.
* Headers and footers.
* Data validation.
* Summary sheets.
* Metadata sheets.
* Validation sheets.

Preserve identifiers as strings.

Prevent Excel from silently converting university IDs into numbers, scientific notation, or dates.

## DOCX Renderer

Support reusable document templates containing:

* University branding.
* Titles.
* Paragraphs.
* Tables.
* Dynamic fields.
* Signature blocks.
* Page headers and footers.
* Arabic RTL content.

## PDF Renderer

The PDF renderer must support:

* A4/A3/A5/Letter/Legal/custom sizes.
* Portrait and landscape.
* Arabic fonts.
* RTL.
* Mixed-direction text.
* High-quality printing.
* Repeated table headers.
* Page numbering.
* Headers and footers.
* QR codes.
* Digital metadata.
* Controlled document identifiers.

## QR Verification

When enabled, QR codes must contain a secure verification identifier rather than sensitive student information.

A verification page may display only information authorized by institutional policy.

Do not embed private student information directly into QR payloads.

## Versioning

Every generated official document must have a version.

Example:

Certificate List — Version 1
Certificate List — Version 2 — Current

Preserve previous versions according to retention policy.

Track:

* Creator.
* Approver.
* Publisher.
* Creation time.
* Approval time.
* Publication time.
* Version.
* Source dataset.
* Template version.
* Change reason.

## Batch Export

Allow authorized users to generate multiple documents in one operation.

Example:

Computer Studies.pdf
Engineering.pdf
Economics.pdf
Medicine.pdf

Optionally package generated files into a ZIP archive.

Provide a batch generation report containing:

* Requested files.
* Successful files.
* Failed files.
* Record counts.
* Error details.

## Export Center

Create a dedicated Export Center displaying:

* Recent exports.
* In-progress jobs.
* Failed jobs.
* Completed jobs.
* Template used.
* Dataset used.
* Record count.
* File format.
* Version.
* Creator.
* Creation date.
* Validation status.

Support:

* Open.
* Download.
* Duplicate template.
* Create new version.
* View validation report.
* View audit history.

## Template Library

Implement an institution-level template library.

Templates may include:

* Public certificate list.
* Internal certificate list.
* Graduation list.
* College report.
* Department report.
* Administrative report.
* Official letter.
* Archive export.

Templates must support permissions such as:

* View.
* Use.
* Edit.
* Duplicate.
* Publish.
* Delete.

Never delete an actively referenced template version without a controlled migration process.

## Data and Presentation Separation

The export system must strictly separate:

1. Source data.
2. Approved records.
3. Export dataset.
4. Template.
5. Renderer.
6. Generated artifact.

Changing a template must never modify the underlying student records.

Changing the underlying records must not mutate an already-generated historical document.

## Export Integrity

For every generated official artifact, store metadata including:

* Artifact ID.
* Dataset/version ID.
* Template ID/version.
* Generator version.
* Creation timestamp.
* Creator.
* Approval state.
* File hash.

This enables later verification that an archived document has not been silently modified.

## Performance

Large exports must run as background jobs.

Do not block the mobile UI or API request while generating large PDF/XLSX/DOCX files.

Show:

* Queued.
* Processing.
* Finalizing.
* Completed.
* Failed.

Support cancellation where safe.

## Acceptance Criteria

A user must be able to:

1. Select an approved dataset.
2. Select or create a template.
3. Customize its layout.
4. Configure table columns.
5. Configure Arabic RTL presentation.
6. Preview the result.
7. Run validation.
8. Fix detected issues.
9. Generate the final file.
10. Download or publish it according to permissions.
11. Reopen its audit history.
12. Create a new version without modifying the historical artifact.

The export subsystem must be precise enough for official university documents and flexible enough to support different colleges, departments, report types, and publication policies.
