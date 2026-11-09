import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SiteFooter } from '../../components/shared/SiteFooter';

interface Resource {
  title: string;
  url: string;
  description: string;
  tag: string;
  tagColor: string;
}

const resources: Resource[] = [
  // Must-Read
  {
    title: "\"Smart Contracts\" — Nick Szabo (1994)",
    url: "https://www.fon.hum.uva.nl/rob/Courses/InformationInSpeech/CDROM/Literature/LOTwinterschool2006/szabo.best.vwh.net/smart.contracts.html",
    description: "The original 1994 paper introducing the concept of smart contracts — 'a computerized transaction protocol that executes the terms of a contract.' Brief, prescient, and foundational.",
    tag: "Must-Read",
    tagColor: "#6366f1",
  },
  {
    title: "Ethereum Whitepaper — Vitalik Buterin",
    url: "https://ethereum.org/en/whitepaper/",
    description: "The original 2014 Ethereum proposal. Introduces smart contracts, the EVM, and the vision of a 'world computer' running arbitrary programmable logic on a blockchain.",
    tag: "Must-Read",
    tagColor: "#6366f1",
  },
  // Books
  {
    title: "Mastering Ethereum — Andreas Antonopoulos & Gavin Wood (free online)",
    url: "https://github.com/ethereumbook/ethereumbook",
    description: "The definitive technical book on Ethereum. Open source on GitHub. Covers smart contracts, EVM internals, Solidity, tokens, DeFi building blocks, and security.",
    tag: "Book",
    tagColor: "#8b5cf6",
  },
  {
    title: "The Infinite Machine — Camila Russo",
    url: "https://www.harpercollins.com/products/the-infinite-machine-camila-russo",
    description: "Narrative history of Ethereum from a Bloomberg journalist who was there. Covers the founding, the The DAO hack, and the birth of DeFi — great context for the technical material.",
    tag: "Book",
    tagColor: "#8b5cf6",
  },
  // Deep Dive
  {
    title: "Solidity Documentation",
    url: "https://docs.soliditylang.org/",
    description: "Official docs for Solidity — the primary language for Ethereum smart contracts. Covers types, ABI encoding, gas optimisation, and security patterns.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "OpenZeppelin Contracts",
    url: "https://docs.openzeppelin.com/contracts/",
    description: "The industry-standard library of audited, reusable smart contracts — ERC-20, ERC-721, ERC-1155, access control, and governance. The starting point for any serious Solidity project.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  // DAOs & NFT utility
  {
    title: "Moving beyond coin voting governance — Vitalik Buterin (2021)",
    url: "https://vitalik.eth.limo/general/2021/08/16/voting3.html",
    description: "Why token-weighted voting tends toward plutocracy and vote-buying, and what alternatives (quadratic voting, reputation, limited governance) look like. The best short read on DAO structure.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Quadratic Funding explained — Gitcoin / WTF is QF",
    url: "https://wtfisqf.com/",
    description: "Interactive explainer of quadratic funding: why many small donations attract more matching than one large one, and why Sybil resistance is the hard part.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Governor contracts — OpenZeppelin Docs",
    url: "https://docs.openzeppelin.com/contracts/governance",
    description: "The standard on-chain DAO stack: Governor (proposals, votes, quorum), votes tokens, and TimelockController. Read to see how the building blocks in Section 3 are wired in code.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Crypto Crime Report — NFT wash trading — Chainalysis (2022)",
    url: "https://www.chainalysis.com/blog/2022-crypto-crime-report-preview-nft-wash-trading-money-laundering/",
    description: "On-chain analysis of self-trading on NFT marketplaces. Context for why reported NFT volumes should be read sceptically.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Ethereum EIPs — Improvement Proposals",
    url: "https://eips.ethereum.org/",
    description: "The official repository of all Ethereum Improvement Proposals. Read EIP-20 (ERC-20), EIP-721 (NFTs), EIP-1155 (multi-token), and EIP-1559 (fee market) at the primary source.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "SWC Registry — Smart Contract Weakness Classification",
    url: "https://swcregistry.io/",
    description: "Standardised registry of known smart contract vulnerability types — reentrancy, integer overflow, access control issues, and more. Essential reading before writing production contracts.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Trail of Bits — Building Secure Contracts",
    url: "https://github.com/crytic/building-secure-contracts",
    description: "Free, open-source security guidelines from one of the top audit firms. Covers testing patterns, static analysis with Slither, and common pitfalls in production Solidity code.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Flash Boys 2.0 — Daian et al. (2019)",
    url: "https://arxiv.org/abs/1904.05234",
    description: "The academic paper that coined 'Miner Extractable Value' (MEV). Quantifies front-running and sandwich attacks in DeFi and sparked the entire MEV research field.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  // Tools
  {
    title: "Remix IDE",
    url: "https://remix.ethereum.org/",
    description: "Browser-based Solidity IDE with a built-in compiler, debugger, and local EVM. Zero setup — the fastest way to write and deploy your first smart contract.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Hardhat",
    url: "https://hardhat.org/",
    description: "The most widely used Ethereum development environment. Write tests in JavaScript/TypeScript, simulate mainnet forks, and deploy with plugins for Etherscan verification.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Foundry",
    url: "https://book.getfoundry.sh/",
    description: "Rust-based Ethereum development toolkit increasingly preferred for production projects. Blazing-fast tests written in Solidity, fuzzing, and a powerful cast CLI for chain interaction.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "EVM Codes — Interactive Opcode Reference",
    url: "https://evm.codes/",
    description: "Interactive reference for every EVM opcode with gas costs, stack effects, and a live bytecode playground. Indispensable for anyone writing or auditing Solidity.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Tenderly — Smart Contract Debugging",
    url: "https://tenderly.co/",
    description: "Smart contract debugging and simulation platform. Replay any historical transaction, set on-chain alerts, and simulate calls before submitting — all without a local node.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Chainlink Documentation",
    url: "https://docs.chain.link/",
    description: "Official docs for Chainlink — the dominant decentralised oracle network. Covers price feeds, VRF (verifiable randomness), CCIP (cross-chain messaging), and Automation.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Dune Analytics",
    url: "https://dune.com/",
    description: "SQL-based analytics platform for on-chain data. Explore protocol stats, wallet behavior, and token flows. The standard tool for data-driven smart contract research.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  // Interactive
  {
    title: "CryptoZombies",
    url: "https://cryptozombies.io/",
    description: "Learn Solidity by building a zombie game. The most popular gamified introduction to smart contract development — covers ERC-20, ERC-721, and basic DeFi patterns.",
    tag: "Interactive",
    tagColor: "#39B54A",
  },
  {
    title: "Ethernaut — OpenZeppelin Wargame",
    url: "https://ethernaut.openzeppelin.com/",
    description: "Hack vulnerable smart contracts to level up. The best hands-on introduction to smart contract security — you learn by exploiting reentrancy, overflow, and access control bugs.",
    tag: "Interactive",
    tagColor: "#39B54A",
  },
  // Video
  {
    title: "Patrick Collins — Full Solidity & Foundry Course (32h)",
    url: "https://www.youtube.com/watch?v=umepbfKp5rI",
    description: "The most comprehensive free Solidity course available. 32 hours covering everything from basic variables to DeFi protocol development using Foundry and best security practices.",
    tag: "Video",
    tagColor: "#6366f1",
  },
  {
    title: "Smart Contract Programmer — YouTube",
    url: "https://www.youtube.com/@smartcontractprogrammer",
    description: "Short, focused Solidity tutorials covering advanced patterns, attack vectors, and DeFi mechanics. Covers reentrancy, flash loans, MEV, proxy patterns, and more.",
    tag: "Video",
    tagColor: "#6366f1",
  },
  {
    title: "Finematics — DeFi Explained",
    url: "https://www.youtube.com/@Finematics",
    description: "High-quality animated explanations of DeFi protocols — AMMs, liquidity pools, yield farming, flash loans, and Ethereum concepts. Perfect visual companion to Sections 2–4.",
    tag: "Video",
    tagColor: "#6366f1",
  },
  // Security
  {
    title: "Immunefi — Bug Bounty Platform",
    url: "https://immunefi.com/",
    description: "The largest blockchain bug bounty platform. Browse real vulnerability disclosures to understand what attackers look for in production smart contracts.",
    tag: "Security",
    tagColor: "#ED1C24",
  },
  {
    title: "Rekt.news — DeFi Hack Postmortems",
    url: "https://rekt.news/",
    description: "Post-mortems on every major DeFi exploit. Essential reading for understanding the real cost of smart contract vulnerabilities — reentrancy attacks, oracle manipulation, and more.",
    tag: "Security",
    tagColor: "#ED1C24",
  },
  // Research
  {
    title: "DeFi Llama — Cross-chain Analytics",
    url: "https://defillama.com/",
    description: "The most comprehensive DeFi analytics platform. Track Total Value Locked across all chains and protocols — essential for understanding the real scale of smart contract adoption.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
  {
    title: "Electric Capital Developer Report",
    url: "https://www.developerreport.com/",
    description: "Annual data-driven report on blockchain developer activity. Understand which ecosystems are actually being built on and how Solidity development has grown.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
  // News
  {
    title: "Bankless — Podcast & Newsletter",
    url: "https://www.bankless.com/",
    description: "The leading Ethereum culture media brand. Long-form interviews and analysis on DeFi protocols, DAOs, L2 ecosystems, and the broader smart contract economy.",
    tag: "News",
    tagColor: "#f59e0b",
  },
  {
    title: "The Defiant",
    url: "https://thedefiant.io/",
    description: "Daily DeFi and Ethereum ecosystem news with in-depth reporting on smart contract protocols, security incidents, and market trends.",
    tag: "News",
    tagColor: "#f59e0b",
  },
];

const ALL_TAGS = ['All', ...Array.from(new Set(resources.map(r => r.tag)))];

const TAG_COLORS: Record<string, string> = Object.fromEntries(
  resources.map(r => [r.tag, r.tagColor])
);

export function SC_Bibliography() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered = activeFilter === 'All'
    ? resources
    : resources.filter(r => r.tag === activeFilter);

  return (
    <div id="section-scroll" className="size-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/30 mb-4">
            <span className="text-[#6366f1] font-bold">📖 Bibliography</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Resources to Keep Learning
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A curated collection of the best papers, books, tools, and interactive resources
            to deepen your understanding of smart contracts and decentralised applications.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {ALL_TAGS.map(tag => {
            const isActive = activeFilter === tag;
            const color = tag === 'All' ? '#6366f1' : TAG_COLORS[tag];
            return (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
                style={
                  isActive
                    ? { backgroundColor: color, color: '#fff', borderColor: color }
                    : { backgroundColor: color + '15', color: color, borderColor: color + '40' }
                }
              >
                {tag}
                {tag !== 'All' && (
                  <span className="ml-1.5 opacity-70 font-normal text-xs">
                    {resources.filter(r => r.tag === tag).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Resource list */}
        <div className="space-y-4">
          {filtered.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-[#6366f1]/50 hover:shadow-lg transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-foreground group-hover:text-[#6366f1] transition-colors">
                    {r.title}
                  </h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: r.tagColor + '20', color: r.tagColor }}
                  >
                    {r.tag}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.description}</p>
              </div>
              <ExternalLink className="size-5 text-muted-foreground group-hover:text-[#6366f1] flex-shrink-0 mt-1 transition-colors" />
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground italic">
            "Code is law — but only if the code is correct." — Smart contract security mantra
          </p>
        </div>
      </div>
      <SiteFooter className="snap-start" />
    </div>
  );
}
