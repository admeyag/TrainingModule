import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { MAX_ATTEMPTS, PASS_MARK, WAREHOUSES } from "@/lib/training-data";
import { CONTENT } from "@/lib/content";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Lock, LogOut, Trash2 } from "lucide-react";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Admin Panel | Purplle Packer Training" },
      {
        name: "description",
        content:
          "Password protected admin panel with employee and warehouse packer training rankings, flagged employees and full entry management.",
      },
      { property: "og:title", content: "Admin Panel | Purplle Packer Training" },
      {
        property: "og:description",
        content: "Ranked employee and site scorecards, flagged packers and entry management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelPage,
});

const PANEL_PASSWORD = "trainingpanel2026";
const AUTH_KEY = "purplle-panel-auth";

type Attempt = {
  id: string;
  packer_name: string;
  employee_code: string;
  email: string | null;
  warehouse_code: string;
  warehouse_name: string;
  city: string;
  shift: string | null;
  language: string | null;
  attempt_number: number | null;
  score: number;
  total_questions: number;
  percentage: number;
  result: string;
  time_taken_seconds: number;
  created_at: string;
};

type EmployeeRow = {
  employee_code: string;
  packer_name: string;
  email: string | null;
  warehouse_code: string;
  warehouse_name: string;
  city: string;
  shift: string | null;
  language: string | null;
  attempts: number;
  best: number;
  last: number;
  lastAt: string;
  avgTime: number;
  status: "passed" | "in_progress" | "flagged";
};

function PanelPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === PANEL_PASSWORD);
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!authed)
    return (
      <PanelLogin
        onSuccess={() => {
          sessionStorage.setItem(AUTH_KEY, PANEL_PASSWORD);
          setAuthed(true);
        }}
      />
    );
  return (
    <Dashboard
      onLogout={() => {
        sessionStorage.removeItem(AUTH_KEY);
        setAuthed(false);
      }}
    />
  );
}

function PanelLogin({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col justify-center px-5 py-20">
        <div className="card-soft p-8">
          <div className="brand-gradient mx-auto flex size-12 items-center justify-center rounded-xl text-primary-foreground">
            <Lock className="size-5" />
          </div>
          <h1 className="mt-5 text-center text-xl font-extrabold">Admin panel login</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            This panel is restricted to training administrators.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (pwd === PANEL_PASSWORD) onSuccess();
              else setErr(true);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="pwd">Password</Label>
              <Input
                id="pwd"
                type="password"
                autoFocus
                value={pwd}
                onChange={(e) => {
                  setPwd(e.target.value);
                  setErr(false);
                }}
                placeholder="Enter admin password"
              />
            </div>
            {err && <p className="text-sm text-destructive">Incorrect password.</p>}
            <Button type="submit" className="w-full">
              Unlock panel
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [wh, setWh] = useState("all");
  const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["training_attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as Attempt[];
    },
    refetchInterval: 30000,
  });

  const attempts = useMemo(() => data ?? [], [data]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["training_attempts"] });

  async function deleteAttempt(id: string) {
    if (!confirm("Delete this attempt permanently?")) return;
    setBusy(true);
    await supabase.from("training_attempts").delete().eq("id", id);
    setBusy(false);
    refresh();
  }

  async function deleteEmployee(code: string) {
    if (!confirm(`Delete ALL attempts for employee ${code}? This resets their training.`))
      return;
    setBusy(true);
    await supabase.from("training_attempts").delete().eq("employee_code", code);
    setBusy(false);
    refresh();
  }

  const employees = useMemo<EmployeeRow[]>(() => {
    const map = new Map<string, Attempt[]>();
    for (const a of attempts) {
      const list = map.get(a.employee_code) ?? [];
      list.push(a);
      map.set(a.employee_code, list);
    }
    return [...map.entries()].map(([code, rows]) => {
      const sorted = [...rows].sort(
        (x, y) => +new Date(y.created_at) - +new Date(x.created_at),
      );
      const latest = sorted[0]!;
      const best = Math.max(...rows.map((r) => Number(r.percentage)));
      const passed = rows.some((r) => r.result === "pass");
      return {
        employee_code: code,
        packer_name: latest.packer_name,
        email: latest.email ?? "",
        warehouse_code: latest.warehouse_code,
        warehouse_name: latest.warehouse_name,
        city: latest.city,
        shift: latest.shift,
        language: latest.language,
        attempts: rows.length,
        best,
        last: Number(latest.percentage),
        lastAt: latest.created_at,
        avgTime: Math.round(
          rows.reduce((s, r) => s + (r.time_taken_seconds ?? 0), 0) / rows.length,
        ),
        status: passed
          ? ("passed" as const)
          : rows.length >= MAX_ATTEMPTS
            ? ("flagged" as const)
            : ("in_progress" as const),
      };
    });
  }, [attempts]);

  // Global ranking: best % desc -> fewer attempts -> faster -> earlier
  const rankedEmployees = useMemo(() => {
    const sorted = [...employees].sort(
      (a, b) =>
        b.best - a.best ||
        a.attempts - b.attempts ||
        a.avgTime - b.avgTime ||
        +new Date(a.lastAt) - +new Date(b.lastAt),
    );
    return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
  }, [employees]);

  const matches = (e: EmployeeRow) => {
    const q = search.trim().toLowerCase();
    const okQ =
      !q ||
      e.packer_name.toLowerCase().includes(q) ||
      e.employee_code.toLowerCase().includes(q) ||
      (e.email ?? "").toLowerCase().includes(q);
    const okWh = wh === "all" || e.warehouse_code === wh;
    const okStatus = status === "all" || e.status === status;
    return okQ && okWh && okStatus;
  };

  const filteredEmployees = rankedEmployees.filter(matches);
  const flagged = rankedEmployees.filter((e) => e.status === "flagged");
  const passedCount = employees.filter((e) => e.status === "passed").length;

  const avg = (nums: number[]) =>
    nums.length
      ? Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10
      : 0;

  const rankedSites = useMemo(() => {
    const rows = WAREHOUSES.map((w) => {
      const emps = employees.filter((e) => e.warehouse_code === w.code);
      const rws = attempts.filter((a) => a.warehouse_code === w.code);
      const passed = emps.filter((e) => e.status === "passed").length;
      return {
        ...w,
        packers: emps.length,
        attempts: rws.length,
        flagged: emps.filter((e) => e.status === "flagged").length,
        certified: passed,
        score: avg(emps.map((e) => e.best)),
        certRate: emps.length ? Math.round((passed / emps.length) * 1000) / 10 : 0,
      };
    });
    return rows
      .sort(
        (a, b) =>
          b.certRate - a.certRate ||
          b.score - a.score ||
          a.flagged - b.flagged ||
          b.packers - a.packers,
      )
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [employees, attempts]);

  const filteredAttempts = attempts.filter((a) => {
    const q = search.trim().toLowerCase();
    const okQ =
      !q ||
      a.packer_name.toLowerCase().includes(q) ||
      a.employee_code.toLowerCase().includes(q) ||
      (a.email ?? "").toLowerCase().includes(q);
    const okWh = wh === "all" || a.warehouse_code === wh;
    return okQ && okWh;
  });

  function exportCsv() {
    const head = [
      "packer_name",
      "employee_code",
      "email",
      "warehouse",
      "city",
      "shift",
      "language",
      "attempt",
      "score",
      "total",
      "percentage",
      "result",
      "time_seconds",
      "created_at",
    ];
    const lines = filteredAttempts.map((a) =>
      [
        a.packer_name,
        a.employee_code,
        a.email ?? "",
        a.warehouse_name,
        a.city,
        a.shift ?? "",
        langLabel(a.language),
        a.attempt_number ?? 1,
        a.score,
        a.total_questions,
        a.percentage,
        a.result,
        a.time_taken_seconds,
        a.created_at,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purplle-packer-training-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="card-premium flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Packer Training Admin Panel
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Ranked employee and site scorecards, attempt progress, flagged packers and full
              entry control across all {WAREHOUSES.length} warehouses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Pass mark {PASS_MARK}%
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Max {MAX_ATTEMPTS} attempts
            </Badge>
            <Button size="sm" variant="outline" onClick={exportCsv}>
              <Download className="size-4" /> CSV
            </Button>
            <Button size="sm" variant="ghost" onClick={onLogout}>
              <LogOut className="size-4" /> Logout
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Stat label="Packers" value={String(employees.length)} />
          <Stat label="Certified" value={String(passedCount)} />
          <Stat label="Flagged" value={String(flagged.length)} tone="danger" />
          <Stat label="Total attempts" value={String(attempts.length)} />
          <Stat label="Avg best score" value={`${avg(employees.map((e) => e.best))}%`} />
          <Stat
            label="Certification rate"
            value={`${employees.length ? Math.round((passedCount / employees.length) * 1000) / 10 : 0}%`}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Input
            placeholder="Search name, code or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Select value={wh} onValueChange={setWh}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {WAREHOUSES.map((w) => (
                <SelectItem key={w.code} value={w.code}>
                  {w.code} - {w.short}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="passed">Certified</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="employees" className="mt-6">
          <TabsList>
            <TabsTrigger value="employees">Employee ranking</TabsTrigger>
            <TabsTrigger value="sites">Site ranking</TabsTrigger>
            <TabsTrigger value="flagged">Flagged ({flagged.length})</TabsTrigger>
            <TabsTrigger value="entries">All entries</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <div className="card-soft overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">Rank</TableHead>
                    <TableHead>Packer</TableHead>
                    <TableHead>Emp code</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Best %</TableHead>
                    <TableHead>Last %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last attempt</TableHead>
                    <TableHead className="text-right">Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <EmptyState
                    isLoading={isLoading}
                    empty={filteredEmployees.length === 0}
                    cols={13}
                  />
                  {filteredEmployees.map((e) => (
                    <TableRow key={e.employee_code}>
                      <TableCell>
                        <RankBadge rank={e.rank} />
                      </TableCell>
                      <TableCell className="font-medium">{e.packer_name}</TableCell>
                      <TableCell>{e.employee_code}</TableCell>
                      <TableCell className="text-xs">{e.email || "-"}</TableCell>
                      <TableCell>
                        {e.warehouse_name}
                        <span className="block text-xs text-muted-foreground">{e.city}</span>
                      </TableCell>
                      <TableCell>{e.shift ?? "-"}</TableCell>
                      <TableCell>{langLabel(e.language)}</TableCell>
                      <TableCell>
                        {e.attempts}/{MAX_ATTEMPTS}
                      </TableCell>
                      <TableCell className="font-semibold">{e.best}%</TableCell>
                      <TableCell>{e.last}%</TableCell>
                      <TableCell>
                        <StatusBadge status={e.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(e.lastAt).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={busy}
                          title="Delete all attempts for this employee"
                          onClick={() => deleteEmployee(e.employee_code)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="sites">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rankedSites.map((w) => (
                <div key={w.code} className="card-soft p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="flex items-center gap-2 font-semibold">
                      <RankBadge rank={w.rank} />
                      {w.code} — {w.short}
                    </p>
                    <span className="brand-text text-lg font-extrabold">{w.certRate}%</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{w.city}</p>
                  <Progress className="mt-3" value={w.certRate} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {w.packers} packers · {w.certified} certified · avg best {w.score}% ·{" "}
                    {w.attempts} attempts
                  </p>
                  {w.flagged > 0 && (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {w.flagged} flagged
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flagged">
            <div className="card-soft overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Packer</TableHead>
                    <TableHead>Emp code</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Best %</TableHead>
                    <TableHead>Last attempt</TableHead>
                    <TableHead className="text-right">Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <EmptyState
                    isLoading={isLoading}
                    empty={flagged.filter(matches).length === 0}
                    cols={9}
                    emptyText="No flagged employees — nobody has exhausted all 3 attempts."
                  />
                  {flagged.filter(matches).map((e) => (
                    <TableRow key={e.employee_code}>
                      <TableCell className="font-medium">{e.packer_name}</TableCell>
                      <TableCell>{e.employee_code}</TableCell>
                      <TableCell className="text-xs">{e.email || "-"}</TableCell>
                      <TableCell>
                        {e.warehouse_name}
                        <span className="block text-xs text-muted-foreground">{e.city}</span>
                      </TableCell>
                      <TableCell>{e.shift ?? "-"}</TableCell>
                      <TableCell>
                        {e.attempts}/{MAX_ATTEMPTS}
                      </TableCell>
                      <TableCell className="font-semibold">{e.best}%</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(e.lastAt).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => deleteEmployee(e.employee_code)}
                        >
                          Reset attempts
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="entries">
            <div className="card-soft overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Packer</TableHead>
                    <TableHead>Emp code</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Training %</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <EmptyState
                    isLoading={isLoading}
                    empty={filteredAttempts.length === 0}
                    cols={11}
                  />
                  {filteredAttempts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.packer_name}</TableCell>
                      <TableCell>{a.employee_code}</TableCell>
                      <TableCell className="text-xs">{a.email || "-"}</TableCell>
                      <TableCell>
                        {a.warehouse_name}
                        <span className="block text-xs text-muted-foreground">{a.city}</span>
                      </TableCell>
                      <TableCell>
                        {a.attempt_number ?? 1}/{MAX_ATTEMPTS}
                      </TableCell>
                      <TableCell>{langLabel(a.language)}</TableCell>
                      <TableCell>
                        {a.score}/{a.total_questions}
                      </TableCell>
                      <TableCell className="font-semibold">{Number(a.percentage)}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={a.result === "pass" ? "default" : "destructive"}
                          className="capitalize"
                        >
                          {a.result}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={busy}
                          title="Delete this entry"
                          onClick={() => deleteAttempt(a.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function langLabel(code: string | null) {
  if (!code) return "English";
  return CONTENT[code]?.label ?? code;
}

function RankBadge({ rank }: { rank: number }) {
  const top = rank <= 3;
  return (
    <span
      className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ${
        top ? "brand-gradient text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {rank}
    </span>
  );
}

function StatusBadge({ status }: { status: EmployeeRow["status"] }) {
  if (status === "passed") return <Badge>Certified</Badge>;
  if (status === "flagged") return <Badge variant="destructive">Flagged</Badge>;
  return <Badge variant="secondary">In progress</Badge>;
}

function EmptyState({
  isLoading,
  empty,
  cols,
  emptyText = "No entries yet.",
}: {
  isLoading: boolean;
  empty: boolean;
  cols: number;
  emptyText?: string;
}) {
  if (isLoading)
    return (
      <TableRow>
        <TableCell colSpan={cols} className="py-10 text-center text-sm text-muted-foreground">
          Loading…
        </TableCell>
      </TableRow>
    );
  if (empty)
    return (
      <TableRow>
        <TableCell colSpan={cols} className="py-10 text-center text-sm text-muted-foreground">
          {emptyText}
        </TableCell>
      </TableRow>
    );
  return null;
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div className="card-soft hover-lift p-5">
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p
        className={`mt-2 text-3xl font-extrabold tracking-tight ${tone === "danger" ? "text-destructive" : "brand-text"}`}
      >
        {value}
      </p>
    </div>
  );

}
