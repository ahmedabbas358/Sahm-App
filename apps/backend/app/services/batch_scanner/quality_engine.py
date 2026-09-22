"""
Sahm Backend — Image Quality Engine (Prompt 17 - Sections 13, 14, 15)
Multi-signal image clarity evaluation: Blur, Brightness, Contrast, Glare,
Aspect ratio, and actionable retake recommendations.
"""
import math
import os
from typing import Any, Dict, List, Tuple
from PIL import Image, ImageStat

from app.models.batch_scanner import QualityCategory


class ImageQualityEngine:
    """
    Evaluates image quality without requiring heavy C++ computer-vision binaries,
    ensuring resilient O(1) memory evaluation on both mobile servers and low-end hardware.
    """

    @classmethod
    def analyze_image(cls, image_path: str) -> Dict[str, Any]:
        """
        Executes multi-signal quality analysis on a certificate image.
        Returns overall score, individual metrics, quality category, and retake recommendations.
        """
        if not os.path.exists(image_path):
            return {
                "overall_score": 0.0,
                "category": QualityCategory.UNUSABLE.value,
                "blur_score": 0.0,
                "brightness_score": 0.0,
                "contrast_score": 0.0,
                "glare_score": 0.0,
                "is_usable": False,
                "recommendations": ["الملف غير موجود أو تالف (File missing or corrupt)"],
            }

        try:
            with Image.open(image_path) as img:
                img_rgb = img.convert("RGB")
                img_gray = img.convert("L")
                width, height = img.size

                # 1. Resolution Check
                min_dim = min(width, height)
                res_score = min(100.0, (min_dim / 1200.0) * 100.0)

                # 2. Brightness / Exposure (Mean Luminance 0-255)
                stat = ImageStat.Stat(img_gray)
                mean_luminance = stat.mean[0]
                # Optimal luminance is between 110 and 180
                if 110 <= mean_luminance <= 180:
                    brightness_score = 100.0
                elif mean_luminance < 110:
                    brightness_score = max(10.0, (mean_luminance / 110.0) * 100.0)
                else:
                    brightness_score = max(10.0, (1.0 - (mean_luminance - 180.0) / 75.0) * 100.0)

                # 3. Contrast (Standard Deviation of gray levels)
                std_dev = stat.stddev[0]
                contrast_score = min(100.0, (std_dev / 50.0) * 100.0)

                # 4. Glare / Highlight clipping (Fraction of pixels > 250)
                histogram = img_gray.histogram()
                total_pixels = width * height
                near_white_pixels = sum(histogram[250:])
                glare_fraction = near_white_pixels / max(1, total_pixels)
                glare_score = max(0.0, 100.0 - (glare_fraction * 500.0))

                # 5. Blur / Sharpness estimation via high-frequency neighbor variance
                # Subsample thumbnail to keep memory bounded and fast
                thumb = img_gray.resize((160, 160), Image.Resampling.BILINEAR)
                pixels = list(thumb.getdata())
                diffs = []
                for y in range(159):
                    for x in range(159):
                        idx = y * 160 + x
                        diff = abs(pixels[idx] - pixels[idx + 1]) + abs(pixels[idx] - pixels[idx + 160])
                        diffs.append(diff)
                avg_diff = sum(diffs) / len(diffs)
                # Sharp certificates typically have avg_diff >= 8.0
                blur_score = min(100.0, (avg_diff / 10.0) * 100.0)

                # Aggregate Overall Quality Score (Weighted combination)
                overall_score = (
                    blur_score * 0.35 +
                    brightness_score * 0.25 +
                    contrast_score * 0.20 +
                    glare_score * 0.10 +
                    res_score * 0.10
                )
                overall_score = round(max(0.0, min(100.0, overall_score)), 1)

                # Categorization
                if overall_score >= 85.0:
                    category = QualityCategory.EXCELLENT
                elif overall_score >= 70.0:
                    category = QualityCategory.GOOD
                elif overall_score >= 50.0:
                    category = QualityCategory.ACCEPTABLE
                elif overall_score >= 30.0:
                    category = QualityCategory.POOR
                else:
                    category = QualityCategory.UNUSABLE

                # Actionable Retake Recommendations
                recommendations: List[str] = []
                if blur_score < 45.0:
                    recommendations.append("الصورة غير حادة أو مهزوزة؛ يُرجى تثبيت الهاتف أثناء الالتقاط (Too blurry).")
                if mean_luminance < 75:
                    recommendations.append("إضاءة الشهادة منخفضة جداً؛ يُرجى تشغيل الفلاش أو تحسين الإضاءة (Too dark).")
                elif mean_luminance > 215:
                    recommendations.append("الصورة شديدة السطوع؛ يُرجى تجنب انعكاس الضوء المباشر (Overexposed).")
                if glare_fraction > 0.08:
                    recommendations.append("يوجد وهج وانعكاس ضوئي ساطع قد يطمس بيانات الشهادة (Strong glare).")
                if min_dim < 600:
                    recommendations.append("دقة الصورة منخفضة جداً؛ يُرجى الاقتراب من الشهادة (Low resolution).")

                sha256 = cls.compute_sha256(image_path)
                phash = cls.compute_phash(image_path)

                metrics_dict = {
                    "blur_score": round(blur_score, 1),
                    "brightness_score": round(brightness_score, 1),
                    "contrast_score": round(contrast_score, 1),
                    "glare_score": round(glare_score, 3),
                    "glare_fraction": round(glare_fraction, 3),
                    "recommendations": recommendations,
                }

                return {
                    "overall_score": overall_score,
                    "quality_score": overall_score,
                    "category": category.value,
                    "quality_category": category.value,
                    "blur_score": round(blur_score, 1),
                    "brightness_score": round(brightness_score, 1),
                    "contrast_score": round(contrast_score, 1),
                    "glare_score": round(glare_score, 3),
                    "resolution": f"{width}x{height}",
                    "is_usable": category != QualityCategory.UNUSABLE,
                    "recommendations": recommendations,
                    "quality_metrics": metrics_dict,
                    "sha256_hash": sha256,
                    "p_hash": phash,
                }

        except Exception as e:
            return {
                "overall_score": 0.0,
                "quality_score": 0.0,
                "category": QualityCategory.UNUSABLE.value,
                "quality_category": QualityCategory.UNUSABLE.value,
                "blur_score": 0.0,
                "brightness_score": 0.0,
                "contrast_score": 0.0,
                "glare_score": 0.0,
                "is_usable": False,
                "recommendations": [f"تعذر فحص الصورة: {str(e)}"],
                "quality_metrics": {
                    "blur_score": 0.0,
                    "brightness_score": 0.0,
                    "contrast_score": 0.0,
                    "glare_score": 0.0,
                    "recommendations": [str(e)],
                },
                "sha256_hash": "",
                "p_hash": "",
            }

    @classmethod
    def compute_sha256(cls, file_path: str) -> str:
        import hashlib
        if not os.path.exists(file_path):
            return ""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def compute_phash(cls, file_path: str) -> str:
        from app.services.batch_scanner.duplicate_engine import compute_dhash
        return compute_dhash(file_path)
