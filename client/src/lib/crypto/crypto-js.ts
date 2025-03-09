const generateBrowserFingerprint = async () => {
  const components = [
    navigator.userAgent.substring(4, navigator.userAgent.length - 12), // user agent
    Intl.DateTimeFormat().resolvedOptions().timeZone, // timezone
    (function () {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;

        if (!gl) return "WebGL Not Supported";

        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        let vendor = "Unknown Vendor";
        let renderer = "Unknown Renderer";

        if (debugInfo) {
          vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || vendor;
          renderer =
            gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer;
        }

        const glParams = gl
          ? [
              gl.getParameter(gl.MAX_TEXTURE_SIZE),
              gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
              gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
              gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
              gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
              gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            ].join(",")
          : "null,null,null,null,null,null";

        function getShaderPrecision(shaderType: number) {
          if (!gl) return "null,null,null";
          const precision = gl.getShaderPrecisionFormat(
            shaderType,
            gl.HIGH_FLOAT
          );
          return precision
            ? `${precision.precision},${precision.rangeMin},${precision.rangeMax}`
            : "null,null,null";
        }

        const vertexShaderPrecision = getShaderPrecision(gl.VERTEX_SHADER);
        const fragmentShaderPrecision = getShaderPrecision(gl.FRAGMENT_SHADER);

        function getCanvasFingerprint() {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return "";

          ctx.textBaseline = "top";
          ctx.font = "14px Arial";
          ctx.fillText("WebGL Fingerprint", 10, 50);
          return canvas.toDataURL();
        }

        const canvasFingerprint = getCanvasFingerprint(); // canvas fingerprinting

        const fingerprint = `${vendor}~${renderer}~${glParams}~${vertexShaderPrecision}~${fragmentShaderPrecision}~${canvasFingerprint}`;

        return fingerprint;
      } catch (error) {
        console.error("WebGL Fingerprinting Error:", error);
        return "";
      }
    })(), // webgl fingerprinting
    (function () {
      const AudioContextClass =
        typeof AudioContext !== "undefined"
          ? AudioContext
          : (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;

      if (!AudioContextClass) {
        console.error("Audio fingerprinting not supported.");
        return "";
      }

      try {
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const analyser = audioCtx.createAnalyser();
        const gain = audioCtx.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.connect(gain);
        gain.connect(analyser);
        const silentDestination = audioCtx.createMediaStreamDestination();
        analyser.connect(silentDestination);

        oscillator.start();

        const buffer = new Float32Array(analyser.frequencyBinCount);

        setTimeout(() => {
          analyser.getFloatFrequencyData(buffer);
          oscillator.stop();

          if (buffer.every((val) => val === -Infinity)) {
            return "Audio Fingerprint Blocked";
          }

          return buffer.slice(0, 10).join(",");
        }, 50);
      } catch {
        console.error("Audio fingerprinting failed.");
        return "";
      }
    })(), // audio fingerprinting
    navigator.hardwareConcurrency || "", // number of logical processors
  ].filter(Boolean);

  const encoder = new TextEncoder();
  const data = encoder.encode(components.join("||"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const encryptWithFingerprint = async (data: string): Promise<string> => {
  const encryptionKey = await generateBrowserFingerprint();

  const encoder = new TextEncoder();
  const salt = encoder.encode("static-salt");

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(encryptionKey),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );

  const result = new Uint8Array(iv.length + encryptedContent.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encryptedContent), iv.length);

  return btoa(String.fromCharCode(...result));
};

export const decryptWithFingerprint = async (
  encryptedData: string
): Promise<string> => {
  try {
    const encryptionKey = await generateBrowserFingerprint();
    const encoder = new TextEncoder();
    const salt = encoder.encode("static-salt");

    const binaryString = atob(encryptedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const encryptedContent = bytes.slice(12);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(encryptionKey),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decryptedContent = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedContent
    );

    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error("Decryption failed. Possible fingerprint mismatch:", error);
    return "";
  }
};
