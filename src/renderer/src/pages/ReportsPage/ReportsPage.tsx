import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { enUS } from "date-fns/locale";
import { tr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

import { Schedule } from "@/types/DB";

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        email: string;
        subject: string;
        touched?: { email?: boolean; subject?: boolean };
      }
    >
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.api.getReportSchedules().then((rows) => {
      const r = rows || [];
      setSchedules(r);
      // initialize drafts for presets
      const initial: Record<string, { email: string; subject: string }> = {};
      ["daily", "weekly", "monthly", "yearly"].forEach((type) => {
        const ex = r.find((s: Schedule) => s.type === type);
        initial[type] = { email: ex?.email || "", subject: ex?.subject || "" };
      });
      setDrafts(initial);
    });
  }, []);

  async function handleGenerate() {
    if (!from || !to) return;
    setLoading(true);
    // use full day bounds
    const f = new Date(from);
    f.setHours(0, 0, 0, 0);
    const t2 = new Date(to);
    t2.setHours(23, 59, 59, 999);

    const res = await window.api.generateSalesReport({
      from: f.toISOString(),
      to: t2.toISOString(),
    });
    setLoading(false);
    if (res?.path) {
      // open folder containing report
      // in renderer we can't directly open native file manager; show path to user
      alert(`Report generated: ${res.path}`);
    }
  }

  async function handleSaveSchedule(s: Partial<Schedule> & { type: string }) {
    await window.api.saveReportSchedule({
      id: s.id,
      type: s.type,
      email: s.email ?? undefined,
      enabled: !!s.enabled,
      subject: s.subject ?? undefined,
    });
    const rows = await window.api.getReportSchedules();
    setSchedules(rows || []);
  }

  async function handleToggle(
    id: number | undefined,
    enabled: boolean,
    type?: string,
  ) {
    // If enabling and there's no existing schedule, create one using current input value
    if (!id && enabled) {
      const draft = drafts[type || "daily"] || { email: "", subject: "" };
      await window.api.saveReportSchedule({
        id: undefined,
        type: type || "daily",
        email: draft.email ?? undefined,
        enabled: true,
        subject: draft.subject ?? undefined,
      });
    } else if (id) {
      await window.api.toggleReportSchedule({ id, enabled });
    }
    const rows = await window.api.getReportSchedules();
    setSchedules(rows || []);
  }

  function updateDraft(
    type: string,
    field: "email" | "subject",
    value: string,
  ) {
    setDrafts((prev) => ({
      ...prev,
      [type]: { ...(prev[type] || { email: "", subject: "" }), [field]: value },
    }));
  }

  function touchDraft(type: string, field: "email" | "subject") {
    setDrafts((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || { email: "", subject: "" }),
        touched: { ...(prev[type]?.touched || {}), [field]: true },
      },
    }));
  }

  function validateDraft(type: string, existing?: Schedule) {
    const d = drafts[type] || {
      email: existing?.email || "",
      subject: existing?.subject || "",
    };
    const email = (d.email || "").trim();
    const subject = (d.subject || "").trim();
    let emailError: string | null = null;
    let subjectError: string | null = null;
    if (!email) {
      emailError = t("ReportsPage.validation.emailRequired");
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email))
        emailError = t("ReportsPage.validation.emailInvalid");
    }
    if (!subject) subjectError = t("ReportsPage.validation.subjectRequired");
    return { emailError, subjectError };
  }

  const presetTypes = ["daily", "weekly", "monthly", "yearly"];
  const activeSchedules = schedules.filter((s) => !!s.enabled);

  return (
    <div className="p-6 max-w-4xl mx-auto text-lg leading-relaxed">
      <h2 className="text-3xl md:text-4xl font-semibold mb-4">
        {t("ReportsPage.title")}
      </h2>

      <div className="mt-4 p-6 border border-slate-700 rounded-lg bg-slate-900">
        <h3 className="font-semibold text-xl md:text-2xl mb-3">
          {t("ReportsPage.generateTitle")}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <label className="text-base text-slate-300 min-w-[56px]">
            {t("Common.from")}
          </label>
          <DatePicker
            selected={from}
            onChange={(d: Date | null) => setFrom(d)}
            locale={i18n.language === "tr" ? tr : enUS}
            className="px-3 py-2 rounded bg-slate-800 text-base text-white border border-slate-700"
          />
          <label className="text-base text-slate-300 min-w-[36px]">
            {t("Common.to")}
          </label>
          <DatePicker
            selected={to}
            onChange={(d: Date | null) => setTo(d)}
            locale={i18n.language === "tr" ? tr : enUS}
            className="px-3 py-2 rounded bg-slate-800 text-base text-white border border-slate-700"
          />
          <div className="mt-2 sm:mt-0">
            <button
              onClick={handleGenerate}
              disabled={!from || !to || loading}
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50"
            >
              {loading ? t("Common.loading") : t("ReportsPage.generate")}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 border border-slate-700 rounded-lg bg-slate-900">
        <h3 className="font-semibold text-xl md:text-2xl mb-3">
          {t("ReportsPage.schedulingTitle")}
        </h3>
        <p className="text-base text-slate-300 mb-4">
          {t("ReportsPage.schedulingDescription")}
        </p>

        {activeSchedules.length > 0 && (
          <div className="mb-4 p-4 bg-slate-800 rounded border border-slate-700">
            <h4 className="font-semibold text-lg mb-2">
              {t("ReportsPage.activeTitle")}
            </h4>
            <div className="space-y-3">
              {activeSchedules.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">
                      {t(`ReportsPage.Presets.${s.type}`)}
                    </div>
                    <div className="text-sm text-slate-300">
                      {s.email}
                      {s.subject ? ` • ${s.subject}` : ""}
                    </div>
                    {s.lastRunAt && (
                      <div className="text-xs text-slate-400">
                        Last: {new Date(s.lastRunAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(s.id, false)}
                      className="px-3 py-1 rounded bg-rose-600 text-white"
                    >
                      {t("ReportsPage.disable") || "Disable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {presetTypes.map((type) => {
            const existing = schedules.find((s) => s.type === type);
            const isActive = !!existing?.enabled;
            if (isActive) return null;
            const draft = drafts[type] || {
              email: existing?.email || "",
              subject: existing?.subject || "",
            };
            const { emailError, subjectError } = validateDraft(type, existing);
            const showEmailError =
              !!emailError && !!drafts[type]?.touched?.email;
            const showSubjectError =
              !!subjectError && !!drafts[type]?.touched?.subject;
            const isValid = !emailError && !subjectError;

            return (
              <div
                key={type}
                className="w-full p-4 mb-4 bg-slate-800 rounded-lg border border-slate-700"
              >
                <div className="mb-2">
                  <div className="font-medium text-base">
                    {t(`ReportsPage.Presets.${type}`)}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <input
                      id={`report-email-${type}`}
                      placeholder={t("ReportsPage.emailPlaceholder")}
                      value={draft.email}
                      onChange={(e) =>
                        updateDraft(type, "email", e.target.value)
                      }
                      onBlur={(e) => {
                        touchDraft(type, "email");
                        handleSaveSchedule({
                          id: existing?.id,
                          type,
                          email: e.target.value,
                          enabled: existing?.enabled,
                        });
                      }}
                      className="w-full px-3 py-2 rounded bg-slate-900 text-base text-white border border-slate-700"
                      disabled={isActive}
                    />
                    <div className="h-4 mt-1 text-xs text-rose-400">
                      {showEmailError ? emailError : "\u00A0"}
                    </div>
                    <input
                      id={`report-subject-${type}`}
                      placeholder={t("ReportsPage.subjectPlaceholder")}
                      value={draft.subject}
                      onChange={(e) =>
                        updateDraft(type, "subject", e.target.value)
                      }
                      onBlur={(e) => {
                        touchDraft(type, "subject");
                        handleSaveSchedule({
                          id: existing?.id,
                          type,
                          email: existing?.email ?? undefined,
                          enabled: existing?.enabled,
                          subject: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 rounded bg-slate-900 text-base text-white border border-slate-700"
                      disabled={isActive}
                    />
                    <div className="h-4 mt-1 text-xs text-rose-400">
                      {showSubjectError ? subjectError : "\u00A0"}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        handleToggle(existing?.id, !isActive, type)
                      }
                      disabled={!isValid}
                      className={`px-3 py-2 rounded font-medium ${isActive ? "bg-sky-600 hover:bg-sky-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"} disabled:opacity-50`}
                    >
                      {t("ReportsPage.schedulingEnable") || "Enable"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
