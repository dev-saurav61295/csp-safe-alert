/**
 * Accurate Wall-Clock Timer Engine
 * Resilient against background tab throttling and setTimeout drift.
 */

export interface TimerOptions {
  duration: number;
  onTick?: (remaining: number, progressRatio: number) => void;
  onExpire?: () => void;
}

export class TimerEngine {
  private duration: number;
  private remaining: number;
  private startTime: number = 0;
  private timeoutId: any = null;
  private intervalId: any = null;
  private isRunning: boolean = false;
  private onTick?: (remaining: number, progressRatio: number) => void;
  private onExpire?: () => void;

  constructor(options: TimerOptions) {
    this.duration = Math.max(0, options.duration);
    this.remaining = this.duration;
    this.onTick = options.onTick;
    this.onExpire = options.onExpire;
  }

  public start(): void {
    if (this.duration <= 0 || this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();

    this.schedule();
  }

  private schedule(): void {
    this.clear();
    const currentRemaining = this.remaining;
    if (currentRemaining <= 0) {
      this.handleExpire();
      return;
    }

    // Interval for progress updates
    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const current = Math.max(0, this.remaining - elapsed);
      const ratio = this.duration > 0 ? current / this.duration : 0;
      if (this.onTick) {
        this.onTick(current, ratio);
      }
      if (current <= 0) {
        this.handleExpire();
      }
    }, 50);

    // Timeout for exact expiration
    this.timeoutId = setTimeout(() => {
      this.handleExpire();
    }, currentRemaining);
  }

  private handleExpire(): void {
    this.stop();
    this.remaining = 0;
    if (this.onTick) {
      this.onTick(0, 0);
    }
    if (this.onExpire) {
      this.onExpire();
    }
  }

  public stop(): number {
    if (!this.isRunning) return this.remaining;
    const elapsed = Date.now() - this.startTime;
    this.remaining = Math.max(0, this.remaining - elapsed);
    this.isRunning = false;
    this.clear();
    return this.remaining;
  }

  public resume(): void {
    if (this.isRunning || this.remaining <= 0) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.schedule();
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.resume();
      return true;
    }
  }

  public increase(additionalMs: number): number {
    const wasRunning = this.isRunning;
    if (wasRunning) {
      this.stop();
    }
    this.remaining += additionalMs;
    this.duration += additionalMs;
    if (wasRunning) {
      this.resume();
    }
    return this.remaining;
  }

  public getRemaining(): number {
    if (!this.isRunning) return this.remaining;
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, this.remaining - elapsed);
  }

  public running(): boolean {
    return this.isRunning;
  }

  public destroy(): void {
    this.isRunning = false;
    this.clear();
  }

  private clear(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
