import { Box, Stack } from "@mui/material";
import SearchBar from "../../components/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { ColorButton } from "../../components/Button";
import { providerOptions } from "../web3Modal/providerOptions";
import MenuIconDrawer from "../../components/nav-section/MenuIconDrawer";
import CreateButton from "../../components/HeaderButtons/CreateButton";
import EthChainButton from "../../components/HeaderButtons/EthChainButton";
import ConnectWallet from "../../components/HeaderButtons/ConnectWallet";
import { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { toHex } from "../web3Modal/utils";
import { networkParams } from "../web3Modal/networks";

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions
});


const DesktopView = () => {

  const [account, setAccount] = useState("");
  const [chain, setChain] = useState("Network");

  var styledAddress = account
    ? account.slice(0, 4) + "..." + account.slice(-4)
    : "";

  const connectWallet = async () => {
    console.log(account);
    const provider = await web3Modal.connect();
    const library = new ethers.providers.Web3Provider(provider);
    const accounts = await library.listAccounts();
    const network = await library.getNetwork();
    const myaccount = accounts[0];
    setAccount(myaccount);
    switch (network?.chainId) {
      case 1:
        setChain("Ethereum")
        break;
      case 56:
        setChain("Binance")
        break;
      case 137:
        setChain("Polygon")
        break;
      default:
        setChain("Choose right ")
        break;
    }
  }
  const switchWallet = () => {

  }
  const disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    setAccount("");
    setChain("");
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
      <Box>
        <SearchBar />
      </Box>
      <Stack direction="row" spacing={2} >
        <CreateButton />
        <EthChainButton />
        <ConnectWallet />
      </Stack>
    </Box >
  )
}

const MobileView = () => {

  const [provider, setProvider] = useState<any>();
  const [library, setLibrary] = useState<any>();
  const [account, setAccount] = useState<any>();
  const [signature, setSignature] = useState<any>("");
  const [error, setError] = useState<any>("");
  const [chainId, setChainId] = useState<any>();
  const [network, setNetwork] = useState<any>();
  const [message, setMessage] = useState<any>("");
  const [signedMessage, setSignedMessage] = useState<any>("");
  const [verified, setVerified] = useState<any>();

  // var styledAddress = account ? account.slice(0, 4) + "..." + account.slice(-4) : "";
  var styledAddress = account ? account.slice(-4) : "";

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network: any = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) setAccount(accounts[0]);
      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  };

  const handleNetwork = (e: any) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e: any) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }]
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            // params: [networkParams[toHex(network)]]
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: [message, account]
      });
      setSignedMessage(message);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const verifyMessage = async () => {
    if (!library) return;
    try {
      const verify = await library.provider.request({
        method: "personal_ecRecover",
        params: [signedMessage, signature]
      });
      setVerified(verify === account.toLowerCase());
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    setAccount("");
    setChainId("");
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: any) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleChainChanged = (_hexChainId: any) => {
        setChainId(_hexChainId);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', }}>
      <Box sx={{ width: '10%', position: 'relative', right: '18px' }}>
        <MenuIconDrawer />
      </Box>
      <Box>
        <SearchBar />
      </Box>
      <Stack direction="row" spacing={{ xs: 0.5, sm: 2 }}>
        <ColorButton variant="contained"
          startIcon={<AddCircleIcon />}
          sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: "fit-content",
            borderRadius: "20px",
            fontWeight: "100",
            fontSize: "13px",
            bgcolor: "rgba(242, 12, 236, 0.15)",
          }}>
          ETH
        </ColorButton>
        {account === "" ? (
          <ColorButton
            variant="contained"
            onClick={() => connectWallet()}
            startIcon={<AccountBalanceWalletIcon />}
            sx={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              height: "fit-content",
              borderRadius: "20px",
              fontWeight: "100",
              fontSize: "13px",
              bgcolor: "rgba(242, 12, 236, 0.15)",
            }}
          >
            {" "}
            Connect
          </ColorButton>
        ) : (
          <ColorButton
            variant="contained"
            onClick={() => { disconnect() }}
            startIcon={<AccountBalanceWalletIcon />}
            sx={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              height: "fit-content",
              borderRadius: "20px",
              fontWeight: "100",
              fontSize: "13px",
              bgcolor: "rgba(242, 12, 236, 0.15)",
            }}
          >
            &nbsp;
            {styledAddress}
          </ColorButton>
        )}
      </Stack>
    </Box>
  );
};

const Header = () => {
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    const setResponsiveness = () => {
      if (window.innerWidth < 900) {
        setMobileView(true);
      }
    };

    setResponsiveness();

    window.addEventListener("resize", () => setResponsiveness());

    return () => {
      window.removeEventListener("resize", () => setResponsiveness());
    };
  }, []);

  return <>{mobileView ? <MobileView /> : <DesktopView />}</>;
};

export default Header;
