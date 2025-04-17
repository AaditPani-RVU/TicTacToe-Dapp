async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const formattedBalance = hre.ethers.formatEther(balance);

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", formattedBalance, "ETH");

  const contractFactory = await hre.ethers.getContractFactory("TicTacToe");
  const contract = await contractFactory.deploy(5, 100); // constructor args

  // No need for contract.deployed() in ethers v6

  console.log("Contract deployed at:", contract.target);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
