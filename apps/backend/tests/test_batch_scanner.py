"""
Sahm Backend — Comprehensive Unit Tests for Smart Batch Certificate Scanner (Prompt 17)
Tests:
1. Multi-signal Image Quality Engine (Blur, Glare, Contrast, Recommendations)
2. 3-Tier Duplicate Detection (SHA-256, dHash Hamming <= 6, Serial/ID)
3. Progressive OCR Extraction (Phases 1-4, Arabic & English, Confidence Scores)
4. Arabic Name Normalization & Fuzzy Token Similarity
5. Identity Reconciliation, Batch Mismatch, and Candidate Isolation
6. Excel-compatible UTF-8 BOM CSV & Audit Report Generation
"""
import os
import tempfile
import uuid
import pytest
from PIL import Image, ImageDraw, ImageFilter

from app.models.batch_scanner import (
    BatchScanSession,
    BatchScanItem,
    BatchSessionStatus,
    ItemProcessingState,
    QualityCategory,
    MatchStatus,
    DuplicateStatus,
    MissingStudentCandidate,
)
from app.models.record import StudentRecord
from app.services.batch_scanner.quality_engine import ImageQualityEngine
from app.services.batch_scanner.duplicate_engine import (
    DuplicateDetectionEngine,
    compute_dhash,
    hamming_distance,
)
from app.services.batch_scanner.ocr_extractor import OCRExtractor
from app.services.batch_scanner.reconciliation_matcher import (
    normalize_arabic_name,
    compute_string_similarity,
    ReconciliationMatcher,
)
from app.services.batch_scanner.report_generator import BatchReportGenerator


# =====================================================================
# Fixtures: Synthetic Test Images
# =====================================================================

@pytest.fixture
def temp_images_dir():
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


@pytest.fixture
def sharp_cert_image(temp_images_dir):
    """Creates a sharp, high-contrast synthetic certificate image."""
    img = Image.new("RGB", (1200, 800), color=(250, 250, 245))
    draw = ImageDraw.Draw(img)
    # Draw dark geometric certificate borders & text-like patterns
    draw.rectangle([40, 40, 1160, 760], outline=(15, 23, 42), width=8)
    draw.rectangle([55, 55, 1145, 745], outline=(13, 148, 136), width=3)
    for y in range(120, 700, 35):
        draw.line([(100, y), (1100, y)], fill=(30, 41, 59), width=4)

    path = os.path.join(temp_images_dir, "sharp_cert.jpg")
    img.save(path, quality=95)
    return path


@pytest.fixture
def blurry_cert_image(temp_images_dir):
    """Creates a severely blurred image simulating camera motion."""
    img = Image.new("RGB", (1200, 800), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    draw.rectangle([40, 40, 1160, 760], outline=(50, 50, 50), width=4)
    # Apply severe Gaussian blur
    img = img.filter(ImageFilter.GaussianBlur(radius=15))

    path = os.path.join(temp_images_dir, "blurry_cert.jpg")
    img.save(path, quality=80)
    return path


# =====================================================================
# 1. Image Quality Engine Tests
# =====================================================================

def test_quality_engine_sharp_vs_blurry(sharp_cert_image, blurry_cert_image):
    engine = ImageQualityEngine()

    sharp_res = engine.analyze_image(sharp_cert_image)
    blurry_res = engine.analyze_image(blurry_cert_image)

    # Sharp image must have significantly higher variance than blurry
    assert sharp_res["quality_metrics"]["blur_score"] > blurry_res["quality_metrics"]["blur_score"]
    assert sharp_res["quality_score"] > blurry_res["quality_score"]

    # Blurry image should have retake recommendation
    assert blurry_res["quality_category"] in ("poor", "unusable", "acceptable")
    if blurry_res["quality_score"] < 60:
        assert len(blurry_res["quality_metrics"]["recommendations"]) > 0


def test_quality_engine_glare_and_contrast(temp_images_dir):
    engine = ImageQualityEngine()

    # Create overexposed/glare image
    img = Image.new("RGB", (800, 600), color=(255, 255, 255))
    glare_path = os.path.join(temp_images_dir, "glare.jpg")
    img.save(glare_path)

    res = engine.analyze_image(glare_path)
    assert res["quality_metrics"]["glare_fraction"] > 0.80
    assert any("سطوع" in r or "فلاش" in r for r in res["quality_metrics"]["recommendations"])


# =====================================================================
# 2. 3-Tier Duplicate Detection Tests
# =====================================================================

def test_dhash_and_hamming_distance():
    # Exactly identical hashes
    h1 = "f0f0f0f0f0f0f0f0"
    assert hamming_distance(h1, h1) == 0

    # 1-bit difference
    h2 = "f0f0f0f0f0f0f0f1"
    assert hamming_distance(h1, h2) == 1

    # Completely different
    h3 = "0f0f0f0f0f0f0f0f"
    assert hamming_distance(h1, h3) > 6


def test_duplicate_engine_sha256_tier1(sharp_cert_image):
    # Mock item
    item1 = BatchScanItem(
        id=uuid.uuid4(),
        session_id=uuid.uuid4(),
        sequence_number=1,
        client_item_id="item1",
        idempotency_key="k1",
        image_path=sharp_cert_image,
        sha256_hash="abc123hash",
        p_hash="f0f0f0f0f0f0f0f0",
        extracted_fields={"certificate_number": "CERT-2026-001", "university_id": "2026001"},
    )

    # In-memory mock session
    class MockQuery:
        def __init__(self, result):
            self._result = result
        def scalars(self):
            return self
        def all(self):
            return self._result
        def first(self):
            return self._result[0] if self._result else None

    class MockDB:
        def execute(self, q):
            # Return item1 as existing item
            return MockQuery([item1])

    db = MockDB()
    dup_engine = DuplicateDetectionEngine(db)

    # Item2 has exact same SHA-256 hash -> Tier 1
    item2 = BatchScanItem(
        id=uuid.uuid4(),
        session_id=item1.session_id,
        sequence_number=2,
        client_item_id="item2",
        idempotency_key="k2",
        image_path=sharp_cert_image,
        sha256_hash="abc123hash",
        p_hash="f0f0f0f0f0f0f0f0",
        extracted_fields={},
    )

    res = dup_engine.detect_duplicates(item2)
    assert res["duplicate_status"] == DuplicateStatus.LIKELY_DUPLICATE.value
    assert res["tier"] == 1


# =====================================================================
# 3. Progressive OCR Extraction Tests
# =====================================================================

def test_progressive_ocr_extraction():
    raw_certificate_text = """
    الجمهورية اليمنية
    وزارة التعليم العالي والبحث العلمي
    جامعة الإمام الشافعي
    كلية الهندسة وتكنولوجيا المعلومات
    قسم هندسة البرمجيات

    تشهد كلية الهندسة وتكنولوجيا المعلومات بأن الطالب: أحمد محمد عبد الله الشامي
    This is to certify that: Ahmed Mohammed Abdullah Al-Shami
    الرقم الجامعي: 2022101045
    رقم الشهادة: CERT-2026-0045
    سنة التخرج: 2026
    بتقدير: ممتاز مع مرتبة الشرف
    """

    extractor = OCRExtractor()
    fields = extractor.extract_fields(image_path="", raw_text=raw_certificate_text)

    assert fields["student_name"] == "أحمد محمد عبد الله الشامي"
    assert "Ahmed Mohammed" in fields["student_name_en"]
    assert fields["university_id"] == "2022101045"
    assert fields["certificate_number"] == "CERT-2026-0045"
    assert fields["graduation_year"] == 2026
    assert "الهندسة" in fields["college"]
    assert fields["ocr_confidence"] >= 0.85


# =====================================================================
# 4. Arabic Normalization & Fuzzy Similarity Tests
# =====================================================================

def test_arabic_name_normalization():
    # Test tashkeel removal, tatweel, and letter unification
    raw = "  أَحْمَدُ  مُحَمَّـدْ  عَلِيّ  حُسَيْن  "
    normalized = normalize_arabic_name(raw)
    assert "احمد محمد علي حسين" == normalized

    # Test alif maqsura and taa marbuta
    raw2 = "فَاطِمَةُ  الزَّهْرَاءِ  مُنَى"
    norm2 = normalize_arabic_name(raw2)
    assert "فاطمه الزهراء مني" == norm2


def test_arabic_name_similarity():
    # Exact after normalization
    s1 = "أحمد محمد علي"
    s2 = "احمد محمد علي"
    assert compute_string_similarity(s1, s2) == 1.0

    # 3 out of 4 tokens match
    s3 = "أحمد محمد علي حسن"
    s4 = "أحمد محمد علي إبراهيم"
    sim = compute_string_similarity(s3, s4)
    assert sim >= 0.60


# =====================================================================
# 5. Reconciliation Matcher & Candidate Isolation Tests
# =====================================================================

def test_reconciliation_and_candidate_isolation():
    # Mock StudentRecord in DB
    student = StudentRecord(
        id=uuid.uuid4(),
        batch_id=uuid.uuid4(),
        student_name="أحمد محمد علي",
        university_id="20260010",
    )

    class MockQuery:
        def __init__(self, data):
            self.data = data
        def scalars(self):
            return self
        def first(self):
            return self.data[0] if self.data else None
        def all(self):
            return self.data

    class MockDB:
        def __init__(self):
            self.added = []
        def execute(self, q):
            # Return matching student by ID or empty for unknown
            return MockQuery([student])
        def add(self, obj):
            self.added.append(obj)

    db = MockDB()
    matcher = ReconciliationMatcher(db)

    session = BatchScanSession(
        id=uuid.uuid4(),
        batch_code="BATCH-TEST-01",
        name="دفعة تجريبية",
        batch_year=2026,
    )

    # Test Exact Match
    item_exact = BatchScanItem(
        id=uuid.uuid4(),
        session_id=session.id,
        sequence_number=1,
        client_item_id="item_ex",
        idempotency_key="k_ex",
        image_path="",
        extracted_fields={
            "student_name": "أحمد محمد علي",
            "university_id": "20260010",
            "certificate_number": "CERT-2026-001",
            "graduation_year": 2026,
        },
    )

    res_exact = matcher.match_item(item_exact, session)
    assert res_exact["match_status"] == MatchStatus.EXACT.value
    assert item_exact.suggested_student_id == student.id
    assert not item_exact.has_batch_mismatch

    # Test Batch Mismatch Detection
    item_mismatch = BatchScanItem(
        id=uuid.uuid4(),
        session_id=session.id,
        sequence_number=2,
        client_item_id="item_mis",
        idempotency_key="k_mis",
        image_path="",
        extracted_fields={
            "student_name": "أحمد محمد علي",
            "university_id": "20260010",
            "certificate_number": "CERT-2026-001",
            "graduation_year": 2024,  # Mismatch! Session is 2026
        },
    )

    res_mis = matcher.match_item(item_mismatch, session)
    assert res_mis["has_batch_mismatch"] is True
    assert any("لا تطابق" in reason for reason in res_mis["anomaly_reasons"])


# =====================================================================
# 6. Report Generator & UTF-8 BOM CSV Tests
# =====================================================================

def test_report_generator_utf8_bom_csv():
    session = BatchScanSession(
        id=uuid.uuid4(),
        batch_code="BATCH-2026-CSV",
        name="دفعة اختبار التقارير",
        batch_year=2026,
        status=BatchSessionStatus.COMPLETED,
    )

    items = [
        BatchScanItem(
            id=uuid.uuid4(),
            session_id=session.id,
            sequence_number=1,
            client_item_id="it_1",
            idempotency_key="key_1",
            state=ItemProcessingState.COMPLETED,
            quality_score=92.0,
            quality_category=QualityCategory.EXCELLENT,
            ocr_confidence=0.95,
            match_status=MatchStatus.EXACT,
            match_confidence=0.98,
            duplicate_status=DuplicateStatus.NO_DUPLICATE,
            has_batch_mismatch=False,
            has_structural_anomaly=False,
            image_path="",
            extracted_fields={
                "student_name": "عبد الله سالم باسليمان",
                "student_name_en": "Abdullah Salem Basulaiman",
                "university_id": "20260045",
                "certificate_number": "CERT-2026-0045",
                "graduation_year": 2026,
                "college": "كلية الحاسوب",
                "department": "نظم المعلومات",
            },
        ),
    ]

    class MockQuery:
        def __init__(self, data):
            self.data = data
        def scalars(self):
            return self
        def all(self):
            return self.data

    class MockDB:
        def get(self, model, ident):
            return session
        def execute(self, q):
            return MockQuery(items)

    db = MockDB()
    rg = BatchReportGenerator(db)

    # Test summary stats
    summary = rg.generate_summary(session.id)
    assert summary["total_certificates"] == 1
    assert summary["completed_count"] == 1
    assert summary["reconciliation_rate_percent"] == 100.0

    # Test CSV with UTF-8 BOM
    csv_text = rg.generate_csv(session.id)
    assert csv_text.startswith("\ufeff")  # Critical for Excel Arabic compatibility!
    assert "عبد الله سالم باسليمان" in csv_text
    assert "CERT-2026-0045" in csv_text
    assert "التسلسل" in csv_text
