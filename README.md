# IronLedger

IronLedger is a blockchain-based transparency system that tracks public development funds on an independent digital network. It requires multiple officials' approval for spending, while citizens can freely view all transactions. Like Bitcoin's public ledger, records are permanent and tamper-proof, deterring corruption.

## Features

- Blockchain-based transparency system for tracking public development funds
- Multiple officials' approval required for spending
- Citizens can freely view all transactions
- Permanent and tamper-proof records, deterring corruption
- Bounties for citizens identifying irregularities
- Customized blockchain with advanced integrity features
- Ecosystem partnerships with local organizations to amplify transparency and accountability

## Prerequisites

- Node.js 14.x or later
- npm 6.x or later
- UniSats wallet extension for the browser
- IPFS daemon running at localhost:5001

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ironledger.git
cd ironledger

Install dependencies:

bashCopynpm install

Configure environment variables:

Create a .env.local file in the root directory and add the following variables:
CopyNEXT_PUBLIC_IPFS_API_URL=http://localhost:5001

Run the development server:

npm run dev
Open http://localhost:3000 with your browser to see the application.
Usage

Install the UniSats wallet browser extension and create a new wallet.
Connect your wallet to the IronLedger application.
As an official, you can create new fund proposals and approve or reject existing proposals.
As a citizen, you can view all transactions, fund proposals, and their status. If you identify any irregularities, you can submit a report to claim a bounty.

Contributing

We welcome contributions to IronLedger. Please read our Contributing Guidelines to get started.

Remember to create the `CONTRIBUTING.md` and `LICENSE` files mentioned in the README.md, and place them in the root directory of your project.
```