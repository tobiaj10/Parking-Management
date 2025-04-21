import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for garage attendants
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Parking tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  licensePlate: text("license_plate").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time"),
  durationMinutes: integer("duration_minutes"),
  amountPaid: integer("amount_paid"),
  status: text("status").notNull(), // 'active' or 'completed'
  paymentMethod: text("payment_method"),
});

export const insertTicketSchema = createInsertSchema(tickets)
  .pick({
    licensePlate: true,
    vehicleType: true,
  })
  .extend({
    licensePlate: z.string().min(1, "License plate is required"),
    vehicleType: z.string().min(1, "Vehicle type is required"),
  });

export const updateTicketSchema = createInsertSchema(tickets)
  .pick({
    exitTime: true,
    durationMinutes: true,
    amountPaid: true,
    status: true,
    paymentMethod: true,
  })
  .partial();

// Garage settings for capacity and rates
export const garageSettings = pgTable("garage_settings", {
  id: serial("id").primaryKey(),
  totalSpaces: integer("total_spaces").notNull(),
  hourlyRate: integer("hourly_rate").notNull(), // in cents
});

export const insertGarageSettingsSchema = createInsertSchema(garageSettings);

// Types for typescript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
export type GarageSettings = typeof garageSettings.$inferSelect;
export type InsertGarageSettings = z.infer<typeof insertGarageSettingsSchema>;
