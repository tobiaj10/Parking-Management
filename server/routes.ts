import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTicketSchema, 
  updateTicketSchema,
  InsertTicket,
  UpdateTicket
} from "@shared/schema";
import { format } from "date-fns";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API status endpoint
  app.get("/api/status", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Get garage stats
  app.get("/api/garage/stats", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getGarageSettings();
      if (!settings) {
        return res.status(404).json({ message: "Garage settings not found" });
      }

      const occupiedSpaces = await storage.getOccupiedSpacesCount();
      const availableSpaces = settings.totalSpaces - occupiedSpaces;
      const todaysRevenue = await storage.getTodayRevenue();
      const vehiclesProcessedToday = await storage.getVehiclesProcessedToday();
      const averageStayTimeMinutes = await storage.getAverageStayTime();
      
      // Convert to hours with 1 decimal point
      const averageStayTime = Math.round(averageStayTimeMinutes / 6) / 10;

      res.json({
        totalSpaces: settings.totalSpaces,
        occupiedSpaces,
        availableSpaces,
        occupiedSpacesPercentage: Math.round((occupiedSpaces / settings.totalSpaces) * 100),
        availableSpacesPercentage: Math.round((availableSpaces / settings.totalSpaces) * 100),
        hourlyRate: settings.hourlyRate / 100, // Convert to dollars
        todaysRevenue: todaysRevenue / 100, // Convert to dollars
        vehiclesProcessedToday,
        averageStayTime
      });
    } catch (err) {
      console.error("Error getting garage stats:", err);
      res.status(500).json({ message: "Error retrieving garage statistics" });
    }
  });

  // Create a new ticket
  app.post("/api/tickets", async (req: Request, res: Response) => {
    try {
      const data = insertTicketSchema.parse(req.body);
      
      // Generate ticket number with PS prefix
      const ticketNumber = `PS-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newTicket: InsertTicket = {
        ...data,
        ticketNumber,
        entryTime: new Date(),
        status: 'active'
      };

      const ticket = await storage.createTicket(newTicket);
      res.status(201).json(ticket);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating ticket:", err);
      res.status(500).json({ message: "Error creating parking ticket" });
    }
  });

  // Get a ticket by number
  app.get("/api/tickets/:ticketNumber", async (req: Request, res: Response) => {
    try {
      const { ticketNumber } = req.params;
      const ticket = await storage.getTicketByNumber(ticketNumber);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (err) {
      console.error("Error retrieving ticket:", err);
      res.status(500).json({ message: "Error retrieving ticket information" });
    }
  });

  // Process payment and exit
  app.put("/api/tickets/:ticketNumber/exit", async (req: Request, res: Response) => {
    try {
      const { ticketNumber } = req.params;
      const ticket = await storage.getTicketByNumber(ticketNumber);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      if (ticket.status !== 'active') {
        return res.status(400).json({ message: "Ticket has already been processed" });
      }
      
      const exitTime = new Date();
      const entryTime = new Date(ticket.entryTime);
      
      // Calculate duration in minutes
      const durationMinutes = Math.ceil((exitTime.getTime() - entryTime.getTime()) / (60 * 1000));
      
      // Get hourly rate from settings
      const settings = await storage.getGarageSettings();
      if (!settings) {
        return res.status(500).json({ message: "Garage settings not found" });
      }
      
      // Calculate amount in cents ($10/hour = 1000 cents/hour)
      // Convert minutes to hours (rounded up) and multiply by hourly rate
      const hours = Math.ceil(durationMinutes / 60);
      const amountPaid = hours * settings.hourlyRate;
      
      const updateData = updateTicketSchema.parse({
        ...req.body,
        exitTime,
        durationMinutes,
        amountPaid,
        status: 'completed'
      });
      
      const updatedTicket = await storage.updateTicket(ticket.id, updateData);
      
      res.json(updatedTicket);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error processing exit:", err);
      res.status(500).json({ message: "Error processing exit" });
    }
  });

  // Get recent activities/tickets
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const tickets = await storage.getRecentTickets(limit);
      
      // Format the response for the activity table
      const activities = tickets.map(ticket => {
        return {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          licensePlate: ticket.licensePlate,
          entryTime: ticket.entryTime,
          exitTime: ticket.exitTime,
          durationMinutes: ticket.durationMinutes,
          amount: ticket.amountPaid ? ticket.amountPaid / 100 : null, // Convert cents to dollars
          status: ticket.status
        };
      });
      
      res.json(activities);
    } catch (err) {
      console.error("Error retrieving activities:", err);
      res.status(500).json({ message: "Error retrieving recent activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
