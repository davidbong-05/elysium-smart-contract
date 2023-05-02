# Elysium

This is the smart contract for a NFT marketplace that is built on the Ethereum blockchain. It is my final year project for my Bachelor of Computer Science (Software Engineering) with Honour at the Universiti Malaysia Sarawak.

## Project Description

Front End:

- [elysium](https://github.com/davidbong-05/elysium.git)

Back End:

- [elysium-mongodb-api](https://github.com/davidbong-05/elysium-mongodb-api.git)
- [elysium-smart-contract](https://github.com/davidbong-05/elysium-smart-contract.git)
- [MongoDB](https://www.mongodb.com/)
- [Pinata](https://pinata.cloud/)

The project is built using the following technologies:

- [Solidity](https://docs.soliditylang.org/en/v0.8.4/)
- [Vite](https://vitejs.dev/)
- [Vue 3](https://v3.vuejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/en/)
- [ethers.js](https://docs.ethers.io/v6/)

## Project Setup (Sepolia Testnet)

Step 1: Clone the repository

```bash
git clone https://github.com/davidbong-05/elysium-smart-contract.git
```

Step 2: Rename the .env.example file to .env and fill in the required information

```bash
# .env.example
SEPOLIA_RPC_URL="<YOUR_SEPOLIA_RPC_URL_HERE>"
PRIVATE_KEY="<YOUR_METAMASK_PRIVATE_KEY_HERE>"
```

Step 3: Deploy the smart contract to Sepolia testnet
Make sure you have enough sepolia testnet ETH in your wallet.
You can get sepolia testnet ETH from [here](https://sepoliafaucet.com/) or any other faucet.

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Step 4: The address of the smart contract will be displayed in the terminal

```bash
Elysium smart contract deployed to ${market.address}
NFT Factory smart contract deployed to ${factory.address}`
```

## Project Setup (Local)

Step 1: Clone the repository

```bash
git clone https://github.com/davidbong-05/elysium-smart-contract.git
```

Step 2: Run a local blockchain

```bash
npx hardhat node
```

Step 3: Add Localhost 8545 to metamask

```bash
Network Name: Localhost 8545
New RPC URL: http://localhost:8545
Chain ID: 31337
Currency Symbol: ETH
```

Step 4: Import 1 of the private key into metamask

```bash
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.
```

Step 5: Rename the .env.example file to .env and fill in the required information

```bash
# .env.example
SEPOLIA_RPC_URL="<YOUR_SEPOLIA_RPC_URL_HERE>" #doesnt matter if you are running locally
PRIVATE_KEY="<YOUR_METAMASK_PRIVATE_KEY_HERE>" #use one of the private keys above
```

Step 6: Deploy the smart contract to local blockchain
Make sure you have enough local ETH in your wallet.
You can get the ETH from the local blockchain.

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Step 7: The address of the smart contract will be displayed in the terminal

```bash
Elysium smart contract deployed to ${market.address}
NFT Factory smart contract deployed to ${factory.address}`
```

## Other Information

You can interact with the smart contract using the project below:

- [elysium](https://github.com/davidbong-05/elysium.git)
- [elysium-mongodb-api](https://github.com/davidbong-05/elysium-mongodb-api.git)

Attention: The project is still under development and is not ready for production.

## Contact

email: davidbong05@gmail.com
