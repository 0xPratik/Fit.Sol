export type FitSol = {
  version: "0.1.0";
  name: "fit_sol";
  instructions: [
    {
      name: "createChallenge";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "challenge";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "name";
          type: "string";
        },
        {
          name: "duration";
          type: "i64";
        },
        {
          name: "maxSolAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "joinChallenge";
      accounts: [
        {
          name: "challenge";
          isMut: true;
          isSigner: false;
        },
        {
          name: "creator";
          isMut: false;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "userAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "fundAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "updateUserSteps";
      accounts: [];
      args: [];
    },
    {
      name: "endChallenge";
      accounts: [
        {
          name: "challenge";
          isMut: true;
          isSigner: false;
        },
        {
          name: "creator";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "winner";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "challenge";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "name";
            type: "string";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "maxAmount";
            type: "u64";
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "duration";
            type: "i64";
          },
          {
            name: "participants";
            type: "i64";
          },
          {
            name: "isEnded";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "user";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "steps";
            type: "i64";
          },
          {
            name: "isJoined";
            type: "bool";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "PayerVaultMismatch";
      msg: "Payer vault account mismatch.";
    },
    {
      code: 6001;
      name: "InvalidOwner";
      msg: "Invalid owner.";
    },
    {
      code: 6002;
      name: "Unauthorized";
      msg: "You do not have sufficient permissions to perform this action.";
    },
    {
      code: 6003;
      name: "InvalidAssociatedTokenAddress";
      msg: "Invalid associated token address. Did you provide the correct address?";
    },
    {
      code: 6004;
      name: "AlreadyJoined";
      msg: "User has Already Joined the Challenge";
    }
  ];
};

export const IDL: FitSol = {
  version: "0.1.0",
  name: "fit_sol",
  instructions: [
    {
      name: "createChallenge",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "challenge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "duration",
          type: "i64",
        },
        {
          name: "maxSolAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "joinChallenge",
      accounts: [
        {
          name: "challenge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "fundAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "updateUserSteps",
      accounts: [],
      args: [],
    },
    {
      name: "endChallenge",
      accounts: [
        {
          name: "challenge",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creator",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "winner",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "challenge",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "maxAmount",
            type: "u64",
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "duration",
            type: "i64",
          },
          {
            name: "participants",
            type: "i64",
          },
          {
            name: "isEnded",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "user",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "steps",
            type: "i64",
          },
          {
            name: "isJoined",
            type: "bool",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "PayerVaultMismatch",
      msg: "Payer vault account mismatch.",
    },
    {
      code: 6001,
      name: "InvalidOwner",
      msg: "Invalid owner.",
    },
    {
      code: 6002,
      name: "Unauthorized",
      msg: "You do not have sufficient permissions to perform this action.",
    },
    {
      code: 6003,
      name: "InvalidAssociatedTokenAddress",
      msg: "Invalid associated token address. Did you provide the correct address?",
    },
    {
      code: 6004,
      name: "AlreadyJoined",
      msg: "User has Already Joined the Challenge",
    },
  ],
};
