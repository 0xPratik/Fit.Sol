import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import Nav from "../components/Nav";
import * as anchor from "@project-serum/anchor";
import IDL from "../idl.json";
import { FitSol } from "../program_types";
import {
  useAnchorWallet,
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { Program } from "@project-serum/anchor";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  HStack,
  useToast,
  Tag,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

const Home: NextPage = () => {
  const [provider, setProvider] = useState<anchor.Provider>();
  const [challenges, setChallenges] = useState<any>([]);

  const opts = {
    preflightCommitment: "processed" as anchor.web3.ConfirmOptions,
  };

  const wallet = useAnchorWallet();

  function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "http://127.0.0.1:8899";
    const connection = new anchor.web3.Connection(
      network,
      opts.preflightCommitment
    );
    if (!wallet) {
      return;
    }
    const provider = new anchor.Provider(
      connection,
      wallet,
      opts.preflightCommitment
    );
    console.log("Provider Set");
    return provider;
  }

  const idl = IDL as anchor.Idl;
  const toast = useToast();

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      if (typeof window !== "undefined") {
        console.log("IN here");
        const provider = await getProvider();
        console.log("PROVUDEr", provider);
        if (provider === null || provider == undefined) {
          console.log("No provider found");
        }
        setProvider(provider);
        console.log("Fetching data");
        await fetchChallenges();
      }
    })();
  }, []);

  const JoinAChallenge = async (
    authority: anchor.web3.PublicKey,
    amount: number
  ) => {
    try {
      console.log("Auth", authority.toString());
      const programID = new anchor.web3.PublicKey(
        "5eHD6sbs1auxr22YtJjDTnn9WRfvccfBLS5v8AbwpFNM"
      );
      if (provider === null) {
        console.log("NO provider");
      }

      const prov = getProvider();
      const program = new anchor.Program(idl, programID, prov);
      console.log("WALLET", program.provider.wallet.publicKey.toString());

      const [user, _unonce] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("user")),
          program.provider.wallet.publicKey.toBuffer(),
          authority.toBuffer(),
        ],
        program.programId
      );

      const [challenge, _nonce] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode("challenge")),
            authority.toBuffer(),
          ],
          program.programId
        );
      console.log("ANOUNY", amount);
      const tx = await program.rpc.joinChallenge(new anchor.BN(amount), {
        accounts: {
          user: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          creator: authority,
          userAccount: user,
          challenge: challenge,
        },
      });
      console.log("Your transaction signature", tx);
      toast({
        title: "Challenge Joined",
        description: "WAGMI",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      fetchChallenges();
    } catch (error) {
      toast({
        title: "Error Time",
        description: "NGMI",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log("JOIN ERROR", error);
    }
  };

  const fetchChallenges = async () => {
    try {
      if (typeof window !== "undefined") {
        // Client-side-only code
        console.log("Inside Fetch challenges");
        const programID = new anchor.web3.PublicKey(
          "5eHD6sbs1auxr22YtJjDTnn9WRfvccfBLS5v8AbwpFNM"
        );
        if (provider === null) {
          console.log("NO provider");
        }
        const prov = getProvider();
        const program = new anchor.Program(idl, programID, prov);
        const data = await program.account.challenge.all();
        setChallenges(data);
        console.log("Your data", data);
      }
    } catch (error) {
      console.log("FETCH CHALLENNGE ERROR", error);
    }
  };

  return (
    <Box>
      <Nav />
      <Flex my={2} align="center" w="full" justifyItems={"center"}>
        <Button onClick={fetchChallenges} colorScheme="orange" variant="ghost">
          Get Challenges
        </Button>
      </Flex>
      <Wrap mx={8} spacing={"4"}>
        {challenges.map((challenge: any, i: number) => {
          console.log("Challenge data", challenge.account.authority.toString());
          return (
            <WrapItem key={i}>
              <Box
                p={8}
                minW="2xl"
                bg="gray.50"
                borderRadius={"base"}
                boxShadow="xl"
                minH={"32"}
              >
                <Heading as="h2" size="lg" mb={4}>
                  {challenge.account.name}
                </Heading>
                <Flex direction="column">
                  <Text> {challenge.account.duration.toNumber()} days</Text>
                  <Text>
                    {" "}
                    {challenge.account.maxAmount.toNumber() /
                      anchor.web3.LAMPORTS_PER_SOL}{" "}
                    SOL
                  </Text>
                </Flex>
                <Text fontSize="md" fontWeight="bold">
                  {" "}
                  Participants {challenge.account.participants.toNumber()}
                </Text>
                <Text color="gray.700">
                  Created By - {challenge.account.authority.toString()}
                </Text>
                <Box mt={2}>
                  {challenge.account.isEnded ? (
                    <Tag size="sm" variant="solid" colorScheme="red">
                      Ended
                    </Tag>
                  ) : (
                    <Tag size="sm" colorScheme="green" variant="solid">
                      OnGoing
                    </Tag>
                  )}
                </Box>
                <Button
                  variant="outline"
                  mt={"4"}
                  onClick={() =>
                    JoinAChallenge(
                      challenge.account.authority as anchor.web3.PublicKey,
                      challenge.account.maxAmount.toNumber() as number
                    )
                  }
                  colorScheme={"green"}
                  w="full"
                >
                  Join Challenge
                </Button>
              </Box>
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
};

export default Home;
