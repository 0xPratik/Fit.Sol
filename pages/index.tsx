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
  useWallet,
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
} from "@chakra-ui/react";

const Home: NextPage = () => {
  const [provider, setProvider] = useState<anchor.Provider>();
  const [challenges, setChallenges] = useState([]);

  const opts = {
    preflightCommitment: "processed" as anchor.web3.ConfirmOptions,
  };

  const wallet = useWallet();

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "http://127.0.0.1:8899";
    const connection = new anchor.web3.Connection(
      network,
      opts.preflightCommitment
    );

    const provider = new anchor.Provider(
      connection,
      wallet,
      opts.preflightCommitment
    );
    console.log("Wallet");
    return provider;
  }

  const idl = IDL as anchor.Idl;
  const toast = useToast();

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }
      console.log("IN here");
      const provider = await getProvider();
      console.log("PROVUDEr", provider);
      setProvider(provider);
      console.log("Fetching data");
      fetchChallenges();
    })();
  }, []);

  const JoinAChallenge = async (authority, amount) => {
    try {
      console.log("Auth", authority.toString());
      const program = new anchor.Program(
        idl,
        "5eHD6sbs1auxr22YtJjDTnn9WRfvccfBLS5v8AbwpFNM".toString(),
        provider
      );

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
      const program = new anchor.Program(
        idl,
        "5eHD6sbs1auxr22YtJjDTnn9WRfvccfBLS5v8AbwpFNM".toString(),
        provider
      );
      const [challenge, _nonce] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode("challenge")),
            program.provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        );

      const data = await program.account.challenge.all();
      setChallenges(data);
      console.log("Your data", data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box>
      <Nav />
      <HStack mx={8} spacing={"4"}>
        {challenges.map((challenge, i) => {
          console.log("Challenge data", challenge.account.authority.toString());
          return (
            <Box
              p={8}
              minW="2xs"
              bg="gray.50"
              borderRadius={"base"}
              boxShadow="xl"
              key={i}
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
                Created By -{" "}
                {challenge.account.authority.toString().substring(0, 7)}
              </Text>
              <Button
                variant="outline"
                mt={"4"}
                onClick={() =>
                  JoinAChallenge(
                    challenge.account.authority,
                    challenge.account.maxAmount.toNumber()
                  )
                }
                colorScheme={"green"}
                w="full"
              >
                Join Challenge
              </Button>
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
};

export default Home;
