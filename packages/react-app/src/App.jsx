import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import { Row, Col, Card, Button, Menu, Alert, List, Input, Divider } from "antd";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "./hooks";
import { Header, Account, Faucet, Ramp, Contract, GasGauge, Balance, Address, EtherInput, AddressInput } from "./components";
import { Transactor } from "./helpers";
import { formatEther, parseEther } from "@ethersproject/units";
import { Hints, ExampleUI, Subgraph } from "./views"
import { INFURA_ID, MORALIS_ENDPOINT, DAI_ADDRESS, DAI_ABI, NETWORK, NETWORKS } from "./constants";

import "antd/dist/antd.css";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

const targetNetwork = NETWORKS['localhost']; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet);
const blockExplorer = targetNetwork.blockExplorer;
const localProviderUrl = targetNetwork.rpcUrl;
const mainnetProvider = new JsonRpcProvider(MORALIS_ENDPOINT);
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);


function App(props) {

  const [injectedProvider, setInjectedProvider] = useState();
  const [tokenSendToAddress, setTokenSendToAddress] = useState();
  const [tokenSendAmount, setTokenSendAmount] = useState();
  const [tokenBuyAmount, setTokenBuyAmount] = useState()
  const [tokenSellAmount, setTokenSellAmount] = useState()
  const [buying, setBuying] = useState();
  const [selling, setSelling] = useState()
  const [approving, setApproving] = useState()
  const [route, setRoute] = useState();

  const gasPrice = useGasPrice(targetNetwork, "fast");
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);

  let localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;

  const tx = Transactor(userProvider, gasPrice);

  const readContracts = useContractLoader(localProvider);
  const writeContracts = useContractLoader(userProvider);

  const vendorAddress = readContracts && readContracts.Vendor && readContracts.Vendor.address
  const vendorETHBalance = useBalance(localProvider, vendorAddress);
  const allowance = useContractReader(readContracts, "Token", "allowance", [address, vendorAddress])
  const vendorTokenBalance = useContractReader(readContracts, "Token", "balanceOf", [vendorAddress]);
  const yourTokenBalance = useContractReader(readContracts, "Token", "balanceOf", [address]);
  const tokensPerEth = useContractReader(readContracts, "Vendor", "tokensPerEth");
  const buyTokensEvents = useEventListener(readContracts, "Vendor", "BuyTokens", localProvider, 1);
  const sellTokensEvents = useEventListener(readContracts, "Vendor", "SellTokens", localProvider, 1);

  const ethCostToPurchaseTokens = tokenBuyAmount && tokensPerEth && parseEther("" + (tokenBuyAmount / parseFloat(tokensPerEth)));



  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  useEffect(() => {
    setRoute(window.location.pathname)
  }, [setRoute]);


  let networkDisplay = ""
  if (localChainId && selectedChainId && localChainId != selectedChainId) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: 'absolute', right: 0, top: 60, padding: 16 }}>
        <Alert
          message={"⚠️ Wrong Network"}
          description={(
            <div>
              You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on <b>{NETWORK(localChainId).name}</b>.
            </div>
          )}
          type="error"
          closable={false}
        />
      </div>
    )
  } else {
    networkDisplay = (
      <strong style={{ zIndex: 2, position: 'absolute', right: 110, top: 10, padding: 14, color: targetNetwork.color }}>
        {targetNetwork.name.toUpperCase()}
      </strong>
    )
  }

  let transferDisplay = ""
  if (yourTokenBalance) {
    transferDisplay = (
      <div style={{ padding: 8, marginTop: 32, width: 420, margin: "auto" }}>
        <Card title="Transfer tokens" >
          <div>
            <div style={{ padding: 8 }}>
              <AddressInput
                ensProvider={mainnetProvider}
                placeholder="to address"
                value={tokenSendToAddress}
                onChange={setTokenSendToAddress}
              />
            </div>
            <div style={{ padding: 8 }}>
              <Input
                style={{ textAlign: "center" }}
                placeholder={"amount of tokens to send"}
                value={tokenSendAmount}
                onChange={(e) => { setTokenSendAmount(e.target.value) }}
              />
            </div>
          </div>
          <div style={{ padding: 8 }}>
            <Button type={"primary"} onClick={() => {
              tx(writeContracts.YourToken.transfer(tokenSendToAddress, parseEther("" + tokenSendAmount)))
            }}>Send Tokens</Button>
          </div>

        </Card>
      </div>
    )
  }

  return (
    <div className="App container">

      <Header />
      {networkDisplay}

      <BrowserRouter>

        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={() => { setRoute("/") }} to="/">YourToken</Link>
          </Menu.Item>
          <Menu.Item key="/admin">
            <Link onClick={() => { setRoute("/contracts") }} to="/contracts">Debug Contracts</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            <div style={{ padding: 8, marginTop: 32, width: 300, margin: "auto" }}>
              <Card title="Your Tokens" extra={<a href="#">code</a>} >
                <div style={{ padding: 8 }}>
                  <Balance
                    balance={yourTokenBalance}
                    fontSize={64}
                  />
                </div>
              </Card>
            </div>
            {transferDisplay}

            <Divider />


            <div className="d-flex flex-row justify-content-center">

              <div style={{ padding: 8 }} className="mx-auto">
                <div>Vendor ETH Balance:</div>
                <Balance
                  balance={vendorETHBalance}
                  fontSize={64}
                /> ETH
              </div>
              <div style={{ padding: 8, }} className="mx-auto">
                <div>Vendor Token Balance:</div>
                <Balance
                  balance={vendorTokenBalance}
                  fontSize={64}
                />
              </div>
            </div>

            <div className="d-flex flex-row justify-content-center m-3">
              <div className="card bg-dark text-white p-3 mx-auto m-2">
                <div className="card-header">
                  Buy RDT
                </div>
                <div className="card-body">
                  <div style={{ padding: 8 }}>
                    {tokensPerEth && tokensPerEth.toNumber()} tokens per ETH
                  </div>

                  <div style={{ padding: 8 }}>
                    <Input
                      style={{ textAlign: "center" }}
                      placeholder={"amount of tokens to buy"}
                      value={tokenBuyAmount}
                      onChange={(e) => { setTokenBuyAmount(e.target.value) }}
                    />
                  </div>
                </div>
                <div className="card-footer">
                  <Button type={"primary"} loading={buying} onClick={async () => {
                    setBuying(true)
                    await tx(writeContracts.Vendor.buyTokens({ value: ethCostToPurchaseTokens }))
                    setBuying(false)
                  }}>
                    Buy Tokens
                  </Button>
                </div>
              </div>

              <div className="card bg-dark text-white p-3 mx-auto m-2">
                <div className="card-header">
                  Sell RDT
                </div>
                <div className="card-body">
                  <div style={{ padding: 8 }}>
                    {tokensPerEth && tokensPerEth.toNumber()} tokens per ETH
                  </div>

                  <div style={{ padding: 8 }}>
                    <Input
                      style={{ textAlign: "center" }}
                      placeholder={"amount of tokens to sell"}
                      value={tokenSellAmount}
                      onChange={(e) => { setTokenSellAmount(e.target.value) }}
                    />
                  </div>
                </div>
                <div className="card-footer">
                  {

                    (allowance && !allowance.isZero()) ?

                      <Button type={"primary"} loading={selling} onClick={async () => {
                        setSelling(true)
                        await tx(writeContracts.Vendor.sellTokens(parseEther(tokenSellAmount)))
                        setSelling(false)
                      }}>
                        Sell
                      </Button>

                      :

                      <Button type={"primary"} loading={approving} onClick={async () => {
                        setApproving(true)
                        await tx(writeContracts.Token.approve(vendorAddress, parseEther(tokenSellAmount * tokensPerEth)))
                        setApproving(false)
                      }}>
                        Approve
                      </Button>
                  }
                </div>
              </div>

            </div>

            <div className="d-flex flex-row justify-content-around m-3">
              <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
                <div>RDT Bought:</div>
                <List
                  className="list"
                  dataSource={buyTokensEvents}
                  renderItem={(item) => {
                    return (
                      <List.Item key={item[0] + item[1] + item.blockNumber} style={{ color: "white" }}>
                        <Address
                          value={item[0]}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                        /> Paid

                        <Balance
                          balance={item[1]}
                        /> KETH to get

                        <Balance
                          balance={item[2]}
                        /> RDT
                      </List.Item>
                    )
                  }}
                />
              </div>
              <div style={{ width: 500, margin: "auto", marginTop: 64 }}>
                <div>RDT Sold:</div>
                <List
                  className="list"
                  dataSource={sellTokensEvents}
                  renderItem={(item) => {
                    return (
                      <List.Item key={item[0] + item[1] + item.blockNumber} style={{ color: "white" }}>
                        <Address
                          value={item[0]}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                        /> Sold

                        <Balance
                          balance={item[2]}
                        />  to get
                        <Balance
                          balance={item[1]}
                        /> KETH

                      </List.Item>
                    )
                  }}
                />
              </div>
            </div>
          </Route>

          <Route path="/admin">

            <Contract
              name="Vendor"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
            <Contract
              name="YourToken"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>

        </Switch>
      </BrowserRouter >


      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
    </div>
  );
}


/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum && window.ethereum.on('chainChanged', chainId => {
  setTimeout(() => {
    window.location.reload();
  }, 1);
})

export default App;
