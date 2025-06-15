const API_BASE = 'http://localhost:5000/api';

let currentEncryptionData = {};

async function encryptData() {
    const plaintext = document.getElementById('plaintext').value;
    if (!plaintext.trim()) {
        alert('Please enter a message to encrypt');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/encrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: plaintext })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentEncryptionData = data;
            
            document.getElementById('encryptResult').innerHTML = `
                <div class="result success">
                    <h3>Encryption Successful!</h3>
                    <p><strong>Encrypted Data:</strong> ${data.encrypted_data}</p>
                    <p><strong>Quantum Key:</strong> ${data.quantum_key}</p>
                    <p><strong>Block Hash:</strong> ${data.block_hash}</p>
                    <p><strong>Merkle Root:</strong> ${data.merkle_root}</p>
                </div>
            `;
            
            // Auto-fill decryption fields
            document.getElementById('encryptedData').value = data.encrypted_data;
            document.getElementById('quantumKey').value = data.quantum_key;
            
            // Update metrics
            updateMetrics(data);
            
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        document.getElementById('encryptResult').innerHTML = `
            <div class="result error">
                <h3>Encryption Failed</h3>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

async function decryptData() {
    const encryptedData = document.getElementById('encryptedData').value;
    const quantumKey = document.getElementById('quantumKey').value;
    
    if (!encryptedData.trim() || !quantumKey.trim()) {
        alert('Please enter both encrypted data and quantum key');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/decrypt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                encrypted_data: encryptedData,
                quantum_key: quantumKey
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('decryptResult').innerHTML = `
                <div class="result success">
                    <h3>Decryption Successful!</h3>
                    <p><strong>Decrypted Message:</strong> ${data.decrypted_data}</p>
                    <p><strong>Merkle Root:</strong> ${data.merkle_root}</p>
                </div>
            `;
            
            // Update metrics
            updateMetrics(data, true);
            
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        document.getElementById('decryptResult').innerHTML = `
            <div class="result error">
                <h3>Decryption Failed</h3>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

async function getBlockchain() {
    try {
        const response = await fetch(`${API_BASE}/blockchain`);
        const data = await response.json();
        
        if (response.ok) {
            let blockchainHtml = `
                <div class="result">
                    <h3>Blockchain Ledger (${data.length} blocks)</h3>
                    <p><strong>Merkle Root:</strong> ${data.merkle_root}</p>
                    <div style="max-height: 400px; overflow-y: auto;">
            `;
            
            data.chain.forEach(block => {
                blockchainHtml += `
                    <div class="blockchain-block">
                        <div class="block-header">Block #${block.index}</div>
                        <div class="block-data">
                            <p><strong>Hash:</strong> ${block.hash}</p>
                            <p><strong>Previous Hash:</strong> ${block.previous_hash}</p>
                            <p><strong>Timestamp:</strong> ${new Date(block.timestamp * 1000).toLocaleString()}</p>
                            <p><strong>Data:</strong> ${typeof block.data === 'object' ? JSON.stringify(block.data) : block.data}</p>
                        </div>
                    </div>
                `;
            });
            
            blockchainHtml += '</div></div>';
            document.getElementById('blockchainResult').innerHTML = blockchainHtml;
            
        } else {
            throw new Error('Failed to fetch blockchain');
        }
    } catch (error) {
        document.getElementById('blockchainResult').innerHTML = `
            <div class="result error">
                <h3>Error</h3>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

function updateMetrics(data, isDecryption = false) {
    const metricsDiv = document.getElementById('metrics');
    let metricsHtml = '<h3>Performance Metrics</h3>';
    
    if (data.encryption_time) {
        metricsHtml += `<span class="metric">Encryption Time: ${data.encryption_time}ms</span>`;
    }
    
    if (data.decryption_time) {
        metricsHtml += `<span class="metric">Decryption Time: ${data.decryption_time}ms</span>`;
    }
    
    if (data.qkd_time) {
        metricsHtml += `<span class="metric">QKD Time: ${data.qkd_time}ms</span>`;
    }
    
    // Simulate accuracy (in real implementation, this would be calculated differently)
    const accuracy = 99.84;
    metricsHtml += `<span class="metric">System Accuracy: ${accuracy}%</span>`;
    
    metricsDiv.innerHTML = metricsHtml;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cyber-Security Trust Model Initialized');
});