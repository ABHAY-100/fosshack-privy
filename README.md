# Privy

<i>Privy is a [Ephemeral](https://medium.com/startupq8/ephemeral-messaging-a-trend-that-wont-disappear-5bb30bf4c95d) messaging platform utilizing [PGP](https://medium.com/@rushikajayasinghe/what-is-pretty-good-privacy-pgp-6327e760587d) for secure, disappearing chats.</i>

<p>
  <img src="https://i.postimg.cc/4x6TjYWh/privy-mockup.png">
</p>

<p>
  <img src="https://img.shields.io/github/last-commit/ABHAY-100/privy.svg">
  <img src="https://img.shields.io/github/languages/code-size/ABHAY-100/privy.svg">
  <img src="https://img.shields.io/github/repo-size/ABHAY-100/privy" alt="Repo Size">
  <a href="https://github.com/ABHAY-100/privy/issues"><img src="https://img.shields.io/github/issues/ABHAY-100/privy" alt="Issues"></a>
  <a href="https://github.com/ABHAY-100/privy/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ABHAY-100/privy" alt="License"></a>
  <a href="https://github.com/ABHAY-100/privy/stargazers"><img src="https://img.shields.io/github/stars/ABHAY-100/privy" alt="Stars"></a>
</p>



## 📖 Table of Contents

- [About](##about)
- [Key Features](#key-features)
- [Security Architecture](##security-architecture)
- [See Privy in Action](##see-privy-in-action)
- [Installation](##installation)
- [Usage](##usage)
- [Tech Stack](##tech-stack)
- [Team](##team)
- [Contributing](##contributing)
- [License](#license)
- [Security Considerations](##security-considerations)



## 🔒 About

Privy is where messages go when they don't want to be remembered. We've built an ephemeral messaging platform that takes privacy seriously - all communications are end-to-end encrypted and vanish completely after your conversation ends.

**Why would you use Privy?**
- When you need conversations that truly disappear
- For sharing sensitive information that shouldn't stick around
- When you want privacy without complexity



## ✨ Key Features

- **Truly Ephemeral Communication**:
  - Messages and data vanish after 30 minutes or on page refresh
  - Auto-destruction after 5 minutes of inactivity
  - Fresh encryption keys generated for each session

- **End-to-End Encryption**:
  - PGP encryption for all message content
  - Your keys never leave your device
  - Messages stored encrypted in your browser only
  - No server-side data storage

- **Private By Design**:
  - Strictly 2 participants per chat room
  - Fair usage: maximum 10 sessions per IP address
  - No message content traces after conversations end



## 🛡️ Security Architecture

### How We Handle Encryption

- **Your Keys, Your Device**: All keys are generated right in your browser
- **Double-Locked Storage**: Private keys are AES-encrypted with browser fingerprint data before storing in SessionStorage
- **Extra Randomness**: We use parts of your browser fingerprint to strengthen encryption (not for tracking!)
- **Minimal Sharing**: Only public keys get exchanged between chat participants
- **Secure Message Storage**: Messages encrypted and stored temporarily in browser's IndexedDB with additional safeguards

### Browser & Network Protections

- **Content Security Policy**: We lock down what can run in your browser
- **Clickjacking Protection**: No one can trick you into clicking things you didn't mean to
- **HTTPS Everywhere**: HSTS headers keep your connection encrypted
- **Secure Sockets**: Real-time chat happens over secure WebSocket connections
- **XSS Prevention**: DOMPurify sanitizes all content to prevent cross-site scripting attacks
- **Rate Limiting**: API request limits protect against brute force and DoS attacks

### How Sessions Work

- **Auto-Cleanup**: Sessions self-destruct after 30 minutes or when you step away for 5 minutes
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

### Full Setup (Client and Server)

```bash
# Clone the repository
git clone https://github.com/ABHAY-100/fosshack-privy.git
cd fosshack-privy

# Setup Server
cd server
npm install

# Setup Client
cd ../client
npm install
cp .env.example .env  # Configure your environment variables
```

## 💻 Usage

### What You'll Need

- Node.js 16 or newer
- A modern browser with good crypto support (Chrome, Firefox, Edge, Safari)

### Running the Application

#### Start the Server
```bash
# From the server directory
cd fosshack-privy/server
npm install  # If not already installed
nodemon server  # For development with auto-restart
# OR
node server.js  # For standard start
```

#### Start the Client
```bash
# From the client directory
cd fosshack-privy/client
npm run dev  # Start development server

# For production
npm run build
npm start
```

### Using Privy

1. Start both server and client using instructions above
2. Open Privy in your browser (typically at http://localhost:3000)
3. We'll automatically generate your secret identity
4. Create a room or join one via URL
5. Share the room link with your chat partner
6. Chat away with complete privacy
7. When you're done, close the tab and everything disappears

## 🔧 Tech Stack

- **Frontend**: TypeScript (84.9%), React
- **Backend**: Node.js, Express
- **Real-time Magic**: Socket.io
- **Look & Feel**: CSS (3%)
- **Security**: WebCrypto API, PGP
- **Auth**: bcrypt where needed

## 👥 Team

Privy was built by this crew at [FOSS HACK 2025](https://fossunited.org/hack/fosshack25):

- [Abhay Balakrishnan](https://github.com/ABHAY-100)
- [Asil Mehaboob](https://github.com/AsilMehaboob)
- [Elvin J Alapatt](https://github.com/Elvin2605)
- [Sreyas B Anand](https://github.com/sreyas-b-anand)

## 🤝 Contributing

We'd love your help making Privy even better:

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/something-awesome`
3. Commit your changes: `git commit -m 'Add something awesome'`
4. Push to the branch: `git push origin feature/something-awesome`
5. Open a Pull Request

We appreciate code that follows the project's style and includes tests!

### Found a Security Issue?

Please don't open a public issue. Email us at [abhaybalakrishnan884@gmail.com](mailto:abhaybalakrishnan884@gmail.com) instead, and we'll work with you directly.

## 📄 License

Privy is MIT Licensed - see the [LICENSE](LICENSE) file for the legal details.


## ⚠️ Security Considerations

- **No Recovery**: Messages are permanently deleted by design - no recovery possible
- **Technical Requirements**: Requires modern browsers with WebCrypto API support
- **Privacy Limits**: While messages are encrypted, connection metadata remains visible
- **User Precautions**:
  - Consider using a VPN to mask your IP address
  - Use private browsing mode
  - Connect only through trusted networks
  - Ensure your device is secure and up-to-date

Remember to assess your specific threat model before using for highly sensitive communications.

---

<b>Built at Foss Hack '25 💪</b>
