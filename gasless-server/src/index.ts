import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { GaslessService } from "./lib";
import dotenv from "dotenv";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { HexString } from "@gear-js/api";
import cors from "cors";

dotenv.config();

async function main() {
  await cryptoWaitReady();

  const app = express();
  app.use(cors());
  const gaslessService = new GaslessService();

  const programId = process.env.PROGRAM_ID as HexString;

  app.use(bodyParser.json());

  app.get("/gasless/voucher/:voucherId/status", async (req, res) => {
    try {
      const { voucherId } = req.params;
      const status = await gaslessService.getVoucherStatus(
        voucherId.startsWith("0x")
          ? (voucherId as `0x${string}`)
          : (`0x${voucherId}` as `0x${string}`)
      );

      console.log(status);
      res.send(status);
    } catch (err) {
      console.error("Error getting voucher status:", err);
      res.status(500).send({ error: "Internal server error" });
    }
  });


  app.post("/gasless/voucher/request", async (req, res) => {
    const { account, amount = 10000000000000, durationInSec = 3600 } = req.body;

    try {
      const voucherId: HexString = await gaslessService.issue(
        account,
        programId,
        amount,
        Number(durationInSec)
      );

      console.log("✅ Voucher created:", voucherId);
      res.status(200).json({ voucherId });
    } catch (error) {
      console.error("❌ Error creating voucher:", error);
      res
        .status(500)
        .json({ error: "Failed to create voucher", details: error instanceof Error ? error.message : String(error), });
    }
  });

  app.post("/issue", async (req, res) => {
    try {
      const data = req.body;

      const spender =
        typeof data.account === "string" ? data.account : String(data.account);

      if (!spender.startsWith("0x") || spender.length !== 66) {
        throw new Error(`Invalid account: ${spender}`);
      }

      const voucher = await gaslessService.issue(
        data.account,
        programId,
        data.amount,
        Number(data.durationInSec)
      );

      res.send(voucher);
    } catch (error) {
      console.error("Error in /issue:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.post("/prolong", async (req, res) => {
    try {
      const data = req.body;
      await gaslessService.prolong(
        data.voucherId,
        data.account,
        data.balance,
        data.durationInSec
      );
      res.sendStatus(200);
    } catch (error) {
      console.error("Error in /prolong:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.post("/revoke", async (req, res) => {
    try {
      const data = req.body;
      await gaslessService.revoke(data.voucherId, data.account);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error in /revoke:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
