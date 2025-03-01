import { defineStore } from 'pinia';

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    currentRound: 0,
    rounds: [
      {
        name: '第一轮',
        matches: [
          { id: 1, team1: '队伍A', team2: '队伍B', winner: '队伍A' },
          { id: 2, team1: '队伍C', team2: '队伍D', winner: '队伍D' }
        ]
      },
      {
        name: '第二轮',
        matches: [
          { id: 3, team1: '队伍A', team2: '队伍D', winner: '队伍D' }
        ]
      }
    ]
  }),
  actions: {
    nextRound() {
      if (this.currentRound < this.rounds.length - 1) {
        this.currentRound++;
      }
    },
    prevRound() {
      if (this.currentRound > 0) {
        this.currentRound--;
      }
    },
    setRound(index) {
      if (index >= 0 && index < this.rounds.length) {
        this.currentRound = index;
      }
    }
  }
});
