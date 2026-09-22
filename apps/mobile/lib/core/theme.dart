/// Sahm — Design System
/// Colors, Typography, Spacing, and Theme configuration.
///
/// Design Philosophy:
/// - Clean, professional, minimal — inspired by Linear/Notion aesthetic
/// - Arabic RTL-first design
/// - High contrast for readability
/// - Limited color palette with purposeful use
library;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ============================================================================
// COLORS
// ============================================================================

class SahmColors {
  SahmColors._();

  // --- Primary (Deep Blue-Slate) ---
  static const primary = Color(0xFF1A1B2E);
  static const primaryLight = Color(0xFF2D2E45);
  static const primaryDark = Color(0xFF0F1020);

  // --- Accent (Warm Amber) ---
  static const accent = Color(0xFFE8A838);
  static const accentLight = Color(0xFFF0C060);
  static const accentDark = Color(0xFFD09020);

  // --- Success ---
  static const success = Color(0xFF34C759);
  static const successLight = Color(0xFFE8F9EE);
  static const successDark = Color(0xFF248A3D);

  // --- Warning ---
  static const warning = Color(0xFFFF9F0A);
  static const warningLight = Color(0xFFFFF3E0);
  static const warningDark = Color(0xFFCC7F08);

  // --- Error ---
  static const error = Color(0xFFFF3B30);
  static const errorLight = Color(0xFFFEECEB);
  static const errorDark = Color(0xFFCC2F26);

  // --- Info ---
  static const info = Color(0xFF5AC8FA);
  static const infoLight = Color(0xFFE8F7FE);

  // --- Neutrals (Light Mode) ---
  static const background = Color(0xFFFAFAFC);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSecondary = Color(0xFFF5F5F7);
  static const border = Color(0xFFE5E5EA);
  static const borderLight = Color(0xFFF0F0F2);
  static const textPrimary = Color(0xFF1A1B2E);
  static const textSecondary = Color(0xFF6B6B80);
  static const textTertiary = Color(0xFF9E9EB0);
  static const textOnPrimary = Color(0xFFFFFFFF);

  // --- Neutrals (Dark Mode) ---
  static const backgroundDark = Color(0xFF0F1020);
  static const surfaceDark = Color(0xFF1A1B2E);
  static const surfaceSecondaryDark = Color(0xFF252640);
  static const borderDark = Color(0xFF3A3B55);
  static const borderLightDark = Color(0xFF2D2E45);
  static const textPrimaryDark = Color(0xFFF5F5F7);
  static const textSecondaryDark = Color(0xFF9E9EB0);
  static const textTertiaryDark = Color(0xFF6B6B80);

  // --- Certificate Status Colors ---
  static const statusExtracted = Color(0xFF9E9EB0);
  static const statusReview = Color(0xFFFF9F0A);
  static const statusReviewed = Color(0xFF5AC8FA);
  static const statusApproved = Color(0xFF34C759);
  static const statusReady = Color(0xFF30D158);
  static const statusDelivered = Color(0xFF248A3D);
  static const statusCorrection = Color(0xFFFF6482);
  static const statusRejected = Color(0xFFFF3B30);
}

// ============================================================================
// SPACING
// ============================================================================

class SahmSpacing {
  SahmSpacing._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double base = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;
  static const double huge = 64;
}

// ============================================================================
// RADIUS
// ============================================================================

class SahmRadius {
  SahmRadius._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double full = 999;
}

// ============================================================================
// CONVENIENCE ALIASES (used by feature screens)
// ============================================================================

/// Alias for [SahmSpacing] — allows `AppSpacing.md` in widget code.
class AppSpacing {
  AppSpacing._();

  static const double xs = SahmSpacing.xs;
  static const double sm = SahmSpacing.sm;
  static const double md = SahmSpacing.md;
  static const double base = SahmSpacing.base;
  static const double lg = SahmSpacing.lg;
  static const double xl = SahmSpacing.xl;
  static const double xxl = SahmSpacing.xxl;
  static const double xxxl = SahmSpacing.xxxl;
  static const double huge = SahmSpacing.huge;
}

/// Alias for [SahmRadius] — allows `AppRadius.lg` in widget code.
class AppRadius {
  AppRadius._();

  static const double xs = SahmRadius.xs;
  static const double sm = SahmRadius.sm;
  static const double md = SahmRadius.md;
  static const double lg = SahmRadius.lg;
  static const double xl = SahmRadius.xl;
  static const double xxl = SahmRadius.xxl;
  static const double full = SahmRadius.full;
}

// ============================================================================
// TYPOGRAPHY
// ============================================================================

class SahmTypography {
  SahmTypography._();

  static String get _fontFamily => 'IBMPlexSansArabic';

  // Headings
  static TextStyle get h1 => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 32,
        fontWeight: FontWeight.w700,
        height: 1.3,
        letterSpacing: -0.5,
      );

  static TextStyle get h2 => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 24,
        fontWeight: FontWeight.w600,
        height: 1.3,
        letterSpacing: -0.3,
      );

  static TextStyle get h3 => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.4,
      );

  static TextStyle get h4 => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 18,
        fontWeight: FontWeight.w500,
        height: 1.4,
      );

  // Body
  static TextStyle get bodyLarge => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.6,
      );

  static TextStyle get body => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.6,
      );

  static TextStyle get bodySmall => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.5,
      );

  // Labels
  static TextStyle get label => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        height: 1.4,
      );

  static TextStyle get labelSmall => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.4,
      );

  // Caption
  static TextStyle get caption => TextStyle(
        fontFamily: _fontFamily,
        fontSize: 11,
        fontWeight: FontWeight.w400,
        height: 1.4,
        letterSpacing: 0.2,
      );

  // Numbers (for stats)
  static TextStyle get number => GoogleFonts.inter(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        height: 1.2,
      );

  static TextStyle get numberSmall => GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.2,
      );
}

// ============================================================================
// SHADOWS
// ============================================================================

class SahmShadows {
  SahmShadows._();

  static List<BoxShadow> get sm => [
        BoxShadow(
          color: Colors.black.withOpacity(0.04),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get md => [
        BoxShadow(
          color: Colors.black.withOpacity(0.06),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get lg => [
        BoxShadow(
          color: Colors.black.withOpacity(0.08),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
      ];
}

// ============================================================================
// THEME
// ============================================================================

class SahmTheme {
  SahmTheme._();

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        fontFamily: 'IBMPlexSansArabic',
        colorScheme: const ColorScheme.light(
          primary: SahmColors.primary,
          onPrimary: SahmColors.textOnPrimary,
          secondary: SahmColors.accent,
          onSecondary: SahmColors.primary,
          surface: SahmColors.surface,
          onSurface: SahmColors.textPrimary,
          error: SahmColors.error,
          onError: Colors.white,
          outline: SahmColors.border,
        ),
        scaffoldBackgroundColor: SahmColors.background,
        appBarTheme: AppBarTheme(
          backgroundColor: SahmColors.surface,
          foregroundColor: SahmColors.textPrimary,
          elevation: 0,
          scrolledUnderElevation: 1,
          centerTitle: true,
          titleTextStyle: SahmTypography.h4.copyWith(
            color: SahmColors.textPrimary,
          ),
        ),
        cardTheme: CardThemeData(
          color: SahmColors.surface,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(SahmRadius.lg),
            side: const BorderSide(color: SahmColors.border, width: 1),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: SahmColors.surfaceSecondary,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: SahmSpacing.base,
            vertical: SahmSpacing.md,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(SahmRadius.md),
            borderSide: const BorderSide(color: SahmColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(SahmRadius.md),
            borderSide: const BorderSide(color: SahmColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(SahmRadius.md),
            borderSide: const BorderSide(color: SahmColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(SahmRadius.md),
            borderSide: const BorderSide(color: SahmColors.error),
          ),
          hintStyle: SahmTypography.body.copyWith(
            color: SahmColors.textTertiary,
          ),
          labelStyle: SahmTypography.label.copyWith(
            color: SahmColors.textSecondary,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: SahmColors.primary,
            foregroundColor: SahmColors.textOnPrimary,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(SahmRadius.md),
            ),
            textStyle: SahmTypography.label,
            elevation: 0,
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: SahmColors.primary,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(SahmRadius.md),
            ),
            side: const BorderSide(color: SahmColors.border),
            textStyle: SahmTypography.label,
          ),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: SahmColors.accent,
          foregroundColor: SahmColors.primary,
          elevation: 2,
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: SahmColors.surface,
          selectedItemColor: SahmColors.primary,
          unselectedItemColor: SahmColors.textTertiary,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: SahmTypography.caption.copyWith(
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: SahmTypography.caption,
          elevation: 8,
        ),
        dividerTheme: const DividerThemeData(
          color: SahmColors.border,
          thickness: 1,
          space: 1,
        ),
        chipTheme: ChipThemeData(
          backgroundColor: SahmColors.surfaceSecondary,
          selectedColor: SahmColors.primary.withOpacity(0.1),
          labelStyle: SahmTypography.labelSmall,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(SahmRadius.full),
          ),
          side: const BorderSide(color: SahmColors.border),
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        fontFamily: 'IBMPlexSansArabic',
        colorScheme: const ColorScheme.dark(
          primary: SahmColors.accent,
          onPrimary: SahmColors.primaryDark,
          secondary: SahmColors.accent,
          onSecondary: SahmColors.primaryDark,
          surface: SahmColors.surfaceDark,
          onSurface: SahmColors.textPrimaryDark,
          error: SahmColors.error,
          onError: Colors.white,
          outline: SahmColors.borderDark,
        ),
        scaffoldBackgroundColor: SahmColors.backgroundDark,
        appBarTheme: AppBarTheme(
          backgroundColor: SahmColors.surfaceDark,
          foregroundColor: SahmColors.textPrimaryDark,
          elevation: 0,
          scrolledUnderElevation: 1,
          centerTitle: true,
          titleTextStyle: SahmTypography.h4.copyWith(
            color: SahmColors.textPrimaryDark,
          ),
        ),
        cardTheme: CardThemeData(
          color: SahmColors.surfaceDark,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(SahmRadius.lg),
            side: const BorderSide(color: SahmColors.borderDark, width: 1),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: SahmColors.surfaceSecondaryDark,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: SahmSpacing.base,
            vertical: SahmSpacing.md,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(SahmRadius.md),
            borderSide: const BorderSide(color: SahmColors.borderDark),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(SahmRadius.md),
            borderSide: const BorderSide(color: SahmColors.borderDark),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(SahmRadius.md),
            borderSide: const BorderSide(color: SahmColors.accent, width: 2),
          ),
          hintStyle: SahmTypography.body.copyWith(
            color: SahmColors.textTertiaryDark,
          ),
          labelStyle: SahmTypography.label.copyWith(
            color: SahmColors.textSecondaryDark,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: SahmColors.accent,
            foregroundColor: SahmColors.primaryDark,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(SahmRadius.md),
            ),
            textStyle: SahmTypography.label,
            elevation: 0,
          ),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: SahmColors.accent,
          foregroundColor: SahmColors.primaryDark,
          elevation: 2,
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: SahmColors.surfaceDark,
          selectedItemColor: SahmColors.accent,
          unselectedItemColor: SahmColors.textTertiaryDark,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: SahmTypography.caption.copyWith(
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: SahmTypography.caption,
          elevation: 8,
        ),
        dividerTheme: const DividerThemeData(
          color: SahmColors.borderDark,
          thickness: 1,
          space: 1,
        ),
      );
}
