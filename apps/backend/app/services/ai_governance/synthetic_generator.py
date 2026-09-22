"""
Sahm Backend — Synthetic Benchmark Data Generator (Prompt 19)
Generates high-fidelity synthetic Arabic student records for safe evaluation without real student PII.
"""
import random
from typing import List, Dict, Any

FIRST_NAMES = ["أحمد", "محمد", "عثمان", "إبراهيم", "علي", "فاطمة", "سارة", "زينب", "عمر", "مريم", "يوسف", "حسن"]
MIDDLE_NAMES = ["عبد الله", "مصطفى", "صالح", "إدريس", "بابكر", "النور", "الشيخ", "محمود", "طه", "عوض"]
LAST_NAMES = ["إبراهيم", "عثمان", "علي", "خليل", "حسن", "الزاكي", "البشير", "الطيب", "مبارك", "فضل الله"]
FACULTIES = [
    "كلية دراسات الحاسوب وتكنولوجيا المعلومات",
    "كلية الهندسة والتقنية",
    "كلية الطب البشري",
    "كلية الاقتصاد والعلوم الإدارية",
    "كلية الشريعة والقانون",
]
PROGRAMS = [
    "علوم الحاسوب",
    "تقنية المعلومات",
    "هندسة البرمجيات",
    "نظم المعلومات الإدارية",
    "الطب والجراحة",
]


def generate_synthetic_record(year: int = 2026, prefix: str = "2022") -> Dict[str, Any]:
    """Generates a single synthetic student record."""
    first = random.choice(FIRST_NAMES)
    middle = random.choice(MIDDLE_NAMES)
    last = random.choice(LAST_NAMES)
    full_name = f"{first} {middle} {last}"

    uni_id = f"{prefix}{random.randint(10000, 99999)}"
    cert_no = f"CERT-{year}-{random.randint(100000, 999999)}"
    faculty = random.choice(FACULTIES)
    program = random.choice(PROGRAMS)

    return {
        "student_name": full_name,
        "university_id": uni_id,
        "certificate_number": cert_no,
        "faculty": faculty,
        "program": program,
        "graduation_year": year,
        "degree": "بكالوريوس",
        "data_classification": "synthetic",
    }


def generate_synthetic_dataset(count: int = 25) -> List[Dict[str, Any]]:
    """Generates a batch of synthetic student records."""
    return [generate_synthetic_record() for _ in range(count)]
