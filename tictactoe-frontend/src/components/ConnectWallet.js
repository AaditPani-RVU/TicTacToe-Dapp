// src/components/ConnectWallet.js
import { useState } from "react";
import { ethers } from "ethers";

const ConnectWallet = ({ setWallet }) => {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);
      setWallet({ provider, signer, account: accounts[0] });
    } else {
      alert("Please install MetaMask to use this app!");
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
      </button>
    </div>
  );
};

export default ConnectWallet;
