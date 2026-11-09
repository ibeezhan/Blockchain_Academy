import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { TitleSlide } from '../../components/templates/TitleSlide';
import { TakeawaySlide } from '../../components/templates/TakeawaySlide';
import { QuizSlide } from '../../components/templates/QuizSlide';
import { SectionNav } from '../../components/navigation/SectionNav';
import { SiteFooter } from '../../components/shared/SiteFooter';
import { DeepDiveBadge } from '../../components/shared/DeepDiveBadge';
import { Wrench } from 'lucide-react';

// Language-neutral shape — only IDs. Labels come from t() at render time.
const chapterIds = [
  's6-standards-intro',
  's6-erc-explain',
  's6-erc-table',
  's6-erc-evolve',
  's6-eip-process',
  's6-erc-example',
  's6-frameworks-intro',
  's6-frameworks-table',
  's6-tools',
  's6-platform-checklist',
  's6-platform-table',
  's6-platform-usecase',
  's6-integration-intro',
  's6-integration-nodes',
  's6-integration-api',
  's6-integration-events',
  's6-integration-oracles',
  's6-integration-data',
  's6-ai-dev',
  's6-takeaways',
  's6-final-quiz',
] as const;

// ═══ DATA (language-neutral: IDs, code identifiers, colors, hex, names) ══════

const ERC_DATA = [
  {
    id: 'erc-20', name: 'ERC-20', kind: 'Fungible Token', color: '#6366f1',
    functions: ['transfer(to, amount)', 'approve(spender, amount)', 'transferFrom(from, to, amount)', 'balanceOf(account)', 'totalSupply()'],
    events: ['Transfer(from, to, amount)', 'Approval(owner, spender, amount)'],
    examples: 'USDC · USDT · UNI · LINK · DAI',
  },
  {
    id: 'erc-721', name: 'ERC-721', kind: 'Non-Fungible Token', color: '#8b5cf6',
    functions: ['ownerOf(tokenId)', 'transferFrom(from, to, tokenId)', 'approve(to, tokenId)', 'tokenURI(tokenId)'],
    events: ['Transfer(from, to, tokenId)', 'Approval(owner, approved, tokenId)'],
    examples: 'CryptoPunks · BAYC · ENS · Propy real-estate deeds',
  },
  {
    id: 'erc-777', name: 'ERC-777', kind: 'Advanced Fungible Token', color: '#22d3ee',
    functions: ['send(recipient, amount, data)', 'authorizeOperator(operator)', 'tokensReceived hook'],
    events: ['Sent', 'Minted', 'Burned', 'AuthorizedOperator'],
    examples: 'Used in some advanced DeFi protocols',
  },
  {
    id: 'erc-2981', name: 'ERC-2981', kind: 'NFT Royalty Standard', color: '#f59e0b',
    functions: ['royaltyInfo(tokenId, salePrice) → (receiver, royaltyAmount)'],
    events: ['(no required events)'],
    examples: 'Most major NFT marketplaces (OpenSea, Blur, Rarible) read this',
  },
  {
    id: 'erc-1155', name: 'ERC-1155', kind: 'Multi-Token Standard', color: '#39B54A',
    functions: ['balanceOfBatch', 'safeBatchTransferFrom', 'setApprovalForAll', 'uri(id)'],
    events: ['TransferSingle', 'TransferBatch', 'ApprovalForAll'],
    examples: 'Gaming items · event tickets · fractional NFTs',
  },
];

const EIP_STEPS = [
  { i: 1,  color: '#6366f1' },
  { i: 2,  color: '#8b5cf6' },
  { i: 3,  color: '#22d3ee' },
  { i: 4,  color: '#39B54A' },
  { i: 5,  color: '#f59e0b' },
  { i: 6,  color: '#ec4899' },
  { i: 7,  color: '#a855f7' },
  { i: 8,  color: '#0ea5e9' },
  { i: 9,  color: '#84cc16' },
  { i: 10, color: '#06b6d4' },
  { i: 11, color: '#ED1C24' },
];

const FRAMEWORKS_META = [
  { id: 'hardhat', name: 'Hardhat',  color: '#6366f1' },
  { id: 'foundry', name: 'Foundry',  color: '#f59e0b' },
  { id: 'truffle', name: 'Truffle',  color: '#8b5cf6' },
  { id: 'brownie', name: 'Brownie',  color: '#22d3ee' },
  { id: 'anchor',  name: 'Anchor',   color: '#39B54A' },
];

// Neutral capability flags (l2, ercFull) keep filtering/scoring identical across languages.
const PLATFORMS = [
  { id: 'eth',     name: 'Ethereum (mainnet)', evm: true,  permissioned: false, l2: false, ercFull: true,  color: '#627EEA' },
  { id: 'fabric',  name: 'Hyperledger Fabric', evm: false, permissioned: true,  l2: false, ercFull: false, color: '#2F6BAC' },
  { id: 'sol',     name: 'Solana',             evm: false, permissioned: false, l2: false, ercFull: false, color: '#9945FF' },
  { id: 'cardano', name: 'Cardano',            evm: false, permissioned: false, l2: false, ercFull: false, color: '#0033AD' },
  { id: 'bnb',     name: 'BNB Chain',          evm: true,  permissioned: false, l2: false, ercFull: true,  color: '#F0B90B' },
  { id: 'polygon', name: 'Polygon',            evm: true,  permissioned: false, l2: true,  ercFull: true,  color: '#8247E5' },
  { id: 'avax',    name: 'Avalanche C-Chain',  evm: true,  permissioned: false, l2: false, ercFull: true,  color: '#E84142' },
  { id: 'arb',     name: 'Arbitrum',           evm: true,  permissioned: false, l2: true,  ercFull: true,  color: '#28A0F0' },
  { id: 'op',      name: 'Optimism',           evm: true,  permissioned: false, l2: true,  ercFull: true,  color: '#FF0420' },
  { id: 'base',    name: 'Base',               evm: true,  permissioned: false, l2: true,  ercFull: true,  color: '#0052FF' },
  { id: 'near',    name: 'Near Protocol',      evm: false, permissioned: false, l2: false, ercFull: false, color: '#000000' },
  { id: 'starknet',name: 'StarkNet',           evm: false, permissioned: false, l2: true,  ercFull: false, color: '#EC796B' },
  { id: 'zksync',  name: 'zkSync Era',         evm: true,  permissioned: false, l2: true,  ercFull: true,  color: '#8C8DFC' },
  { id: 'dot',     name: 'Polkadot',           evm: false, permissioned: false, l2: false, ercFull: false, color: '#E6007A' },
  { id: 'algo',    name: 'Algorand',           evm: false, permissioned: false, l2: false, ercFull: false, color: '#000000' },
  { id: 'aleo',    name: 'Aleo',               evm: false, permissioned: false, l2: false, ercFull: false, color: '#005AFF' },
  { id: 'corda',   name: 'Corda',              evm: false, permissioned: true,  l2: false, ercFull: false, color: '#FF0F00' },
];

// ═══ INTERACTIVE: ERC EXPLORER ══════════════════════════════════════════════

function ERCExplorer() {
  const { t } = useTranslation('smart-contracts/section-6');
  const [active, setActive] = useState(ERC_DATA[0].id);
  const erc = ERC_DATA.find(e => e.id === active)!;
  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('ercExplorer.badge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('ercExplorer.heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('ercExplorer.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 flex gap-5">
        {/* Tabs */}
        <div className="flex flex-col gap-2 w-44 shrink-0">
          {ERC_DATA.map(e => (
            <button key={e.id}
              onClick={() => setActive(e.id)}
              className="text-left p-3 rounded-xl border-2 transition-all hover:scale-[1.02]"
              style={{
                borderColor: active === e.id ? e.color : 'transparent',
                backgroundColor: active === e.id ? e.color + '15' : 'var(--card)',
              }}>
              <div className="font-mono font-black text-sm" style={{ color: e.color }}>{e.name}</div>
              <div className="text-[10px] text-muted-foreground">{e.kind}</div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <motion.div key={erc.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="flex-1 grid grid-cols-2 gap-4 min-h-0 overflow-hidden">

          <div className="flex flex-col gap-3 overflow-y-auto">
            <div className="p-3 rounded-xl" style={{ backgroundColor: erc.color + '12' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: erc.color }}>{t('ercExplorer.purposeLabel')}</div>
              <p className="text-sm text-foreground">{t(`ercData.${erc.id}.purpose`)}</p>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('ercExplorer.functionsLabel')}</div>
              <ul className="space-y-1.5">
                {erc.functions.map(f => (
                  <li key={f} className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t('ercExplorer.eventsLabel')}</div>
              <ul className="space-y-1.5">
                {erc.events.map(e => (
                  <li key={e} className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">{e}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto">
            <div className="p-4 bg-card border rounded-xl" style={{ borderColor: erc.color + '40' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: erc.color }}>{t('ercExplorer.examplesLabel')}</div>
              <div className="text-sm font-semibold text-foreground">{erc.examples}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-card to-transparent border rounded-xl flex-1" style={{ borderColor: erc.color + '40' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: erc.color }}>{t('ercExplorer.takeawayLabel')}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(`ercData.${erc.id}.takeaway`)}</p>
            </div>
            <a href={`https://eips.ethereum.org/EIPS/${erc.id.replace('erc-', 'eip-')}`}
              target="_blank" rel="noreferrer"
              className="px-3 py-2 rounded-lg text-xs font-bold text-center transition-colors"
              style={{ backgroundColor: erc.color + '15', color: erc.color }}>
              {t('ercExplorer.specLink', { name: erc.name })}
            </a>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

// ═══ INTERACTIVE: EIP PROCESS FLOW ═══════════════════════════════════════════

function EIPProcessFlow() {
  const { t } = useTranslation('smart-contracts/section-6');
  const [active, setActive] = useState(1);
  const step = EIP_STEPS.find(s => s.i === active)!;
  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#22d3ee]/15 border border-[#22d3ee]/40 text-[#22d3ee] text-xs font-bold">{t('eipFlow.badge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('eipFlow.heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('eipFlow.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 flex gap-5">
        {/* Steps column */}
        <div className="flex flex-col gap-1.5 w-72 shrink-0 overflow-y-auto">
          {EIP_STEPS.map(s => (
            <button key={s.i} onClick={() => setActive(s.i)}
              className="text-left p-2 rounded-lg border transition-all flex items-center gap-2"
              style={{
                borderColor: active === s.i ? s.color : 'transparent',
                backgroundColor: active === s.i ? s.color + '12' : 'var(--card)',
              }}>
              <div className="size-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ backgroundColor: s.color }}>
                {s.i}
              </div>
              <div className="font-bold text-xs text-foreground">{t(`eipSteps.${s.i}.label`)}</div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <motion.div key={step.i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="flex-1 p-6 bg-card border-2 rounded-2xl flex flex-col gap-4"
          style={{ borderColor: step.color + '50' }}>
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl flex items-center justify-center text-white text-lg font-black"
              style={{ backgroundColor: step.color }}>
              {step.i}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: step.color }}>{t(`eipSteps.${step.i}.actor`)}</div>
              <div className="font-black text-foreground text-xl">{t(`eipSteps.${step.i}.label`)}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t(`eipSteps.${step.i}.desc`)}</p>

          {/* Mini timeline */}
          <div className="mt-auto">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">{t('eipFlow.timelineLabel')}</div>
            <div className="flex items-center gap-1">
              {EIP_STEPS.map(s => (
                <div key={s.i}
                  onClick={() => setActive(s.i)}
                  className="flex-1 h-2 rounded-full cursor-pointer transition-colors"
                  style={{ backgroundColor: s.i === active ? s.color : s.i < active ? s.color + '60' : 'var(--muted)' }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{t('eipFlow.timelineStart')}</span>
              <span>{t('eipFlow.timelineEnd')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ═══ INTERACTIVE: FRAMEWORKS COMPARE ════════════════════════════════════════

const FW_ROW_KEYS = ['language', 'chains', 'testing', 'deploy', 'plugins', 'strengths', 'cons', 'ideal'] as const;
type FwRowKey = (typeof FW_ROW_KEYS)[number];

function FrameworksCompare() {
  const { t } = useTranslation('smart-contracts/section-6');
  const [activeRow, setActiveRow] = useState<FwRowKey>('strengths');
  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('fwCompare.badge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('fwCompare.heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('fwCompare.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[140px_repeat(5,1fr)] gap-2 text-xs overflow-y-auto">
        {/* Header row */}
        <div></div>
        {FRAMEWORKS_META.map(f => (
          <div key={f.id} className="font-black text-center p-2 rounded-lg" style={{ backgroundColor: f.color + '15', color: f.color }}>
            {t(`frameworks.${f.id}.name`, { defaultValue: f.name })}
          </div>
        ))}

        {/* Data rows */}
        {FW_ROW_KEYS.map(key => (
          <FwRow key={key} rowKey={key} active={activeRow === key} onSelect={() => setActiveRow(key)} />
        ))}
      </div>
    </div>
  );
}

function FwRow({ rowKey, active, onSelect }: { rowKey: FwRowKey; active: boolean; onSelect: () => void }) {
  const { t } = useTranslation('smart-contracts/section-6');
  return (
    <>
      <button onClick={onSelect}
        className="text-right p-2 font-semibold rounded-lg transition-colors"
        style={{ color: active ? '#6366f1' : 'var(--muted-foreground)', backgroundColor: active ? '#6366f110' : 'transparent' }}>
        {t(`fwCompare.rows.${rowKey}`)}
      </button>
      {FRAMEWORKS_META.map(f => (
        <div key={f.id} className="p-2 rounded-lg transition-colors"
          style={{ backgroundColor: active ? f.color + '10' : 'var(--card)', border: '1px solid var(--border)' }}>
          <span className="text-foreground">{t(`frameworks.${f.id}.${rowKey}`)}</span>
        </div>
      ))}
    </>
  );
}

// ═══ INTERACTIVE: PLATFORM CHECKLIST ════════════════════════════════════════

const CHECKLIST_IDS = ['evm', 'public', 'cheap', 'fast', 'erc', 'privacy', 'enterprise', 'devs'] as const;

function PlatformChecklist() {
  const { t } = useTranslation('smart-contracts/section-6');
  const [picks, setPicks] = useState<Record<string, boolean>>({});
  const score = (p: typeof PLATFORMS[number]) => {
    let s = 0;
    if (picks.evm        && p.evm)                                  s += 1;
    if (picks.public     && !p.permissioned)                        s += 1;
    if (picks.cheap      && (p.l2 || /Polygon|BNB|Avalanche|Solana|Algo/i.test(p.name))) s += 1;
    if (picks.fast       && (p.l2 || /Solana|Algorand|Avalanche|Near|Polygon/i.test(p.name))) s += 1;
    if (picks.erc        && p.ercFull) s += 1;
    if (picks.privacy    && (p.permissioned || /Aleo|StarkNet/.test(p.name))) s += 1;
    if (picks.enterprise && (p.permissioned || /Hyperledger|Corda/.test(p.name))) s += 1;
    if (picks.devs       && /Ethereum|Polygon|Arbitrum|BNB|Solana/.test(p.name)) s += 1;
    return s;
  };
  const ranked = [...PLATFORMS].map(p => ({ p, score: score(p) })).sort((a, b) => b.score - a.score);
  const top    = ranked.slice(0, 5);
  const anyPicked = Object.values(picks).some(Boolean);

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3">
        <span className="px-2.5 py-0.5 rounded-full bg-[#39B54A]/15 border border-[#39B54A]/40 text-[#39B54A] text-xs font-bold">{t('checklist.badge')}</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">{t('checklist.heading')}</h2>
        <p className="text-muted-foreground text-sm">{t('checklist.subtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5">
        {/* Checklist */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-2">
          {CHECKLIST_IDS.map(id => (
            <button key={id} onClick={() => setPicks(p => ({ ...p, [id]: !p[id] }))}
              className="flex items-center gap-3 p-3 bg-card border-2 rounded-xl text-left transition-colors hover:bg-muted/30"
              style={{ borderColor: picks[id] ? '#39B54A' : 'var(--border)' }}>
              <div className="size-5 rounded border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: picks[id] ? '#39B54A' : 'var(--muted-foreground)', backgroundColor: picks[id] ? '#39B54A' : 'transparent' }}>
                {picks[id] && <span className="text-white text-xs font-black">✓</span>}
              </div>
              <span className="text-sm font-medium text-foreground">{t(`checklist.items.${id}`)}</span>
            </button>
          ))}
        </div>

        {/* Top matches */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest">{t('checklist.topMatches')}</div>
          {!anyPicked ? (
            <div className="p-4 rounded-xl border border-dashed border-border flex-1 flex items-center justify-center">
              <p className="text-xs text-muted-foreground italic text-center">{t('checklist.empty')}</p>
            </div>
          ) : top.map(({ p, score }, i) => (
            <div key={p.id} className="p-3 bg-card border rounded-xl flex items-center gap-3"
              style={{ borderColor: p.color + '40' }}>
              <div className="size-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: p.color }}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-foreground">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">{t(`platforms.${p.id}.type`)}</div>
              </div>
              <div className="font-mono font-black text-sm" style={{ color: p.color }}>{score}/{Object.values(picks).filter(Boolean).length}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ INTERACTIVE: PLATFORMS TABLE ════════════════════════════════════════════

function PlatformsTable() {
  const { t } = useTranslation('smart-contracts/section-6');
  const [filter, setFilter] = useState<'all' | 'evm' | 'public' | 'permissioned' | 'l2'>('all');

  const filtered = PLATFORMS.filter(p => {
    if (filter === 'evm')          return p.evm;
    if (filter === 'public')       return !p.permissioned;
    if (filter === 'permissioned') return p.permissioned;
    if (filter === 'l2')           return p.l2;
    return true;
  });

  const filterButton = (key: typeof filter, label: string) => (
    <button onClick={() => setFilter(key)}
      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
      style={{
        backgroundColor: filter === key ? '#6366f1' : 'var(--muted)',
        color: filter === key ? 'white' : 'var(--muted-foreground)',
      }}>
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      <div className="shrink-0 mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/40 text-[#6366f1] text-xs font-bold">{t('platformsTable.badge')}</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">{t('platformsTable.heading')}</h2>
          <p className="text-muted-foreground text-sm">{t('platformsTable.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filterButton('all',          t('platformsTable.filters.all'))}
          {filterButton('evm',          t('platformsTable.filters.evm'))}
          {filterButton('public',       t('platformsTable.filters.public'))}
          {filterButton('permissioned', t('platformsTable.filters.permissioned'))}
          {filterButton('l2',           t('platformsTable.filters.l2'))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-background">
            <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="p-2 font-semibold">{t('platformsTable.headers.platform')}</th>
              <th className="p-2 font-semibold">{t('platformsTable.headers.type')}</th>
              <th className="p-2 font-semibold">{t('platformsTable.headers.evm')}</th>
              <th className="p-2 font-semibold">{t('platformsTable.headers.language')}</th>
              <th className="p-2 font-semibold">{t('platformsTable.headers.erc')}</th>
              <th className="p-2 font-semibold">{t('platformsTable.headers.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                <td className="p-2 font-bold text-foreground" style={{ color: p.color }}>{p.name}</td>
                <td className="p-2 text-muted-foreground">{t(`platforms.${p.id}.type`)}</td>
                <td className="p-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ backgroundColor: p.evm ? '#39B54A20' : '#ED1C2420', color: p.evm ? '#39B54A' : '#ED1C24' }}>
                    {p.evm ? t('platformsTable.yes') : t('platformsTable.no')}
                  </span>
                </td>
                <td className="p-2 font-mono text-[11px] text-muted-foreground">{t(`platforms.${p.id}.language`)}</td>
                <td className="p-2 text-muted-foreground">{t(`platforms.${p.id}.erc`)}</td>
                <td className="p-2 text-muted-foreground leading-snug">{t(`platforms.${p.id}.desc`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ TYPES FOR returnObjects ARRAYS ═════════════════════════════════════════

interface LabelDesc { label: string; desc: string; }
interface LabelText { label: string; text: string; }
interface NameDesc { name: string; desc: string; }
interface StandardCard { name: string; items: string[]; }
interface NodeCard { title: string; pros: string[]; cons: string[]; }
interface UsecaseRow { use: string; platforms: string; }

// ═══ MAIN ═══════════════════════════════════════════════════════════════════

export function SC_Section6() {
  const { t } = useTranslation('smart-contracts/section-6');

  const chapters = useMemo(
    () => chapterIds.map((id) => ({ id, label: t(`chapters.${id}`) })),
    [t]
  );

  const standardsCards = t('standardsIntro.cards', { returnObjects: true }) as StandardCard[];
  const standardsColors = ['#6366f1', '#8b5cf6', '#39B54A'];
  const standardsEmoji = ['🪙', '🆔', '🏛'];

  const eipsVsErcs = t('ercExplain.eipsVsErcs', { returnObjects: true }) as string[];

  const evolveCards = t('ercEvolve.cards', { returnObjects: true }) as { title: string; desc: string }[];
  const evolveEmoji = ['🚀', '🔍', '💡'];
  const evolveColors = ['#6366f1', '#ED1C24', '#39B54A'];

  const examplePoints = t('ercExample.points', { returnObjects: true }) as LabelDesc[];
  const exampleColors = ['#6366f1', '#8b5cf6', '#22d3ee', '#39B54A'];

  const lifecycle = t('frameworksIntro.lifecycle', { returnObjects: true }) as LabelDesc[];
  const lifecycleEmoji = ['📁', '⚙️', '🧪', '📜', '🔬'];
  const production = t('frameworksIntro.production', { returnObjects: true }) as LabelDesc[];
  const productionEmoji = ['⛽', '✅', '🌐', '🧩', '🔄'];

  const toolsItems = t('tools.items', { returnObjects: true }) as NameDesc[];
  const toolsMeta = [
    { url: 'remix.ethereum.org',   emoji: '🧪', color: '#6366f1' },
    { url: 'eth.build',            emoji: '🛠', color: '#8b5cf6' },
    { url: 'speedrunethereum.com', emoji: '🏃', color: '#22d3ee' },
    { url: 'scaffoldeth.io',       emoji: '🏗', color: '#39B54A' },
  ];

  const usecaseItems = t('platformUsecase.items', { returnObjects: true }) as UsecaseRow[];
  const usecaseColors = ['#6366f1', '#8b5cf6', '#39B54A', '#22d3ee', '#f59e0b', '#ec4899'];

  const integrationPatterns = t('integrationIntro.patterns', { returnObjects: true }) as { label: string }[];
  const integrationNums = ['01', '02', '03', '04', '05'];
  const integrationColors = ['#6366f1', '#8b5cf6', '#22d3ee', '#f59e0b', '#39B54A'];

  const nodeCards = t('nodes.cards', { returnObjects: true }) as NodeCard[];
  const nodeEmoji = ['🏠', '☁️', '🔄'];
  const nodeColors = ['#39B54A', '#6366f1', '#8b5cf6'];

  const apiDoes = t('api.does', { returnObjects: true }) as LabelDesc[];
  const apiEmoji = ['🔧', '📊', '🎭'];
  const apiStacks = t('api.stacks', { returnObjects: true }) as NameDesc[];
  const apiStackColors = ['#6366f1', '#8b5cf6', '#22d3ee', '#39B54A'];

  const eventsFlow = t('events.flowSteps', { returnObjects: true }) as string[];
  const eventsExamples = t('events.examples', { returnObjects: true }) as LabelText[];

  const oraclesDo = t('oracles.do', { returnObjects: true }) as LabelText[];
  const oraclesProviders = t('oracles.providers', { returnObjects: true }) as NameDesc[];
  const oraclesProviderColors = ['#375BD2', '#8b5cf6', '#6366f1', '#f59e0b'];

  const dataOnchain = t('data.onchain', { returnObjects: true }) as string[];
  const dataOffchain = t('data.offchain', { returnObjects: true }) as string[];
  const dataStorage = t('data.storage', { returnObjects: true }) as NameDesc[];
  const dataStorageColors = ['#65C2CB', '#0090FF', '#000000', '#FF0021'];

  const aiHelps = t('aiDev.helps', { returnObjects: true }) as LabelText[];
  const aiNot = t('aiDev.not', { returnObjects: true }) as LabelText[];

  const takeawayItems = t('takeaways.items', { returnObjects: true }) as string[];
  const quizOptions = t('quiz.options', { returnObjects: true }) as string[];

  return (
    <div className="h-full w-full flex overflow-hidden">
      <SectionNav chapters={chapters} accentColor="#6366f1" />
      <div id="section-scroll" className="flex-1 overflow-y-auto snap-y snap-mandatory">
        <div className="slide-flow">

        <div className="h-full">
          <TitleSlide
            sectionNumber={t('title.sectionNumber')}
            title={t('title.title')}
            subtitle={t('title.subtitle')}
            icon={<Wrench className="size-20 text-[#6366f1]" />}
            gradient="from-[#6366f1] to-[#22d3ee]"
          />
        </div>

        {/* ═══════ STANDARDS INTRO ═══════ */}
        <div id="s6-standards-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="mb-2"><DeepDiveBadge label={t('optionalAdvanced', { ns: 'common' })} /></div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('standardsIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('standardsIntro.subtitle')}</p>
            <div className="mt-3 p-2.5 rounded-xl border border-[#8b5cf6]/30 text-xs text-muted-foreground" style={{ backgroundColor: '#8b5cf60f' }}>
              <span className="font-bold text-[#8b5cf6]">{t('optionalNote.label')}</span>{t('optionalNote.body')}
            </div>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {standardsCards.map((c, ci) => {
              const color = standardsColors[ci];
              return (
                <div key={ci} className="p-5 bg-card border rounded-xl flex flex-col gap-3" style={{ borderColor: color + '40' }}>
                  <div className="text-4xl">{standardsEmoji[ci]}</div>
                  <div className="font-black text-foreground">{c.name}</div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {c.items.map(i => (
                      <li key={i} className="flex gap-1.5"><span style={{ color }}>›</span>{i}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('standardsIntro.whyLabel')}</span>{t('standardsIntro.whyBody')}
          </div>
        </div>

        {/* ═══════ ERC EXPLAIN ═══════ */}
        <div id="s6-erc-explain" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ercExplain.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('ercExplain.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="p-5 bg-card border border-[#6366f1]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#6366f1]">{t('ercExplain.definitionTitle')}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('ercExplain.definitionBody1A')}<span className="font-semibold text-foreground">{t('ercExplain.definitionTermErc')}</span>{t('ercExplain.definitionBody1B')}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('ercExplain.definitionBody2')}
              </p>
            </div>
            <div className="p-5 bg-card border border-[#8b5cf6]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#8b5cf6]">{t('ercExplain.eipsVsErcsTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                <li className="flex gap-2"><span className="text-[#8b5cf6]">›</span><span><span className="font-semibold text-foreground">{t('ercExplain.eipTerm')}</span> {eipsVsErcs[0]}</span></li>
                <li className="flex gap-2"><span className="text-[#8b5cf6]">›</span><span><span className="font-semibold text-foreground">{t('ercExplain.ercTerm')}</span> {eipsVsErcs[1]}</span></li>
                <li className="flex gap-2"><span className="text-[#8b5cf6]">›</span>{eipsVsErcs[2]}</li>
                <li className="flex gap-2"><span className="text-[#8b5cf6]">›</span>{eipsVsErcs[3]}</li>
              </ul>
              <a href="https://eips.ethereum.org/erc" target="_blank" rel="noreferrer"
                className="self-start px-3 py-1.5 rounded-lg bg-[#8b5cf6]/15 text-[#8b5cf6] text-xs font-bold hover:bg-[#8b5cf6]/25 transition-colors">
                {t('ercExplain.browseLink')}
              </a>
            </div>
          </div>
        </div>

        {/* ═══════ INTERACTIVE: ERC EXPLORER ═══════ */}
        <div id="s6-erc-table" className="h-full">
          <ERCExplorer />
        </div>

        {/* ═══════ WHY STANDARDS EVOLVE ═══════ */}
        <div id="s6-erc-evolve" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ercEvolve.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('ercEvolve.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {evolveCards.map((c, ci) => {
              const color = evolveColors[ci];
              return (
                <div key={ci} className="p-5 bg-card border rounded-xl flex flex-col gap-3" style={{ borderColor: color + '30' }}>
                  <div className="text-4xl">{evolveEmoji[ci]}</div>
                  <div className="font-black text-sm" style={{ color }}>{c.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-4 p-3 rounded-xl border border-[#f59e0b]/30 bg-[#f59e0b]/06 text-xs text-muted-foreground">
            <span className="font-bold text-[#f59e0b]">{t('ercEvolve.exampleLabel')}</span>{t('ercEvolve.exampleBody')}
          </div>
        </div>

        {/* ═══════ INTERACTIVE: EIP PROCESS ═══════ */}
        <div id="s6-eip-process" className="h-full">
          <EIPProcessFlow />
        </div>

        {/* ═══════ ERC-20 OPENZEPPELIN EXAMPLE ═══════ */}
        <div id="s6-erc-example" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('ercExample.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('ercExample.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="p-5 bg-card border border-[#6366f1]/30 rounded-xl flex flex-col">
              <div className="text-xs font-semibold text-muted-foreground mb-2">{t('ercExample.fileName')}</div>
              <pre className="flex-1 bg-muted p-3 rounded-lg text-[11px] font-mono text-foreground overflow-auto leading-relaxed">{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Pull in the audited ERC-20 base from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        // Mint to the deployer, scaled by 18 decimals
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }
}`}</pre>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('ercExample.givesYouTitle')}</div>
              {examplePoints.map((p, pi) => {
                const color = exampleColors[pi];
                return (
                  <div key={pi} className="p-3 bg-card border rounded-xl" style={{ borderColor: color + '30' }}>
                    <div className="font-bold text-sm" style={{ color }}>{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
                  </div>
                );
              })}
              <div className="p-3 bg-[#39B54A]/10 border border-[#39B54A]/30 rounded-xl text-xs text-muted-foreground mt-auto">
                <span className="font-bold text-[#39B54A]">{t('ercExample.whyOzLabel')}</span>{t('ercExample.whyOzBody')}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ FRAMEWORKS INTRO ═══════ */}
        <div id="s6-frameworks-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('frameworksIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('frameworksIntro.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest">{t('frameworksIntro.lifecycleTitle')}</div>
              {lifecycle.map((f, fi) => (
                <div key={fi} className="p-2.5 bg-card border border-border rounded-lg flex items-start gap-3">
                  <div className="text-xl shrink-0">{lifecycleEmoji[fi]}</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">{t('frameworksIntro.productionTitle')}</div>
              {production.map((f, fi) => (
                <div key={fi} className="p-2.5 bg-card border border-border rounded-lg flex items-start gap-3">
                  <div className="text-xl shrink-0">{productionEmoji[fi]}</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ INTERACTIVE: FRAMEWORKS COMPARE ═══════ */}
        <div id="s6-frameworks-table" className="h-full">
          <FrameworksCompare />
        </div>

        {/* ═══════ TOOLS GRID ═══════ */}
        <div id="s6-tools" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('tools.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('tools.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 content-center">
            {toolsItems.map((tool, ti) => {
              const meta = toolsMeta[ti];
              return (
                <a key={ti} href={`https://${meta.url}`} target="_blank" rel="noreferrer"
                  className="p-5 bg-card border rounded-xl flex flex-col gap-3 hover:scale-[1.02] transition-transform"
                  style={{ borderColor: meta.color + '40' }}>
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: meta.color + '15' }}>{meta.emoji}</div>
                    <div>
                      <div className="font-black text-base" style={{ color: meta.color }}>{tool.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{meta.url} ↗</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </a>
              );
            })}
          </div>
        </div>

        {/* ═══════ INTERACTIVE: PLATFORM CHECKLIST ═══════ */}
        <div id="s6-platform-checklist" className="h-full">
          <PlatformChecklist />
        </div>

        {/* ═══════ INTERACTIVE: PLATFORMS TABLE ═══════ */}
        <div id="s6-platform-table" className="h-full">
          <PlatformsTable />
        </div>

        {/* ═══════ USE CASE → PLATFORM ═══════ */}
        <div id="s6-platform-usecase" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('platformUsecase.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('platformUsecase.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 content-center">
            {usecaseItems.map((c, ci) => {
              const color = usecaseColors[ci];
              return (
                <div key={ci} className="p-4 bg-card border rounded-xl" style={{ borderColor: color + '30' }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>{c.use}</div>
                  <div className="text-sm font-semibold text-foreground">{c.platforms}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════ INTEGRATION INTRO ═══════ */}
        <div id="s6-integration-intro" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('integrationIntro.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('integrationIntro.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="max-w-3xl text-center space-y-4">
              <p className="text-base text-muted-foreground leading-relaxed">
                {t('integrationIntro.lead')}
              </p>
              <div className="grid grid-cols-5 gap-3 mt-6">
                {integrationPatterns.map((p, pi) => {
                  const color = integrationColors[pi];
                  return (
                    <div key={pi} className="p-3 bg-card border rounded-xl" style={{ borderColor: color + '40' }}>
                      <div className="font-mono font-black text-xl" style={{ color }}>{integrationNums[pi]}</div>
                      <div className="text-xs font-semibold text-foreground mt-1">{p.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ NODES ═══════ */}
        <div id="s6-integration-nodes" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#6366f1] uppercase tracking-widest mb-1">{t('nodes.patternLabel')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('nodes.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('nodes.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4 content-center">
            {nodeCards.map((c, ci) => {
              const color = nodeColors[ci];
              return (
                <div key={ci} className="p-4 bg-card border rounded-xl flex flex-col gap-3" style={{ borderColor: color + '30' }}>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">{nodeEmoji[ci]}</div>
                    <div className="font-black text-sm" style={{ color }}>{c.title}</div>
                  </div>
                  <div className="text-[10px] font-bold text-[#39B54A] uppercase tracking-widest">{t('nodes.prosLabel')}</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {c.pros.map(p => <li key={p} className="flex gap-1.5"><span className="text-[#39B54A]">›</span>{p}</li>)}
                  </ul>
                  <div className="text-[10px] font-bold text-[#ED1C24] uppercase tracking-widest mt-2">{t('nodes.consLabel')}</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {c.cons.map(p => <li key={p} className="flex gap-1.5"><span className="text-[#ED1C24]">›</span>{p}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="shrink-0 mt-3 p-2 rounded-lg bg-muted/40 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('nodes.providersLabel')}</span>{t('nodes.providersValue')}<span className="font-semibold text-foreground">{t('nodes.selfHostLabel')}</span>{t('nodes.selfHostValue')}
          </div>
        </div>

        {/* ═══════ API & MIDDLEWARE ═══════ */}
        <div id="s6-integration-api" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-1">{t('api.patternLabel')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('api.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('api.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">{t('api.doesTitle')}</div>
              {apiDoes.map((p, pi) => (
                <div key={pi} className="p-3 bg-card border border-border rounded-xl flex items-start gap-3">
                  <div className="text-2xl shrink-0">{apiEmoji[pi]}</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">{t('api.stacksTitle')}</div>
              {apiStacks.map((s, si) => {
                const color = apiStackColors[si];
                return (
                  <div key={si} className="p-3 bg-card border rounded-xl" style={{ borderColor: color + '30' }}>
                    <div className="font-bold text-sm" style={{ color }}>{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ EVENTS ═══════ */}
        <div id="s6-integration-events" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#22d3ee] uppercase tracking-widest mb-1">{t('events.patternLabel')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('events.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('events.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="p-5 bg-card border border-[#22d3ee]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#22d3ee]">{t('events.flowTitle')}</div>
              <ol className="text-xs text-muted-foreground space-y-2 flex-1 list-decimal list-inside">
                <li>{eventsFlow[0]}<code className="text-foreground">PaymentReceived(buyer, amount)</code>{t('events.flowStep1Suffix')}</li>
                <li>{eventsFlow[1]}</li>
                <li>{eventsFlow[2]}</li>
                <li>{eventsFlow[3]}</li>
              </ol>
            </div>
            <div className="p-5 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#39B54A]">{t('events.examplesTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                {eventsExamples.map((e, ei) => (
                  <li key={ei} className="flex gap-2"><span className="text-[#39B54A]">›</span><span><span className="font-semibold text-foreground">{e.label}</span>{e.text}</span></li>
                ))}
              </ul>
              <div className="p-2 bg-[#39B54A]/10 rounded-lg text-xs text-muted-foreground mt-auto">
                <span className="font-semibold text-foreground">{t('events.whyLabel')}</span>{t('events.whyBody')}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ ORACLES ═══════ */}
        <div id="s6-integration-oracles" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">{t('oracles.patternLabel')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('oracles.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('oracles.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="p-5 bg-card border border-[#f59e0b]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#f59e0b]">{t('oracles.doTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                {oraclesDo.map((o, oi) => (
                  <li key={oi} className="flex gap-2"><span className="text-[#f59e0b]">›</span><span><span className="font-semibold text-foreground">{o.label}</span>{o.text}</span></li>
                ))}
              </ul>
              <div className="p-2 bg-[#ED1C24]/10 rounded-lg text-xs text-muted-foreground">
                <span className="font-semibold text-[#ED1C24]">{t('oracles.criticalLabel')}</span>{t('oracles.criticalBody')}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest">{t('oracles.chooseTitle')}</div>
              {oraclesProviders.map((o, oi) => {
                const color = oraclesProviderColors[oi];
                return (
                  <div key={oi} className="p-3 bg-card border border-border rounded-xl flex items-start gap-2">
                    <div className="px-2 py-0.5 rounded font-bold text-xs shrink-0 text-white" style={{ backgroundColor: color }}>{o.name}</div>
                    <div className="text-xs text-muted-foreground">{o.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ DATA ON/OFF-CHAIN ═══════ */}
        <div id="s6-integration-data" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <div className="text-xs font-bold text-[#39B54A] uppercase tracking-widest mb-1">{t('data.patternLabel')}</div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('data.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('data.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="p-5 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#39B54A]">{t('data.onchainTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                {dataOnchain.map((d, di) => (
                  <li key={di} className="flex gap-2"><span className="text-[#39B54A]">›</span>{d}</li>
                ))}
              </ul>
            </div>
            <div className="p-5 bg-card border border-[#ED1C24]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#ED1C24]">{t('data.offchainTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                {dataOffchain.map((d, di) => (
                  <li key={di} className="flex gap-2"><span className="text-[#ED1C24]">›</span>{d}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="shrink-0 mt-4 grid grid-cols-4 gap-3">
            {dataStorage.map((s, si) => {
              const color = dataStorageColors[si];
              return (
                <div key={si} className="p-3 bg-card border border-border rounded-xl text-center">
                  <div className="font-mono font-black text-sm" style={{ color }}>{s.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════ AI-DRIVEN DEV ═══════ */}
        <div id="s6-ai-dev" className="h-full flex flex-col p-6 lg:p-10">
          <div className="shrink-0 mb-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{t('aiDev.heading')}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t('aiDev.subtitle')}</p>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 content-center">
            <div className="p-5 bg-card border border-[#39B54A]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#39B54A]">{t('aiDev.helpsTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                {aiHelps.map((a, ai) => (
                  <li key={ai} className="flex gap-2"><span className="text-[#39B54A]">›</span><span><span className="font-semibold text-foreground">{a.label}</span>{a.text}</span></li>
                ))}
              </ul>
              <div className="p-2 bg-[#39B54A]/10 rounded-lg text-xs text-muted-foreground mt-auto">
                {t('aiDev.helpsFooter')}
              </div>
            </div>
            <div className="p-5 bg-card border border-[#ED1C24]/30 rounded-xl flex flex-col gap-3">
              <div className="font-bold text-sm text-[#ED1C24]">{t('aiDev.notTitle')}</div>
              <ul className="text-xs text-muted-foreground space-y-2 flex-1">
                {aiNot.map((a, ai) => (
                  <li key={ai} className="flex gap-2"><span className="text-[#ED1C24]">›</span><span><span className="font-semibold text-foreground">{a.label}</span>{a.text}</span></li>
                ))}
              </ul>
              <div className="p-2 bg-[#ED1C24]/10 rounded-lg text-xs text-muted-foreground mt-auto">
                <span className="font-bold text-[#ED1C24]">{t('aiDev.bottomLabel')}</span>{t('aiDev.bottomBody')}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ TAKEAWAYS ═══════ */}
        <div id="s6-takeaways" className="h-full">
          <TakeawaySlide
            title={t('takeaways.title')}
            takeaways={takeawayItems}
          />
        </div>

        {/* ═══════ FINAL QUIZ ═══════ */}
        <div id="s6-final-quiz" className="h-full">
          <QuizSlide
            question={t('quiz.question')}
            options={[
              { text: quizOptions[0], correct: false },
              { text: quizOptions[1], correct: false },
              { text: quizOptions[2], correct: true },
              { text: quizOptions[3], correct: false },
            ]}
            explanation={t('quiz.explanation')}
          />
        </div>

        </div>
        <SiteFooter className="snap-start" />
      </div>
    </div>
  );
}
