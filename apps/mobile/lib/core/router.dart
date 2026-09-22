/// Sahm — Router Configuration
/// Uses GoRouter for declarative navigation with auth guards.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/login_screen.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/splash/splash_screen.dart';
import '../features/export_studio/export_studio_screen.dart';
import '../features/export_studio/qr_verification_screen.dart';
import '../features/batch_scanner/batch_scanner_screen.dart';
import '../features/batch_scanner/batch_review_screen.dart';
import '../shared/widgets/shell_scaffold.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    // Splash — shown on app start
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),

    // Login
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),

    // Batch Certificate Scanner (Prompt 17)
    GoRoute(
      path: '/batch-scanner',
      builder: (context, state) => const BatchScannerScreen(),
    ),

    // Batch Review Workspace
    GoRoute(
      path: '/batch-review',
      builder: (context, state) => const BatchReviewScreen(),
    ),

    // Export Studio
    GoRoute(
      path: '/export-studio',
      builder: (context, state) => const ExportStudioScreen(),
    ),

    // QR Verification
    GoRoute(
      path: '/verify',
      builder: (context, state) => const QrVerificationScreen(),
    ),

    // Main app shell with bottom navigation
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => ShellScaffold(child: child),
      routes: [
        GoRoute(
          path: '/',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: DashboardScreen(),
          ),
        ),
        GoRoute(
          path: '/settings',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: SettingsScreen(),
          ),
        ),
      ],
    ),
  ],
);

