import express from "express";
import { Staff } from "../models/staff.js";
import { MongoServerError } from "mongodb";

export const staffRouter = express.Router();

staffRouter.post("/staff", async (req, res) => {
  try {
    const member = new Staff(req.body);
    await member.save();
    res.status(201).send(member);
  } 
  catch (error: unknown) {
    if (error instanceof Error && error.name === "ValidationError") { 
      return res.status(400).send({error: error.message});
    }
    else if (error instanceof MongoServerError && error.code === 11000) { 
      return res.status(409).send({error: "El número de colegiado ya existe"});
    }
    return res.status(500).send({error: "Error interno del servidor"});
  }
});



/*
staffRouter.post("/staff", async (req, res) => {
  const member = new Staff(req.body);
  try {
    await member.save();
    res.status(201).send(member);
  } catch (error) {
    res.status(500).send(error);
  }
});
*/