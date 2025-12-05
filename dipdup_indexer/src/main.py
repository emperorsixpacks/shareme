import argparse
import asyncio

from . import config
from .blockchain import Blockchain
from .database import Database


async def main():
    parser = argparse.ArgumentParser(description='ShareMe DipDup Indexer')
    parser.add_argument('--start-block', type=int, help='Block number to start processing from.')
    args = parser.parse_args()

    db = Database(config.DB_FILE)
    blockchain = Blockchain()

    from_block = args.start_block if args.start_block is not None else db.last_processed_block + 1

    print(f'Starting event listener from block {from_block}...')

    while True:
        try:
            current_block = blockchain.w3.eth.block_number
            if from_block > current_block:
                print(f'Waiting for new blocks. Current: {current_block}, Next to process: {from_block}')
                await asyncio.sleep(5)
                continue

            to_block = min(current_block, from_block + 100)

            print(f'Processing blocks from {from_block} to {to_block}')

            # Process WalletCreated events
            wallet_created_logs = blockchain.get_wallet_created_logs(from_block, to_block)
            for log in wallet_created_logs:
                event = blockchain.shareme_contract.events.WalletCreated().process_log(log)
                wallet_address = event['args']['wallet']
                db.add_allowed_address(wallet_address)

            # Process Transfer events
            transfer_logs = blockchain.get_transfer_logs(from_block, to_block)
            for log in transfer_logs:
                event = blockchain.avax_usdc_fuji_contract.events.Transfer().process_log(log)
                to_address = event['args']['to']

                if to_address in db.allowed_addresses:
                    print(f'Recipient {to_address} is whitelisted. Calling forwardTransfer...')
                    blockchain.forward_transfer(
                        to_address=to_address, token_address=event['address'], amount=event['args']['value']
                    )
                else:
                    continue
                    # print(f'Recipient {to_address} not whitelisted, skipping forwardTransfer.')

            db.last_processed_block = to_block
            db.save()
            from_block = to_block + 1

            await asyncio.sleep(1)

        except Exception as e:
            print(f'An error occurred: {e}')
            await asyncio.sleep(5)


def run():
    asyncio.run(main())
