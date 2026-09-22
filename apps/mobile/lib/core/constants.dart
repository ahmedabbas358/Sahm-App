/// Sahm — Application Constants
library;

class AppConstants {
  AppConstants._();

  static const String appName = 'سهم';
  static const String appNameEn = 'Sahm';
  static const String appTagline = 'من الورقة إلى سجل جامعي موثوق';
  static const String appTaglineEn = 'From paper to trusted university records';
  static const String appVersion = '0.1.0';

  // API
  static const String apiBaseUrl = 'http://localhost:8000/api/v1';

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String themeKey = 'theme_mode';
  static const String localeKey = 'locale';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Search
  static const int searchDebounceMs = 300;
  static const int minSearchLength = 2;
}
