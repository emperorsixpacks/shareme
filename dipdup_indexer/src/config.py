import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Configuration ---
RPC_URL = os.getenv('RPC_URL')
PRIVATE_KEY = os.getenv('PRIVATE_KEY')
DB_FILE = 'db.json'  # Using JSON file for persistence

# Contract Addresses (from dipdup.yaml)
SHAREME_CONTRACT_ADDRESS = '0xa9A5ccb6cd45451189A61F7c15ACb96a03e87D99'
AVAX_USDC_FUJI_ADDRESS = '0x5425890298aed601595a70ab815c96711a31bc65'

# --- ABIs ---
FORWARDER_ABI_PATH = 'abi/forwarder.json'
SHAREME_CONTRACT_ABI_PATH = 'abi/shareme_contract/abi.json'
AVAX_USDC_FUJI_ABI_PATH = 'abi/avax_usdc_fuji/abi.json'
