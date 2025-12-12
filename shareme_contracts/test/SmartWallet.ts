import { expect } from "chai";
import hre from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SmartWallet, SmartWalletFactory, ERC20Mock } from "../typechain-types";

const { ethers, networkHelpers } = await hre.network.connect();

describe("SmartWallet", function () {
  let controller: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let platformWallet: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let factory: SmartWalletFactory;
  let smartWallet: SmartWallet;
  let token: ERC20Mock;

  beforeEach(async function () {
    [controller, creator, platformWallet, user] = await ethers.getSigners();

    const SmartWalletFactoryFactory = await ethers.getContractFactory(
      "SmartWalletFactory"
    );
    factory = await SmartWalletFactoryFactory.deploy(platformWallet.address);
    await factory.waitForDeployment();

    const SmartWalletContractFactory = await ethers.getContractFactory(
      "SmartWallet"
    );
    smartWallet = await SmartWalletContractFactory.deploy(
      controller.address,
      creator.address,
      factory.target
    );
    await smartWallet.waitForDeployment();

    const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
    token = await ERC20MockFactory.deploy(
      "Mock Token",
      "MTK",
      ethers.parseUnits("1000000", 18)
    );
    await token.waitForDeployment();

    // Configure the factory
    await factory.connect(controller).addAllowedAsset(token.target);
    await factory.connect(controller).setPlatformFee(20);
  });

  describe("Deployment", function () {
    //it("Should set the right controller", async function () {
    //  expect(await smartWallet.controller()).to.equal(controller.address);
    //});

    it("Should set the right creator", async function () {
      expect(await smartWallet.creator()).to.equal(creator.address);
    });

    it("Should set the right factory", async function () {
      expect(await smartWallet.factory()).to.equal(factory.target);
    });
  });

  describe("Creator Token Management", function () {
    let creatorToken: ERC20Mock;

    beforeEach(async function () {
      const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
      creatorToken = await ERC20MockFactory.deploy(
        "Creator Token",
        "CTK",
        ethers.parseUnits("1000000", 18)
      );
      await creatorToken.waitForDeployment();
    });

    it("Should allow controller to set creator token", async function () {
      await smartWallet
        .connect(controller)
        .setCreatorToken(creatorToken.target);
      expect(await smartWallet.getCreatorToken()).to.equal(creatorToken.target);
    });

    it("Should not allow non-controller to set creator token", async function () {
      await expect(
        smartWallet.connect(user).setCreatorToken(creatorToken.target)
      ).to.be.revertedWith("Not controller");
    });

    it("Should revert getting creator token if not set", async function () {
      await expect(smartWallet.getCreatorToken()).to.be.revertedWith(
        "Creator token not set"
      );
    });

    it("Should have allowOnlyCreatorToken set to false by default", async function () {
      expect(await smartWallet.allowOnlyCreatorToken()).to.be.false;
    });

    it("Should allow controller to call allowOnlyCreatorTokenOff", async function () {
      await smartWallet.connect(controller).allowOnlyCreatorTokenOff();
      expect(await smartWallet.allowOnlyCreatorToken()).to.be.false;
    });
  });

  describe("forwardTransfer", function () {
    beforeEach(async function () {
      await token.transfer(smartWallet.target, ethers.parseUnits("1000", 18));
    });

    it("Should revert if called by non-controller", async function () {
      await expect(
        smartWallet
          .connect(user)
          .forwardTransfer(token.target, ethers.parseUnits("1000", 18))
      ).to.be.revertedWith("Not controller");
    });

    it("Should revert if token is not allowed", async function () {
      const anotherToken = await (
        await ethers.getContractFactory("ERC20Mock")
      ).deploy("Another Token", "ATK", 1000);
      await expect(
        smartWallet
          .connect(controller)
          .forwardTransfer(anotherToken.target, ethers.parseUnits("1000", 18))
      ).to.be.revertedWith("Token not allowed");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        smartWallet.connect(controller).forwardTransfer(token.target, 0)
      ).to.be.revertedWith("No payment");
    });

    it("Should split the payment correctly", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const platformFee = await factory.getPlatformFee();
      const platformAmount = (amount * platformFee) / 100n;
      const creatorAmount = amount - platformAmount;

      await expect(
        smartWallet.connect(controller).forwardTransfer(token.target, amount)
      ).to.changeTokenBalances(
        ethers,
        token,
        [creator, platformWallet],
        [creatorAmount.toString(), platformAmount.toString()]
      );
    });

    it("Should emit PaymentReceived and PaymentSplit events", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const platformFee = await factory.getPlatformFee();
      const platformAmount = (amount * platformFee) / 100n;
      const creatorAmount = amount - platformAmount;

      await expect(
        smartWallet.connect(controller).forwardTransfer(token.target, amount)
      )
        .to.emit(smartWallet, "PaymentReceived")
        .withArgs(controller.address, amount)
        .and.to.emit(smartWallet, "PaymentSplit")
        .withArgs(creator.address, creatorAmount, platformAmount);
    });
  });

  describe("Receive Ether", function () {
    it("Should split received Ether correctly", async function () {
      const amount = ethers.parseEther("1.0");
      const platformFee = await factory.getPlatformFee();
      const platformAmount = (amount * platformFee) / 100n;
      const creatorAmount = amount - platformAmount;

      await expect(
        user.sendTransaction({ to: smartWallet.target, value: amount })
      ).to.changeEtherBalances(
        ethers,
        [creator, platformWallet],
        [creatorAmount.toString(), platformAmount.toString()]
      );
    });

    it("Should emit PaymentReceived and PaymentSplit events for Ether", async function () {
      const amount = ethers.parseEther("1.0");
      const platformFee = await factory.getPlatformFee();
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
  let controller: HardhatEthersSigner;
  let platformWallet: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let factory: SmartWalletFactory;

  beforeEach(async function () {
    [controller, platformWallet, creator, user] = await ethers.getSigners();

    const SmartWalletFactoryFactory = await ethers.getContractFactory(
      "SmartWalletFactory",
      controller
    );
    factory = await SmartWalletFactoryFactory.deploy(platformWallet.address);
    await factory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right platform wallet", async function () {
      expect(await factory.platformWallet()).to.equal(platformWallet.address);
    });

    it("Should set the right controller", async function () {
      // Test controller by calling a restricted function
      await expect(factory.connect(user).setPlatformFee(10)).to.be.revertedWith(
        "Not controller"
      );
      await factory.connect(controller).setPlatformFee(10);
    });
  });

  describe("Wallet Creation", function () {
    it("Should create a new smart wallet and emit event", async function () {
      const spaceID = ethers.encodeBytes32String("test-space");

      await expect(factory.connect(creator).createWallet(spaceID))
        .to.emit(factory, "WalletCreated")
        .withArgs(creator.address, (addr: any) => ethers.isAddress(addr));
    });

    it("Should not allow creating a wallet for an existing space", async function () {
      const spaceID = ethers.encodeBytes32String("test-space");
      await factory.connect(creator).createWallet(spaceID);

      await expect(
        factory.connect(creator).createWallet(spaceID)
      ).to.be.revertedWith("Space already exists");
    });
  });

  describe("Asset Management", function () {
    it("Should allow controller to add an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await factory.connect(controller).addAllowedAsset(newTokenAddress);
      expect(await factory.isAllowedAsset(newTokenAddress)).to.be.true;
    });

    it("Should allow controller to remove an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await factory.connect(controller).addAllowedAsset(newTokenAddress);
      await factory.connect(controller).removeAllowedAsset(newTokenAddress);
      expect(await factory.isAllowedAsset(newTokenAddress)).to.be.false;
    });

    it("Should not allow non-controller to add an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await expect(
        factory.connect(user).addAllowedAsset(newTokenAddress)
      ).to.be.revertedWith("Not controller");
    });

    it("Should not allow non-controller to remove an allowed asset", async function () {
      const newTokenAddress = ethers.Wallet.createRandom().address;
      await factory.connect(controller).addAllowedAsset(newTokenAddress);
      await expect(
        factory.connect(user).removeAllowedAsset(newTokenAddress)
      ).to.be.revertedWith("Not controller");
    });
  });

  describe("Platform Fee", function () {
    it("Should allow controller to update platform fee", async function () {
      await factory.connect(controller).setPlatformFee(30);
      expect(await factory.getPlatformFee()).to.equal(30);
    });

    it("Should not allow non-controller to update platform fee", async function () {
      await expect(factory.connect(user).setPlatformFee(30)).to.be.revertedWith(
        "Not controller"
      );
    });

    it("Should revert if fee is too high", async function () {
      await expect(
        factory.connect(controller).setPlatformFee(101)
      ).to.be.revertedWith("Fee too high");
    });
  });
});
