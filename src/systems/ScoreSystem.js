// Computes score when a pipe is passed, plus lifetime totals.
export class ScoreSystem {
  constructor({ pointsPerPipe = 1, eventBus }) {
    this.pointsPerPipe = pointsPerPipe;
    this.eventBus = eventBus;
    this.score = 0;
  }

  reset() {
    this.score = 0;
  }

  // Called when bird's leading edge crosses a pipe's trailing edge.
  markPipePassed() {
    this.score += this.pointsPerPipe;
    this.eventBus?.emit('score:changed', { score: this.score });
    return this.score;
  }

  getScore() {
    return this.score;
  }
}