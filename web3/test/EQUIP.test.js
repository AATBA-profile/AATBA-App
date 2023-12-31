const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");

describe("Whitelist Registry Contract", function () {
    async function deploySubProfileNFTFixture() {
        const [acc1, acc2] = await ethers.getSigners();
        const addressZero = "0x0000000000000000000000000000000000000000"

        const VerifiedCollectionRegistry = await hre.ethers.deployContract("VerifiedCollectionRegistry");
        await VerifiedCollectionRegistry.waitForDeployment();
        const VerifiedCollectionRegistryAddress = await VerifiedCollectionRegistry.getAddress();

        const subProfileTBA = await hre.ethers.deployContract("SubProfileTBA", [VerifiedCollectionRegistryAddress]);
        await subProfileTBA.waitForDeployment();

        const subProfileNFT = await hre.ethers.deployContract("SubProfileNFT",["Test", "TST"]);
        await subProfileNFT.waitForDeployment();

        const testNFT = await hre.ethers.deployContract("TestNFT");
        await testNFT.waitForDeployment();

        return {
            subProfileTBA,
            subProfileNFT,
            VerifiedCollectionRegistry,
            testNFT,
            addressZero,
            acc1,
            acc2
        };
    }

    describe("Deployment", function () {
        it("Should deploy the right subProfileNFT", async function () {
            const { subProfileNFT, acc1 } = await loadFixture(deploySubProfileNFTFixture);
            expect(await subProfileNFT.name()).to.equal("Test");
            expect(await subProfileNFT.symbol()).to.equal("TST");
            expect(await subProfileNFT.owner()).to.equal(await acc1.getAddress());
        });

        it("Should deploy the right Verifier address", async function () {
            const { VerifiedCollectionRegistry, acc1 } = await loadFixture(deploySubProfileNFTFixture);
            expect(await VerifiedCollectionRegistry.Verifier()).to.equal(await acc1.getAddress());
        });

        it("Should set the right VerifiedCollectionRegistry address in SubProfileTBA", async function () {
            const { VerifiedCollectionRegistry, subProfileTBA } = await loadFixture(deploySubProfileNFTFixture);
            expect(await subProfileTBA.verifiedCollectionRegistryAddress()).to.equal(await VerifiedCollectionRegistry.getAddress());
        });        
    });

    describe("Checking Whitelist Registry contract", function () {
        it("Should fail for whitelisting address(0)", async function() {
            const{addressZero, VerifiedCollectionRegistry, acc2} = await loadFixture(deploySubProfileNFTFixture);
            await expect(VerifiedCollectionRegistry.requestForVerification(await acc2.getAddress())).to.be.revertedWith("Address is not a contract address");
            await expect(VerifiedCollectionRegistry.requestForVerification(addressZero)).to.be.revertedWith('Invalid contract address');
        });

        it("Only owner can whitelist EOA", async function() {
            const{VerifiedCollectionRegistry, acc1, acc2, addressZero} = await loadFixture(deploySubProfileNFTFixture);
            const acc2Address = await acc2.getAddress();
            await expect(VerifiedCollectionRegistry.connect(acc2).addVerificationEOA(acc2Address)).to.be.revertedWith('Only owner can call this function');
            await expect(VerifiedCollectionRegistry.addVerificationEOA(addressZero)).to.be.revertedWith('Invalid contract address');
            await VerifiedCollectionRegistry.addVerificationEOA(acc2Address);
            expect(await VerifiedCollectionRegistry.isVerified(acc2Address)).to.true;
        });

        it("Should be able to request for whitelist and remove whitelist request", async function() {
            const{subProfileNFT, VerifiedCollectionRegistry, acc2} = await loadFixture(deploySubProfileNFTFixture);
            const subProfileNFTAddress = await subProfileNFT.getAddress();
            await VerifiedCollectionRegistry.connect(acc2).requestForVerification(subProfileNFTAddress);
            expect(await VerifiedCollectionRegistry.getRequestStatus(subProfileNFTAddress)).to.equal(0); // Requested status
            await VerifiedCollectionRegistry.connect(acc2).removeFromVerificationRequest(subProfileNFTAddress);
            expect(await VerifiedCollectionRegistry.getRequestStatus(subProfileNFTAddress)).to.equal(3); // Removed status
        });

        it("Should be able to request and whitelist a contract verified by owner", async function() {
            const{subProfileNFT, VerifiedCollectionRegistry, acc1} = await loadFixture(deploySubProfileNFTFixture);
            const subProfileNFTAddress = await subProfileNFT.getAddress();
            await VerifiedCollectionRegistry.requestForVerification(subProfileNFTAddress);
            expect(await VerifiedCollectionRegistry.getRequestStatus(subProfileNFTAddress)).to.equal(0); // Requested status
            await VerifiedCollectionRegistry.connect(acc1).addVerifiedCollection(subProfileNFTAddress);
            expect(await VerifiedCollectionRegistry.getRequestStatus(subProfileNFTAddress)).to.equal(1); // Verified status
        });

        it("Should be able to add and remove whitelisted contracts", async function() {
            const{subProfileNFT, VerifiedCollectionRegistry, acc1, acc2} = await loadFixture(deploySubProfileNFTFixture);
            const subProfileNFTAddress = await subProfileNFT.getAddress();
            await VerifiedCollectionRegistry.connect(acc2).requestForVerification(subProfileNFTAddress);
            expect(await VerifiedCollectionRegistry.getRequestStatus(subProfileNFTAddress)).to.equal(0); // Requested status
            await VerifiedCollectionRegistry.connect(acc1).addVerifiedCollection(subProfileNFTAddress);
            expect(await VerifiedCollectionRegistry.getRequestStatus(subProfileNFTAddress)).to.equal(1); // Verified status
            await expect(VerifiedCollectionRegistry.connect(acc2).removeFromVerificationRequest(subProfileNFTAddress)).to.be.revertedWith('Only owner can remove these requests');
            await VerifiedCollectionRegistry.removeVerification(subProfileNFTAddress);
            expect(await VerifiedCollectionRegistry.isVerified(subProfileNFTAddress)).to.false;
            expect(await VerifiedCollectionRegistry.getRequestStatus(subProfileNFTAddress)).to.equal(3); // Removed status
        });
    });

    describe("Add verified badges, using transfer and mint functions", function() {
        it("Should be able receive and verify badge by minting", async function() {
            const{subProfileTBA, VerifiedCollectionRegistry, testNFT} = await loadFixture(deploySubProfileNFTFixture);
            const testNFTAddress = await testNFT.getAddress();
            const subProfileTBAAddress = await subProfileTBA.getAddress();
            await VerifiedCollectionRegistry.requestForVerification(testNFTAddress);
            await VerifiedCollectionRegistry.addVerifiedCollection(testNFTAddress);
            expect(await VerifiedCollectionRegistry.getRequestStatus(testNFTAddress)).to.equal(1); // Verified status
            await expect(testNFT.mint(subProfileTBAAddress)).to.emit(subProfileTBA,'BadgeAdded').withArgs(subProfileTBAAddress, 1);
            console.log("Check badges: ", await subProfileTBA.getSubProfileBadges());
        });

        it("Should fail to transfer SBT to another account after minting", async function(){
            const{subProfileTBA, VerifiedCollectionRegistry, testNFT, acc2} = await loadFixture(deploySubProfileNFTFixture);
            const acc2Address = await acc2.getAddress();
            const subProfileTBAAddress = await subProfileTBA.getAddress();
            await VerifiedCollectionRegistry.addVerificationEOA(acc2Address);
            expect(await VerifiedCollectionRegistry.getRequestStatus(acc2Address)).to.equal(1); // Verified status
            await testNFT.mint(acc2Address);
            await expect(testNFT.connect(acc2).transferFrom(acc2Address, subProfileTBAAddress, 1)).to.be.revertedWith('SBT: only if unlocked');
        });
    });
});