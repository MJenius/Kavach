import React, { useState } from 'react';
import './architecture.css';

type Detail = { name: string; description: string; source: string; status: 'LIVE' | 'FOUNDATION' };

const details: Record<string, Detail> = {
  frontend: { name: 'Kavach React frontend', description: 'React + TypeScript + Vite application that calls the configured API base URL.', source: 'src/app/App.tsx · src/api/mock-client.ts', status: 'LIVE' },
  amplify: { name: 'AWS Amplify Hosting', description: 'Build configuration publishes the Vite dist output and supplies the production API URL.', source: 'amplify.yml', status: 'LIVE' },
  gateway: { name: 'Amazon API Gateway', description: 'The deployed REST API forwards the synchronous application request to Lambda.', source: 'infra/template.yaml · src/api/handler.ts', status: 'LIVE' },
  lambda: { name: 'AWS Lambda', description: 'ApiHandlerFunction bundles the API routes and agent orchestration.', source: 'infra/template.yaml · src/api/index.ts', status: 'LIVE' },
  bedrock: { name: 'Amazon Bedrock Mantle', description: 'Lambda uses the OpenAI-compatible Mantle endpoint with openai.gpt-oss-120b for production inference.', source: 'src/ai/bedrock-mantle.ts', status: 'LIVE' },
  dynamo: { name: 'Amazon DynamoDB', description: 'DynamoEvidenceStore reads and writes worker evidence, with fixture fallback when records are absent.', source: 'src/evidence/store.ts', status: 'LIVE' },
  s3: { name: 'Amazon S3', description: 'The evidence bucket and an S3 case-package export implementation provide object-storage integration.', source: 'infra/template.yaml · src/services/index.ts', status: 'LIVE' },
  step: { name: 'AWS Step Functions', description: 'A three-stage investigation workflow is provisioned, but the synchronous API handler does not start it.', source: 'infra/template.yaml · tests/aws/step-functions.test.ts', status: 'FOUNDATION' },
  eventbridge: { name: 'Amazon EventBridge', description: 'An event bus is provisioned; no PutEvents or event publishing runtime path exists.', source: 'infra/template.yaml', status: 'FOUNDATION' },
  cognito: { name: 'Amazon Cognito', description: 'User-pool infrastructure and an optional provider exist; the current frontend does not demonstrate a complete live sign-in flow.', source: 'infra/template.yaml · src/auth/index.ts', status: 'FOUNDATION' },
  supervisor: { name: 'SupervisorAgent', description: 'Coordinates the investigation agents and returns the evidence-backed synthesis.', source: 'src/agents/supervisor-agent.ts', status: 'LIVE' },
  forensics: { name: 'ForensicsAgent', description: 'Reconstructs the trip timeline and assesses SLA feasibility from evidence.', source: 'src/agents/forensics-agent.ts', status: 'LIVE' },
  earnings: { name: 'EarningsAgent', description: 'Reconciles payouts using deterministic financial facts before AI interpretation.', source: 'src/agents/earnings-agent.ts', status: 'LIVE' },
  policy: { name: 'PolicyAgent', description: 'Explains the available policy record without treating it as legal advice.', source: 'src/agents/policy-agent.ts', status: 'LIVE' },
  twin: { name: 'WorkerTwinAgent', description: 'Answers worker questions with deterministic answers authoritative for supported facts.', source: 'src/agents/worker-twin-agent.ts', status: 'LIVE' },
};

const Node = ({ id, children, active, onSelect }: { id: string; children: React.ReactNode; active: boolean; onSelect: (id: string) => void }) => (
  <button type="button" className={`architecture-node ${active ? 'selected' : ''}`} onClick={() => onSelect(id)} aria-label={`Show ${details[id].name} details`} title={details[id].description}>
    {children}
  </button>
);

export const ArchitecturePage: React.FC = () => {
  const [selected, setSelected] = useState('lambda');
  const [view, setView] = useState<'live' | 'foundation'>('live');
  const detail = details[selected];

  return (
    <div className="architecture-page">
      <section className="architecture-hero">
        <div>
          <span className="badge badge-success">● LIVE PRODUCTION</span>
          <h1>Architecture</h1>
          <p>How Kavach turns evidence into verified worker intelligence.</p>
          <small>Live production architecture — AWS services, agent orchestration, deterministic grounding, and evidence flow.</small>
        </div>
        <div className="architecture-switch" aria-label="Architecture view">
          <button type="button" className={view === 'live' ? 'active' : ''} onClick={() => setView('live')}>Live production path</button>
          <button type="button" className={view === 'foundation' ? 'active' : ''} onClick={() => setView('foundation')}>Provisioned foundations</button>
        </div>
      </section>

      <section className={`architecture-card request-path ${view === 'foundation' ? 'muted-path' : ''}`}>
        <div className="section-heading"><div><span>01 — LIVE REQUEST PATH</span><h2>Worker request to verified result</h2></div><p>Click a node to inspect the repository-backed implementation detail.</p></div>
        <div className="path-stack">
          <div className="path-row"><div className="person">Worker</div><i>↓</i><Node id="frontend" active={selected === 'frontend'} onSelect={setSelected}>Kavach React App</Node><i>↓</i><Node id="amplify" active={selected === 'amplify'} onSelect={setSelected}>AWS Amplify Hosting</Node></div>
          <i>↓</i><Node id="gateway" active={selected === 'gateway'} onSelect={setSelected}>Amazon API Gateway</Node><i>↓</i>
          <Node id="lambda" active={selected === 'lambda'} onSelect={setSelected}><strong>AWS Lambda</strong><small>Kavach API / Agent Orchestration</small></Node><i>↓</i>
          <Node id="supervisor" active={selected === 'supervisor'} onSelect={setSelected}>SupervisorAgent</Node>
          <div className="agent-branch"><Node id="forensics" active={selected === 'forensics'} onSelect={setSelected}>ForensicsAgent</Node><Node id="earnings" active={selected === 'earnings'} onSelect={setSelected}>EarningsAgent</Node><Node id="policy" active={selected === 'policy'} onSelect={setSelected}>PolicyAgent</Node></div>
          <i>↓</i><div className="grounding">Grounding &amp; Validation <small>deterministic reconstruction · financial facts · structured output · evidence IDs · safe fallback</small></div><i>↓</i>
          <Node id="bedrock" active={selected === 'bedrock'} onSelect={setSelected}><strong>Amazon Bedrock Mantle</strong><small>openai.gpt-oss-120b</small></Node><i>↓</i><div className="result">Validated investigation → Kavach UI</div>
        </div>
        <aside className="architecture-detail"><span className={`badge ${detail.status === 'LIVE' ? 'badge-success' : 'badge-warning'}`}>{detail.status}</span><h3>{detail.name}</h3><p>{detail.description}</p><code>{detail.source}</code></aside>
      </section>

      <section className="architecture-grid">
        <article className="architecture-card"><div className="section-heading"><div><span>02 — DATA &amp; EVIDENCE</span><h2>Evidence stays linked</h2></div></div><div className="data-flow"><Node id="s3" active={selected === 's3'} onSelect={setSelected}>Amazon S3<small>Evidence and object storage</small></Node><i>↓</i><Node id="dynamo" active={selected === 'dynamo'} onSelect={setSelected}>Amazon DynamoDB<small>Evidence records / application data</small></Node><i>↓</i><Node id="forensics" active={selected === 'forensics'} onSelect={setSelected}>ForensicsAgent</Node><i>↓</i><div className="result">Deterministic reconstruction → evidence-linked finding</div></div></article>
        <article className="architecture-card"><div className="section-heading"><div><span>03 — AI RELIABILITY</span><h2>AI reasoning is grounded</h2></div></div><div className="reliability-flow"><div>Evidence + known domain facts + deterministic calculations</div><i>↓</i><div className="grounding">Grounding / Validation</div><i>↓</i><div>Bedrock AI reasoning</div><i>↓</i><div className="result">Structured, evidence-backed response</div></div><div className="reliability-badges"><span>Evidence IDs validated</span><span>Deterministic financial facts</span><span>Hallucination protection</span><span>Safe fallback</span></div></article>
      </section>

      <section className="architecture-card"><div className="section-heading"><div><span>04 — AGENT LAYER</span><h2>Application components inside Lambda</h2></div><p>WorkerTwinAgent is a separate worker-facing grounded Q&amp;A path.</p></div><div className="agent-cards">{['supervisor', 'forensics', 'earnings', 'policy', 'twin'].map((id) => <Node key={id} id={id} active={selected === id} onSelect={setSelected}><strong>{details[id].name}</strong><small>{details[id].description}</small></Node>)}</div></section>

      <section className="architecture-card"><div className="section-heading"><div><span>05 — AWS INFRASTRUCTURE</span><h2>Active services and foundations</h2></div></div><div className="infra-columns"><div><h3>Active production services</h3><div className="infra-list">{['amplify', 'gateway', 'lambda', 'bedrock', 'dynamo', 's3'].map((id) => <Node key={id} id={id} active={selected === id} onSelect={setSelected}>{details[id].name}</Node>)}</div></div><div className={view === 'foundation' ? 'foundation-highlight' : ''}><h3>Provisioned infrastructure / foundations</h3><div className="infra-list">{['step', 'eventbridge', 'cognito'].map((id) => <Node key={id} id={id} active={selected === id} onSelect={setSelected}><strong>{details[id].name}</strong><small>Provisioned foundation</small></Node>)}</div></div></div></section>

      <section className="architecture-card hero-case"><div className="section-heading"><div><span>06 — HERO CASE FLOW</span><h2>From raw evidence to an actionable case</h2></div><p>Example: Vikram Sharma · QuickBite · trip-2026-09-15-001</p></div><div className="case-flow">{[['GPS arrival', '19:02'], ['Merchant delay', '7 min'], ['SLA remaining', '3 min'], ['Traffic delay', '6 min'], ['Delivery', '19:24'], ['Penalty', '₹350'], ['Result', 'Penalty warrants review']].map(([label, value]) => <React.Fragment key={label}><div><small>{label}</small><strong>{value}</strong></div><i>→</i></React.Fragment>)}</div><div className="case-confidence"><span className="badge badge-success">Evidence strength: Strong</span><span className="badge badge-info">Confidence: 94%</span></div></section>
    </div>
  );
};
