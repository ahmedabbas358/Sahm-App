/// Sahm — Main Entry Point
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/theme.dart';
import 'core/router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    const ProviderScope(
      child: SahmApp(),
    ),
  );
}

class SahmApp extends ConsumerWidget {
  const SahmApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'سهم',
      debugShowCheckedModeBanner: false,

      // Theme
      theme: SahmTheme.light,
      darkTheme: SahmTheme.dark,
      themeMode: ThemeMode.system,

      // Routing
      routerConfig: router,

      // Localization — Arabic first, English second
      locale: const Locale('ar'),
      supportedLocales: const [
        Locale('ar'),
        Locale('en'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
