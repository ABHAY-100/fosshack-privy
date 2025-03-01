# <img src="./client/public/privy.svg" width="32"> Privy

<p>
	<img src="https://i.postimg.cc/4x6TjYWh/privy-mockup.png">
</p>

<p>
  <a href=""><img src="https://img.shields.io/github/discussions/ABHAY-100/privy" alt="Discussions"></a>
  <a href="https://github.com/ABHAY-100/privy/issues"><img src="https://img.shields.io/github/issues/ABHAY-100/privy" alt="Issues"></a>
  <img src="https://img.shields.io/github/last-commit/ABHAY-100/privy.svg">
  <a href="https://github.com/ABHAY-100/privy/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ABHAY-100/privy" alt="License"></a>
  <a href="https://github.com/ABHAY-100/privy/stargazers"><img src="https://img.shields.io/github/stars/ABHAY-100/privy" alt="Stars"></a>
  <img src="https://img.shields.io/github/repo-size/ABHAY-100/privy" alt="Repo Size">
  <a href="https://github.com/ABHAY-100/privy/network/members"><img src="https://img.shields.io/github/forks/ABHAY-100/privy" alt="Forks"></a>
</p>

## 📖 Table of Contents

- [About](#about)
- [Key Features](#key-features)
- [Security Architecture](#security-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)
- [Security Considerations](#security-considerations)

## 🔒 About

Privy is where messages go when they don't want to be remembered. We've built an ephemeral messaging platform that takes privacy seriously - all communications are end-to-end encrypted and vanish completely after your conversation ends.

**Why would you use Privy?**
- When you need conversations that truly disappear
- For sharing sensitive information that shouldn't stick around
- When you want privacy without complexity

## ✨ Key Features

- **Actually Ephemeral**: Messages vanish after your session ends or when you refresh - seriously, they're gone
- **End-to-End Encryption**: Everything's locked with PGP/RSA encryption that even we can't peek at
- **Zero Server Storage**: Your private keys stay on your device - where they belong
- **Smart Session Controls**:
  - 5 minutes of inactivity? You're logged out
  - 30 minutes total session time? That's all you get
  - Fresh encryption keys each time - because reusing keys is like reusing passwords
- **Just You Two**: Chat rooms are strictly limited to 2 participants
- **Fair Usage**: Maximum 10 sessions per IP (we want to keep the lights on for everyone)

## 🛡️ Security Architecture

### How We Handle Encryption

- **Your Keys, Your Device**: All keys are generated right in your browser
- **Nothing Leaves Home**: Private keys never leave your device - not even to us
- **Double-Locked Storage**: Private keys are AES-encrypted before even hitting SessionStorage
- **Extra Randomness**: We use parts of your browser fingerprint to strengthen encryption (not for tracking!)
- **Minimal Sharing**: Only public keys get exchanged between chat participants

### Browser & Network Protections

- **Content Security Policy**: We lock down what can run in your browser
- **Clickjacking Protection**: No one can trick you into clicking things you didn't mean to
- **HTTPS Everywhere**: HSTS headers keep your connection encrypted
- **Secure Sockets**: Real-time chat happens over secure WebSocket connections

### How Sessions Work

- **Auto-Cleanup**: Sessions self-destruct after 30 minutes or when you step away
- **Private Conversations**: Only two people can join a room - no unexpected guests
- **Clean Slate**: When you're done, all keys and messages are completely wiped
- **Fair Usage**: Limits on concurrent sessions prevent abuse

## 🎬 See Privy in Action

<div>
  <a href="https://www.youtube.com/watch?v=0xQDagvV17s" target="_blank">
    <img src="https://img.youtube.com/vi/0xQDagvV17s/maxresdefault.jpg" alt="Privy Demo Video" width="600">
  </a>
  <p><em>Click to watch the demo video</em></p>
</div>

## 🚀 Installation

```bash
# Grab the code
git clone https://github.com/ABHAY-100/privy.git

# Head into the project folder
cd privy

# Set up dependencies
npm install

# Create your config
cp .env.example .env

# Fire up the dev server
npm run dev

# Ready for production?
npm run build
npm start
```

## 💻 Usage

### What You'll Need

- Node.js 16 or newer
- A modern browser with good crypto support

### Development

```bash
# Start coding with hot reload
npm run dev

# Run the test suite
npm test

# Keep your code tidy
npm run lint
```

### Using Privy

1. Open Privy in your browser
2. We'll automatically generate your secret identity
3. Create a room or join one via URL
4. Share the room link with your chat partner
5. Chat away with complete privacy
6. When you're done, close the tab and everything disappears

## 🔧 Tech Stack

- **Frontend**: TypeScript (84.9%), React
- **Backend**: Node.js, Express
- **Real-time Magic**: Socket.io
- **Look & Feel**: CSS (3%)
- **Security**: WebCrypto API, PGP
- **Auth**: bcrypt where needed

## 👥 Team

Privy was built by this crew at FOSS HACK 2025:

- [Abhay Balakrishnan](https://github.com/ABHAY-100) - Leading the charge
- [Asil Mehaboob](https://github.com/AsilMehaboob) - Backend wizardry
- [Elvin J Alapatt](https://github.com/Elvin2605) - Frontend craftsmanship
- [Sreyas B Anand](https://github.com/sreyas-b-anand) - Security architecture

## 🤝 Contributing

We'd love your help making Privy even better:

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/something-awesome`
3. Commit your changes: `git commit -m 'Add something awesome'`
4. Push to the branch: `git push origin feature/something-awesome`
5. Open a Pull Request

We appreciate code that follows the project's style and includes tests!

### Found a Security Issue?

Please don't open a public issue. Email us at security@example.com instead, and we'll work with you directly.

## 📄 License

Privy is MIT Licensed - see the [LICENSE](LICENSE) file for the legal details.

## ⚠️ Security Considerations

- **Gone Means Gone**: By design, there's no way to recover messages
- **Modern Browsers Only**: You'll need a browser with proper WebCrypto support
- **Not Perfect**: While message content is encrypted, connection timing might still reveal metadata
- **Know Your Risks**: Consider your threat model when using any privacy tool

---

<p align="center">
  Created at <strong>FOSS HACK 2025</strong> • Getting better since March 2025
</p>
