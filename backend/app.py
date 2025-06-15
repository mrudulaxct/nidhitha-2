from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from crypto_utils import QKDSimulator, MAESEncryption
from blockchain import SimpleBlockchain
import time

app = Flask(__name__)
CORS(app)

# Initialize components
qkd = QKDSimulator()
maes = MAESEncryption()
blockchain = SimpleBlockchain()

@app.route('/api/encrypt', methods=['POST'])
def encrypt_data():
    try:
        data = request.json
        plaintext = data['message']
        
        # QKD Key Generation
        start_time = time.time()
        quantum_key = qkd.generate_quantum_key()
        qkd_time = (time.time() - start_time) * 1000
        
        # MAES Encryption
        start_time = time.time()
        encrypted_data = maes.encrypt(plaintext, quantum_key)
        encryption_time = (time.time() - start_time) * 1000
        
        # Add to blockchain
        block = blockchain.add_block({
            'action': 'encrypt',
            'data_hash': maes.get_hash(plaintext),
            'timestamp': time.time()
        })
        
        return jsonify({
            'encrypted_data': encrypted_data,
            'quantum_key': quantum_key,
            'encryption_time': round(encryption_time, 3),
            'qkd_time': round(qkd_time, 3),
            'block_hash': block['hash'],
            'merkle_root': blockchain.get_merkle_root()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/decrypt', methods=['POST'])
def decrypt_data():
    try:
        data = request.json
        encrypted_data = data['encrypted_data']
        quantum_key = data['quantum_key']
        
        start_time = time.time()
        decrypted_data = maes.decrypt(encrypted_data, quantum_key)
        decryption_time = (time.time() - start_time) * 1000
        
        # Add to blockchain
        blockchain.add_block({
            'action': 'decrypt',
            'data_hash': maes.get_hash(decrypted_data),
            'timestamp': time.time()
        })
        
        return jsonify({
            'decrypted_data': decrypted_data,
            'decryption_time': round(decryption_time, 3),
            'merkle_root': blockchain.get_merkle_root()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/blockchain', methods=['GET'])
def get_blockchain():
    return jsonify({
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
        'merkle_root': blockchain.get_merkle_root()
    })

@app.route('/api/verify', methods=['POST'])
def verify_integrity():
    try:
        data = request.json
        message = data['message']
        expected_hash = data['hash']
        
        actual_hash = maes.get_hash(message)
        is_valid = actual_hash == expected_hash
        
        return jsonify({
            'is_valid': is_valid,
            'actual_hash': actual_hash,
            'expected_hash': expected_hash
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)