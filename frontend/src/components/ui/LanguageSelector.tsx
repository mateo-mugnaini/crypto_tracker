import { useI18n, type Locale } from "../../i18n/I18nContext";
import styles from "./LanguageSelector.module.css";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={styles.wrapper}>
      <span className={styles.label}>{t("language")}</span>
      <select
        aria-label={t("language")}
        className={styles.select}
        onChange={(event) => setLocale(event.target.value as Locale)}
        value={locale}
      >
        <option value="it">{t("language_it")}</option>
        <option value="es">{t("language_es")}</option>
        <option value="en">{t("language_en")}</option>
      </select>
    </label>
  );
}
