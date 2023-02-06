const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  describe("Unstoppable", function () {
    
    async function deployFixture() {
      
      // Contracts are deployed using the first signer/account by default
      const [owner,exploiter, otherAccount] = await ethers.getSigners();

      /////////DEPLOYING DVT CONTRACTS//////////
      const DamnValuableToken = await ethers.getContractFactory("DamnValuableToken");
      const DVT = await DamnValuableToken.deploy();

      await DVT.connect(owner).transfer(exploiter.address, 100);
     

      /////////DEPLOYING DVTSnapshot////////////
      const initialSupply = 1000000;
      const DamnValuableTokenSnapshot = await ethers.getContractFactory("DamnValuableTokenSnapshot");
      const DVTsnap = await DamnValuableTokenSnapshot.deploy(initialSupply);


      /////////DEPLOYING UnstoppableLender/////////
      const UnstoppableLender = await ethers.getContractFactory("UnstoppableLender");
      const unstop = await UnstoppableLender.deploy(DVT.address);

      await DVT.connect(exploiter).approve(unstop.address, 100);
      ////////DEPLOYING ReceiverUnstoppable////////
      const ReceiverUnstoppable = await ethers.getContractFactory("ReceiverUnstoppable");
      const receiver = await ReceiverUnstoppable.deploy(unstop.address);

      return { DVT, unstop, DVTsnap, receiver, owner, exploiter, otherAccount };
    }

      describe("DepositTokens", function () {
            it("Should revert if amount passed is zero", async function (){
                const {exploiter, unstop} = await loadFixture(deployFixture);

                await expect(unstop.connect(exploiter).depositTokens(0)).to.be.revertedWith("Must deposit at least one token");
            });

            it("Should pass if amount is greater", async function() {
              const {exploiter, unstop} = await loadFixture(deployFixture);

              await expect(unstop.connect(exploiter).depositTokens(10)).not.to.be.reverted;
            })
        });

      describe("Flashloan", function (){
              it("Should revert if borrow amount is less than zero", async function (){
                const {exploiter, DVT, unstop} = await loadFixture(deployFixture);
                const balanceBefore = DVT.balanceOf(unstop.address);
                DVT.transfer(unstop.address, 1000);

                await expect(unstop.connect(exploiter).flashLoan(0)).to.be.revertedWith("Must borrow at least one token");
              });

              it("Should revert if pool borrow amount is greater than pool balance", async function (){
                const {exploiter,DVT, unstop} = await loadFixture(deployFixture);
                const balanceBefore = DVT.balanceOf(unstop.address);

                await expect(unstop.connect(exploiter).flashLoan(3)).to.be.revertedWith("Not enough tokens in pool");
              });

              it("Should stop offering flashloans", async function (){
                const {exploiter,DVT, unstop} = await loadFixture(deployFixture);
                await DVT.connect(exploiter).transfer(unstop.address, 50);

                await expect(unstop.connect(exploiter).flashLoan(23)).to.be.reverted;
              })
        });

        
  
  
//     describe("depositTokens", function () {
//       describe("Validations", function () {
//         it("Should revert with the right error if called too soon", async function () {
//           const { lock } = await loadFixture(deployOneYearLockFixture);
  
//           await expect(lock.withdraw()).to.be.revertedWith(
//             "You can't withdraw yet"
//           );
//         });
  
//         it("Should revert with the right error if called from another account", async function () {
//           const { lock, unlockTime, otherAccount } = await loadFixture(
//             deployOneYearLockFixture
//           );
  
//           // We can increase the time in Hardhat Network
//           await time.increaseTo(unlockTime);
  
//           // We use lock.connect() to send a transaction from another account
//           await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
//             "You aren't the owner"
//           );
//         });
  
//         it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//           const { lock, unlockTime } = await loadFixture(
//             deployOneYearLockFixture
//           );
  
//           // Transactions are sent using the first signer by default
//           await time.increaseTo(unlockTime);
  
//           await expect(lock.withdraw()).not.to.be.reverted;
//         });
//       });
  
//       describe("Events", function () {
//         it("Should emit an event on withdrawals", async function () {
//           const { lock, unlockTime, lockedAmount } = await loadFixture(
//             deployOneYearLockFixture
//           );
  
//           await time.increaseTo(unlockTime);
  
//           await expect(lock.withdraw())
//             .to.emit(lock, "Withdrawal")
//             .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
//         });
//       });
  
//       describe("Transfers", function () {
//         it("Should transfer the funds to the owner", async function () {
//           const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
//             deployOneYearLockFixture
//           );
  
//           await time.increaseTo(unlockTime);
  
//           await expect(lock.withdraw()).to.changeEtherBalances(
//             [owner, lock],
//             [lockedAmount, -lockedAmount]
//           );
//         });
//       });
//     });
   });
