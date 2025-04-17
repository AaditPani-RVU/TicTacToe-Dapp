import { ethers } from "ethers";
import abi from "./TicTacToeABI.json"; // Paste your ABI inside this file as a JSON array

const CONTRACT_ADDRESS = "0x937461392949C767c2d1D827387dF7753387F991"; // replace with your deployed address

const getContract = () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("Please install MetaMask!");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

  return contract;
};

export default getContract;
