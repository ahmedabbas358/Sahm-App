import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:sahm_mobile/main.dart';

void main() {
  testWidgets('SahmApp renders successfully', (WidgetTester tester) async {
    // Build the app inside ProviderScope (required by Riverpod).
    await tester.pumpWidget(
      const ProviderScope(
        child: SahmApp(),
      ),
    );

    // Verify the app title appears somewhere in the widget tree.
    await tester.pumpAndSettle();
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
