import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';
import progressGif from "./images/wave.gif";
import progressWave from "./images/Wave-tada.png";
import progressError from "./images/wave-error.png";

export default function App() {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const [shouldShowGif, setShouldShowGif] = useState(false);
  const [shouldShowWave, setShouldShowWave] = useState(false);
  const [shouldShowError, setShouldShowError] = useState(false);

  const contractAddress = '0xbC4e258A38930CE731fc5687adA76b0Bf85cAD88';
  const contractABI = abi.abi;

  const updateStatus = (msg) => {
    setStatus(msg);
    console.log(msg);
  }
  
  

   /**
  * Implement your connectWallet method here
  */
    const connectWallet = async () => {
      try {
        const { ethereum } = window;
  
        if (!ethereum) {
          alert("Get MetaMask on Ethereum Bro!!!");
          return;
        }
  
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  
        console.log("Connected", accounts[0]);
        setCurrentAccount(accounts[0]); 
      } catch (error) {
        console.log(error)
      }
    }

    /*
   * Create a method that gets all waves from your contract
   */
const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum objectz does not exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
    const wave = async () => {
      try {
        const { ethereum } = window;
  
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          
          // using contractABI here
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
  
          let count = await wavePortalContract.getTotalWaves();
          console.log("Tada! Retrieved total wave count...", count.toNumber());
          updateStatus(`Retrieved total greeting count... ${count.toNumber()}`);  
         
          /*
          * Execute the actual wave from your smart contract
          */
          const waveTxn = await wavePortalContract.wave(message, {gasLimit: 500000});
          console.log("Mining... \r\n doo do do dooo....\r\n", waveTxn.hash);
          updateStatus(`Mining for a wave... \r\ndoo do do dooo.... \r\n${waveTxn.hash}`);
          setMessage("");
          setShouldShowGif(true);
          setShouldShowWave(false);
          setShouldShowError(false);

          await waveTxn.wait();
          console.log("Mined!! -- ", waveTxn.hash);
          setShouldShowGif(false);
          setShouldShowWave(true);
          setShouldShowError(false);


          count = await wavePortalContract.getTotalWaves();
          console.log("We have retrieved the total wave count as...", count.toNumber());
          updateStatus(`Retrieved total greeting count... ${count.toNumber()}`);


        } else {
          console.log("Ethereum object doesn't exist! womp womp! ");
          setShouldShowGif(false);
          setShouldShowWave(false);
          setShouldShowError(true);
        }
      } catch (error) {
        console.log(error)
          setShouldShowGif(false);
          setShouldShowWave(false);
          setShouldShowError(true);        
      }
    }
  
  
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window;
        
        if (!ethereum) {
          updateStatus("Are you sure you have your metamask setup?!");
          return;
        } else {
          console.log("We haz rinkeby-ethereum objectz", ethereum);
        }
        
        /*
        * Check if we're authorized to access the user's wallet
        */
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account! BINGO! :", account);

          setCurrentAccount(account);
          getAllWaves();
        } else {
          updateStatus("No authorized account found. womp womp! ");
        }
      } catch (error) {
        console.log(error);
      }
    }
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <span role="img">🎉</span>  Hi there!
        </div>

        <div className="bio">
          I'm rips and this is my first eth smart contract project w/ _buildspace <span role="img">✨</span> 
          <p> Connect your Ethereum wallet and wave at me <span role="img">👋🏾</span>!</p>
        </div>
        <br />
        <br />
        <textarea 
          rows="3" 
          type="text" 
          onChange={e => {
            e.preventDefault();
            setMessage(e.target.value);
            }} 
          value={message} 
          placeholder={`Send a short greeting!`}/>

        <button className="waveButton" onClick={wave}>
            Wave at Me! <span role="img">👋</span>
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount? (
          <button className="waveButton" onClick={connectWallet}>
            <span role="img">🤓</span> can we haz Connect Wallet plz...
          </button>
        ):
        <div className="connectedButton">
          <p><span role="img">🥳</span> Wallet Connected to address ...{currentAccount.slice(-4)}</p>
        </div> 
        }
        
        {shouldShowGif && (
        <div className="status" align="center">
             <p><img src={progressGif} width="150" height="150" alt="wave in progress..."/></p>
        </div>)}
        {shouldShowWave && (
        <div className="status" align="center">
             <p><img src={progressWave} width="150" height="150" alt="tada"/></p>
        </div>)}
        {shouldShowError && (
        <div className="status" align="center">
             <p><img src={progressError} width="150" height="150" alt="wompwomp"/></p>
        </div>)}

        <div className="status">
          <p>{status}</p>
        </div>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{  marginTop: "16px", padding: "8px"}}>
              <div className="key">Address: {wave.address}
              <br />Time: {wave.timestamp.toString()}
              <br />Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}
