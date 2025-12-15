"use client"

import type React from "react"

interface CodeLineProps {
  num: number
  indent?: number
  children?: React.ReactNode
}

function CodeLine({ num, indent = 0, children }: CodeLineProps) {
  return (
    <div className="flex">
      <span className="w-8 pr-4 text-right text-slate-600 select-none flex-shrink-0">{num}</span>
      <span className="flex-1" style={{ paddingLeft: `${indent * 16}px` }}>
        {children}
      </span>
    </div>
  )
}

// Syntax highlighting helpers
const kw = "text-blue-400" // keywords
const fn = "text-yellow-300" // functions
const tp = "text-sky-300" // types
const str = "text-green-400" // strings
const prm = "text-orange-300" // parameters
const txt = "text-slate-300" // plain text

export function ReactHookSample() {
  return (
    <code className="block font-mono text-sm leading-6 max-h-72 overflow-y-auto">
      <CodeLine num={1}>
        <span className={kw}>import</span> {"{ "}
        <span className={tp}>useState</span>, <span className={tp}>useEffect</span>
        {" }"} <span className={kw}>from</span> <span className={str}>'react'</span>;
      </CodeLine>
      <CodeLine num={2} />
      <CodeLine num={3}>
        <span className={kw}>export function</span> <span className={fn}>useDebounce</span>
        {"<"}
        <span className={tp}>T</span>
        {">"}(<span className={prm}>value</span>: <span className={tp}>T</span>, <span className={prm}>delay</span>:{" "}
        <span className={tp}>number</span>) {"{"}
      </CodeLine>
      <CodeLine num={4} indent={1}>
        <span className={kw}>const</span> [<span className={tp}>debouncedValue</span>,{" "}
        <span className={tp}>setDebouncedValue</span>] = <span className={fn}>useState</span>(value);
      </CodeLine>
      <CodeLine num={5} />
      <CodeLine num={6} indent={1}>
        <span className={fn}>useEffect</span>
        {"(() => {"}
      </CodeLine>
      <CodeLine num={7} indent={2}>
        <span className={kw}>const</span> timer = <span className={fn}>setTimeout</span>
        {"(() =>"} <span className={fn}>setDebouncedValue</span>(value), delay);
      </CodeLine>
      <CodeLine num={8} indent={2}>
        <span className={kw}>return</span> {"() =>"} <span className={fn}>clearTimeout</span>(timer);
      </CodeLine>
      <CodeLine num={9} indent={1}>
        {"}, ["}value, delay{"]);"}
      </CodeLine>
      <CodeLine num={10} />
      <CodeLine num={11} indent={1}>
        <span className={kw}>return</span> <span className={txt}>debouncedValue</span>;
      </CodeLine>
      <CodeLine num={12}>{"}"}</CodeLine>
    </code>
  )
}

export function PythonAsyncSample() {
  return (
    <code className="block font-mono text-sm leading-6 max-h-72 overflow-y-auto">
      <CodeLine num={1}>
        <span className={kw}>import</span> <span className={tp}>asyncio</span>
      </CodeLine>
      <CodeLine num={2}>
        <span className={kw}>from</span> <span className={tp}>typing</span> <span className={kw}>import</span>{" "}
        <span className={tp}>AsyncIterator</span>
      </CodeLine>
      <CodeLine num={3} />
      <CodeLine num={4}>
        <span className={kw}>async def</span> <span className={fn}>fetch_batch</span>(urls:{" "}
        <span className={tp}>list</span>[<span className={tp}>str</span>]) -{">"}{" "}
        <span className={tp}>AsyncIterator</span>[<span className={tp}>dict</span>]:
      </CodeLine>
      <CodeLine num={5} indent={1}>
        <span className={str}>"""Fetch multiple URLs concurrently."""</span>
      </CodeLine>
      <CodeLine num={6} indent={1}>
        <span className={kw}>async with</span> <span className={tp}>aiohttp</span>.
        <span className={fn}>ClientSession</span>() <span className={kw}>as</span> session:
      </CodeLine>
      <CodeLine num={7} indent={2}>
        tasks = [<span className={fn}>fetch_one</span>(session, url) <span className={kw}>for</span> url{" "}
        <span className={kw}>in</span> urls]
      </CodeLine>
      <CodeLine num={8} indent={2}>
        <span className={kw}>for</span> result <span className={kw}>in</span> <span className={kw}>await</span> asyncio.
        <span className={fn}>gather</span>(*tasks):
      </CodeLine>
      <CodeLine num={9} indent={3}>
        <span className={kw}>yield</span> result
      </CodeLine>
    </code>
  )
}

export function TypeScriptAPISample() {
  return (
    <code className="block font-mono text-sm leading-6 max-h-72 overflow-y-auto">
      <CodeLine num={1}>
        <span className={kw}>interface</span> <span className={tp}>ApiResponse</span>
        {"<"}
        <span className={tp}>T</span>
        {">"} {"{"}
      </CodeLine>
      <CodeLine num={2} indent={1}>
        <span className={prm}>data</span>: <span className={tp}>T</span>;
      </CodeLine>
      <CodeLine num={3} indent={1}>
        <span className={prm}>status</span>: <span className={str}>'success'</span> |{" "}
        <span className={str}>'error'</span>;
      </CodeLine>
      <CodeLine num={4} indent={1}>
        <span className={prm}>timestamp</span>: <span className={tp}>number</span>;
      </CodeLine>
      <CodeLine num={5}>{"}"}</CodeLine>
      <CodeLine num={6} />
      <CodeLine num={7}>
        <span className={kw}>export async function</span> <span className={fn}>fetchApi</span>
        {"<"}
        <span className={tp}>T</span>
        {">"}(
      </CodeLine>
      <CodeLine num={8} indent={1}>
        <span className={prm}>endpoint</span>: <span className={tp}>string</span>
      </CodeLine>
      <CodeLine num={9}>
        ): <span className={tp}>Promise</span>
        {"<"}
        <span className={tp}>ApiResponse</span>
        {"<"}
        <span className={tp}>T</span>
        {">>"} {"{"}
      </CodeLine>
      <CodeLine num={10} indent={1}>
        <span className={kw}>const</span> res = <span className={kw}>await</span> <span className={fn}>fetch</span>(
        <span className={str}>
          {"`/api/${"}
          <span className={tp}>endpoint</span>
          {"}`"}
        </span>
        );
      </CodeLine>
      <CodeLine num={11} indent={1}>
        <span className={kw}>return</span> res.<span className={fn}>json</span>();
      </CodeLine>
      <CodeLine num={12}>{"}"}</CodeLine>
    </code>
  )
}
