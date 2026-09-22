"""
Sahm Backend — AI Evaluation & Metrics Engine (Prompt 19)
Computes CER, WER, Field Exact Match, Arabic Normalized Accuracy, and Critical Safety Match Metrics.
"""
import re
from typing import List, Dict, Any, Tuple


def levenshtein_distance(s1: str, s2: str) -> int:
    """Computes standard edit distance between two sequences."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


def calculate_cer(reference: str, hypothesis: str) -> float:
    """
    Calculates Character Error Rate (CER): (S + D + I) / len(reference).
    Returns a float between 0.0 (perfect) and 1.0+ (poor).
    """
    ref_clean = reference.strip()
    hyp_clean = hypothesis.strip()

    if not ref_clean and not hyp_clean:
        return 0.0
    if not ref_clean:
        return 1.0

    dist = levenshtein_distance(ref_clean, hyp_clean)
    return dist / max(len(ref_clean), 1)


def calculate_wer(reference: str, hypothesis: str) -> float:
    """
    Calculates Word Error Rate (WER): edit distance on word tokens.
    """
    ref_words = reference.strip().split()
    hyp_words = hypothesis.strip().split()

    if not ref_words and not hyp_words:
        return 0.0
    if not ref_words:
        return 1.0

    # Token-level Levenshtein
    m, n = len(ref_words), len(hyp_words)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if ref_words[i - 1] == hyp_words[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])

    return dp[m][n] / max(len(ref_words), 1)


def normalize_arabic_for_search(text: str) -> str:
    """
    Applies lenient normalization for search matching:
    - Normalizes alefs: أ, إ, آ -> ا
    - Normalizes teh marbuta: ة -> ه
    - Normalizes alef maksura: ى -> ي
    - Strips tashkeel / diacritics
    - Collapses multiple whitespace
    """
    if not text:
        return ""

    s = text
    # Strip diacritics
    s = re.sub(r"[\u064B-\u065F\u0670]", "", s)
    # Normalize alefs
    s = re.sub(r"[إأآا]", "ا", s)
    # Teh marbuta
    s = re.sub(r"ة", "ه", s)
    # Alef maksura
    s = re.sub(r"ى", "ي", s)
    # Normalize spaces
    s = re.sub(r"\s+", " ", s).strip()
    return s


def calculate_arabic_accuracy_levels(reference: str, hypothesis: str) -> Dict[str, bool]:
    """
    Evaluates extraction under two distinct lenses:
    - raw_exact: Exact character-by-character match (respecting official hamzas)
    - search_normalized: Lenient match under Arabic search normalization
    """
    raw_exact = reference.strip() == hypothesis.strip()
    norm_exact = normalize_arabic_for_search(reference) == normalize_arabic_for_search(hypothesis)

    return {
        "raw_exact": raw_exact,
        "search_normalized": norm_exact,
    }


def calculate_matching_safety_metrics(
    evaluations: List[Tuple[bool, bool]]
) -> Dict[str, float]:
    """
    Calculates identity and duplicate matching metrics from pairs of:
    (ground_truth_is_match, predicted_is_match).

    Crucial Focus: False Positive Match Rate is treated as high-risk safety metric.
    """
    tp = 0
    fp = 0
    fn = 0
    tn = 0

    for actual, pred in evaluations:
        if actual and pred:
            tp += 1
        elif not actual and pred:
            fp += 1
        elif actual and not pred:
            fn += 1
        else:
            tn += 1

    total = len(evaluations)
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    # False Positive Rate = FP / (FP + TN)
    false_positive_rate = fp / max(fp + tn, 1)

    return {
        "total_samples": total,
        "true_positives": tp,
        "false_positives": fp,
        "true_negatives": tn,
        "false_negatives": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "false_positive_rate": round(false_positive_rate, 6),
        "is_safety_compliant": false_positive_rate <= 0.0005,  # <= 0.05% threshold
    }
