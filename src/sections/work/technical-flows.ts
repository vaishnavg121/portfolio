type Step = readonly [label: string, explanation: string];
type Flow = { title: string; lanes: readonly (readonly Step[])[] };

export const technicalFlows = {
  observations: {
    title: "From the airport to a common weather record",
    lanes: [
      [
        ["PTU & wind", "Pressure, temperature, humidity, dew point, wind speed and direction."],
        ["Visibility & present weather", "Meteorological Optical Range and observations of current weather."],
        ["Cloud layers", "Ceilometer observations supply cloud bases, coverage, and vertical visibility."],
      ],
      [["Validation", "Check timestamps, flag gaps and remove duplicate observations."]],
      [["Time-aligned record", "Preserve the time and conditions needed to compare observations across streams."]],
    ],
  },
  forecast: {
    title: "Forecast preparation and evaluation",
    lanes: [
      [["Raw observations", "Sensor feeds arrive with different formats and sampling intervals."]],
      [["Clean and align", "Decode cloud telegrams, apply quality checks, and align the streams to a common 15-second grid."]],
      [
        ["Classical models", "Evaluate tree ensembles and other tabular models on prepared features."],
        ["Recurrent models", "Feed recent observations to sequential models such as GRU and Attention-LSTM."],
      ],
      [["Forecast evaluation", "Compare errors for the relevant prediction target alongside computational efficiency."]],
    ],
  },
  windy: {
    title: "One question, three tool paths",
    lanes: [
      [["Weather question", "The Next.js interface streams application events as the investigation progresses."]],
      [["Intent routing", "The agent classifies the question and sends it to the matching typed tool."]],
      [
        ["DuckDB analytics", "Filters, numerical aggregation, event lookup, and supported airport comparisons run against tabular observations."],
        ["Semantic retrieval", "The vector index retrieves meteorology and project documentation for explanatory context."],
        ["Pattern discovery", "Complete rows are standardized, projected with PCA, and clustered with K-Means."],
      ],
      [["Answer with evidence", "Synthesis uses tool results, with tables, charts, or source citations as applicable."]],
    ],
  },
  windyOutput: {
    title: "What supports the answer",
    lanes: [
      [
        ["Numerical results", "DuckDB returns values and matching row counts for supported comparisons."],
        ["Retrieved context", "Domain sources accompany explanations when retrieval contributes evidence."],
      ],
      [["Synthesis", "The model uses the tool response to explain the result and its stated bounds."]],
      [["Response and visuals", "A visitor can read the answer and inspect the accompanying chart, table, or citation."]],
    ],
  },
  legalLoop: {
    title: "From case intake to reviewable analysis",
    lanes: [
      [["Case intake", "Separate claims, uploaded documents, and gaps that require clarification."]],
      [["Research plan", "Use the case state to identify questions and authorities to look for."]],
      [["Evidence check", "Track source references and flag gaps when the available material is insufficient."]],
      [["Preliminary analysis", "Organize supported arguments, counterarguments, and unresolved questions for review."]],
    ],
  },
  legalRetrieval: {
    title: "How authorities reach the evidence graph",
    lanes: [
      [["Typed legal query", "Parse exact references and apply metadata filters before searching."]],
      [
        ["Statute or precedent lookup", "An explicit reference can go directly to the corresponding authority."],
        ["Hybrid retrieval", "Combine lexical and semantic search for broader questions. Embedding profiles remain separate."],
      ],
      [["Ranked authorities", "Fuse hybrid results using reciprocal rank fusion and apply authority-aware ranking."]],
      [["Source references", "Attach provenance to the selected passages before using them in the case analysis."]],
    ],
  },
  spenzaChecks: {
    title: "Checks before recording an expense",
    lanes: [
      [["Expense request", "An authenticated request carries the expense, payer contributions, participants, and a retry key."]],
      [["Validate the split", "Use integer minor units and check that payer contributions add up to the expense."]],
      [["Deterministic rounding", "Allocate the remainder predictably so that the shares sum to the exact amount."]],
      [["Recorded balances", "Store the financial changes and expose the resulting participant balances."]],
    ],
  },
  spenzaWrite: {
    title: "What happens when a request is retried",
    lanes: [
      [["Client mutation", "The client supplies an idempotency key with the requested expense or settlement."]],
      [["Check the key", "Identify whether the request has already been recorded."]],
      [
        ["New request", "Validate and apply the financial write in the transaction."],
        ["Recorded request", "Reuse the recorded result for an equivalent retry."],
      ],
      [["Reconciled ledger", "Participant balances reflect one successful write for the request."]],
    ],
  },
} as const satisfies Record<string, Flow>;
