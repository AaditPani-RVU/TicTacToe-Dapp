const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { BigNumber, utils } = require("ethers");

describe("TicTacToe Tests", function () {
  let contractFactory, contract, accounts, deployer, player1, player2, contractPlayer1, contractPlayer2;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    player1 = accounts[1];
    player2 = accounts[2];

    contractFactory = await ethers.getContractFactory("TicTacToe"); 
    contract = await contractFactory.deploy(5, 100);

    contractPlayer1 = contract.connect(player1); 
    contractPlayer2 = contract.connect(player2); 
  });

  it("create a game, join that game with different account", async () => {
    await contractPlayer1.startGame({ value: ethers.parseEther("0.1") });
    await contractPlayer2.joinGame(1, {
      value: ethers.parseEther("0.1")
,
    });

    const game = await contract.games(1);
    assert.equal(game.isStarted, true);
  });

  it("play the game until P1 wins by row.", async () => {
    await contractPlayer1.startGame({ value: ethers.parseEther("0.1") });
    await contractPlayer2.joinGame(1, {
      value: ethers.parseEther("0.1"),
    });

    await contractPlayer1.makeMove(0, 0, 1);
    await contractPlayer2.makeMove(1, 1, 1);
    await contractPlayer1.makeMove(0, 1, 1);
    await contractPlayer2.makeMove(1, 2, 1);
    await contractPlayer1.makeMove(0, 2, 1);

    const game = await contract.games(1);
    assert.equal(game.winner, 1);
  });
});
