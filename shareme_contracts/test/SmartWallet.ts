import { describe, beforeEach, it } from "node:test";
import { expect } from "chai";
import hre from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SmartWallet, SmartWalletFactory, IERC20 } from "../typechain-types";

const { ethers, networkHelpers } = await hre.network.connect();

describe("SmartWallet", function () {
  let controller: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let platformWallet: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let smartWallet: SmartWallet;
  let token: IERC20;

  beforeEach(async function () {
    [controller, creator, platformWallet, user] = await ethers.getSigners();

    const SmartWalletFactory = await ethers.getContractFactory("SmartWallet");
    smartWallet = await SmartWalletFactory.deploy(
      controller.address,
      creator.address,
      platformWallet.address
    );

    const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
    token = await ERC20MockFactory.deploy("Mock Token", "MTK", 1000000);

    await smartWallet.connect(controller).addAllowedAsset(token.target);
  });

  describe("Deployment", function () {
    // it("Should set the right controller", async function () {
    //   expect(await smartWallet.controller()).to.equal(controller.address);
    // });

    it("Should set the right creator", async function () {
      expect(await smartWallet.creator()).to.equal(creator.address);
    });

    it("Should set the right platform wallet", async function () {
      expect(await smartWallet.platformWallet()).to.equal(
        platformWallet.address
      );
    });

    // it("Should set the platform fee to 20%", async function () {
    //   expect(await smartWallet.platformFee()).to.equal(20);
    // });
  });

  describe("forwardTransfer", function () {
    beforeEach(async function () {
      await token.transfer(smartWallet.target, 1000);
    });

    it("Should revert if called by non-controller", async function () {
      await expect(
        smartWallet.connect(user).forwardTransfer(token.target, 1000)
      ).to.be.revertedWith("Not controller");
    });

    it("Should revert if token is not allowed", async function () {
      const anotherToken = await (
        await ethers.getContractFactory("ERC20Mock")
      ).deploy("Another Token", "ATK", 1000);
      await expect(
        smartWallet
          .connect(controller)
          .forwardTransfer(anotherToken.target, 1000)
      ).to.be.revertedWith("Token not allowed");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        smartWallet.connect(controller).forwardTransfer(token.target, 0)
      ).to.be.revertedWith("No payment");
    });

    it("Should split the payment correctly", async function () {
      const amount = 1000;
      const platformFee = await smartWallet.platformFee();
      const platformAmount = (BigInt(amount) * platformFee) / 100n;
      const creatorAmount = BigInt(amount) - platformAmount;

      await expect(
        smartWallet.connect(controller).forwardTransfer(token.target, amount)
      ).to.changeTokenBalances(
        ethers,
        token,
        [creator, platformWallet],
        [creatorAmount, platformAmount]
      );
    });

    it("Should emit PaymentReceived and PaymentSplit events", async function () {
      const amount = 1000;
      const platformFee = await smartWallet.platformFee();
      const platformAmount = (BigInt(amount) * platformFee) / 100n;
      const creatorAmount = BigInt(amount) - platformAmount;

      await expect(
        smartWallet.connect(controller).forwardTransfer(token.target, amount)
      )
        .to.emit(smartWallet, "PaymentReceived")
        .withArgs(controller.address, amount)
        .and.to.emit(smartWallet, "PaymentSplit")
        .withArgs(creator.address, creatorAmount, platformAmount);
    });
  });

  describe("Asset Management", function () {
    it("Should allow controller to add an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await smartWallet.connect(controller).addAllowedAsset(newTokenAddress);
      expect(await smartWallet.allowedAssets(newTokenAddress)).to.be.true;
    });

    it("Should allow controller to remove an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await smartWallet.connect(controller).addAllowedAsset(newTokenAddress);
      await smartWallet.connect(controller).removeAllowedAsset(newTokenAddress);
      expect(await smartWallet.allowedAssets(newTokenAddress)).to.be.false;
    });

    it("Should not allow non-controller to add an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await expect(
        smartWallet.connect(user).addAllowedAsset(newTokenAddress)
      ).to.be.revertedWith("Not controller");
    });

    it("Should not allow non-controller to remove an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await smartWallet.connect(controller).addAllowedAsset(newTokenAddress);
      await expect(
        smartWallet.connect(user).removeAllowedAsset(newTokenAddress)
      ).to.be.revertedWith("Not controller");
    });
  });

  describe("Platform Fee", function () {
    it("Should allow controller to update platform fee", async function () {
      await smartWallet.connect(controller).updatePlatformFee(30);
      expect(await smartWallet.platformFee()).to.equal(30);
    });

    it("Should not allow non-controller to update platform fee", async function () {
      await expect(
        smartWallet.connect(user).updatePlatformFee(30)
      ).to.be.revertedWith("Not controller");
    });
  });

  describe("Receive Ether", function () {
    it("Should split received Ether correctly", async function () {
      const amount = ethers.parseEther("1.0");
      const platformFee = await smartWallet.platformFee();
      const platformAmount = (amount * platformFee) / 100n;
      const creatorAmount = amount - platformAmount;

      await expect(
        user.sendTransaction({ to: smartWallet.target, value: amount })
      ).to.changeEtherBalances(
        ethers,
        [creator, platformWallet],
        [creatorAmount, platformAmount]
      );
    });

    it("Should emit PaymentReceived and PaymentSplit events for Ether", async function () {
      const amount = ethers.parseEther("1.0");
      const platformFee = await smartWallet.platformFee();
      const platformAmount = (amount * platformFee) / 100n;
      const creatorAmount = amount - platformAmount;

      await expect(
        user.sendTransaction({ to: smartWallet.target, value: amount })
      )
        .to.emit(smartWallet, "PaymentReceived")
        .withArgs(user.address, amount)
        .and.to.emit(smartWallet, "PaymentSplit")
        .withArgs(creator.address, creatorAmount, platformAmount);
    });
  });
});

describe("SmartWalletFactory", function () {
  let platformWallet: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let factory: SmartWalletFactory;

  beforeEach(async function () {
    [platformWallet, creator] = await ethers.getSigners();

    const SmartWalletFactoryFactory = await ethers.getContractFactory(
      "SmartWalletFactory"
    );
    factory = await SmartWalletFactoryFactory.deploy(platformWallet.address);
  });

  it("Should create a new smart wallet", async function () {
    const spaceID = ethers.encodeBytes32String("test-space");

    await expect(factory.connect(creator).createWallet(spaceID)).to.emit(
      factory,
      "WalletCreated"
    );
  });

  it("Should not allow creating a wallet for an existing space", async function () {
    const spaceID = ethers.encodeBytes32String("test-space");
    await factory.connect(creator).createWallet(spaceID);

    await expect(
      factory.connect(creator).createWallet(spaceID)
    ).to.be.revertedWith("Space already exists");
  });
});
