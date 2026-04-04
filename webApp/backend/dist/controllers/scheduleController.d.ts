import { Request, Response } from 'express';
export declare class ScheduleController {
    getSchedule(req: Request, res: Response): Promise<void>;
    getUserSchedule(req: Request, res: Response): Promise<void>;
    getTodayUserSchedule(req: Request, res: Response): Promise<void>;
    addSchedule(req: Request, res: Response): Promise<void>;
    updateSchedule(req: Request, res: Response): Promise<void>;
    removeSchedule(req: Request, res: Response): Promise<void>;
    upsertScheduledTrip(req: Request, res: Response): Promise<void>;
    removeScheduledTrip(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=scheduleController.d.ts.map