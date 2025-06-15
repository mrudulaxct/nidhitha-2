import hashlib
import json
import time
from datetime import datetime

class SimpleBlockchain:
    def __init__(self):
        self.chain = []
        self.create_genesis_block()
    
    def create_genesis_block(self):
        genesis_block = {
            'index': 0,
            'timestamp': time.time(),
            'data': 'Genesis Block',
            'previous_hash': '0',
            'hash': self.calculate_hash(0, time.time(), 'Genesis Block', '0')
        }
        self.chain.append(genesis_block)
    
    def calculate_hash(self, index, timestamp, data, previous_hash):
        value = str(index) + str(timestamp) + str(data) + str(previous_hash)
        return hashlib.sha256(value.encode()).hexdigest()
    
    def add_block(self, data):
        previous_block = self.chain[-1]
        new_index = previous_block['index'] + 1
        new_timestamp = time.time()
        new_hash = self.calculate_hash(new_index, new_timestamp, data, previous_block['hash'])
        
        new_block = {
            'index': new_index,
            'timestamp': new_timestamp,
            'data': data,
            'previous_hash': previous_block['hash'],
            'hash': new_hash
        }
        
        self.chain.append(new_block)
        return new_block
    
    def get_merkle_root(self):
        # Simple Merkle tree implementation
        if not self.chain:
            return None
        
        hashes = [block['hash'] for block in self.chain]
        
        while len(hashes) > 1:
            new_hashes = []
            for i in range(0, len(hashes), 2):
                if i + 1 < len(hashes):
                    combined = hashes[i] + hashes[i + 1]
                else:
                    combined = hashes[i] + hashes[i]
                new_hashes.append(hashlib.sha256(combined.encode()).hexdigest())
            hashes = new_hashes
        
        return hashes[0]