import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'package:medi_track_patient/app.dart';

void main() {
  testWidgets('MediTrack affiche la page de connexion', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(home: LoginPage(onLogin: _ignoreLogin)),
    );
    await tester.pump();

    expect(find.text('Votre santé,\nà portée de main.'), findsOneWidget);
    expect(find.text('Se connecter'), findsOneWidget);
  });

  testWidgets('le compte démo affiche le suivi de Patrice', (
    WidgetTester tester,
  ) async {
    await initializeDateFormatting('fr_FR');
    await tester.pumpWidget(
      MaterialApp(
        home: PatientShell(
          user: PatriceDemo.user,
          token: demoSessionToken,
          onLogout: _ignoreLogout,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Bonjour, Patrice'), findsOneWidget);
    expect(find.text('HÔPITAL GÉNÉRAL DE LOANDJILI'), findsOneWidget);
    expect(PatriceDemo.snapshot.constants, hasLength(3));
    await tester.tap(find.text('Constantes'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Tension 135/86 mmHg'), findsOneWidget);
    await tester.tap(find.text('Alertes'));
    await tester.pumpAndSettle();
    expect(find.text('Aucun rappel de suivi pour le moment.'), findsOneWidget);
    await tester.tap(find.text('Traitements'));
    await tester.pumpAndSettle();
    expect(find.text('Amlodipine (Norvasc)'), findsOneWidget);

    final result = await MediTrackApi(
      token: demoSessionToken,
    ).createMeasurement({'dossier_medical_id': 1, 'poids': 79.1});
    expect(result, MeasurementSaveStatus.demoLocal);
    expect(PatriceDemo.snapshot.constants.first.weight, '79.1');
  });
}

Future<void> _ignoreLogin(String email, String password) async {}

Future<void> _ignoreLogout() async {}
