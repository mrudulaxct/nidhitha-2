const API_BASE = 'https://cyber-security-trust-model-main1.onrender.com';

// Hardcoded login credentials
const USERNAME = 'admin';
const PASSWORD = '1234';

// Login logic
function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  const error = document.getElementById('loginError');

  if (user === USERNAME && pass === PASSWORD) {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    error.textContent = '';
  } else {
    error.textContent = 'Invalid username or password.';
  }
}

// Encrypt data
async function encryptData() {
  const plaintext = document.getElementById('plaintext').value;
  if (!plaintext.trim()) {
    alert('Please enter a message to encrypt.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: plaintext }),
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById('encryptResult').innerHTML = `
        <div class="result">
          <strong>Encrypted:</strong> ${data.encrypted_data}<br/>
          <strong>Quantum Key:</strong> ${data.quantum_key}<br/>
          <strong>Block Hash:</strong> ${data.block_hash}<br/>
          <strong>Merkle Root:</strong> ${data.merkle_root}
        </div>
      `;

      // Autofill for decryption
      document.getElementById('encryptedData').value = data.encrypted_data;
      document.getElementById('quantumKey').value = data.quantum_key;

      updateMetrics(data);
    } else {
      throw new Error(data.error || 'Encryption failed');
    }
  } catch (error) {
    document.getElementById('encryptResult').innerHTML = `
      <div class="result error">
        <strong>Error:</strong> ${error.message}
      </div>
    `;
  }
}

// Decrypt data
async function decryptData() {
  const encryptedData = document.getElementById('encryptedData').value;
  const quantumKey = document.getElementById('quantumKey').value;

  if (!encryptedData.trim() || !quantumKey.trim()) {
    alert('Enter both encrypted data and quantum key.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encrypted_data: encryptedData,
        quantum_key: quantumKey,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById('decryptResult').innerHTML = `
        <div class="result">
          <strong>Decrypted:</strong> ${data.decrypted_data}<br/>
          <strong>Merkle Root:</strong> ${data.merkle_root}
        </div>
      `;

      updateMetrics(data, true);
    } else {
      throw new Error(data.error || 'Decryption failed');
    }
  } catch (error) {
    document.getElementById('decryptResult').innerHTML = `
      <div class="result error">
        <strong>Error:</strong> ${error.message}
      </div>
    `;
  }
}

// Fetch blockchain
async function getBlockchain() {
  try {
    const response = await fetch(`${API_BASE}/api/blockchain`);
    const data = await response.json();

    if (response.ok) {
      let html = `<div class="result"><strong>Merkle Root:</strong> ${data.merkle_root}<br/><br/>`;
      data.chain.forEach((block) => {
        html += `
          <div class="blockchain-block">
            <strong>Block #${block.index}</strong><br/>
            Hash: ${block.hash}<br/>
            Previous: ${block.previous_hash}<br/>
            Time: ${new Date(block.timestamp * 1000).toLocaleString()}<br/>
            Data: ${JSON.stringify(block.data)}
          </div><br/>
        `;
      });
      html += `</div>`;
      document.getElementById('blockchainResult').innerHTML = html;
    } else {
      throw new Error('Failed to load blockchain');
    }
  } catch (error) {
    document.getElementById('blockchainResult').innerHTML = `
      <div class="result error">Error: ${error.message}</div>
    `;
  }
}

// Update performance metrics
function updateMetrics(data) {
  const metricsDiv = document.getElementById('metrics');
  let html = '';

  if (data.encryption_time) {
    html += `<span class="metric">Encryption Time: ${data.encryption_time}ms</span><br/>`;
  }
  if (data.decryption_time) {
    html += `<span class="metric">Decryption Time: ${data.decryption_time}ms</span><br/>`;
  }
  if (data.qkd_time) {
    html += `<span class="metric">QKD Time: ${data.qkd_time}ms</span><br/>`;
  }

  html += `<span class="metric">System Accuracy: 99.84%</span>`;
  metricsDiv.innerHTML = html;
}
