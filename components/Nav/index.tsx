import {
  Box,
  Flex,
  Text,
  IconButton,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Image,
  Button,
  VStack,
  Input,
  useToast,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  useWallet,
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import IDL from "../../idl.json";
import { useEffect, useState } from "react";

const EndChallengeModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const wallet = useWallet();
  const [provider, setProvider] = useState<anchor.Provider>();
  const [winner, setWinner] = useState<string>("");

  const opts = {
    preflightCommitment: "processed" as anchor.web3.ConfirmOptions,
  };

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
      const provider = await getProvider();
      setProvider(provider);
    })();
  }, [wallet]);

  const endChallenge = async () => {
    try {
      const winnerPubKey = new anchor.web3.PublicKey(winner);
      const program = new anchor.Program(
        idl,
        "5eHD6sbs1auxr22YtJjDTnn9WRfvccfBLS5v8AbwpFNM".toString(),
        provider
      );
      const [pdachallenge, _nonce] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode("challenge")),
            program.provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        );

      console.log("CHALLENGE PDA", pdachallenge.toString());
      const tx = await program.rpc.endChallenge({
        accounts: {
          challenge: pdachallenge,
          creator: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          winner: winnerPubKey,
        },
      });
      console.log("Your transaction signature", tx);
      toast({
        title: "Challenge Ended",
        description: "Hope you will come back with something new",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.log("End Challenge", error);
      onClose();
    }
  };

  return (
    <>
      <Button onClick={onOpen} mr={4} colorScheme="cyan" variant="ghost">
        End Challenge
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Challenge</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={"4"}>
              <Input
                variant="filled"
                placeholder="Winner Address"
                required
                onChange={(e) => setWinner(e.target.value)}
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blackAlpha"
              variant="outline"
              mr={3}
              onClick={endChallenge}
            >
              End Challenge
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const ModalComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [challenge, setChallenge] = useState({
    name: "",
    duration: "",
    amount: "",
  });

  const wallet = useWallet();
  const [provider, setProvider] = useState<anchor.Provider>();

  const opts = {
    preflightCommitment: "processed" as anchor.web3.ConfirmOptions,
  };

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "http://127.0.0.1:8899";
    const connection = new anchor.web3.Connection(
      network,
      opts.preflightCommitment
    );

    console.log("Wallet");

    const provider = new anchor.Provider(
      connection,
      wallet,
      opts.preflightCommitment
    );
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
      const provider = await getProvider();
      setProvider(provider);
    })();
  }, [wallet]);

  const CreateChallenge = async () => {
    try {
      const program = new anchor.Program(
        idl,
        "5eHD6sbs1auxr22YtJjDTnn9WRfvccfBLS5v8AbwpFNM".toString(),
        provider
      );
      const [pdachallenge, _nonce] =
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from(anchor.utils.bytes.utf8.encode("challenge")),
            program.provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        );

      console.log("CHALLENGE PDA", pdachallenge.toString());
      const tx = await program.rpc.createChallenge(
        challenge.name,
        new anchor.BN(parseInt(challenge.duration)),
        new anchor.BN(
          anchor.web3.LAMPORTS_PER_SOL * parseInt(challenge.amount)
        ),
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            challenge: pdachallenge,
          },
        }
      );
      console.log("Your transaction signature", tx);
      toast({
        title: "Challenge Created",
        description: "Ready to hustle",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.log("Create Challenge", error);
      onClose();
    }
  };

  return (
    <>
      <Button onClick={onOpen} mr={4} colorScheme="purple" variant="ghost">
        Create Challenge
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Challenge</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={"4"}>
              <Input
                variant="filled"
                placeholder="Name"
                required
                onChange={(e) =>
                  setChallenge({ ...challenge, name: e.target.value })
                }
              />
              <Input
                variant="filled"
                placeholder="Duration"
                type="number"
                required
                onChange={(e) =>
                  setChallenge({ ...challenge, duration: e.target.value })
                }
              />
              <Input
                variant="filled"
                placeholder="Amount"
                type="number"
                required
                onChange={(e) =>
                  setChallenge({ ...challenge, amount: e.target.value })
                }
              />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blackAlpha"
              variant="outline"
              mr={3}
              onClick={CreateChallenge}
            >
              Create Challenge
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default function WithSubnavigation() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Image
            boxSize="70px"
            objectFit="cover"
            src="./sol.fit-logo.png"
            alt="Sol Fit"
          />

          <Flex display={{ base: "none", md: "flex" }} align="center" ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>
        <EndChallengeModal />
        <ModalComponent />
        <WalletMultiButton />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");

  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <Link
                p={2}
                href={navItem.href ?? "#"}
                fontSize={"sm"}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: "none",
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={popoverContentBgColor}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      href={href}
      role={"group"}
      display={"block"}
      p={2}
      rounded={"md"}
      _hover={{ bg: useColorModeValue("pink.50", "gray.900") }}
    >
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text
            transition={"all .3s ease"}
            _groupHover={{ color: "pink.400" }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={"sm"}>{subLabel}</Text>
        </Box>
        <Flex
          transition={"all .3s ease"}
          transform={"translateX(-10px)"}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify={"flex-end"}
          align={"center"}
          flex={1}
        >
          <Icon color={"pink.400"} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? "#"}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  //   {
  //     label: "Daily challenge",
  //     children: [
  //       {
  //         label: "Explore Design Work",
  //         subLabel: "Trending Design to inspire you",
  //         href: "#",
  //       },
  //       {
  //         label: "New & Noteworthy",
  //         subLabel: "Up-and-coming Designers",
  //         href: "#",
  //       },
  //     ],
  //   },
  //   {
  //     label: "Weekly challenge",
  //     children: [
  //       {
  //         label: "Job Board",
  //         subLabel: "Find your dream design job",
  //         href: "#",
  //       },
  //       {
  //         label: "Freelance Projects",
  //         subLabel: "An exclusive list for contract work",
  //         href: "#",
  //       },
  //     ],
  //   },
  {
    label: "Daily challenge",
    href: "#",
  },
  {
    label: "Weekly challenge",
    href: "#",
  },
  {
    label: "Monthly challenge",
    href: "#",
  },
];
