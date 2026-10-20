import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SiteFooter } from '../components/shared/SiteFooter';

interface Resource {
  title: string;
  url: string;
  description: string;
  tag: string;
  tagColor: string;
}

const resources: Resource[] = [
  // Foundational
  {
    title: "Bitcoin Whitepaper — Satoshi Nakamoto",
    url: "https://bitcoin.org/bitcoin.pdf",
    description: "The original 9-page paper that started it all. Surprisingly readable and essential for any blockchain student.",
    tag: "Must-Read",
    tagColor: "#ED1C24",
  },
  {
    title: "But how does Bitcoin actually work? — 3Blue1Brown",
    url: "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
    description: "The best visual explanation of Bitcoin's cryptography, mining, and consensus in 26 minutes.",
    tag: "Video",
    tagColor: "#6366f1",
  },
  {
    title: "Blockchain Demo — Anders Brownworth",
    url: "https://andersbrownworth.com/blockchain/",
    description: "Interactive visual demo of blocks, hashing, and mining. Great for building intuition on how a blockchain works.",
    tag: "Interactive",
    tagColor: "#39B54A",
  },
  {
    title: "Learn Me a Bitcoin",
    url: "https://learnmeabitcoin.com/",
    description: "Incredibly detailed, well-illustrated guide to every technical aspect of Bitcoin — from transactions to script opcodes.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  // Books
  {
    title: "Mastering Bitcoin — Andreas Antonopoulos (free online)",
    url: "https://github.com/bitcoinbook/bitcoinbook",
    description: "The definitive technical book on Bitcoin. Open source. Covers keys, transactions, mining, and the network protocol.",
    tag: "Book",
    tagColor: "#8b5cf6",
  },
  {
    title: "Mastering Ethereum — Andreas Antonopoulos & Gavin Wood",
    url: "https://github.com/ethereumbook/ethereumbook",
    description: "The Ethereum equivalent. Covers smart contracts, EVM, Solidity, DeFi building blocks, and more.",
    tag: "Book",
    tagColor: "#8b5cf6",
  },
  {
    title: "The Bitcoin Standard — Saifedean Ammous",
    url: "https://saifedean.com/thebitcoinstandard/",
    description: "A deep economic and historical argument for Bitcoin as sound money. Thought-provoking regardless of your stance.",
    tag: "Book",
    tagColor: "#8b5cf6",
  },
  // Courses
  {
    title: "MIT 15.S12 — Blockchain and Money (Gary Gensler)",
    url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63UUkfL0onkxF6MYgVa04Fn",
    description: "Full MIT course on blockchain technology and its applications in finance. 24 lectures, completely free.",
    tag: "Course",
    tagColor: "#ED1C24",
  },
  {
    title: "CryptoZombies",
    url: "https://cryptozombies.io/",
    description: "Learn Solidity by building a zombie game. Fun, gamified introduction to smart contract development.",
    tag: "Interactive",
    tagColor: "#39B54A",
  },
  // Tools
  {
    title: "Blockchain Explorer — Mempool.space",
    url: "https://mempool.space/",
    description: "Beautiful real-time visualization of Bitcoin's mempool, blocks, and transactions. See the blockchain live.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Etherscan — Ethereum Explorer",
    url: "https://etherscan.io/",
    description: "Explore Ethereum transactions, smart contracts, tokens, and DeFi protocols in real time.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "SHA-256 Hash — Online Tool",
    url: "https://emn178.github.io/online-tools/sha256.html",
    description: "Quick online SHA-256 calculator. Useful for experimenting with hash functions.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Blockchain.com Explorer — Visual Block Explorer",
    url: "https://www.blockchain.com/explorer",
    description: "Clean, visual Bitcoin and Ethereum block explorer. Explore blocks, transactions, and addresses with clear graphs and stats.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "DeFi Llama — DeFi Analytics Dashboard",
    url: "https://defillama.com/",
    description: "The most comprehensive DeFi analytics platform. Track Total Value Locked (TVL) across all chains and protocols with beautiful charts.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  // Videos
  {
    title: "Whiteboard Crypto — YouTube",
    url: "https://www.youtube.com/@WhiteboardCrypto",
    description: "Short animated explainers on DeFi, NFTs, DAOs, Layer 2s and more. Great for visual learners.",
    tag: "Video",
    tagColor: "#6366f1",
  },
  {
    title: "Finematics — YouTube",
    url: "https://www.youtube.com/@Finematics",
    description: "High-quality animated explanations of DeFi protocols, liquidity pools, yield farming, and Ethereum concepts.",
    tag: "Video",
    tagColor: "#6366f1",
  },
  // News & Research
  {
    title: "Bitcoin Magazine",
    url: "https://bitcoinmagazine.com/",
    description: "Stay up to date with Bitcoin news, technical developments, and industry analysis.",
    tag: "News",
    tagColor: "#f59e0b",
  },
  {
    title: "Quo Vadis Web3 — Blockchain Research Report",
    url: "https://quovadis.webthree.rs/",
    description: "Comprehensive research report exploring where Web3 is heading — covering DeFi, NFTs, DAOs, regulation, and emerging trends.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
  // Visuals
  {
    title: "TxCity — Watch Bitcoin & Ethereum Transactions Live",
    url: "https://txcity.io/v/eth-btc",
    description: "Mesmerizing real-time visualization of BTC and ETH transactions as passengers boarding buses (blocks). A beautiful way to see the blockchain in action.",
    tag: "Visual",
    tagColor: "#39B54A",
  },
  {
    title: "Bitfeed — Real-Time Bitcoin Block Visualizer",
    url: "https://bitfeed.live/",
    description: "Watch Bitcoin transactions appear in real time as colorful floating bubbles sized by value. Hypnotic and educational.",
    tag: "Visual",
    tagColor: "#39B54A",
  },
  {
    title: "Txstreet — Blockchain Transaction Visualizer",
    url: "https://txstreet.com/",
    description: "Animated visualization of pending transactions as people waiting to board a bus (the next block). Compare BTC, ETH, and other chains side by side.",
    tag: "Visual",
    tagColor: "#39B54A",
  },
  {
    title: "Ultrasound.money — Ethereum Supply Dashboard",
    url: "https://ultrasound.money/",
    description: "Real-time visualization of ETH issuance, burn rate, and supply dynamics since The Merge. Beautiful animated charts.",
    tag: "Visual",
    tagColor: "#39B54A",
  },
  // Ethereum — Technical
  {
    title: "Ethereum Whitepaper — Vitalik Buterin",
    url: "https://ethereum.org/en/whitepaper/",
    description: "The original Ethereum proposal from 2014. Introduces smart contracts, the EVM, and the vision of a 'world computer'. A must-read after the Bitcoin whitepaper.",
    tag: "Must-Read",
    tagColor: "#ED1C24",
  },
  {
    title: "Ethereum Yellow Paper — Gavin Wood",
    url: "https://ethereum.github.io/yellowpaper/paper.pdf",
    description: "The formal mathematical specification of the Ethereum Virtual Machine. Dense but authoritative — the definitive technical reference for how the EVM executes bytecode.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Ethereum Developer Documentation",
    url: "https://ethereum.org/en/developers/docs/",
    description: "The official Ethereum Foundation developer docs. Covers accounts, transactions, gas, the EVM, consensus, and Layer 2 — well-structured for all levels.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "Solidity Documentation",
    url: "https://docs.soliditylang.org/",
    description: "Official docs for Solidity, the primary language for writing Ethereum smart contracts. Covers syntax, types, ABI encoding, and security patterns.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  {
    title: "EVM Codes — Interactive EVM Opcode Reference",
    url: "https://evm.codes/",
    description: "Interactive reference for every EVM opcode with gas costs, stack effects, and a live bytecode playground. Indispensable for anyone writing or auditing Solidity.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "OpenZeppelin Contracts",
    url: "https://docs.openzeppelin.com/contracts/",
    description: "The industry-standard library of audited, reusable smart contracts — ERC-20, ERC-721, access control, governance, and more. The starting point for any serious Solidity project.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Remix IDE",
    url: "https://remix.ethereum.org/",
    description: "Browser-based Solidity IDE with a built-in compiler, debugger, and local EVM. Zero setup — the fastest way to write and deploy your first smart contract.",
    tag: "Interactive",
    tagColor: "#39B54A",
  },
  {
    title: "Ethereum EIPs — Improvement Proposals",
    url: "https://eips.ethereum.org/",
    description: "The official repository of all Ethereum Improvement Proposals. Read EIP-20 (ERC-20 tokens), EIP-721 (NFTs), EIP-1559 (fee market reform), and more at the source.",
    tag: "Deep Dive",
    tagColor: "#f59e0b",
  },
  // Ethereum — Business & Ecosystem
  {
    title: "Bankless — Podcast & Newsletter",
    url: "https://www.bankless.com/",
    description: "The leading Ethereum culture media brand. Covers DeFi, DAOs, L2 ecosystems, and the broader crypto economy with long-form interviews and analysis.",
    tag: "News",
    tagColor: "#f59e0b",
  },
  {
    title: "The Defiant",
    url: "https://thedefiant.io/",
    description: "Daily DeFi and Ethereum ecosystem news with in-depth reporting on protocols, regulation, and market trends. One of the most reliable crypto journalism outlets.",
    tag: "News",
    tagColor: "#f59e0b",
  },
  {
    title: "Week in Ethereum News",
    url: "https://weekinethereumnews.com/",
    description: "A weekly digest of everything happening in the Ethereum ecosystem — protocol upgrades, tooling releases, security disclosures, and ecosystem news. Invaluable for staying current.",
    tag: "News",
    tagColor: "#f59e0b",
  },
  {
    title: "Electric Capital Developer Report",
    url: "https://www.developerreport.com/",
    description: "Annual data-driven report on blockchain developer activity across all ecosystems. The go-to source for understanding which chains are actually being built on.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
  {
    title: "L2Beat — Layer 2 Risk & Analytics",
    url: "https://l2beat.com/",
    description: "Comprehensive tracking of every Ethereum Layer 2 — TVL, risk ratings, withdrawal mechanisms, and technical maturity. Essential for understanding the L2 landscape.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  // Wallets
  {
    title: "Rabby",
    url: "https://rabby.io/",
    description: "Open-source multi-chain browser extension wallet with pre-transaction simulation and risk warnings. A security-focused choice for interacting with dApps and DeFi protocols.",
    tag: "Wallet",
    tagColor: "#f97316",
  },
  {
    title: "Zerion",
    url: "https://zerion.io/",
    description: "Multi-chain wallet and portfolio tracker, available as a browser extension and mobile app. Shows all your tokens, NFTs, and DeFi positions across networks in one place.",
    tag: "Wallet",
    tagColor: "#f97316",
  },
  {
    title: "MetaMask",
    url: "https://metamask.io/",
    description: "Widely used Ethereum browser extension wallet. One of several options for interacting with dApps, DeFi protocols, and NFT marketplaces directly in your browser.",
    tag: "Wallet",
    tagColor: "#f97316",
  },
  {
    title: "Phantom",
    url: "https://phantom.com/",
    description: "The leading Solana wallet, also supporting Ethereum and Bitcoin. Known for its clean UI and seamless dApp integration.",
    tag: "Wallet",
    tagColor: "#f97316",
  },
  {
    title: "Coinbase Wallet",
    url: "https://www.coinbase.com/wallet",
    description: "Self-custodial wallet from Coinbase. A beginner-friendly entry point supporting multiple chains, DeFi, and NFTs — you hold your own keys.",
    tag: "Wallet",
    tagColor: "#f97316",
  },
  {
    title: "Binance Web3 Wallet",
    url: "https://www.binance.com/en/web3wallet",
    description: "Binance's built-in self-custodial Web3 wallet. Access DeFi protocols, dApps, and cross-chain swaps directly from the Binance app.",
    tag: "Wallet",
    tagColor: "#f97316",
  },

  // ─── Where to go from here: curated next-step paths ──────────────────────
  //
  // Recommended after Course 1. Grouped by intent: write contracts, build a
  // dApp, audit security, or go academic. Same tag scheme as the rest of the
  // bibliography — Security is a new tag, the rest are existing.

  // Path: Want to write smart contracts
  {
    title: "Solidity by Example",
    url: "https://solidity-by-example.org/",
    description: "Hands-on Solidity tutorial — every concept introduced via a short, runnable contract. The fastest path from 'read code' to 'write code'.",
    tag: "Interactive",
    tagColor: "#39B54A",
  },
  {
    title: "Cyfrin Updraft — Patrick Collins",
    url: "https://updraft.cyfrin.io/",
    description: "Free, structured courses on Solidity, Foundry, and smart contract security. Patrick Collins' production-grade follow-on to his freeCodeCamp series.",
    tag: "Course",
    tagColor: "#ED1C24",
  },
  {
    title: "Patrick Collins — Learn Solidity (freeCodeCamp)",
    url: "https://www.youtube.com/watch?v=gyMwXuJrbJQ",
    description: "32-hour video crash course on Solidity, Foundry, and full-stack Ethereum development. The most-watched Web3 dev tutorial on YouTube.",
    tag: "Video",
    tagColor: "#6366f1",
  },

  // Path: Want to build a dApp
  {
    title: "Scaffold-ETH 2",
    url: "https://scaffoldeth.io/",
    description: "Open-source starter kit for Ethereum dApps. Wallet, frontend, contract templates, hot reload — go from idea to deployed dApp in an afternoon.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Hardhat",
    url: "https://hardhat.org/",
    description: "The most widely-used Ethereum development environment. Local network, fast tests, deployment scripts, plugin ecosystem. Industry standard.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },
  {
    title: "Foundry — Forge / Cast / Anvil",
    url: "https://book.getfoundry.sh/",
    description: "Rust-based Ethereum toolkit. Faster than Hardhat, lets you write tests directly in Solidity. The modern Cyfrin/Paradigm default.",
    tag: "Tool",
    tagColor: "#22d3ee",
  },

  // Path: Want to understand security
  {
    title: "Secureum — Smart Contract Security Bootcamp",
    url: "https://www.secureum.xyz/",
    description: "The most respected free smart contract security curriculum. Slides, quizzes, and the famous Race-quiz format. Where many professional auditors start.",
    tag: "Security",
    tagColor: "#dc2626",
  },
  {
    title: "Building Secure Smart Contracts — Trail of Bits",
    url: "https://github.com/crytic/building-secure-contracts",
    description: "A curated reference of secure smart contract development practices from the auditors at Trail of Bits. Reads like a working engineer's manual.",
    tag: "Security",
    tagColor: "#dc2626",
  },
  {
    title: "Trail of Bits — Published Audit Reports",
    url: "https://github.com/trailofbits/publications",
    description: "Real audit reports from one of the most respected security firms in the industry. The fastest way to develop instinct for what actually breaks in production.",
    tag: "Security",
    tagColor: "#dc2626",
  },
  {
    title: "Solodit — Smart Contract Vulnerability Database",
    url: "https://solodit.cyfrin.io/",
    description: "Searchable database of every public smart contract vulnerability ever reported. Pair it with the Secureum curriculum for serious depth.",
    tag: "Security",
    tagColor: "#dc2626",
  },

  // Path: Want academic depth
  {
    title: "Bitcoin & Cryptocurrency Technologies — Princeton (free book)",
    url: "https://bitcoinbook.cs.princeton.edu/",
    description: "The Princeton textbook by Narayanan, Bonneau, Felten, Miller, and Goldfeder. Rigorous, technical, completely free. The closest thing to a canonical academic reference.",
    tag: "Book",
    tagColor: "#8b5cf6",
  },
  {
    title: "Vitalik Buterin's Blog",
    url: "https://vitalik.eth.limo/",
    description: "Ethereum's founder writing on protocol design, cryptoeconomics, governance, and the broader vision. Many of the most influential ideas in the field were drafted here first.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
  {
    title: "a16z Crypto Canon",
    url: "https://a16zcrypto.com/posts/article/crypto-readings-resources/",
    description: "An evolving reading list from Andreessen Horowitz covering every layer of the crypto stack — cryptography, consensus, economics, governance, regulation, history.",
    tag: "Research",
    tagColor: "#f59e0b",
  },
];

const ALL_TAGS = ['All', ...Array.from(new Set(resources.map(r => r.tag)))];

const TAG_COLORS: Record<string, string> = Object.fromEntries(
  resources.map(r => [r.tag, r.tagColor])
);

export function Bibliography() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered = activeFilter === 'All'
    ? resources
    : resources.filter(r => r.tag === activeFilter);

  return (
    <div id="section-scroll" className="size-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/30 mb-4">
            <span className="text-[#ED1C24] font-bold">📖 Bibliography</span>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Resources to Keep Learning
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A curated collection of the best books, videos, tools, and interactive resources
            to deepen your understanding of Bitcoin and blockchain technology.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {ALL_TAGS.map(tag => {
            const isActive = activeFilter === tag;
            const color = tag === 'All' ? '#ED1C24' : TAG_COLORS[tag];
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
              className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-[#ED1C24]/50 hover:shadow-lg transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-foreground group-hover:text-[#ED1C24] transition-colors">
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
              <ExternalLink className="size-5 text-muted-foreground group-hover:text-[#ED1C24] flex-shrink-0 mt-1 transition-colors" />
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground italic">
            "An investment in knowledge pays the best interest." — Benjamin Franklin
          </p>
        </div>
      </div>
      <SiteFooter className="snap-start" />
    </div>
  );
}
