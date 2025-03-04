import { Request, Response } from "express";
import { getWeekNumber, WorkoutInstance } from "../models/WorkoutInstance";
import { WorkoutTemplate } from "../models/WorkoutTemplate";
import { AppError, handleError } from "../utils/errorHandler";
import { BaseController } from "./baseController";
import { Exercise } from "../models/Exercise";

export class WorkoutController extends BaseController {
  // Get all workout templates
  async getAll(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const templates = await WorkoutTemplate.find({ userId }).populate(
        "exercises"
      );
      res.json(templates);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  // Create a new workout template
  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const template = new WorkoutTemplate({
        ...req.body,
        userId,
        isActive: true,
      });

      console.log(template);
      await template.save();
      res.status(201).json(template);
    } catch (error) {
      console.log(error);
      handleError(error as Error, res);
    }
  }

  // Create exercise
  async createExercise(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const exercise = new Exercise({
        ...req.body,
        userId,
      });
      await exercise.save();
      res.status(201).json(exercise);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  // Get a specific workout template
  async getById(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const template = await WorkoutTemplate.findOne({
        _id: req.params.id,
        userId,
      }).populate("exercises");

      if (!template) {
        throw new AppError("Workout not found", 404);
      }
      res.json(template);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  // Update a workout template
  async update(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const template = await WorkoutTemplate.findOneAndUpdate(
        { _id: req.params.id, userId },
        req.body,
        { new: true }
      ).populate("exercises");

      if (!template) {
        throw new AppError("Workout not found", 404);
      }
      res.json(template);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  // Delete a workout template and its instances
  async delete(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);

      // Delete template
      const template = await WorkoutTemplate.findOneAndDelete({
        _id: req.params.id,
        userId,
      });

      if (!template) {
        throw new AppError("Workout not found", 404);
      }

      // Delete instances
      await WorkoutInstance.deleteMany({ templateId: template._id });

      res.status(204).send();
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  // Get workouts for current week
  async getCurrentWeek(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const instances = await WorkoutInstance.findCurrentWeek(userId);
      res.json(instances);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  // Mark a workout instance as completed
  async completeWorkout(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const instance = await WorkoutInstance.findOne({
        _id: req.params.id,
        userId,
      }).populate({
        path: "templateId",
        populate: {
          path: "exercises",
        },
      });

      if (!instance) {
        throw new AppError("Workout instance not found", 404);
      }

      if (instance.completed) {
        throw new AppError("Workout instance already completed", 400);
      }

      const { exercises, completedAt, notes } = req.body;

      // Validate exercises data
      if (!Array.isArray(exercises)) {
        throw new AppError("Invalid exercises data", 400);
      }

      // Validate completion data
      if (!completedAt || !Date.parse(completedAt)) {
        throw new AppError("Invalid completion date", 400);
      }

      // Mark as completed using the instance method
      await instance.markAsCompleted({
        exercises,
        completedAt,
        notes: notes || "Workout completed successfully",
      });

      // Return the updated instance
      const updatedInstance = await WorkoutInstance.findById(
        instance._id
      ).populate({
        path: "templateId",
        populate: {
          path: "exercises",
        },
      });

      res.json(updatedInstance);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  // Get suggested workouts
  async suggestUpcoming(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const date = new Date();

      // Create instances for the current week if they don't exist
      const instances = await WorkoutInstance.createWeekInstances(userId, date);

      // Filter to show only uncompleted workouts
      const suggestions = instances
        .filter((instance) => !instance.completed)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      res.json(suggestions);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getInstance(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const instance = await WorkoutInstance.findById(req.params.id).populate({
        path: "templateId",
        populate: {
          path: "exercises",
        },
      });

      if (!instance || instance.userId !== userId) {
        throw new AppError("Workout instance not found", 404);
      }

      res.json(instance);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getInstancesByTemplate(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);

      // Get all instances for this template
      const instances = await WorkoutInstance.find({
        userId,
        templateId: req.params.id,
      })
        .populate({
          path: "templateId",
          populate: {
            path: "exercises",
          },
        })
        .sort("-date"); // Most recent first

      // If no instances exist, create a new one
      if (instances.length === 0) {
        const template = await WorkoutTemplate.findOne({
          _id: req.params.id,
          userId,
        }).populate("exercises");

        if (!template) {
          throw new AppError("Template not found", 404);
        }

        const newInstance = await WorkoutInstance.create({
          templateId: template._id,
          userId,
          date: new Date(),
          weekNumber: getWeekNumber(new Date()),
          year: new Date().getFullYear(),
          completed: false,
        });

        // Populate the new instance
        const populatedInstance = await WorkoutInstance.findById(
          newInstance._id
        ).populate({
          path: "templateId",
          populate: {
            path: "exercises",
          },
        });

        res.json([populatedInstance]); // Return as array for consistency
        return;
      }

      res.json(instances);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async getWorkoutDetail(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const id = req.params.id;

      let instance = await WorkoutInstance.findOne({
        _id: id,
        userId,
      }).populate({
        path: "templateId",
        populate: { path: "exercises" },
      });

      if (instance) {
        res.json(instance);
        return;
      }

      const template = await WorkoutTemplate.findOne({
        _id: id,
        userId,
      }).populate("exercises");
      if (template) {
        // Create a pseudo–instance object from the template.
        const pseudoInstance = {
          _id: template._id,
          templateId: template,
          userId,
          date: null, // Not scheduled yet
          completed: false,
          progress: [],
          // You can add any extra fields needed for display
        };
        res.json(pseudoInstance);
        return;
      }

      throw new AppError("Workout not found", 404);
    } catch (error) {
      handleError(error as Error, res);
    }
  }

  async createInstance(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const { templateId } = req.body;
      if (!templateId) {
        throw new AppError("templateId is required", 400);
      }
      const template = await WorkoutTemplate.findOne({
        _id: templateId,
        userId,
      }).populate("exercises");
      if (!template) {
        throw new AppError("Workout template not found", 404);
      }
      const now = new Date();
      const weekNumber = getWeekNumber(now);
      const newInstance = await WorkoutInstance.create({
        templateId: template._id,
        userId,
        date: now,
        weekNumber,
        year: now.getFullYear(),
        completed: false,
        progress: [],
      });
      const populatedInstance = await WorkoutInstance.findById(
        newInstance._id
      ).populate({
        path: "templateId",
        populate: { path: "exercises" },
      });
      res.status(201).json(populatedInstance);
    } catch (error) {
      handleError(error as Error, res);
    }
  }
}
