import json
from pathlib import Path

class Database:
    def __init__(self, db_file):
        self.db_file = db_file
        self.allowed_addresses = set()
        self.last_processed_block = 0
        self.load()

    def load(self):
        if Path(self.db_file).exists():
            with open(self.db_file, 'r') as f:
                data = json.load(f)
                self.allowed_addresses = set(data.get('allowed_addresses', []))
                self.last_processed_block = data.get('last_processed_block', 0)
        print(f'Loaded DB: last_processed_block={self.last_processed_block}, allowed_addresses_count={len(self.allowed_addresses)}')

    def save(self):
        data = {
            'allowed_addresses': list(self.allowed_addresses),
            'last_processed_block': self.last_processed_block,
        }
        with open(self.db_file, 'w') as f:
            json.dump(data, f, indent=4)
        print(f'Saved DB: last_processed_block={self.last_processed_block}, allowed_addresses_count={len(self.allowed_addresses)}')

    def add_allowed_address(self, address):
        if address not in self.allowed_addresses:
            self.allowed_addresses.add(address)
            print(f'Added {address} to whitelist.')
            return True
        print(f'{address} already in whitelist.')
        return False
