"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, CircleDot, type LucideIcon, UsersRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative min-h-dvh px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-white">
              <CircleDot className="h-5 w-5" aria-hidden="true" />
            </span>
            Orbitask
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#security" className="hover:text-foreground">Security</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </nav>
          <Button asChild variant="secondary" size="sm">
            <Link href="/app/my-tasks">Open demo</Link>
          </Button>
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 pb-16 pt-16 lg:grid-cols-[1fr_0.92fr] lg:pt-24">
          <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }} className="max-w-3xl">
            <motion.div variants={fadeUp}>
              <Badge className="border-red-200 bg-red-50 text-red-700">Built for multi-assignee tasks</Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-6 max-w-4xl text-5xl font-bold leading-[1.04] tracking-normal text-foreground sm:text-6xl lg:text-7xl"
            >
              Team tasks where every assignee owns their own status.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Orbitask keeps the speed of a simple todo list, then adds team ownership, project permissions, and
              independent progress for each person on the same task.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/app/my-tasks">
                  Try the product flow <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/sign-up">Create workspace</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8 grid max-w-2xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {["Realtime Convex model", "Role-based authorization", "Calm productivity UI"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
              <div className="rounded-xl border border-border bg-[#fbfaf8]">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div>
                    <p className="text-sm font-semibold">Shared launch task</p>
                    <p className="text-xs text-muted-foreground">3 assignees with separate status</p>
                  </div>
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">Doing</Badge>
                </div>
                <div className="space-y-3 p-4">
                  {[
                    ["Design", "Done", "bg-emerald-50 text-emerald-700 border-emerald-200"],
                    ["Engineering", "Doing", "bg-amber-50 text-amber-700 border-amber-200"],
                    ["Operations", "Todo", "bg-slate-50 text-slate-600 border-slate-200"],
                  ].map(([name, status, className], index) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + index * 0.08 }}
                      className="flex items-center justify-between rounded-lg border border-border bg-white p-3"
                    >
                      <span className="font-medium">{name}</span>
                      <Badge className={className}>{status}</Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="workflow" className="border-y border-border bg-surface px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            { title: "Create team workspaces", copy: "Owners create teams, invite people, and control member roles.", Icon: UsersRound },
            { title: "Assign one task to many", copy: "A task can include multiple assignees without collapsing responsibility.", Icon: CircleDot },
            { title: "Track live progress", copy: "Each assignee updates only their own status; the overall status is derived.", Icon: Zap },
          ].map(({ title, copy, Icon }: { title: string; copy: string; Icon: LucideIcon }) => (
            <div key={title} className="rounded-xl border border-border bg-background p-6">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-bold">{title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="security" className="px-5 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="border-border bg-surface text-muted-foreground">Authorization-first MVP</Badge>
          <h2 className="mt-5 text-3xl font-bold sm:text-5xl">Built around server-side permission checks.</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Convex queries and mutations are designed to derive identity from auth context, validate active membership,
            and prevent users from changing another person&apos;s assignment status.
          </p>
        </div>
      </section>

      <section id="pricing" className="px-5 pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl bg-foreground p-8 text-white md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-red-200">MVP ready path</p>
            <h2 className="mt-2 text-3xl font-bold">Start with the product demo, then connect Convex auth.</h2>
          </div>
          <Button asChild size="lg" className="bg-white text-foreground hover:bg-red-50">
            <Link href="/app/my-tasks">View app UI</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
