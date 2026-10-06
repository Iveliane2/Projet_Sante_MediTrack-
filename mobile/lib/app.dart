import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

const teal = Color(0xff087f82);
const ink = Color(0xff173042);
const canvas = Color(0xfff4f8f7);
const demoSessionToken = 'demo-patrice';
const demoPatientEmail = 'patrice.mabanza@patient.loandjili.cg';
const demoPatientPassword = 'Patrice-HGL-2026';
const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:8000/api',
);

class MediTrackApp extends StatelessWidget {
  const MediTrackApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'MediTrack Patient',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: canvas,
      colorScheme: ColorScheme.fromSeed(seedColor: teal),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 15,
        ),
      ),
    ),
    home: const SessionGate(),
  );
}

class SessionGate extends StatefulWidget {
  const SessionGate({super.key});
  @override
  State<SessionGate> createState() => _SessionGateState();
}

class _SessionGateState extends State<SessionGate> {
  final api = MediTrackApi();
  User? user;
  String? token;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    restoreSession();
  }

  Future<void> restoreSession() async {
    final preferences = await SharedPreferences.getInstance();
    final savedToken = preferences.getString('token');
    final savedUser = preferences.getString('user');
    if (!mounted) return;
    setState(() {
      token = savedToken;
      user = savedUser == null ? null : User.fromJson(jsonDecode(savedUser));
      loading = false;
    });
  }

  Future<void> login(String email, String password) async {
    final isDemoAccount =
        email.trim().toLowerCase() == demoPatientEmail &&
        password == demoPatientPassword;
    final result = isDemoAccount
        ? LoginResult(token: demoSessionToken, user: PatriceDemo.user)
        : await api.login(email, password);
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString('token', result.token);
    await preferences.setString('user', jsonEncode(result.user.toJson()));
    if (!mounted) return;
    setState(() {
      token = result.token;
      user = result.user;
    });
  }

  Future<void> logout() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove('token');
    await preferences.remove('user');
    if (!mounted) return;
    setState(() {
      token = null;
      user = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (token == null || user == null) return LoginPage(onLogin: login);
    return PatientShell(user: user!, token: token!, onLogout: logout);
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({required this.onLogin, super.key});
  final Future<void> Function(String email, String password) onLogin;
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final formKey = GlobalKey<FormState>();
  final email = TextEditingController();
  final password = TextEditingController();
  bool loading = false;
  String? error;

  Future<void> submit() async {
    if (!formKey.currentState!.validate()) return;
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await widget.onLogin(email.text.trim(), password.text);
    } catch (exception) {
      if (mounted) {
        setState(
          () => error = exception.toString().replaceFirst('Exception: ', ''),
        );
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Form(
              key: formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: teal,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Icon(
                      Icons.favorite_rounded,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text(
                    'Votre santé,\nà portée de main.',
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: ink,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Connectez-vous à votre espace patient MediTrack.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.blueGrey.shade700,
                    ),
                  ),
                  const SizedBox(height: 34),
                  TextFormField(
                    controller: email,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Adresse e-mail',
                      prefixIcon: Icon(Icons.mail_outline),
                    ),
                    validator: (value) => value != null && value.contains('@')
                        ? null
                        : 'Saisissez une adresse e-mail valide',
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: password,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Mot de passe',
                      prefixIcon: Icon(Icons.lock_outline),
                    ),
                    validator: (value) => value != null && value.length >= 6
                        ? null
                        : '6 caractères minimum',
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 14),
                    Text(
                      error!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: loading ? null : submit,
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: teal,
                      ),
                      child: loading
                          ? const SizedBox(
                              width: 21,
                              height: 21,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Se connecter'),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: loading
                          ? null
                          : () {
                              email.text = demoPatientEmail;
                              password.text = demoPatientPassword;
                              submit();
                            },
                      icon: const Icon(Icons.person_pin_circle_outlined),
                      label: const Text('Accès démo · Patrice Mabanza'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: teal,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      'MediTrack Patient',
                      style: TextStyle(
                        color: Colors.blueGrey.shade500,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

class PatientShell extends StatefulWidget {
  const PatientShell({
    required this.user,
    required this.token,
    required this.onLogout,
    super.key,
  });
  final User user;
  final String token;
  final Future<void> Function() onLogout;
  @override
  State<PatientShell> createState() => _PatientShellState();
}

class _PatientShellState extends State<PatientShell> {
  int index = 0;
  late Future<PatientSnapshot> snapshot;
  @override
  void initState() {
    super.initState();
    snapshot = widget.token == demoSessionToken
        ? Future.value(PatriceDemo.snapshot)
        : MediTrackApi(token: widget.token).loadPatientData(widget.user);
  }

  void reload() => setState(() {
    snapshot = widget.token == demoSessionToken
        ? Future.value(PatriceDemo.snapshot)
        : MediTrackApi(token: widget.token).loadPatientData(widget.user);
  });
  @override
  Widget build(BuildContext context) {
    final titles = [
      'Bonjour ${widget.user.firstName}',
      'Mes constantes',
      'Mes rendez-vous',
      'Mes alertes',
      'Mes traitements',
      'Mon profil',
    ];
    return Scaffold(
      appBar: AppBar(
        title: Text(
          titles[index],
          style: const TextStyle(fontWeight: FontWeight.w800, color: ink),
        ),
        backgroundColor: canvas,
        actions: [
          IconButton(
            onPressed: reload,
            tooltip: 'Actualiser',
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: FutureBuilder<PatientSnapshot>(
        future: snapshot,
        builder: (context, state) {
          if (state.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.hasError) {
            return ErrorState(
              message: state.error.toString().replaceFirst('Exception: ', ''),
              onRetry: reload,
            );
          }
          final data = state.data!;
          return Column(
            children: [
              SyncStatusBanner(
                isOffline: data.isOffline,
                pendingCount: data.pendingCount,
              ),
              Expanded(
                child: IndexedStack(
                  index: index,
                  children: [
                    OverviewPage(
                      user: widget.user,
                      data: data,
                      onNavigate: (value) => setState(() => index = value),
                    ),
                    MeasurementsPage(
                      items: data.constants,
                      dossierMedicalId: data.patient?.medicalFileId,
                      api: MediTrackApi(token: widget.token),
                      onSaved: reload,
                    ),
                    AppointmentsPage(items: data.appointments),
                    AlertsPage(data: data),
                    TreatmentsPage(items: data.treatments),
                    ProfilePage(
                      user: widget.user,
                      patient: data.patient,
                      api: MediTrackApi(token: widget.token),
                      onLogout: widget.onLogout,
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Accueil',
          ),
          NavigationDestination(
            icon: Icon(Icons.monitor_heart_outlined),
            selectedIcon: Icon(Icons.monitor_heart_rounded),
            label: 'Constantes',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_outlined),
            selectedIcon: Icon(Icons.event_rounded),
            label: 'Rendez-vous',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_outlined),
            selectedIcon: Icon(Icons.notifications_rounded),
            label: 'Alertes',
          ),
          NavigationDestination(
            icon: Icon(Icons.medication_outlined),
            selectedIcon: Icon(Icons.medication_rounded),
            label: 'Traitements',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}

class OverviewPage extends StatelessWidget {
  const OverviewPage({
    required this.user,
    required this.data,
    required this.onNavigate,
    super.key,
  });
  final User user;
  final PatientSnapshot data;
  final ValueChanged<int> onNavigate;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
    children: [
      if (data.patient?.pathology != null) ...[
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: teal,
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'HÔPITAL GÉNÉRAL DE LOANDJILI',
                style: TextStyle(
                  color: Color(0xffc4f1e8),
                  fontWeight: FontWeight.w800,
                  fontSize: 11,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Bonjour, ${user.firstName}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                data.patient!.pathology!,
                style: const TextStyle(color: Colors.white),
              ),
              const SizedBox(height: 4),
              const Text(
                'Suivi de votre tension artérielle et de votre glycémie à domicile.',
                style: TextStyle(color: Color(0xffd7f3ed)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
      ],
      Text(
        'Votre espace santé',
        style: Theme.of(
          context,
        ).textTheme.bodyLarge?.copyWith(color: Colors.blueGrey.shade600),
      ),
      const SizedBox(height: 20),
      Row(
        children: [
          Expanded(
            child: MetricCard(
              icon: Icons.event_available_rounded,
              value: '${data.appointments.length}',
              label: 'rendez-vous',
              color: const Color(0xffd9f1ee),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: MetricCard(
              icon: Icons.medication_rounded,
              value: '${data.treatments.length}',
              label: 'traitements',
              color: const Color(0xffffead0),
            ),
          ),
        ],
      ),
      const SizedBox(height: 26),
      SectionTitle(
        title: 'Dernières constantes',
        action: data.constants.isEmpty ? 'Ajouter' : 'Tout voir',
        onTap: () => onNavigate(1),
      ),
      const SizedBox(height: 10),
      if (data.constants.isEmpty)
        const EmptyCard(
          icon: Icons.monitor_heart_outlined,
          message: 'Aucune mesure enregistrée pour le moment.',
        )
      else
        ...data.constants
            .take(3)
            .map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: MeasurementTile(item: item),
              ),
            ),
      const SizedBox(height: 26),
      SectionTitle(
        title: 'Prochain rendez-vous',
        action: data.appointments.isEmpty ? null : 'Tout voir',
        onTap: data.appointments.isEmpty ? null : () => onNavigate(2),
      ),
      const SizedBox(height: 10),
      if (data.appointments.isEmpty)
        const EmptyCard(
          icon: Icons.event_busy_rounded,
          message: 'Aucun rendez-vous planifié.',
        )
      else
        AppointmentTile(item: data.appointments.first),
      const SizedBox(height: 26),
      SectionTitle(
        title: 'Traitements en cours',
        action: data.treatments.isEmpty ? null : 'Tout voir',
        onTap: data.treatments.isEmpty ? null : () => onNavigate(4),
      ),
      const SizedBox(height: 10),
      if (data.treatments.isEmpty)
        const EmptyCard(
          icon: Icons.medication_liquid_rounded,
          message: 'Aucun traitement en cours.',
        )
      else
        ...data.treatments
            .take(3)
            .map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: TreatmentTile(item: item),
              ),
            ),
    ],
  );
}

class MeasurementsPage extends StatefulWidget {
  const MeasurementsPage({
    required this.items,
    required this.dossierMedicalId,
    required this.api,
    required this.onSaved,
    super.key,
  });

  final List<VitalMeasurement> items;
  final int? dossierMedicalId;
  final MediTrackApi api;
  final VoidCallback onSaved;

  @override
  State<MeasurementsPage> createState() => _MeasurementsPageState();
}

class _MeasurementsPageState extends State<MeasurementsPage> {
  final formKey = GlobalKey<FormState>();
  final pressure = TextEditingController();
  final glucose = TextEditingController();
  final weight = TextEditingController();
  final temperature = TextEditingController();
  String? error;
  bool saving = false;

  @override
  void dispose() {
    pressure.dispose();
    glucose.dispose();
    weight.dispose();
    temperature.dispose();
    super.dispose();
  }

  Future<void> addMeasurement() async {
    if (widget.dossierMedicalId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Aucun dossier médical associé au compte.'),
        ),
      );
      return;
    }

    pressure.clear();
    glucose.clear();
    weight.clear();
    temperature.clear();
    error = null;
    final saved = await showDialog<MeasurementSaveStatus>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Enregistrer une mesure'),
          content: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: pressure,
                    decoration: const InputDecoration(
                      labelText: 'Tension artérielle (mmHg)',
                      hintText: '120/80',
                    ),
                  ),
                  const SizedBox(height: 12),
                  numberField('Glycémie (g/L)', glucose),
                  const SizedBox(height: 12),
                  numberField('Poids (kg)', weight),
                  const SizedBox(height: 12),
                  numberField('Température (°C)', temperature),
                  if (error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      error!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: saving ? null : () => Navigator.pop(dialogContext),
              child: const Text('Annuler'),
            ),
            FilledButton(
              onPressed: saving
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;
                      if ([
                        pressure,
                        glucose,
                        weight,
                        temperature,
                      ].every((controller) => controller.text.trim().isEmpty)) {
                        setDialogState(
                          () => error = 'Saisissez au moins une constante.',
                        );
                        return;
                      }

                      setDialogState(() {
                        saving = true;
                        error = null;
                      });
                      final values = <String, dynamic>{
                        'dossier_medical_id': widget.dossierMedicalId,
                        if (pressure.text.trim().isNotEmpty)
                          'tension_arterielle': pressure.text.trim(),
                        if (glucose.text.trim().isNotEmpty)
                          'glycemie': double.tryParse(glucose.text.trim()),
                        if (weight.text.trim().isNotEmpty)
                          'poids': double.tryParse(weight.text.trim()),
                        if (temperature.text.trim().isNotEmpty)
                          'temperature': double.tryParse(
                            temperature.text.trim(),
                          ),
                      };
                      try {
                        final saveStatus = await widget.api.createMeasurement(
                          values,
                        );
                        if (dialogContext.mounted) {
                          Navigator.pop(dialogContext, saveStatus);
                        }
                      } catch (exception) {
                        setDialogState(() {
                          saving = false;
                          error = exception.toString().replaceFirst(
                            'Exception: ',
                            '',
                          );
                        });
                      }
                    },
              child: saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Enregistrer'),
            ),
          ],
        ),
      ),
    );

    saving = false;
    if (saved != null && mounted) {
      widget.onSaved();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(switch (saved) {
            MeasurementSaveStatus.queued =>
              'Donnée enregistrée hors connexion. Elle sera synchronisée dès que le réseau sera disponible.',
            MeasurementSaveStatus.demoLocal =>
              'Donnée de démonstration enregistrée localement sur cet appareil.',
            MeasurementSaveStatus.synced =>
              'Mesure synchronisée avec l’hôpital.',
          }),
        ),
      );
    }
  }

  Widget numberField(String label, TextEditingController controller) =>
      TextFormField(
        controller: controller,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(labelText: label),
        validator: (value) =>
            value != null && value.isNotEmpty && double.tryParse(value) == null
            ? 'Saisissez une valeur numérique valide'
            : null,
      );

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      Row(
        children: [
          Expanded(
            child: Text(
              'Historique des mesures transmises à votre équipe médicale.',
              style: Theme.of(
                context,
              ).textTheme.bodyLarge?.copyWith(color: Colors.blueGrey.shade600),
            ),
          ),
          IconButton.filledTonal(
            onPressed: addMeasurement,
            tooltip: 'Ajouter une mesure',
            icon: const Icon(Icons.add_rounded),
          ),
        ],
      ),
      const SizedBox(height: 18),
      if (widget.items.isEmpty)
        const EmptyCard(
          icon: Icons.monitor_heart_outlined,
          message: 'Aucune constante enregistrée.',
        )
      else
        ...widget.items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: MeasurementTile(item: item),
          ),
        ),
    ],
  );
}

class MeasurementTile extends StatelessWidget {
  const MeasurementTile({required this.item, super.key});
  final VitalMeasurement item;

  @override
  Widget build(BuildContext context) {
    final values = <String>[
      if (item.pressure != null) 'Tension ${item.pressure} mmHg',
      if (item.glucose != null) 'Glycémie ${item.glucose} g/L',
      if (item.weight != null) 'Poids ${item.weight} kg',
      if (item.temperature != null) 'Temp. ${item.temperature} °C',
    ];
    return Card(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xffe2e8f0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.formattedDate,
              style: const TextStyle(fontWeight: FontWeight.w700, color: ink),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: values.isEmpty
                  ? [const Text('Aucune valeur disponible')]
                  : values.map((value) => Chip(label: Text(value))).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class AppointmentsPage extends StatelessWidget {
  const AppointmentsPage({required this.items, super.key});
  final List<Appointment> items;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      Text(
        'Votre agenda médical',
        style: Theme.of(
          context,
        ).textTheme.bodyLarge?.copyWith(color: Colors.blueGrey.shade600),
      ),
      const SizedBox(height: 18),
      if (items.isEmpty)
        const EmptyCard(
          icon: Icons.event_busy_rounded,
          message: 'Aucun rendez-vous à afficher.',
        )
      else
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AppointmentTile(item: item),
          ),
        ),
    ],
  );
}

class AlertsPage extends StatelessWidget {
  const AlertsPage({required this.data, super.key});
  final PatientSnapshot data;

  @override
  Widget build(BuildContext context) {
    final alerts = <Widget>[];
    for (final item in data.constants) {
      final pressure = item.pressure
          ?.split('/')
          .map((part) => int.tryParse(part.trim()))
          .toList();
      final systolic = pressure != null && pressure.isNotEmpty
          ? pressure.first
          : null;
      final diastolic = pressure != null && pressure.length > 1
          ? pressure[1]
          : null;
      final glucose = double.tryParse(item.glucose ?? '');
      if ((systolic != null && systolic >= 160) ||
          (diastolic != null && diastolic >= 100)) {
        alerts.add(
          AlertTile(
            title: 'Mesure de tension à vérifier',
            detail: '${item.pressure} mmHg · ${item.formattedDate}',
            icon: Icons.monitor_heart_outlined,
          ),
        );
      }
      if (glucose != null && glucose > 1.26) {
        alerts.add(
          AlertTile(
            title: 'Glycémie au-dessus du repère indicatif',
            detail: '${item.glucose} g/L · ${item.formattedDate}',
            icon: Icons.water_drop_outlined,
          ),
        );
      }
    }
    final now = DateTime.now();
    for (final appointment in data.appointments.where(
      (item) =>
          item.date.isAfter(now) && item.date.difference(now).inHours <= 48,
    )) {
      alerts.add(
        AlertTile(
          title: 'Rendez-vous dans les prochaines 48 heures',
          detail: '${appointment.formattedDate} · ${appointment.reason}',
          icon: Icons.event_available_outlined,
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Rappels et prévention',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: ink,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          'Repères de suivi à revoir avec votre équipe soignante. Ce ne sont pas des diagnostics.',
          style: TextStyle(color: Colors.blueGrey.shade700),
        ),
        const SizedBox(height: 16),
        if (alerts.isEmpty)
          const EmptyCard(
            icon: Icons.notifications_none_rounded,
            message: 'Aucun rappel de suivi pour le moment.',
          )
        else
          ...alerts,
      ],
    );
  }
}

class AlertTile extends StatelessWidget {
  const AlertTile({
    required this.title,
    required this.detail,
    required this.icon,
    super.key,
  });
  final String title;
  final String detail;
  final IconData icon;

  @override
  Widget build(BuildContext context) => Card(
    elevation: 0,
    color: Colors.white,
    margin: const EdgeInsets.only(bottom: 10),
    child: ListTile(
      leading: Icon(icon, color: const Color(0xff2476b8)),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Text(detail),
    ),
  );
}

class SyncStatusBanner extends StatelessWidget {
  const SyncStatusBanner({
    required this.isOffline,
    required this.pendingCount,
    super.key,
  });
  final bool isOffline;
  final int pendingCount;

  @override
  Widget build(BuildContext context) {
    final waiting = pendingCount > 0;
    final label = waiting
        ? '$pendingCount donnée(s) en attente de synchronisation'
        : isOffline
        ? 'Mode hors connexion · données locales de démonstration'
        : 'Synchronisé avec l’hôpital';
    final color = waiting || isOffline
        ? const Color(0xff56718a)
        : const Color(0xff2476b8);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
      color: const Color(0xffeaf3fa),
      child: Row(
        children: [
          Icon(
            waiting || isOffline
                ? Icons.cloud_off_outlined
                : Icons.cloud_done_outlined,
            size: 16,
            color: color,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class TreatmentsPage extends StatelessWidget {
  const TreatmentsPage({required this.items, super.key});
  final List<Treatment> items;
  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      Text(
        'Suivez vos prescriptions',
        style: Theme.of(
          context,
        ).textTheme.bodyLarge?.copyWith(color: Colors.blueGrey.shade600),
      ),
      const SizedBox(height: 18),
      if (items.isEmpty)
        const EmptyCard(
          icon: Icons.medication_liquid_rounded,
          message: 'Aucun traitement à afficher.',
        )
      else
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TreatmentTile(item: item),
          ),
        ),
    ],
  );
}

class ProfilePage extends StatelessWidget {
  const ProfilePage({
    required this.user,
    required this.patient,
    required this.api,
    required this.onLogout,
    super.key,
  });
  final User user;
  final Patient? patient;
  final MediTrackApi api;
  final Future<void> Function() onLogout;
  @override
  Widget build(BuildContext context) => _ProfileContent(
    user: user,
    patient: patient,
    api: api,
    onLogout: onLogout,
  );
}

class _ProfileContent extends StatefulWidget {
  const _ProfileContent({
    required this.user,
    required this.patient,
    required this.api,
    required this.onLogout,
  });
  final User user;
  final Patient? patient;
  final MediTrackApi api;
  final Future<void> Function() onLogout;
  @override
  State<_ProfileContent> createState() => _ProfileContentState();
}

class _ProfileContentState extends State<_ProfileContent> {
  late String language = widget.user.language;
  bool savingLanguage = false;
  String? languageMessage;

  Future<void> saveLanguage(String? value) async {
    if (value == null || value == language) return;
    setState(() {
      language = value;
      savingLanguage = true;
      languageMessage = null;
    });
    try {
      await widget.api.updateProfile({'langue_preferee': value});
      final preferences = await SharedPreferences.getInstance();
      final savedUser = {...widget.user.toJson(), 'langue_preferee': value};
      await preferences.setString('user', jsonEncode(savedUser));
      if (mounted) setState(() => languageMessage = 'Préférence enregistrée.');
    } catch (_) {
      if (mounted) {
        setState(() {
          language = widget.user.language;
          languageMessage =
              'Impossible d’enregistrer la langue. Réessayez en ligne.';
        });
      }
    } finally {
      if (mounted) setState(() => savingLanguage = false);
    }
  }

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      Center(
        child: CircleAvatar(
          radius: 42,
          backgroundColor: teal,
          child: Text(
            widget.user.initials,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 25,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
      const SizedBox(height: 14),
      Center(
        child: Text(
          widget.user.fullName,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
            color: ink,
          ),
        ),
      ),
      Center(
        child: Text(
          widget.user.email,
          style: TextStyle(color: Colors.blueGrey.shade600),
        ),
      ),
      const SizedBox(height: 26),
      InfoRow(
        icon: Icons.badge_outlined,
        label: 'Numéro de dossier',
        value: widget.patient?.numeroDossier ?? 'Non renseigné',
      ),
      InfoRow(
        icon: Icons.bloodtype_outlined,
        label: 'Groupe sanguin',
        value: widget.patient?.groupeSanguin ?? 'Non renseigné',
      ),
      InfoRow(
        icon: Icons.location_on_outlined,
        label: 'Adresse',
        value: widget.patient?.adresse ?? 'Non renseignée',
      ),
      if (widget.patient?.numeroDossier == 'HGL-2023-0492') ...[
        InfoRow(
          icon: Icons.cake_outlined,
          label: 'Âge',
          value: '${widget.patient!.age} ans',
        ),
        InfoRow(
          icon: Icons.medical_information_outlined,
          label: 'Pathologie suivie',
          value: widget.patient!.pathology!,
        ),
        InfoRow(
          icon: Icons.medical_services_outlined,
          label: 'Médecin référent',
          value: widget.patient!.doctor!,
        ),
        InfoRow(
          icon: Icons.history_rounded,
          label: 'Antécédents',
          value: widget.patient!.medicalHistory!,
        ),
        InfoRow(
          icon: Icons.warning_amber_rounded,
          label: 'Allergies',
          value: widget.patient!.allergies!,
        ),
      ],
      const SizedBox(height: 12),
      Text(
        'Langue préférée',
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w700,
          color: ink,
        ),
      ),
      const SizedBox(height: 8),
      DropdownButtonFormField<String>(
        initialValue: language,
        decoration: const InputDecoration(labelText: 'Langue'),
        items: const [
          DropdownMenuItem(value: 'FRANCAIS', child: Text('Français')),
          DropdownMenuItem(value: 'ANGLAIS', child: Text('English')),
          DropdownMenuItem(value: 'LINGALA', child: Text('Lingala')),
          DropdownMenuItem(value: 'KIKONGO', child: Text('Kikongo')),
        ],
        onChanged: savingLanguage ? null : saveLanguage,
      ),
      if (languageMessage != null)
        Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Text(
            languageMessage!,
            style: TextStyle(color: savingLanguage ? Colors.blueGrey : teal),
          ),
        ),
      const SizedBox(height: 18),
      OutlinedButton.icon(
        onPressed: widget.onLogout,
        icon: const Icon(Icons.logout_rounded),
        label: const Text('Se déconnecter'),
        style: OutlinedButton.styleFrom(
          foregroundColor: teal,
          padding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    ],
  );
}

class MetricCard extends StatelessWidget {
  const MetricCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
    super.key,
  });
  final IconData icon;
  final String value;
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: teal),
        const SizedBox(height: 15),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w800,
            color: ink,
          ),
        ),
        Text(label, style: TextStyle(color: Colors.blueGrey.shade700)),
      ],
    ),
  );
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({required this.title, this.action, this.onTap, super.key});
  final String title;
  final String? action;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w800,
          color: ink,
        ),
      ),
      if (action != null) TextButton(onPressed: onTap, child: Text(action!)),
    ],
  );
}

class AppointmentTile extends StatelessWidget {
  const AppointmentTile({required this.item, super.key});
  final Appointment item;
  @override
  Widget build(BuildContext context) => Card(
    elevation: 0,
    color: Colors.white,
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: const Color(0xffe4f4f1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.event_rounded, color: teal),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Dr. ${item.doctorName}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: ink,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  item.formattedDate,
                  style: TextStyle(color: Colors.blueGrey.shade700),
                ),
                if (item.reason.isNotEmpty)
                  Text(
                    item.reason,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.blueGrey.shade500),
                  ),
                if (item.location != null)
                  Text(
                    item.location!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.blueGrey.shade500),
                  ),
              ],
            ),
          ),
          StatusPill(label: item.statusLabel, color: item.statusColor),
        ],
      ),
    ),
  );
}

class TreatmentTile extends StatelessWidget {
  const TreatmentTile({required this.item, super.key});
  final Treatment item;
  @override
  Widget build(BuildContext context) => Card(
    elevation: 0,
    color: Colors.white,
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: const Color(0xfffff0dc),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.medication_rounded,
              color: Color(0xffb56a00),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.medicine,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: ink,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  item.dosage.isEmpty
                      ? 'Posologie non renseignée'
                      : item.dosage,
                  style: TextStyle(color: Colors.blueGrey.shade700),
                ),
                if (item.timing != null)
                  Text(
                    item.timing!,
                    style: TextStyle(color: Colors.blueGrey.shade700),
                  ),
                if (item.instructions != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      item.instructions!,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.blueGrey.shade500),
                    ),
                  ),
                if (item.endDate != null)
                  Text(
                    'Jusqu’au ${DateFormat('dd/MM/yyyy').format(item.endDate!)}',
                    style: TextStyle(color: Colors.blueGrey.shade500),
                  ),
              ],
            ),
          ),
          StatusPill(label: item.statusLabel, color: item.statusColor),
        ],
      ),
    ),
  );
}

class StatusPill extends StatelessWidget {
  const StatusPill({required this.label, required this.color, super.key});
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
    decoration: BoxDecoration(
      color: color.withAlpha(25),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(
      label,
      style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w800),
    ),
  );
}

class InfoRow extends StatelessWidget {
  const InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    super.key,
  });
  final IconData icon;
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) => ListTile(
    contentPadding: EdgeInsets.zero,
    leading: Icon(icon, color: teal),
    title: Text(
      label,
      style: TextStyle(color: Colors.blueGrey.shade600, fontSize: 12),
    ),
    subtitle: Text(
      value,
      style: const TextStyle(color: ink, fontWeight: FontWeight.w600),
    ),
  );
}

class EmptyCard extends StatelessWidget {
  const EmptyCard({required this.icon, required this.message, super.key});
  final IconData icon;
  final String message;
  @override
  Widget build(BuildContext context) => Card(
    elevation: 0,
    child: Padding(
      padding: const EdgeInsets.all(22),
      child: Row(
        children: [
          Icon(icon, color: Colors.blueGrey.shade300),
          const SizedBox(width: 12),
          Text(message, style: TextStyle(color: Colors.blueGrey.shade600)),
        ],
      ),
    ),
  );
}

class ErrorState extends StatelessWidget {
  const ErrorState({required this.message, required this.onRetry, super.key});
  final String message;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.cloud_off_rounded, size: 46, color: Colors.blueGrey),
          const SizedBox(height: 14),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          FilledButton(onPressed: onRetry, child: const Text('Réessayer')),
        ],
      ),
    ),
  );
}

class MediTrackApi {
  MediTrackApi({this.token});
  final String? token;
  Map<String, String> get headers => {
    'Accept': 'application/json',
    if (token != null) 'Authorization': 'Bearer $token',
  };

  Future<LoginResult> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/login'),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'email': email, 'password': password}),
    );
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 400) {
      throw Exception(body['message'] ?? 'Connexion impossible');
    }
    return LoginResult(token: body['token'], user: User.fromJson(body['user']));
  }

  Future<PatientSnapshot> loadPatientData(User currentUser) async {
    final preferences = await SharedPreferences.getInstance();
    final cacheKey = 'patient_snapshot_${currentUser.id}';
    var isOffline = false;
    late List<dynamic> responses;
    try {
      responses = await Future.wait([
        get('/patients'),
        get('/rendezvous'),
        get('/traitements'),
        get('/constantes'),
      ]);
      await preferences.setString(cacheKey, jsonEncode(responses));
    } on ApiRequestException {
      rethrow;
    } catch (_) {
      final cached = preferences.getString(cacheKey);
      if (cached == null) rethrow;
      responses = jsonDecode(cached) as List<dynamic>;
      isOffline = true;
    }
    final patients = list(responses[0])
        .map(Patient.fromJson)
        .where((item) => item.userId == currentUser.id)
        .toList();
    final patientIds = patients.map((item) => item.id).toSet();
    final appointments =
        list(responses[1])
            .map(Appointment.fromJson)
            .where((item) => patientIds.contains(item.patientId))
            .toList()
          ..sort((a, b) => a.date.compareTo(b.date));
    final treatments = list(responses[2])
        .map(Treatment.fromJson)
        .where((item) => patientIds.contains(item.patientId))
        .toList();
    final patient = patients.isEmpty ? null : patients.first;
    final constants = list(responses[3])
        .map(VitalMeasurement.fromJson)
        .where((item) => item.medicalFileId == patient?.medicalFileId)
        .toList();
    final queueKey = 'pending_measurements_${patient?.medicalFileId}';
    var queuedMeasurements = <Map<String, dynamic>>[];
    final storedQueue = preferences.getString(queueKey);
    if (storedQueue != null) {
      queuedMeasurements = (jsonDecode(storedQueue) as List)
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
    }
    if (!isOffline && queuedMeasurements.isNotEmpty) {
      final stillPending = <Map<String, dynamic>>[];
      for (final measurement in queuedMeasurements) {
        try {
          await _postMeasurement(measurement);
        } on ApiRequestException {
          rethrow;
        } catch (_) {
          stillPending.add(measurement);
        }
      }
      queuedMeasurements = stillPending;
      if (queuedMeasurements.isEmpty) {
        await preferences.remove(queueKey);
      } else {
        await preferences.setString(queueKey, jsonEncode(queuedMeasurements));
      }
    }
    for (var index = 0; index < queuedMeasurements.length; index++) {
      final measurement = queuedMeasurements[index];
      constants.insert(
        0,
        VitalMeasurement(
          id: -(index + 1),
          medicalFileId: toInt(measurement['dossier_medical_id']),
          date:
              DateTime.tryParse(toText(measurement['date_mesure'])) ??
              DateTime.now(),
          pressure: nullable(measurement['tension_arterielle']),
          glucose: nullable(measurement['glycemie']),
          weight: nullable(measurement['poids']),
          temperature: nullable(measurement['temperature']),
        ),
      );
    }
    return PatientSnapshot(
      patient: patient,
      appointments: appointments,
      treatments: treatments,
      constants: constants,
      isOffline: isOffline,
      pendingCount: queuedMeasurements.length,
    );
  }

  Future<dynamic> get(String path) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl$path'),
      headers: headers,
    );
    if (response.statusCode >= 400) {
      throw ApiRequestException(
        'Impossible de charger vos données (${response.statusCode}).',
      );
    }
    return jsonDecode(response.body);
  }

  Future<MeasurementSaveStatus> createMeasurement(
    Map<String, dynamic> values,
  ) async {
    if (token == demoSessionToken) {
      PatriceDemo.snapshot.constants.insert(
        0,
        VitalMeasurement(
          id: -DateTime.now().microsecondsSinceEpoch,
          medicalFileId: toInt(values['dossier_medical_id']),
          date: DateTime.now(),
          pressure: nullable(values['tension_arterielle']),
          glucose: nullable(values['glycemie']),
          weight: nullable(values['poids']),
          temperature: nullable(values['temperature']),
        ),
      );
      return MeasurementSaveStatus.demoLocal;
    }
    try {
      await _postMeasurement(values);
      return MeasurementSaveStatus.synced;
    } on ApiRequestException {
      rethrow;
    } catch (_) {
      final dossierId = values['dossier_medical_id'];
      if (dossierId == null) rethrow;
      final preferences = await SharedPreferences.getInstance();
      final key = 'pending_measurements_$dossierId';
      final stored = preferences.getString(key);
      final queue = stored == null
          ? <Map<String, dynamic>>[]
          : (jsonDecode(stored) as List)
                .whereType<Map>()
                .map((item) => Map<String, dynamic>.from(item))
                .toList();
      queue.add({...values, 'date_mesure': DateTime.now().toIso8601String()});
      await preferences.setString(key, jsonEncode(queue));
      return MeasurementSaveStatus.queued;
    }
  }

  Future<void> _postMeasurement(Map<String, dynamic> values) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/constantes'),
      headers: {...headers, 'Content-Type': 'application/json'},
      body: jsonEncode(values),
    );
    if (response.statusCode >= 400) {
      final body = jsonDecode(response.body);
      throw ApiRequestException(
        body is Map
            ? body['message'] ?? 'Enregistrement impossible.'
            : 'Enregistrement impossible.',
      );
    }
  }

  Future<void> updateProfile(Map<String, dynamic> values) async {
    if (token == demoSessionToken) return;
    final response = await http.put(
      Uri.parse('$apiBaseUrl/profil'),
      headers: {...headers, 'Content-Type': 'application/json'},
      body: jsonEncode(values),
    );
    if (response.statusCode >= 400) {
      throw Exception(
        'Impossible d’enregistrer les préférences (${response.statusCode}).',
      );
    }
  }

  List<Map<String, dynamic>> list(dynamic value) {
    final data = value is Map ? value['data'] : value;
    return (data as List? ?? const [])
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }
}

class LoginResult {
  const LoginResult({required this.token, required this.user});
  final String token;
  final User user;
}

enum MeasurementSaveStatus { synced, queued, demoLocal }

class ApiRequestException implements Exception {
  const ApiRequestException(this.message);
  final String message;

  @override
  String toString() => message;
}

class PatientSnapshot {
  const PatientSnapshot({
    required this.patient,
    required this.appointments,
    required this.treatments,
    required this.constants,
    this.isOffline = false,
    this.pendingCount = 0,
  });
  final Patient? patient;
  final List<Appointment> appointments;
  final List<Treatment> treatments;
  final List<VitalMeasurement> constants;
  final bool isOffline;
  final int pendingCount;
}

class PatriceDemo {
  static const user = User(
    id: 1,
    firstName: 'Patrice',
    lastName: 'Mabanza',
    email: demoPatientEmail,
  );

  static final snapshot = PatientSnapshot(
    isOffline: true,
    patient: const Patient(
      id: 1,
      userId: 1,
      medicalFileId: 1,
      numeroDossier: 'HGL-2023-0492',
      adresse: 'Loandjili, Pointe-Noire',
      age: 54,
      pathology: 'HTA & Diabète',
      doctor: 'Dr. Aris Mendosa',
      medicalHistory:
          'HTA essentielle depuis 8 ans; diabète de type 2 (2021); surpoids modéré.',
      allergies: 'Pénicilline, sulfamides',
    ),
    appointments: [
      Appointment(
        patientId: 1,
        date: DateTime(2026, 10, 14, 9, 30),
        doctorName: 'Aris Mendosa',
        reason: 'Contrôle semestriel de tension et évaluation HbA1c',
        status: 'PLANIFIE',
        location:
            'Consultation Externe HTA/Diabète, Bâtiment C, Hôpital Général de Loandjili',
      ),
    ],
    treatments: [
      Treatment(
        patientId: 1,
        medicine: 'Amlodipine (Norvasc)',
        dosage: '10 mg · 1 comprimé par jour',
        endDate: null,
        status: 'EN_COURS',
        timing: 'Matin au réveil (08:00)',
        instructions:
            'Avec un grand verre d’eau. Ne pas interrompre brutalement.',
      ),
      Treatment(
        patientId: 1,
        medicine: 'Metformine (Glucophage)',
        dosage: '850 mg · 2 fois par jour',
        endDate: null,
        status: 'EN_COURS',
        timing: 'Matin et soir, au milieu des repas',
        instructions:
            'À prendre au milieu du repas pour limiter les troubles digestifs.',
      ),
      Treatment(
        patientId: 1,
        medicine: 'Lisinopril',
        dosage: '20 mg · 1 comprimé par jour',
        endDate: null,
        status: 'EN_COURS',
        timing: 'Soir (20:00)',
        instructions:
            'Surveiller une éventuelle toux sèche. Contrôle de la créatininémie semestriel.',
      ),
    ],
    constants: [
      VitalMeasurement(
        id: 1,
        medicalFileId: 1,
        date: DateTime(2026, 10, 2, 8, 15),
        pressure: '135/86',
      ),
      VitalMeasurement(
        id: 2,
        medicalFileId: 1,
        date: DateTime(2026, 10, 2, 7, 30),
        glucose: '1.25',
      ),
      VitalMeasurement(
        id: 3,
        medicalFileId: 1,
        date: DateTime(2026, 10, 1),
        weight: '78.5',
      ),
    ],
  );
}

class User {
  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.language = 'FRANCAIS',
  });
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final String language;
  String get fullName => '$firstName $lastName';
  String get initials =>
      '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'
          .toUpperCase();
  factory User.fromJson(Map<String, dynamic> json) => User(
    id: toInt(json['id']),
    firstName: toText(json['prenom']),
    lastName: toText(json['nom']),
    email: toText(json['email']),
    language: toText(json['langue_preferee']).isEmpty
        ? 'FRANCAIS'
        : toText(json['langue_preferee']),
  );
  Map<String, dynamic> toJson() => {
    'id': id,
    'prenom': firstName,
    'nom': lastName,
    'email': email,
    'langue_preferee': language,
  };
}

class Patient {
  const Patient({
    required this.id,
    required this.userId,
    this.medicalFileId,
    this.numeroDossier,
    this.groupeSanguin,
    this.adresse,
    this.age,
    this.pathology,
    this.doctor,
    this.medicalHistory,
    this.allergies,
  });
  final int id;
  final int userId;
  final int? medicalFileId;
  final String? numeroDossier;
  final String? groupeSanguin;
  final String? adresse;
  final int? age;
  final String? pathology;
  final String? doctor;
  final String? medicalHistory;
  final String? allergies;
  factory Patient.fromJson(Map<String, dynamic> json) {
    final rawUser = json['utilisateur'];
    final user = rawUser is Map
        ? Map<String, dynamic>.from(rawUser)
        : <String, dynamic>{};
    return Patient(
      id: toInt(json['id']),
      userId: toInt(user['id']),
      medicalFileId: json['dossier_medical_id'] == null
          ? null
          : toInt(json['dossier_medical_id']),
      numeroDossier: nullable(json['numero_dossier']),
      groupeSanguin: nullable(json['groupe_sanguin']),
      adresse: nullable(json['adresse']),
    );
  }
}

class VitalMeasurement {
  const VitalMeasurement({
    required this.id,
    required this.medicalFileId,
    required this.date,
    this.pressure,
    this.glucose,
    this.weight,
    this.temperature,
  });

  final int id;
  final int medicalFileId;
  final DateTime date;
  final String? pressure;
  final String? glucose;
  final String? weight;
  final String? temperature;

  String get formattedDate =>
      DateFormat('d MMM yyyy · HH:mm', 'fr_FR').format(date);

  factory VitalMeasurement.fromJson(Map<String, dynamic> json) =>
      VitalMeasurement(
        id: toInt(json['id']),
        medicalFileId: toInt(json['dossier_medical_id']),
        date:
            DateTime.tryParse(json['date_mesure']?.toString() ?? '') ??
            DateTime.now(),
        pressure: json['tension_arterielle']?.toString(),
        glucose: json['glycemie']?.toString(),
        weight: json['poids']?.toString(),
        temperature: json['temperature']?.toString(),
      );
}

class Appointment {
  const Appointment({
    required this.patientId,
    required this.date,
    required this.doctorName,
    required this.reason,
    required this.status,
    this.location,
  });
  final int patientId;
  final DateTime date;
  final String doctorName;
  final String reason;
  final String status;
  final String? location;
  String get formattedDate =>
      DateFormat('EEEE d MMMM à HH:mm', 'fr_FR').format(date);
  String get statusLabel =>
      {
        'PLANIFIE': 'Planifié',
        'ANNULE': 'Annulé',
        'TERMINE': 'Terminé',
      }[status] ??
      status;
  Color get statusColor => status == 'ANNULE'
      ? Colors.red
      : status == 'TERMINE'
      ? Colors.blueGrey
      : teal;
  factory Appointment.fromJson(Map<String, dynamic> json) {
    final doctor = json['medecin'] is Map
        ? Map<String, dynamic>.from(json['medecin'])
        : <String, dynamic>{};
    final rawUser = doctor['utilisateur'];
    final user = rawUser is Map
        ? Map<String, dynamic>.from(rawUser)
        : <String, dynamic>{};
    final patient = json['patient'];
    return Appointment(
      patientId: toInt(
        json['patient_id'] ?? (patient is Map ? patient['id'] : null),
      ),
      date: DateTime.tryParse(toText(json['date_heure'])) ?? DateTime.now(),
      doctorName:
          '${toText(user['prenom'])} ${toText(user['nom'])}'.trim().isEmpty
          ? 'Médecin'
          : '${toText(user['prenom'])} ${toText(user['nom'])}'.trim(),
      reason: toText(json['motif']),
      status: toText(json['statut']),
    );
  }
}

class Treatment {
  const Treatment({
    required this.patientId,
    required this.medicine,
    required this.dosage,
    required this.endDate,
    required this.status,
    this.timing,
    this.instructions,
  });
  final int patientId;
  final String medicine;
  final String dosage;
  final DateTime? endDate;
  final String status;
  final String? timing;
  final String? instructions;
  String get statusLabel =>
      {
        'EN_COURS': 'En cours',
        'TERMINE': 'Terminé',
        'SUSPENDU': 'Suspendu',
      }[status] ??
      status;
  Color get statusColor => status == 'SUSPENDU'
      ? Colors.red
      : status == 'TERMINE'
      ? Colors.blueGrey
      : const Color(0xffb56a00);
  factory Treatment.fromJson(Map<String, dynamic> json) {
    final diagnostic = json['diagnostic'] is Map
        ? Map<String, dynamic>.from(json['diagnostic'])
        : <String, dynamic>{};
    final dossier = diagnostic['dossier_medical'] is Map
        ? Map<String, dynamic>.from(diagnostic['dossier_medical'])
        : <String, dynamic>{};
    final patient = dossier['patient'] is Map
        ? Map<String, dynamic>.from(dossier['patient'])
        : <String, dynamic>{};
    return Treatment(
      patientId: toInt(json['patient_id'] ?? patient['id']),
      medicine: toText(json['medicament']).isEmpty
          ? 'Traitement'
          : toText(json['medicament']),
      dosage: toText(json['posologie']),
      endDate: DateTime.tryParse(toText(json['date_fin'])),
      status: toText(json['statut']),
    );
  }
}

int toInt(dynamic value) => value is int ? value : int.tryParse('$value') ?? 0;
String toText(dynamic value) => value?.toString() ?? '';
String? nullable(dynamic value) =>
    value == null || '$value'.isEmpty ? null : '$value';
