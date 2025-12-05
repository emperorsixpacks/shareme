import json

from web3 import Web3

from . import config


def load_abi(path):
    with open(path) as f:
        return json.load(f)


class Blockchain:
    def __init__(self):
        if not config.RPC_URL:
            raise ValueError('RPC_URL not set in .env file')
        self.w3 = Web3(Web3.HTTPProvider(config.RPC_URL))

        # Load ABIs
        self.forwarder_abi = load_abi(config.FORWARDER_ABI_PATH)
        self.shareme_contract_abi = load_abi(config.SHAREME_CONTRACT_ABI_PATH)
        self.avax_usdc_fuji_abi = load_abi(config.AVAX_USDC_FUJI_ABI_PATH)

        # Create contract instances
        self.shareme_contract = self.w3.eth.contract(
            address=self.w3.to_checksum_address(config.SHAREME_CONTRACT_ADDRESS), abi=self.shareme_contract_abi
        )
        self.avax_usdc_fuji_contract = self.w3.eth.contract(
            address=self.w3.to_checksum_address(config.AVAX_USDC_FUJI_ADDRESS), abi=self.avax_usdc_fuji_abi
        )

    def get_wallet_created_logs(self, from_block, to_block):
        filter_params = {
            'fromBlock': hex(from_block),
            'toBlock': hex(to_block),
            'address': config.SHAREME_CONTRACT_ADDRESS,
            'topics': ['0x5b03bfed1c14a02bdeceb5fa582eb1a5765fc0bc64ca0e6af4c20afc9487f081'],
        }
        return self.w3.eth.get_logs(filter_params)

    def get_transfer_logs(self, from_block, to_block):
        transfer_event_signature = self.w3.keccak(text='Transfer(address,address,uint256)').hex()
        filter_params = {
            'fromBlock': hex(from_block),
            'toBlock': hex(to_block),
            'address': self.w3.to_checksum_address(config.AVAX_USDC_FUJI_ADDRESS),
            'topics': [f'0x{transfer_event_signature}'],
        }
        return self.w3.eth.get_logs(filter_params)

    def forward_transfer(self, to_address, token_address, amount):
        if not config.PRIVATE_KEY or config.PRIVATE_KEY == 'your_private_key_here':
            print('PRIVATE_KEY not set, skipping forwardTransfer call.')
            return

        try:
            account = self.w3.eth.account.from_key(config.PRIVATE_KEY)
            forwarder_contract = self.w3.eth.contract(
                address=self.w3.to_checksum_address(to_address),
                abi=self.forwarder_abi,
            )

            nonce = self.w3.eth.get_transaction_count(account.address)
            tx_params = {
                'from': account.address,
                'nonce': nonce,
                'gasPrice': self.w3.eth.gas_price,
            }

            gas_estimate = forwarder_contract.functions.forwardTransfer(
                token=self.w3.to_checksum_address(token_address),
                amount=amount,
            ).estimate_gas(tx_params)

            tx_params['gas'] = gas_estimate

            tx = forwarder_contract.functions.forwardTransfer(
                token=self.w3.to_checksum_address(token_address),
                amount=amount,
            ).build_transaction(tx_params)

            signed_tx = self.w3.eth.account.sign_transaction(tx, config.PRIVATE_KEY)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            print(f'Sent forwardTransfer transaction: {tx_hash.hex()}')
        except Exception as e:
            print(f'Failed to call forwardTransfer for {to_address}: {e}')
