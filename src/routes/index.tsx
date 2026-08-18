import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import {
  QUESTIONS,
  WAREHOUSES,
  PASS_MARK,
  MAX_ATTEMPTS,
  SHIFTS,
  warehouseByCode,
} from "@/lib/training-data";
import { LANGUAGES, getContent } from "@/lib/content";
import sopVideo from "@/assets/purplle-sop.mp4.asset.json";

// Use the stable project asset origin so the video also works when this app is
// deployed to another host such as Cloudflare Workers.
const ASSET_ORIGIN = "https://project--84002374-aeaf-4bf1-a95b-a1a56c5e644c-dev.lovable.app";
const SOP_VIDEO_URL = `${ASSET_ORIGIN}${sopVideo.url}`;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ClipboardList, Languages, PackageCheck, XCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Packer Training & Assessment | Purplle" },
      {
        name: "description",
        content:
          "Read the Purplle packing SOP in your language and take the packer assessment. 100% score required, 3 attempts allowed.",
      },
      { property: "og:title", content: "Packer Training & Assessment | Purplle" },
      {
        property: "og:description",
        content:
          "Packing SOP training in 9 Indian languages with a 100% pass mark and 3 attempts per packer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrainingPage,
});

type Step = "details" | "blocked" | "sop" | "quiz" | "result";

type Details = {
  packer_name: string;
  employee_code: string;
  email: string;
  warehouse_code: string;
  shift: string;
  language: string;
};

const EMAIL_DOMAIN = "@purplle.com";
const isPurplleEmail = (v: string) =>
  /^[^\s@]+@purplle\.com$/.test(v.trim().toLowerCase());

function TrainingPage() {
  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<Details>({
    packer_name: "",
    employee_code: "",
    email: "",
    warehouse_code: "",
    shift: "First Shift",
    language: "en",
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedAttempts, setUsedAttempts] = useState(0);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [result, setResult] = useState<{ score: number; pct: number } | null>(null);

  const c = getContent(details.language);
  const t = c.ui;
  const answeredCount = Object.keys(answers).length;
  const detailsValid =
    details.packer_name.trim().length >= 2 &&
    details.employee_code.trim().length >= 2 &&
    isPurplleEmail(details.email) &&
    details.warehouse_code !== "";

  const wh = useMemo(
    () => warehouseByCode(details.warehouse_code),
    [details.warehouse_code],
  );

  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - usedAttempts);

  async function beginTraining() {
    setChecking(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from("training_attempts")
        .select("result")
        .eq("employee_code", details.employee_code.trim())
        .limit(50);
      if (qErr) throw qErr;
      const rows = data ?? [];
      setUsedAttempts(rows.length);
      const passed = rows.some((r) => r.result === "pass");
      setAlreadyPassed(passed);
      if (passed || rows.length >= MAX_ATTEMPTS) {
        setStep("blocked");
        return;
      }
      setStep("sop");
    } catch (e) {
      console.error("[beginTraining]", e);
      setError(
        e instanceof Error && e.message.includes("environment variable")
          ? "Backend is not configured on this deployment (missing VITE_SUPABASE_* build variables)."
          : t.saveError,
      );
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    if (answeredCount !== QUESTIONS.length) return;
    setSaving(true);
    setError(null);
    const score = QUESTIONS.reduce(
      (acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0),
      0,
    );
    const pct = Math.round((score / QUESTIONS.length) * 10000) / 100;
    const { error: insertError } = await supabase.from("training_attempts").insert({
      packer_name: details.packer_name.trim().slice(0, 100),
      employee_code: details.employee_code.trim().slice(0, 40),
      email: details.email.trim().toLowerCase().slice(0, 120),
      warehouse_code: details.warehouse_code,
      warehouse_name: wh ? `${wh.code} - ${wh.short}` : details.warehouse_code,
      city: wh?.city ?? "",
      shift: details.shift,
      language: details.language,
      attempt_number: usedAttempts + 1,
      answers: QUESTIONS.map((q) => ({
        id: q.id,
        section: q.section,
        selected: answers[q.id],
        correct: q.answer,
        is_correct: answers[q.id] === q.answer,
      })),
      score,
      total_questions: QUESTIONS.length,
      percentage: pct,
      result: pct >= PASS_MARK ? "pass" : "fail",
      time_taken_seconds: startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0,
    });
    setSaving(false);
    if (insertError) {
      console.error("[submit]", insertError);
      setError(t.saveError);
      return;
    }
    setUsedAttempts((n) => n + 1);
    setResult({ score, pct });
    setStep("result");
  }

  function resetAll() {
    setAnswers({});
    setResult(null);
    setUsedAttempts(0);
    setAlreadyPassed(false);
    setDetails({
      packer_name: "",
      employee_code: "",
      email: "",
      warehouse_code: "",
      shift: "First Shift",
      language: details.language,
    });
    setStep("details");
  }

  const shiftLabel = (s: string) =>
    s === "First Shift" ? t.firstShift : s === "Second Shift" ? t.secondShift : t.nightShift;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="brand-gradient relative overflow-hidden text-primary-foreground">
        <div
          className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase backdrop-blur-sm">
            {t.heroKicker}
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl leading-[1.05] font-extrabold sm:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-sm opacity-90 sm:text-base">{t.heroSubtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ClipboardList, label: `${c.sop.length} ${t.sopSections}` },
              { icon: PackageCheck, label: `${t.passMark} ${PASS_MARK}%` },
              { icon: CheckCircle2, label: `${WAREHOUSES.length} ${t.warehouses}` },
              { icon: Languages, label: `${LANGUAGES.length} languages` },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm"
              >
                <Icon className="size-4 shrink-0" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>


      <main className="mx-auto max-w-3xl px-5 py-10">
        <Stepper
          step={step === "blocked" ? "details" : step}
          labels={[t.stepDetails, t.stepSop, t.stepQuiz, t.stepResult]}
        />

        {(step === "details" || step === "blocked") && (
          <div className="card-soft mt-6 p-6 sm:p-8">
            <h2 className="text-xl font-bold">{t.detailsTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.detailsSubtitle}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t.language}</Label>
                <Select
                  value={details.language}
                  onValueChange={(v) => setDetails({ ...details, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t.packerName}</Label>
                <Input
                  id="name"
                  maxLength={100}
                  value={details.packer_name}
                  onChange={(e) => setDetails({ ...details, packer_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp">{t.employeeCode}</Label>
                <Input
                  id="emp"
                  maxLength={40}
                  value={details.employee_code}
                  onChange={(e) =>
                    setDetails({ ...details, employee_code: e.target.value })
                  }
                  placeholder="e.g. PKR1042"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Work email ({EMAIL_DOMAIN})</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  placeholder={`yourname${EMAIL_DOMAIN}`}
                />
                {details.email.trim() !== "" && !isPurplleEmail(details.email) ? (
                  <p className="text-xs font-medium text-destructive">
                    Only {EMAIL_DOMAIN} email addresses can access this training.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Use your official Purplle email — it is recorded with your result.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t.warehouse}</Label>
                <Select
                  value={details.warehouse_code}
                  onValueChange={(v) => setDetails({ ...details, warehouse_code: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectWarehouse} />
                  </SelectTrigger>
                  <SelectContent>
                    {WAREHOUSES.map((w) => (
                      <SelectItem key={w.code} value={w.code}>
                        {w.code} - {w.short} ({w.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.shift}</Label>
                <Select
                  value={details.shift}
                  onValueChange={(v) => setDetails({ ...details, shift: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {shiftLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {step === "blocked" && (
              <div
                className={`mt-6 rounded-xl p-4 text-sm ${
                  alreadyPassed
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {alreadyPassed ? t.passed + " ✓" : t.noAttemptsLeft}
              </div>
            )}

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <Button
              className="mt-7 w-full sm:w-auto"
              disabled={!detailsValid || checking || step === "blocked"}
              onClick={beginTraining}
            >
              {checking ? t.checkingAttempts : t.startTraining}
            </Button>
            {step === "blocked" && (
              <Button className="mt-3 ml-0 sm:ml-3" variant="outline" onClick={resetAll}>
                {t.newPacker}
              </Button>
            )}
          </div>
        )}

        {step === "sop" && (
          <div className="mt-6 space-y-4">
            <div className="card-soft flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <span className="font-medium">
                {t.attemptLabel} {usedAttempts + 1} / {MAX_ATTEMPTS}
              </span>
              <span className="text-muted-foreground">
                {attemptsLeft} {t.attemptsLeft} · {t.perfectRequired}
              </span>
            </div>
            {c.sop.map((s) => (
              <article key={s.title} className="card-soft p-6">
                <h3 className="text-base font-bold">{s.title}</h3>
                <ul className="mt-3 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}

            <article className="card-premium p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 -top-24 h-40 brand-gradient opacity-10 blur-2xl" />
              <p className="eyebrow relative">Training video</p>
              <h3 className="relative mt-2 text-lg font-bold">
                Watch the narrated packing SOP
              </h3>
              <p className="relative mt-1 text-sm text-muted-foreground">
                Watch fully before starting the assessment.
              </p>
              <div className="relative mt-5 overflow-hidden rounded-2xl border border-border bg-black shadow-[var(--shadow-elevated)]">
                <video
                  src={SOP_VIDEO_URL}
                  controls
                  preload="metadata"
                  playsInline
                  className="aspect-video w-full"
                />
              </div>
            </article>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setStartedAt(Date.now());
                  setStep("quiz");
                }}
              >
                {t.readSopStart}
              </Button>
              <Button variant="outline" onClick={() => setStep("details")}>
                {t.back}
              </Button>
            </div>
          </div>
        )}

        {step === "quiz" && (
          <div className="mt-6 space-y-4">
            <div className="card-soft sticky top-16 z-20 p-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>
                  {answeredCount} {t.of} {QUESTIONS.length} {t.answered}
                </span>
                <span className="text-muted-foreground">
                  {details.packer_name} · {wh?.code}-{wh?.short}
                </span>
              </div>
              <Progress className="mt-3" value={(answeredCount / QUESTIONS.length) * 100} />
            </div>

            {QUESTIONS.map((q, i) => (
              <article key={q.id} className="card-soft p-6">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                  {q.section}
                </p>
                <h3 className="mt-2 text-base font-semibold">
                  {i + 1}. {c.questions[i]?.q ?? q.q}
                </h3>
                <div className="mt-4 grid gap-2">
                  {(c.questions[i]?.options ?? q.options).map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                          selected
                            ? "border-primary bg-secondary font-medium text-secondary-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              size="lg"
              disabled={answeredCount !== QUESTIONS.length || saving}
              onClick={submit}
            >
              {saving
                ? t.submitting
                : answeredCount !== QUESTIONS.length
                  ? t.answerAll
                  : t.submit}
            </Button>
          </div>
        )}

        {step === "result" && result && (
          <div className="card-soft mt-6 p-8 text-center">
            {result.pct >= PASS_MARK ? (
              <CheckCircle2 className="mx-auto size-14 text-success" />
            ) : (
              <XCircle className="mx-auto size-14 text-destructive" />
            )}
            <h2 className="mt-4 text-2xl font-bold">
              {result.pct >= PASS_MARK ? t.passed : t.failed}
            </h2>
            <p className="brand-text mt-2 text-5xl font-extrabold">{result.pct}%</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.score} {t.of} {QUESTIONS.length} {t.correctCount} · {details.packer_name} ·{" "}
              {wh?.code}-{wh?.short} · {t.attemptLabel} {usedAttempts}/{MAX_ATTEMPTS}
            </p>

            {result.pct < PASS_MARK && (
              <p
                className={`mx-auto mt-4 max-w-md rounded-xl p-3 text-sm ${
                  attemptsLeft > 0
                    ? "bg-muted text-muted-foreground"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {attemptsLeft > 0
                  ? `${t.perfectRequired} ${attemptsLeft} ${t.attemptsLeft}.`
                  : t.noAttemptsLeft}
              </p>
            )}

            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              {QUESTIONS.map((q, i) => ({ q, i })).filter(
                ({ q }) => answers[q.id] !== q.answer,
              ).map(({ q, i }) => (
                <div key={q.id} className="rounded-xl bg-muted p-4 text-sm">
                  <p className="font-medium">{c.questions[i]?.q ?? q.q}</p>
                  <p className="mt-1 text-muted-foreground">
                    {t.correctAnswer}: {c.questions[i]?.options[q.answer] ?? q.options[q.answer]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {result.pct < PASS_MARK && attemptsLeft > 0 && (
                <Button
                  onClick={() => {
                    setAnswers({});
                    setResult(null);
                    setStep("sop");
                  }}
                >
                  {t.tryAgain}
                </Button>
              )}
              <Button variant="outline" onClick={resetAll}>
                {t.newPacker}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stepper({ step, labels }: { step: Step; labels: string[] }) {
  const keys: Step[] = ["details", "sop", "quiz", "result"];
  const activeIndex = keys.indexOf(step);
  return (
    <ol className="flex items-center gap-2 text-xs font-semibold">
      {keys.map((k, i) => (
        <li key={k} className="flex flex-1 items-center gap-2">
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
              i <= activeIndex
                ? "brand-gradient text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </span>
          <span className={i <= activeIndex ? "text-foreground" : "text-muted-foreground"}>
            {labels[i]}
          </span>
        </li>
      ))}
    </ol>
  );
}
