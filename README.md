# Privy 🔐

Privy is a privacy-focused messaging platform that ensures your conversations remain secure and untraceable. Using modern Web Crypto API encryption and a zero-storage architecture, your messages exist only in RAM and leave no digital footprint. ✨

## Preview 👀

![Privy](https://i.postimg.cc/28D1TDWZ/Untitled.jpg)

## Why Privy? 🤔

In today's digital age, privacy isn't just a feature – it's a necessity. Traditional messaging platforms store your data, creating potential security vulnerabilities. Privy solves this by implementing true ephemeral messaging where nothing is ever written to disk. 🛡️

## Key Features ⭐

1. **Zero Storage Architecture** 💨: All communications exist purely in RAM with immediate secure memory wiping after delivery. No logs, no history, no traces.

2. **Modern Cryptography** 🔒: Implements RSA-OAEP encryption using Web Crypto API with 2048-bit keys and SHA-256 hashing for secure communication.

3. **Complete Anonymity** 🕵️: No user accounts and no metadata collection ensure your identity remains protected.

4. **Real-time Encrypted Rooms** 🚪: Create secure, ephemeral spaces for group communications with secure message destruction.

## Technical Details 🔧

Privy uses the Web Crypto API for cryptographic operations:
```typescript
const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
};
```

## Getting Started 🚀

### Prerequisites 📋
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with Web Crypto API support

### Installation 💿

1. Clone the Repository
```bash
git clone https://github.com/ABHAY-100/Privy.git
cd Privy
```

2. Install Client Dependencies
```bash
cd client
npm install
```

3. Install Server Dependencies
```bash
cd ../server
npm install
```
### Running Privy ▶️

1. Start the Server
```bash
cd server
nodemon server
```

2. Create a `.env` file in the client directory
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000  # or your hosted server URL
```

3. Launch the Client
```bash
cd client
npm run dev
```

Visit `http://localhost:3000` to start using Privy.

## Built With 🛠️

![Tech Stack](https://skillicons.dev/icons?i=nextjs,typescript,tailwind,nodejs,express)

- Next.js 13+ with App Router
- TypeScript for type safety
- Tailwind CSS & Shadcn UI
- Express.js backend
- Socket.IO for real-time communication
- Web Crypto API for encryption

## Best Practices 💡

- Use Tor Browser for maximum anonymity
- Connect through a trusted VPN
- Use private browsing mode
- Regularly rotate rooms for enhanced security
- Verify recipient keys through secondary channels

## Contributing 🤝

Open to legitimate contributions. Fork and submit a PR!


## Team Members

1. [Abhay Balakrishnan](https://github.com/ABHAY-100)
2. [Elvin J Alapatt](https://github.com/Elvin2605)
3. [Sreyas B Anand](https://github.com/sreyas-b-anand)
4. [Asil Mehaboob](https://github.com/AsilMehaboob)

## License ⚖️

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support 🆘

Found a bug or have a question? Please check our [Issues](https://github.com/ABHAY-100/Privy/issues) page or create a new issue with detailed information.

---

**Privy: Because your conversations should be yours alone.** 🤫
